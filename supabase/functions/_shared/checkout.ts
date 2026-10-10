import type Stripe from 'npm:stripe@17.7.0';
import { clampSeats, lineItemFor, type Interval, type Plan } from './okunami.ts';

export interface CheckoutInput {
  plan: Plan; interval: Interval;
  /** true only when the database granted this person a founding spot a moment ago */
  founding: boolean; foundingCents: number; reserveMinutes: number;
  /** Business only: how many cards (clamped to 3..100 here). Ignored for other plans. */
  seats?: number;
  customer: string; userId: string; siteUrl: string; nowSec: number;
}

/** The whole Stripe Checkout request. It is pure so it can be tested, and the browser never supplies a price:
    plan and interval are validated here, and the founding price needs a spot granted by the database. */
export function buildCheckoutParams(i: CheckoutInput): Stripe.Checkout.SessionCreateParams {
  const founding = i.founding && i.plan === 'pro' && i.interval === 'month' && i.foundingCents > 0;   // Pro monthly only, never Business or yearly
  const params: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    customer: i.customer,
    client_reference_id: i.userId,
    line_items: [lineItemFor(i.plan, i.interval, founding, i.foundingCents, i.seats)],
    allow_promotion_codes: !founding,   // no stacking a promo code on top of the founding price
    subscription_data: { metadata: { okunami_user_id: i.userId, okunami_plan: i.plan, okunami_interval: i.interval, okunami_seats: i.plan === 'team' ? String(clampSeats(i.seats)) : '', okunami_founding: founding ? '1' : '0' } },
    metadata: { okunami_user_id: i.userId, okunami_plan: i.plan },
    success_url: `${i.siteUrl}/app?upgraded=${i.plan}`,
    cancel_url: `${i.siteUrl}/app?checkout=canceled`,
  };
  if (founding) params.expires_at = i.nowSec + 60 * Math.max(30, i.reserveMinutes);   // an unpaid founding checkout lets its spot go
  return params;
}
