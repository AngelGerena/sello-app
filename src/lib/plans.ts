/* Pricing and plan rules live here so they can change without touching screens.
   Stripe price IDs live in Netlify env (STRIPE_PRICE_PRO, STRIPE_PRICE_TEAM, and the yearly ones later).
   Plan ids stay 'free' | 'pro' | 'plus' | 'team' to match the database; display names are Lite, Pro, Pro Plus, Business. */
import type { TemplateId } from './types';

export const APP_NAME = 'OKUNAMI';
export type PlanId = 'free' | 'pro' | 'plus' | 'team';

/** The three designs anyone can publish on the free Lite plan. Everything else is Pro. */
export const FREE_TEMPLATES: TemplateId[] = ['arch', 'header', 'swiss'];
/** What a Lite card falls back to publicly if it is set to a Pro design. Keep in sync with fc_public_card(). */
export const FREE_FALLBACK: TemplateId = 'arch';

export const isLocked = (plan: PlanId, template: string) => plan === 'free' && !FREE_TEMPLATES.includes(template as TemplateId);

export interface PlanDef {
  id: PlanId; name: string; price: number; yearly: number; per: string; pitch: string; features: string[];
  featured?: boolean;
  /** How many cards the plan includes. */
  cards: number;
}

/* Keep these prices in step with supabase/functions/_shared/okunami.ts and with the Stripe Payment Links.
   Pro Plus: the card count is one number here and in fc_card_limit() (migration 0014). */
export const PLUS_CARDS = 1;
export const BUSINESS_CARDS = 5;

export const PLANS: PlanDef[] = [
  { id: 'free', name: 'Lite', price: 0, yearly: 0, per: 'forever', cards: 1,
    pitch: 'A clean card that gets the job done.',
    features: ['1 card', '3 Lite designs', 'Preview every Pro design on your own card', 'Colors, fonts and dice shuffle', 'Save to contacts, QR and NFC', 'Small "Made with OKUNAMI" badge'] },
  { id: 'pro', name: 'Pro', price: 8, yearly: 79, per: 'month', featured: true, cards: 3,
    pitch: 'Every design, forever growing.',
    features: ['Up to 3 cards', 'All {designs} designs', 'Every new OKUNAMI Drop, 3 to 5 designs every other month', 'Brand kit and custom fonts', 'No badge', 'Tap and save stats (coming soon)'] },
  { id: 'plus', name: 'Pro Plus', price: 16, yearly: 149, per: 'month', cards: PLUS_CARDS,
    pitch: 'Everything in Pro, plus hands-on help from me.',
    features: ['Everything in Pro', '1 card', 'Event sections (coming soon)', 'Multiple languages on your card (coming soon)', 'Connect a domain you already own (coming soon)', 'Two done-for-you edits a month by Finesse Media'] },
  { id: 'team', name: 'Business', price: 41, yearly: 399, per: 'month', cards: BUSINESS_CARDS,
    pitch: 'Matching cards for your whole team.',
    features: ['Everything in Pro', '5 cards included', 'Matching designs with brand lock (coming soon)', 'Team admin (coming soon)', 'Priority support, straight from me'] },
];

/** How many cards an account may have. Keep in step with fc_card_limit() in the database. */
export const cardLimit = (plan: PlanId, seats?: number | null): number => (plan === 'team' ? Math.max(1, seats ?? BUSINESS_CARDS) : plan === 'plus' ? PLUS_CARDS : plan === 'pro' ? 3 : 1);
/** Plans that are paid (every design unlocked, no badge). */
export const isPaid = (plan: PlanId) => plan !== 'free';

/** Done-for-you work by Finesse Media (OKUNAMI Studio). Studio cards are hosted on OKUNAMI and need a Pro, Pro Plus or Business subscription.
    `includes` lists only what has been approved for each package: add to it when you confirm more. */
export const STUDIO = [
  { id: 'signature', name: 'Signature card', from: 249, cardPackage: true,
    blurb: 'I design your card from scratch in your exact brand.',
    includes: ['A card designed from scratch in your exact brand', 'Custom animation', 'Copywriting', 'Full setup', 'One round of revisions'] },
  { id: 'portrait', name: 'Living Portrait', from: 99,
    blurb: 'Your photo becomes a short looping video of you smiling and waving.',
    includes: ['Animated from a photo you already have, or filmed live at a headshot session'] },
  { id: 'tap', name: 'Tap products', from: 29,
    blurb: 'Physical products that open your card with a tap.',
    includes: ['Metal, wood or matte NFC cards', '"Tap to book" countertop stands and window decals'] },
  { id: 'team', name: 'Team setup', from: 35, per: 'person', cardPackage: true,
    blurb: 'I set up every staff card so the whole team matches.',
    includes: ['Every staff card built', 'Matching headshots', 'Branded NFC cards for the whole team'] },
] as const;

export const STUDIO_CONTACT = {
  /** Opens WhatsApp (a chat with me). The page says so before the click. */
  whatsapp: 'https://wa.me/14079609004?text=' + encodeURIComponent("Hi Angel, I'd like to request a free consult for OKUNAMI Studio."),
  email: 'mailto:angel@finessemedia.pro?subject=' + encodeURIComponent('OKUNAMI Studio'),
};

/** Pro customers who want Business message me directly (the billing portal can only cancel or update a card). */
export const BUSINESS_CONTACT = 'https://wa.me/14079609004?text=' + encodeURIComponent("Hi Angel, I'd like to move my OKUNAMI account to Business.");
