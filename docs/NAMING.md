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

## Logo and home-screen icon

- `src/assets/seyo-wordmark.png` is the "SeYo" lettering from the supplied logo, cropped with a transparent background. It is made for dark backgrounds, and every page that shows it (landing header and footer, demo card bar) is dark.
- The home-screen icon is the card symbol on a deep navy-to-blue background: `public/icon-192.png`, `icon-512.png`, `icon-maskable-512.png` (Android, extra padding so circular crops keep the whole card), `apple-touch-icon.png` (iPhone, 180px, no transparency) and `favicon-32.png`.
- `index.html` sets the iPhone home-screen name to "SeYo" so it is not the long page title.
- The full logo with the tagline ("Your world. One tap. Digital you.") is not on the site yet.
