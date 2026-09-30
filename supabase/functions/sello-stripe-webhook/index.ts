// Stripe -> Sello. Keeps fc_profiles.plan in sync with the customer's subscription.
// Authentication is Stripe's signature (STRIPE_WEBHOOK_SECRET), so JWT checking is off for this function.
import Stripe from 'npm:stripe@17.7.0';
import { admin, env, planForPrice, stripe } from '../_shared/sello.ts';

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
  const plan = (sub.metadata?.sello_plan as 'pro' | 'team' | undefined) ?? planForPrice(priceId) ?? 'pro';
  const paid = PAID.includes(sub.status);
  const quantity = sub.items?.data?.[0]?.quantity ?? null;   // Business: number of cards
  const update: Record<string, unknown> = {
    plan: paid ? plan : 'free',
    seats: paid && plan === 'team' ? Math.max(1, quantity ?? 5) : null,
    plan_status: sub.status,
    stripe_customer_id: customer,
    stripe_subscription_id: sub.id,
    current_period_end: periodEnd(sub),
    plan_interval: sub.items?.data?.[0]?.price?.recurring?.interval ?? null,
  };
  if (sub.metadata?.sello_founding === '1') update.founding = true;

  const userId = userIdHint ?? sub.metadata?.sello_user_id ?? null;
  const q = db.from('fc_profiles').update(update);
  const { error } = userId ? await q.eq('id', userId) : await q.eq('stripe_customer_id', customer);
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
