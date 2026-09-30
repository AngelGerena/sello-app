// Shared helpers for the Sello Stripe functions (Supabase Edge Functions, Deno).
import Stripe from 'npm:stripe@17.7.0';
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2.45.4';

export const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

export function env(name: string): string {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`Missing secret ${name}. Add it in Supabase > Edge Functions > Secrets.`);
  return v;
}

export const stripe = () => new Stripe(env('STRIPE_SECRET_KEY'), { httpClient: Stripe.createFetchHttpClient() });

/** Service-role client: bypasses row-level security. Server side only. */
export const admin = (): SupabaseClient =>
  createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } });

/** The signed-in Sello user making the request, from their access token. */
export async function currentUser(req: Request) {
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const { data } = await admin().auth.getUser(token);
  return data.user ?? null;
}

export type Plan = 'pro' | 'team';
export type Interval = 'month' | 'year';

/* Prices are set right here, so nothing has to be created in the Stripe dashboard.
   Amounts are in cents (USD). Keep them in step with the pricing shown on the site (src/lib/plans.ts). */
const CENTS: Record<Plan, Record<Interval, number>> = { pro: { month: 800, year: 7200 }, team: { month: 600, year: 6000 } };   // Business is per card
const FOUNDING_CENTS = 500;
const NAMES: Record<Plan, string> = { pro: 'Sello Pro', team: 'Sello Business (per card)' };

/** Business is priced per card. The customer picks how many; these are the limits. */
export const TEAM_MIN = 3;
export const TEAM_MAX = 100;
export const TEAM_DEFAULT = 5;
export function clampSeats(n: unknown): number {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v)) return TEAM_DEFAULT;
  return Math.min(TEAM_MAX, Math.max(TEAM_MIN, v));
}

/** The line item for Checkout. Stripe creates the product and price on the fly.
    Optional: if you ever create fixed prices in Stripe, add them as secrets named like
    SELLO_PRICE_PRO_MONTH, SELLO_PRICE_PRO_YEAR, SELLO_PRICE_TEAM_MONTH, SELLO_PRICE_TEAM_YEAR
    (and SELLO_PRICE_PRO_FOUNDING) and they take priority over the built-in amounts. The Business prices are PER CARD. */
export function lineItemFor(plan: Plan, interval: Interval, founding: boolean, seats = 1): Stripe.Checkout.SessionCreateParams.LineItem {
  const quantity = plan === 'team' ? clampSeats(seats) : 1;
  const secretName = founding ? 'SELLO_PRICE_PRO_FOUNDING' : `SELLO_PRICE_${plan === 'pro' ? 'PRO' : 'TEAM'}_${interval === 'month' ? 'MONTH' : 'YEAR'}`;
  const fixed = Deno.env.get(secretName);
  if (fixed) return { price: fixed, quantity };
  return {
    quantity,
    price_data: {
      currency: 'usd',
      unit_amount: founding ? FOUNDING_CENTS : CENTS[plan][interval],
      recurring: { interval },
      product_data: { name: founding ? 'Sello Pro (founding member)' : NAMES[plan] },
    },
  };
}

/** Which Sello plan a Stripe price belongs to (fallback when metadata is missing). */
export function planForPrice(priceId: string | undefined): Plan | null {
  if (!priceId) return null;
  for (const k of ['SELLO_PRICE_PRO_MONTH', 'SELLO_PRICE_PRO_YEAR', 'SELLO_PRICE_PRO_FOUNDING']) if (Deno.env.get(k) === priceId) return 'pro';
  for (const k of ['SELLO_PRICE_TEAM_MONTH', 'SELLO_PRICE_TEAM_YEAR']) if (Deno.env.get(k) === priceId) return 'team';
  return null;
}

export const siteUrl = () => (Deno.env.get('SELLO_SITE_URL') ?? 'https://selloapp.netlify.app').replace(/\/$/, '');
