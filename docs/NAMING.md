# Product name

The product is called **SeYo** (it was called Sello until October 2026; Sello is a Shopify trademark).
Write it SeYo in running text. Finesse Media LLC is still the company behind it.

## Names that were kept on purpose

These are internal identifiers that are already deployed or stored. Renaming them would break live checkout or lose data, so they still say "sello". Customers never see them.

| Identifier | Where it lives | Why it stayed |
|---|---|---|
| `sello-checkout`, `sello-portal`, `sello-stripe-webhook` | Supabase Edge Function names and `src/lib/billing.ts` | The deployed function URLs. A new name means new deploys and a new Stripe webhook URL. |
| `_shared/sello.ts` | Edge Function helper file | Imported by all three functions. |
| `SELLO_SITE_URL`, `SELLO_PRICE_*`, `SELLO_FOUNDING` | Supabase Edge Function secrets | Secrets would need to be re-created under new names. |
| `sello_user_id`, `sello_plan`, `sello_interval`, `sello_founding` | Stripe metadata keys | Subscriptions already created in Stripe carry these keys. |
| `selloapp.netlify.app`, repo `sello-app` | Netlify site and GitHub repo | Renaming changes the live address and the deploy connection. |

If you later move to a SeYo domain or rename the Netlify site, update `SELLO_SITE_URL`, the Supabase auth redirect URLs and `VITE_PUBLIC_ORIGIN` together.
