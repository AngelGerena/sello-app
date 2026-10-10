# Naming and brand

The product is called **OKUNAMI**. Write it in capital letters, as it appears in the logo. Finesse Media LLC is the company behind it.

## Where the name lives

| What | Where |
|---|---|
| Display name used by the app | `APP_NAME` in `src/lib/plans.ts` |
| Page title, iPhone home-screen name, install name | `index.html` and `public/manifest.webmanifest` |
| Logo | `src/assets/okunami-wordmark.png` (made for dark backgrounds), used by `src/components/Brand.tsx` |
| App icons | `public/icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`, `favicon-32.png` (the "O" on midnight navy) |
| Stripe product names | `NAMES` in `supabase/functions/_shared/okunami.ts` and the product names in the Stripe dashboard |
| Edge Functions | `okunami-checkout`, `okunami-portal`, `okunami-stripe-webhook` |
| Edge Function secrets | `OKUNAMI_SITE_URL`, `OKUNAMI_PRICE_*`, `OKUNAMI_FOUNDING` |
| Stripe metadata keys | `okunami_user_id`, `okunami_plan`, `okunami_interval`, `okunami_founding` |

## Moving to a real domain later

When a domain is registered, update these together: `OKUNAMI_SITE_URL` (Supabase secret), `VITE_PUBLIC_ORIGIN` (Netlify), the Supabase auth redirect URLs, the Stripe webhook endpoint, and the address written in `src/legal/content.ts`.

## Trademark

Clear the name and the domain before launch. Search USPTO TESS and the Florida fictitious name register, and have the lawyer confirm.
