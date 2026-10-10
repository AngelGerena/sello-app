// Stripe -> OKUNAMI. Keeps fc_profiles.plan in sync with the customer's subscription.
// Authentication is Stripe's signature (STRIPE_WEBHOOK_SECRET), so JWT checking is off for this function.
import Stripe from 'npm:stripe@17.7.0';
import { BUSINESS_CARDS, admin, env, planForAmount, planForPrice, stripe, type Plan } from '../_shared/okunami.ts';

const PAID = ['active', 'trialing', 'past_due'];

function periodEnd(sub: Stripe.Subscription): string | null {
  // Newer Stripe API versions keep the period on the subscription item.
  const raw = (sub as unknown as { current_period_end?: number }).current_period_end
    ?? (sub.items?.data?.[0] as unknown as { current_period_end?: number } | undefined)?.current_period_end;
  return raw ? new Date(raw * 1000).toISOString() : null;
}

async function applySubscription(sub: Stripe.Subscription, userIdHint?: string | null) {
  const db = admin();
  const customer = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
  const priceId = sub.items?.data?.[0]?.price?.id;
  const item = sub.items?.data?.[0];
  // Website checkout sets okunami_plan. A Payment Link has no metadata, so fall back to the price id, then to the amount charged.
  const metaPlan = sub.metadata?.okunami_plan;
  const resolved: Plan | null = (metaPlan === 'pro' || metaPlan === 'plus' || metaPlan === 'team' ? metaPlan : null)
    ?? planForPrice(priceId) ?? planForAmount(item?.price?.unit_amount, item?.price?.recurring?.interval);
  const paid = PAID.includes(sub.status);
  // An unrecognised price must never grant a paid plan. It may still end one (a cancelled subscription drops to Lite).
  if (!resolved && paid) { console.error('Unrecognised subscription price; plan not changed', sub.id, priceId, item?.price?.unit_amount); return; }
  const plan: Plan = resolved ?? 'pro';
  const update: Record<string, unknown> = {
    plan: paid ? plan : 'free',
    seats: paid && plan === 'team' ? BUSINESS_CARDS : null,   // Business is a flat 5 cards
    plan_status: sub.status,
    stripe_customer_id: customer,
    stripe_subscription_id: sub.id,
    current_period_end: periodEnd(sub),
    plan_interval: sub.items?.data?.[0]?.price?.recurring?.interval ?? null,
  };
  // Founding offer: the price stays only while the subscription stays active, as Pro monthly. Otherwise the spot lapses for good.
  if (sub.metadata?.okunami_founding === '1') {
    const interval = sub.items?.data?.[0]?.price?.recurring?.interval;
    const uid = userIdHint ?? sub.metadata?.okunami_user_id ?? null;
    let entitled = false;
    if (paid && plan === 'pro' && interval === 'month' && uid) {
      const { data: ok } = await db.rpc('fc_founding_activate', { p_user: uid, p_subscription: sub.id });
      entitled = !!ok;
    } else {
      await db.rpc('fc_founding_lapse', { p_subscription: sub.id });
    }
    update.founding = entitled;
  }

  // Who is this? Website checkout tells us. Otherwise use the Stripe customer we already stored, and for a Payment Link
  // (a brand new Stripe customer) match the email the buyer used to the OKUNAMI account.
  let userId: string | null = userIdHint ?? sub.metadata?.okunami_user_id ?? null;
  if (!userId) {
    const { data: byCustomer } = await db.from('fc_profiles').select('id').eq('stripe_customer_id', customer).maybeSingle();
    userId = byCustomer?.id ?? null;
  }
  if (!userId) {
    const c = await stripe().customers.retrieve(customer);
    const email = !('deleted' in c && c.deleted) ? (c as Stripe.Customer).email?.trim().toLowerCase() : null;
    if (email) {
      const { data: byEmail } = await db.from('fc_profiles').select('id').ilike('email', email).maybeSingle();
      userId = byEmail?.id ?? null;
    }
  }
  if (!userId) { console.error('No OKUNAMI account matches this subscription; nothing changed', sub.id, customer); return; }
  const { error } = await db.from('fc_profiles').update(update).eq('id', userId);
  if (error) throw error;
}

Deno.serve(async (req) => {
  const sig = req.headers.get('stripe-signature');
  if (!sig) return new Response('Missing signature', { status: 400 });
  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe().webhooks.constructEventAsync(raw, sig, env('STRIPE_WEBHOOK_SECRET'), undefined, Stripe.createSubtleCryptoProvider());
  } catch (e) {
    console.error('bad signature', e);
    return new Response('Bad signature', { status: 400 });
  }
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription' && session.subscription) {
          const sub = await stripe().subscriptions.retrieve(typeof session.subscription === 'string' ? session.subscription : session.subscription.id);
          await applySubscription(sub, session.client_reference_id);
        }
        break;
      }
      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        await admin().rpc('fc_founding_release_session', { p_session: session.id });   // an unpaid checkout frees its founding spot
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'customer.subscription.paused':
      case 'customer.subscription.resumed':
        await applySubscription(event.data.object as Stripe.Subscription);
        break;
      default:
        break; // ignore everything else
    }
    return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('webhook handling failed', event.type, e);
    return new Response('Handler error', { status: 500 }); // Stripe retries
  }
});
