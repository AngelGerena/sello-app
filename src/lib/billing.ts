import { supabase } from './supabase';
import { friendlyPaymentError, PAYMENTS_DOWN } from './payErrors';

/* Payments run on Supabase Edge Functions (okunami-checkout, okunami-portal, okunami-stripe-webhook),
   so they work with drag-and-drop Netlify deploys. Stripe keys never touch the browser. */

export type Interval = 'month' | 'year';
export const INTERVAL_KEY = 'fc.plan-interval';
export const CARDS_KEY = 'fc.plan-cards';

async function call(fn: string, body: Record<string, unknown>): Promise<string> {
  const { data, error } = await supabase.functions.invoke(fn, { body });
  if (error) {
    // The function replies with { error: "..." }. Log the real reason for the owner, show a calm one to the customer.
    let reason = '';
    try { const ctx = (error as { context?: Response }).context; const j = ctx ? await ctx.json() : null; reason = j?.error ?? ''; } catch { /* no body */ }
    console.error(`[payments] ${fn}:`, reason || error.message);
    throw new Error(friendlyPaymentError(reason));
  }
  if (!data?.url) {
    if (data?.error) console.error(`[payments] ${fn}:`, data.error);
    throw new Error(friendlyPaymentError(data?.error) || PAYMENTS_DOWN);
  }
  return data.url as string;
}

/** Sends the signed-in user to Stripe Checkout (or to the Billing Portal if they already subscribe). */
export async function startCheckout(plan: 'pro' | 'plus' | 'team', interval: Interval = 'month', cards?: number): Promise<void> {
  window.location.href = await call('okunami-checkout', { plan, interval, seats: plan === 'team' ? cards : undefined });
}

/** Opens Stripe's Billing Portal: change plan, update card, cancel, download invoices. */
export async function openBillingPortal(): Promise<void> {
  window.location.href = await call('okunami-portal', {});
}
