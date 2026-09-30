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

export const PLANS = [
  { id: 'free', name: 'Lite', price: 0, yearly: 0, per: 'forever',
    pitch: 'A clean card that gets the job done.',
    features: ['1 card', '3 Lite designs', 'Preview every Pro design on your own card', 'Colors, fonts and dice shuffle', 'Save to contacts, QR and NFC', 'Small "Made with Sello" badge'] },
  { id: 'pro', name: 'Pro', price: 8, yearly: 72, per: 'month', featured: true,
    pitch: 'Every design, forever growing.',
    features: ['Up to 3 cards', 'All 107 designs', 'Every new Sello Drop, 3 to 5 designs every other month', 'Brand kit and custom fonts', 'No badge', 'Tap and save stats (coming soon)'] },
  { id: 'team', name: 'Business', price: 39, yearly: 390, per: 'month',
    pitch: 'Matching cards for your whole staff.',
    features: ['Everything in Pro', '5 team cards included', 'Brand lock so staff stay on brand (coming soon)', 'Team page and admin dashboard (coming soon)', 'Custom domain', 'Priority help from Finesse Media'] },
] as const;

export const FOUNDING = { spots: 100, price: 5, note: 'Founding members: the first 100 Pro subscribers lock in $5 a month for life.' };

/** Done-for-you work by Finesse Media. Every Studio card is hosted on Sello (Pro or Business). */
export const STUDIO = [
  { id: 'signature', name: 'Signature card', from: 249, blurb: 'We design your card from scratch in your exact brand, with custom animation, copywriting and full setup. One round of revisions.' },
  { id: 'portrait', name: 'Living Portrait', from: 99, blurb: 'Your photo becomes a short looping video of you smiling and waving. AI-animated from a photo, or filmed live at a headshot session.' },
  { id: 'tap', name: 'Tap products', from: 29, blurb: 'Metal, wood or matte NFC cards, plus "Tap to book" countertop stands and window decals for your shop.' },
  { id: 'team', name: 'Team setup', from: 35, per: 'person', blurb: 'We build every staff card, shoot matching headshots and deliver branded NFC cards to the whole team.' },
] as const;

export const STUDIO_CONTACT = {
  whatsapp: 'https://wa.me/14079609004?text=' + encodeURIComponent("Hi Finesse Media, I'm interested in Sello Studio."),
  email: 'mailto:angel@finessemedia.pro?subject=' + encodeURIComponent('Sello Studio'),
};
