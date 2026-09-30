import { supabase } from './supabase';

/* Payments run on Supabase Edge Functions (sello-checkout, sello-portal, sello-stripe-webhook),
   so they work with drag-and-drop Netlify deploys. Stripe keys never touch the browser. */

export type Interval = 'month' | 'year';
export const INTERVAL_KEY = 'fc.plan-interval';

async function call(fn: string, body: Record<string, unknown>): Promise<string> {
  const { data, error } = await supabase.functions.invoke(fn, { body });
  if (error) {
    // Surface the function's own message when there is one.
    const ctx = (error as { context?: Response }).context;
    try { const j = ctx ? await ctx.json() : null; if (j?.error) throw new Error(j.error); } catch (e) { if (e instanceof Error && e.message) throw e; }
    throw new Error('Payments are not available right now. Please try again in a minute.');
  }
  if (!data?.url) throw new Error(data?.error ?? 'Payments are not available right now.');
  return data.url as string;
}

/** Sends the signed-in user to Stripe Checkout (or to the Billing Portal if they already subscribe). */
export async function startCheckout(plan: 'pro' | 'team', interval: Interval = 'month'): Promise<void> {
  window.location.href = await call('sello-checkout', { plan, interval });
}

/** Opens Stripe's Billing Portal: change plan, update card, cancel, download invoices. */
export async function openBillingPortal(): Promise<void> {
  window.location.href = await call('sello-portal', {});
}
