# Review changes, evidence and open decisions

Everything here is in the working copy only. **Nothing has been deployed, published, migrated, or changed in Stripe or DNS.**
The Nova TEST draft (a96b0b85-02eb-42fa-b10d-9d78cb811288) was never written to: its content fingerprint, published state and last-updated time are identical before and after.

## What was verified before changing (original code, measured)
| Claim | Finding |
|---|---|
| Editor writes when only opened | True. Opening a card sent one save including `published`. |
| Autosave can undo a takedown | True. A stale editor tab re-published a card an admin had unpublished. |
| Save status visible on phones | False. A CSS rule hid it, and there was no Retry anywhere. |
| Design counts conflict | True, and worse: totals of 107, 117, 150 and 97 appeared; Tech and IT said 14 vs "Seven", Barbershops 10 vs "Four". |
| Previews exposed to keyboards | True. 1,231 sample links and buttons across 106 previews. |
| Terms and Privacy | Signup said "you agree" with no documents existing. |
| English/Spanish support | Did not exist in the code. |
| Founding price mismatch | True. $5 for life on the homepage, $8 on signup, count race, rejoin loophole. |

## What changed
1. **Editor.** Content-only autosave (never touches `published`), no write on open, one save at a time, Retry, real error reasons, offline wording, leave-warning. Publishing is its own confirmed step. Draft/Published always visible; Preview never publishes. Optional quick setup for a first card (details, design, private preview); existing users are not forced into it. Advanced styling folded away. Lite users see free designs everywhere.
2. **Counts.** One module computes every number from the same data the screens render, plan-aware, English and Spanish. `npm run check:copy` guards it.
3. **Sign-in.** See `docs/AUTH.md`.
4. **Founding offer.** See `docs/PRICING-RULES.md` (migration 0013, functions, UI).
5. **Two purchase paths.** "Make it yourself" vs "Done for you" with the required subscription beside "from $249", what-you-pay and how-it-works, included lists, and "Request a free consult on WhatsApp".
6. **Trust and accessibility.** Decorative previews are inert (0 exposed controls), 105 labelled "Open demo" links to a real interactive demo page, unfinished features marked "coming soon", Terms and Privacy pages and links (`docs/LEGAL-REVIEW.md`).
7. **EN/ES toggle.** See `docs/I18N.md`.
Also fixed: a 25,000px sideways-scroll bug on the phone landing page.

## Test results (all passing at the end)
| Suite | Checks |
|---|---|
| Editor saving, publishing, failure and retry (real code, mocked network) | 25 |
| Quick setup, Lite, existing users, desktop and phone | 50 |
| Sign-in scenarios in isolated browsers | 31 |
| Language toggle, Spanish screens, legal pages, offer display | 39 |
| Landing, keyboard, demos, Studio copy, legal links | 26 |
| Admin portal (demo) | 23 |
| Business pricing UI (demo) | 29 |
| Database, Lite and public restrictions (rolled back) | 11 |
| Database, Business card limits (rolled back) | 18 |
| Database, founding offer incl. attack cases (rolled back) | 27 |
| `check:copy`, `check:i18n` (619 phrases) | pass |

## Not tested or not claimed
Real iPhone or Android devices (an iPhone-like Chromium window only); real email delivery; WhatsApp delivery; real Stripe payments or webhooks; DNS or subdomain provisioning; simultaneous founding checkouts.

## Needs your decision or approval before deployment
1. Apply migration 0013, deploy the two functions, add the Stripe event `checkout.session.expired`, and test in Stripe test mode.
2. Confirm the founding rules (especially never reopening a spot after cancelling).
3. Lawyer review of Terms and Privacy; your refund policy.
4. Headline "117 designs" (was "107", which is really the layout count).
5. Studio facts: where the card lives, editing access, ongoing costs, delivery time, revisions. The old "edit it anytime" claim was removed until confirmed.
6. Spanish wording review.
