# Founding offer: rules, enforcement and rollout

## The rules
1. $5 a month (the price is a setting), **Pro billed monthly only**, for the **first 100 paying customers**.
2. A spot is **reserved atomically** when checkout starts and held 45 minutes. Unpaid checkouts release their spot (hold expiry, or Stripe's `checkout.session.expired`).
3. **One per person.** Gmail dots, `+tags`, `googlemail.com` and capitalization all count as the same address. One account cannot hold two spots.
4. The price lasts **while the subscription stays active**. If it ends, the spot is **never reopened** and cannot be claimed again, on any account or email.
5. **No stacking**: promo codes are switched off on a founding checkout. No founding price on yearly or Business.
6. The browser can ask for nothing: it sends only plan, interval and card count, all clamped on the server. Price and eligibility come from the database.

## Where each rule lives
| Rule | Enforced in |
|---|---|
| Offer on/off, spots, price, hold time | `fc_offer_config` (one row, key `founding`). Only the server can read or change it. |
| Atomic claim, one per person, no recycling | `fc_claim_founding` (advisory lock) and the unique indexes on `fc_founding_claims` |
| Spots left shown on the site | `fc_offer_status()` (public, read-only) via `src/lib/offers.ts` |
| Price, no promo stacking, quantity limits | `supabase/functions/_shared/checkout.ts` (pure, unit-tested) |
| Activation and lapse | `okunami-stripe-webhook` |

If `fc_offer_status` cannot be read (for example before the migration is applied), the website says **nothing** about the offer, and checkout charges the regular price.

## Running it
```sql
-- see status
select public.fc_offer_status();
-- end the offer
update public.fc_offer_config set value = jsonb_set(value, '{active}', 'false') where key = 'founding';
-- change spots or price (cents)
update public.fc_offer_config set value = jsonb_set(jsonb_set(value, '{spots}', '50'), '{price_cents}', '600') where key = 'founding';
```

## Rollout checklist (needs approval, none of it is done yet)
1. Apply `supabase/migrations/0013_founding_offer.sql`.
2. Deploy `okunami-checkout` and `okunami-stripe-webhook` (and the shared files they import).
3. In Stripe, add the event `checkout.session.expired` to the existing webhook endpoint.
4. In Stripe **test mode**: pay as founding member 1, confirm `fc_profiles.founding = true` and a claim with status `active`; cancel, confirm `lapsed` and that re-subscribing charges $8; abandon a checkout and confirm the spot is released after it expires.

## Tested so far
27 database checks (rolled back, nothing kept) and 9 checkout-builder cases. **Not tested:** real Stripe payments, truly simultaneous checkouts (the lock is exercised in sequence), a Stripe-side plan change made by hand in the Stripe dashboard.

## Current price list (October 2026)

| Plan | Monthly | Yearly | Cards | Notes |
|---|---|---|---|---|
| Lite | free | free | 1 | 3 Lite designs, small badge |
| Pro | $8 | $79 | 3 | Founding price $5 on Pro monthly only |
| Pro Plus | $16 | $149 | 1 (one constant, see below) | Everything in Pro plus event sections, multiple languages, own domain, two done-for-you edits a month. Event sections, languages and own domain are marked "coming soon" on the site until they exist. |
| Business | $41 | $399 | 5 included | Flat price. Brand lock and team admin are marked "coming soon". Extra cards are not offered. |

- Amounts live in `src/lib/plans.ts` (screens) and `supabase/functions/_shared/okunami.ts` (what Stripe charges). Change both together.
- Pro Plus card count: `PLUS_CARDS` in `plans.ts` and `when 'plus' then 1` in `fc_card_limit()` (migration 0014).
- Stripe Payment Links: a purchase made through a Payment Link has no OKUNAMI metadata. The webhook identifies the plan by price id (if `OKUNAMI_PRICE_*` secrets are set) or by the amount charged, and finds the account by the email used at payment. An amount it does not recognise never grants a paid plan.
- The founding promo code for Payment Links is not wired in. The database enforces the founding offer only for website checkout.
