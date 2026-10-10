// POST {}  ->  { url }   Opens the Stripe Billing Portal: update card, switch plan, cancel, invoices.
import { admin, cors, currentUser, json, siteUrl, stripe } from '../_shared/okunami.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const user = await currentUser(req);
    if (!user) return json({ error: 'Please sign in first.' }, 401);
    const { data } = await admin().from('fc_profiles').select('stripe_customer_id').eq('id', user.id).maybeSingle();
    if (!data?.stripe_customer_id) return json({ error: 'No billing account yet. Choose a plan first.' }, 400);
    const portal = await stripe().billingPortal.sessions.create({ customer: data.stripe_customer_id, return_url: `${siteUrl()}/app` });
    return json({ url: portal.url });
  } catch (e) {
    console.error('okunami-portal', e);
    return json({ error: e instanceof Error ? e.message : 'Could not open billing.' }, 500);
  }
});
