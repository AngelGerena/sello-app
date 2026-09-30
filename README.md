# Finesse Cards

Self-serve digital business cards: sign up, add your details, pick one of ten layouts, recolor anything, publish to a link, QR code or NFC tag.

Stack: React + Vite + TypeScript, Supabase (auth, Postgres, storage), Netlify (hosting + functions), Stripe (subscriptions).

## Two builds, one codebase
- `npm run build` -> `dist/` production app. Needs Supabase env vars.
- `npm run build:demo` -> `dist-demo/index.html`, one self-contained file with a seeded card and no backend. Use it for sales demos. Data stays in the visitor's browser.

## First deploy
1. Supabase: this runs inside the existing finessemedia.pro project. SQL Editor: run `supabase/migrations/0001_finesse_cards.sql`. Every object it creates is prefixed `fc_`; it never changes the site's own tables, functions, triggers or policies.
2. Supabase, Authentication, URL Configuration: leave Site URL as the site. Add `https://cards.finessemedia.pro/**` to Redirect URLs. Set up custom SMTP (Resend) before launch; the built-in sender only allows a few emails per hour.
3. Push this folder to a new GitHub repo. Netlify: Add new site, Import from GitHub (CI deploy, not drag-and-drop: this app has a build step and functions).
4. Netlify, Site configuration, Environment variables:
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_PUBLIC_ORIGIN`
   - server only: `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_TEAM`
5. Custom domain: Netlify, Domain management, add `cards.finessemedia.pro` (or the product domain). Add the CNAME at your registrar.
6. Stripe: create Pro and Team monthly prices; webhook to `https://YOUR-DOMAIN/.netlify/functions/stripe-webhook` with checkout.session.completed, customer.subscription.updated, customer.subscription.deleted.
7. Platform admins live in `fc_admins` (separate from the site's `admin_users`). Check with `select * from fc_admins;`

## Where things live
- `src/lib/theme.ts` color derivation, presets, randomizers, element registry, font pairs
- `src/styles/buttons.css` the button library (shapes, sizes, styles, textures)
- `src/templates/` the ten layouts and their shared blocks
- `src/lib/socials.ts` 57 networks with brand icons
- `src/lib/plans.ts` app name and pricing
