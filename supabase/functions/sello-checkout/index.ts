// POST { plan: 'pro' | 'plus' | 'team', interval: 'month' | 'year' }  ->  { url }
// Prices are fixed in _shared/sello.ts; the browser never sends an amount.
// Starts Stripe Checkout for the signed-in user. If they already have a subscription,
// returns a Billing Portal link instead (update card, cancel, invoices), never a second subscription.
import { admin, cors, currentUser, json, siteUrl, stripe, type Interval, type Plan } from '../_shared/sello.ts';
import { buildCheckoutParams } from '../_shared/checkout.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Use POST.' }, 405);
  try {
    const user = await currentUser(req);
    if (!user) return json({ error: 'Please sign in first.' }, 401);

    const body = await req.json().catch(() => ({}));
    const plan: Plan = body.plan === 'team' ? 'team' : body.plan === 'plus' ? 'plus' : 'pro';
    const interval: Interval = body.interval === 'year' ? 'year' : 'month';

    const db = admin();
    const s = stripe();
    const { data: profile } = await db.from('fc_profiles')
      .select('id, email, stripe_customer_id, stripe_subscription_id, plan_status').eq('id', user.id).maybeSingle();

    // One Stripe customer per SeYo account.
    let customer = profile?.stripe_customer_id as string | null;
    if (!customer) {
      const c = await s.customers.create({ email: user.email ?? undefined, metadata: { sello_user_id: user.id } });
      customer = c.id;
      await db.from('fc_profiles').update({ stripe_customer_id: customer }).eq('id', user.id);
    }

    // Already subscribed: changes happen in the Billing Portal, never as a second subscription.
    if (profile?.stripe_subscription_id && ['active', 'trialing', 'past_due'].includes(profile.plan_status ?? '')) {
      const portal = await s.billingPortal.sessions.create({ customer, return_url: `${siteUrl()}/app` });
      return json({ url: portal.url, portal: true });
    }

    // Founding offer: eligibility, the spot count and the price all live in the database. The browser can ask for nothing.
    const { data: offer } = await db.rpc('fc_offer_status');
    let founding = false;
    if (plan === 'pro' && interval === 'month' && offer?.active && offer.plan === 'pro' && offer.interval === 'month' && Deno.env.get('SELLO_FOUNDING') !== 'off') {
      const { data: claim, error } = await db.rpc('fc_claim_founding', { p_user: user.id, p_email: user.email ?? '' });
      founding = !error && !!claim?.granted;   // any problem (including a missing migration) means the regular price
    }

    let session;
    try {
      session = await s.checkout.sessions.create(buildCheckoutParams({
        plan, interval, founding, foundingCents: offer?.price_cents ?? 0, reserveMinutes: offer?.reserve_minutes ?? 45,
        customer: customer as string, userId: user.id, siteUrl: siteUrl(), nowSec: Math.floor(Date.now() / 1000),
      }));
    } catch (e) {
      if (founding) await db.rpc('fc_founding_release_user', { p_user: user.id });   // never hold a spot for a checkout that failed
      throw e;
    }
    if (founding) await db.rpc('fc_founding_attach', { p_user: user.id, p_session: session.id });
    return json({ url: session.url, founding });
  } catch (e) {
    console.error('sello-checkout', e);
    return json({ error: e instanceof Error ? e.message : 'Checkout failed.' }, 500);
  }
});
