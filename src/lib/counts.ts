/* One source of truth for every "how many designs" number the site shows.
   Counts are computed from the same data that renders the options, and respect the viewer's plan, so a
   label can never disagree with what is on screen. Never type a design, layout or niche count by hand.

   Definitions
     layout  a page structure (Classic or a niche layout). LAYOUT_COUNT
     design  a ready-made look: a layout with colors, fonts and buttons, shown under a niche. A design that
             several niches share is counted once overall. DESIGN_COUNT
     niche   a line of work with its own set of designs. NICHE_COUNT */
import { ALL_DESIGNS, NICHES, liteDesigns, type Niche } from './niches';
import { TEMPLATES } from '../templates';
import { isLocked, type PlanId } from './plans';

export type Lang = 'en' | 'es';

/** The one list of selectable designs. The "All designs" tab renders exactly this list. */
export const UNIQUE_DESIGNS = (() => {
  const seen = new Set<string>();
  return ALL_DESIGNS.filter(({ design }) => {
    const k = design.template + design.name + design.seeds.brand;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
})();
export const DESIGN_COUNT = UNIQUE_DESIGNS.length;
export const LAYOUT_COUNT = TEMPLATES.length;
export const NICHE_COUNT = NICHES.length;

export interface NicheCounts {
  /** Designs this viewer can publish without upgrading. */
  free: number;
  /** Designs shown but locked to Pro for this viewer (they can still try them). */
  locked: number;
  /** Everything shown for this niche. */
  total: number;
}

/** What a niche offers THIS viewer. On Lite, three generic free designs are shown beside the locked Pro ones. */
export function nicheCounts(niche: Niche, plan: PlanId): NicheCounts {
  const locked = niche.designs.filter((d) => isLocked(plan, d.template)).length;
  const free = (plan === 'free' ? liteDesigns(niche).length : 0) + niche.designs.length - locked;
  return { free, locked, total: free + locked };
}

const pluralIndex = (n: number, lang: Lang) => (new Intl.PluralRules(lang).select(n) === 'one' ? 0 : 1);
const NOUN: Record<Lang, [string, string]> = { en: ['design', 'designs'], es: ['diseño', 'diseños'] };

/** "1 design", "14 designs", "14 diseños" */
export const designsLabel = (n: number, lang: Lang = 'en') => `${n} ${NOUN[lang][pluralIndex(n, lang)]}`;

/** The label next to a niche: "14 designs" for paying plans, "3 free + 14 Pro designs" on Lite. */
export function nicheCountLabel(niche: Niche, plan: PlanId, lang: Lang = 'en'): string {
  const c = nicheCounts(niche, plan);
  if (plan !== 'free' || c.locked === 0) return designsLabel(c.total, lang);
  return lang === 'es'
    ? `${c.free} gratis + ${c.locked} ${NOUN.es[pluralIndex(c.locked, 'es')]} Pro`
    : `${c.free} free + ${c.locked} Pro ${NOUN.en[pluralIndex(c.locked, 'en')]}`;
}

/** Fills {designs}, {layouts} and {niches} in feature copy, so plan text can never go stale. */
export const feature = (text: string): string =>
  text.replace(/\{designs\}/g, String(DESIGN_COUNT)).replace(/\{layouts\}/g, String(LAYOUT_COUNT)).replace(/\{niches\}/g, String(NICHE_COUNT));
