// POST { plan: 'pro' | 'team', interval: 'month' | 'year' }  ->  { url }
// Starts Stripe Checkout for the signed-in user. If they already have a subscription,
// returns a Billing Portal link instead so they can switch plans there.
import { admin, cors, currentUser, json, priceFor, siteUrl, stripe, type Interval, type Plan } from '../_shared/sello.ts';

const FOUNDING_SPOTS = 100;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Use POST.' }, 405);
  try {
    const user = await currentUser(req);
    if (!user) return json({ error: 'Please sign in first.' }, 401);

    const body = await req.json().catch(() => ({}));
    const plan: Plan = body.plan === 'team' ? 'team' : 'pro';
    const interval: Interval = body.interval === 'year' ? 'year' : 'month';

    const db = admin();
    const s = stripe();
    const { data: profile } = await db.from('fc_profiles')
      .select('id, email, stripe_customer_id, stripe_subscription_id, plan_status').eq('id', user.id).maybeSingle();

    // One Stripe customer per Sello account.
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

    // Founding pricing: Pro monthly, while spots remain.
    let founding = false;
    if (plan === 'pro' && interval === 'month' && Deno.env.get('SELLO_PRICE_PRO_FOUNDING')) {
      const { count } = await db.from('fc_profiles').select('id', { count: 'exact', head: true }).eq('founding', true);
      founding = (count ?? 0) < FOUNDING_SPOTS;
    }

    const session = await s.checkout.sessions.create({
      mode: 'subscription',
      customer,
      client_reference_id: user.id,
      line_items: [{ price: priceFor(plan, interval, founding), quantity: 1 }],
      allow_promotion_codes: true,
      subscription_data: { metadata: { sello_user_id: user.id, sello_plan: plan, sello_interval: interval, sello_founding: founding ? '1' : '0' } },
      metadata: { sello_user_id: user.id, sello_plan: plan },
      success_url: `${siteUrl()}/app?upgraded=${plan}`,
      cancel_url: `${siteUrl()}/app?checkout=canceled`,
    });
    return json({ url: session.url });
  } catch (e) {
    console.error('sello-checkout', e);
    return json({ error: e instanceof Error ? e.message : 'Checkout failed.' }, 500);
  }
});
