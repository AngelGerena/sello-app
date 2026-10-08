// Shared helpers for the SeYo Stripe functions (Supabase Edge Functions, Deno).
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

/** The signed-in SeYo user making the request, from their access token. */
export async function currentUser(req: Request) {
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const { data } = await admin().auth.getUser(token);
  return data.user ?? null;
}

export type Plan = 'pro' | 'plus' | 'team';
export type Interval = 'month' | 'year';

/* Prices are set right here, so nothing has to be created in the Stripe dashboard.
   Amounts are in cents (USD). Keep them in step with the pricing shown on the site (src/lib/plans.ts). */
export const CENTS: Record<Plan, Record<Interval, number>> = {
  pro: { month: 800, year: 7900 },
  plus: { month: 1600, year: 14900 },
  team: { month: 4100, year: 39900 },   // flat: 5 cards included
};
const FOUNDING_CENTS = 500;   // fallback only; the live price is read from fc_offer_config
const NAMES: Record<Plan, string> = { pro: 'SeYo Pro', plus: 'SeYo Pro Plus', team: 'SeYo Business' };

/** Business includes this many cards. Extra cards are not offered. Keep in step with BUSINESS_CARDS in src/lib/plans.ts and fc_card_limit(). */
export const BUSINESS_CARDS = 5;

export function lineItemFor(plan: Plan, interval: Interval, founding: boolean, foundingCents = FOUNDING_CENTS): Stripe.Checkout.SessionCreateParams.LineItem {
  const secretName = founding ? 'SELLO_PRICE_PRO_FOUNDING' : `SELLO_PRICE_${plan.toUpperCase()}_${interval === 'month' ? 'MONTH' : 'YEAR'}`;
  const fixed = founding ? undefined : Deno.env.get(secretName);   // the founding price comes only from the database offer settings
  if (fixed) return { price: fixed, quantity: 1 };
  return {
    quantity: 1,
    price_data: {
      currency: 'usd',
      unit_amount: founding ? foundingCents : CENTS[plan][interval],
      recurring: { interval },
      product_data: { name: founding ? 'SeYo Pro (founding member)' : NAMES[plan] },
    },
  };
}

/** Which SeYo plan a Stripe price belongs to (fallback when metadata is missing). */
export function planForPrice(priceId: string | undefined): Plan | null {
  if (!priceId) return null;
  for (const k of ['SELLO_PRICE_PRO_MONTH', 'SELLO_PRICE_PRO_YEAR', 'SELLO_PRICE_PRO_FOUNDING']) if (Deno.env.get(k) === priceId) return 'pro';
  for (const k of ['SELLO_PRICE_PLUS_MONTH', 'SELLO_PRICE_PLUS_YEAR']) if (Deno.env.get(k) === priceId) return 'plus';
  for (const k of ['SELLO_PRICE_TEAM_MONTH', 'SELLO_PRICE_TEAM_YEAR']) if (Deno.env.get(k) === priceId) return 'team';
  return null;
}

/** Last resort for subscriptions made on a Stripe Payment Link (no SeYo metadata): match the amount charged.
    The founding price (a Pro monthly) is recognised by the amount the database offer uses. */
export function planForAmount(cents: number | null | undefined, interval: string | null | undefined, foundingCents = FOUNDING_CENTS): Plan | null {
  if (cents == null || !interval) return null;
  if (interval === 'month' && cents === foundingCents) return 'pro';
  for (const plan of ['pro', 'plus', 'team'] as Plan[]) if (CENTS[plan][interval as Interval] === cents) return plan;
  return null;
}

export const siteUrl = () => (Deno.env.get('SELLO_SITE_URL') ?? 'https://selloapp.netlify.app').replace(/\/$/, '');
