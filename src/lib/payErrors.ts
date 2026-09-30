/* Payment errors come from the server (Supabase Edge Functions). Anything that mentions setup,
   secrets or infrastructure is for the owner, not the customer, so it is replaced with a calm,
   plain message. Everything else (like "Please sign in first.") passes through. */
export const PAYMENTS_DOWN = 'Payments are not available right now. Please try again in a little while.';

const OWNER_ONLY = /secret|stripe|supabase|edge function|api key|env(ironment)?|not configured|missing/i;

export function friendlyPaymentError(message: string | undefined | null): string {
  const m = (message ?? '').trim();
  if (!m || OWNER_ONLY.test(m)) return PAYMENTS_DOWN;
  return m;
}
