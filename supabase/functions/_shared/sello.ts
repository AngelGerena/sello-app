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

/** Price IDs live in secrets so prices can change in Stripe without redeploying. */
export function priceFor(plan: Plan, interval: Interval, founding: boolean): string {
  if (plan === 'pro' && interval === 'month' && founding && Deno.env.get('SELLO_PRICE_PRO_FOUNDING')) return env('SELLO_PRICE_PRO_FOUNDING');
  const key = `SELLO_PRICE_${plan === 'pro' ? 'PRO' : 'TEAM'}_${interval === 'month' ? 'MONTH' : 'YEAR'}`;
  return env(key);
}

/** Which Sello plan a Stripe price belongs to (fallback when metadata is missing). */
export function planForPrice(priceId: string | undefined): Plan | null {
  if (!priceId) return null;
  for (const k of ['SELLO_PRICE_PRO_MONTH', 'SELLO_PRICE_PRO_YEAR', 'SELLO_PRICE_PRO_FOUNDING']) if (Deno.env.get(k) === priceId) return 'pro';
  for (const k of ['SELLO_PRICE_TEAM_MONTH', 'SELLO_PRICE_TEAM_YEAR']) if (Deno.env.get(k) === priceId) return 'team';
  return null;
}

export const siteUrl = () => (Deno.env.get('SELLO_SITE_URL') ?? 'https://sello-app.netlify.app').replace(/\/$/, '');
