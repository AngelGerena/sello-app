/* Pricing and plan rules live here so they can change without touching screens.
   Stripe price IDs live in Netlify env (STRIPE_PRICE_PRO, STRIPE_PRICE_TEAM, and the yearly ones later).
   Plan ids stay 'free' | 'pro' | 'team' to match the database; display names are Lite, Pro, Business. */
import type { TemplateId } from './types';

export const APP_NAME = 'Sello';
export type PlanId = 'free' | 'pro' | 'team';

/** The three designs anyone can publish on the free Lite plan. Everything else is Pro. */
export const FREE_TEMPLATES: TemplateId[] = ['arch', 'header', 'swiss'];
/** What a Lite card falls back to publicly if it is set to a Pro design. Keep in sync with fc_public_card(). */
export const FREE_FALLBACK: TemplateId = 'arch';

export const isLocked = (plan: PlanId, template: string) => plan === 'free' && !FREE_TEMPLATES.includes(template as TemplateId);

export interface PlanDef {
  id: PlanId; name: string; price: number; yearly: number; per: string; pitch: string; features: string[];
  featured?: boolean;
  /** Business: the price is per card, and a team picks how many cards it needs. */
  perCard?: boolean;
}

export const PLANS: PlanDef[] = [
  { id: 'free', name: 'Lite', price: 0, yearly: 0, per: 'forever',
    pitch: 'A clean card that gets the job done.',
    features: ['1 card', '3 Lite designs', 'Preview every Pro design on your own card', 'Colors, fonts and dice shuffle', 'Save to contacts, QR and NFC', 'Small "Made with Sello" badge'] },
  { id: 'pro', name: 'Pro', price: 8, yearly: 72, per: 'month', featured: true,
    pitch: 'Every design, forever growing.',
    features: ['Up to 3 cards', 'All 107 designs', 'Every new Sello Drop, 3 to 5 designs every other month', 'Brand kit and custom fonts', 'No badge', 'Tap and save stats (coming soon)'] },
  { id: 'team', name: 'Business', price: 6, yearly: 60, per: 'card / month', perCard: true,
    pitch: 'Matching cards for your whole staff. Pay only for the cards you need.',
    features: ['Everything in Pro', 'Pay per card, from 3 cards', 'Brand lock so staff stay on brand (coming soon)', 'Team page and admin dashboard (coming soon)', 'Custom domain (coming soon)', 'Priority support, straight from me'] },
];

/* Business is billed per card. Keep these in step with supabase/functions/_shared/sello.ts. */
export const TEAM = { min: 3, max: 100, initial: 5, monthly: 6, yearly: 60 };
export const clampCards = (n: number): number => {
  const v = Math.round(Number(n));
  return Number.isFinite(v) ? Math.min(TEAM.max, Math.max(TEAM.min, v)) : TEAM.initial;
};
/** What a Business team pays: per month when billed monthly, per year when billed yearly. */
export const teamTotal = (cards: number, yearly: boolean): number => clampCards(cards) * (yearly ? TEAM.yearly : TEAM.monthly);
/** How many cards an account may have. Keep in step with fc_card_limit() in the database. */
export const cardLimit = (plan: PlanId, seats?: number | null): number => (plan === 'team' ? Math.max(1, seats ?? TEAM.initial) : plan === 'pro' ? 3 : 1);

export const FOUNDING = { spots: 100, price: 5, note: 'Founding members: the first 100 Pro subscribers lock in $5 a month for life.' };

/** Done-for-you work by Finesse Media. Every Studio card is hosted on Sello (Pro or Business). */
export const STUDIO = [
  { id: 'signature', name: 'Signature card', from: 249, blurb: 'I design your card from scratch in your exact brand, with custom animation, copywriting and full setup. One round of revisions is included.' },
  { id: 'portrait', name: 'Living Portrait', from: 99, blurb: 'I turn your photo into a short looping video of you smiling and waving. Animated from a photo you already have, or filmed live at a headshot session.' },
  { id: 'tap', name: 'Tap products', from: 29, blurb: 'I supply metal, wood or matte NFC cards, plus "Tap to book" countertop stands and window decals for your shop.' },
  { id: 'team', name: 'Team setup', from: 35, per: 'person', blurb: 'I build every staff card, shoot matching headshots and deliver branded NFC cards to the whole team.' },
] as const;

export const STUDIO_CONTACT = {
  whatsapp: 'https://wa.me/14079609004?text=' + encodeURIComponent("Hi Angel, I'm interested in Sello Studio."),
  email: 'mailto:angel@finessemedia.pro?subject=' + encodeURIComponent('Sello Studio'),
};

/** Pro customers who want Business message me directly (the billing portal can only cancel or update a card). */
export const BUSINESS_CONTACT = 'https://wa.me/14079609004?text=' + encodeURIComponent("Hi Angel, I'd like to move my Sello account to Business.");
/** Business customers who need more (or fewer) cards message me; I change the card count in Stripe and the site follows. */
export const MORE_CARDS_CONTACT = (cards: number) => 'https://wa.me/14079609004?text=' + encodeURIComponent(`Hi Angel, my Sello Business account has ${cards} cards and I'd like to change that number.`);
