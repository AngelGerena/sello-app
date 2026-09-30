import type { ButtonSpec, ElementId, Mode, Theme, Tokens } from './types';
import { bestInk, contrast, ensureContrast, hexToHsl, hsl, mix } from './color';

/* ---------------------------------------------------------------
   Seeds -> full light and dark token sets.
   A user (or the dice) picks 2-3 colors; everything else is derived
   so every combination stays readable in both modes.
   --------------------------------------------------------------- */
export interface Seeds { brand: string; accent: string; ground?: string; }

export function deriveTokens(seeds: Seeds): Record<Mode, Tokens> {
  const b = hexToHsl(seeds.brand);
  const g = seeds.ground ? hexToHsl(seeds.ground) : { h: b.h, s: Math.min(b.s, 28), l: 96 };

  // ---- light
  const lbg = seeds.ground ?? hsl(g.h, Math.min(g.s, 30), 96);
  const lsurface = mix(lbg, '#FFFFFF', 0.72);
  const ltext = ensureContrast(hsl(b.h, Math.min(b.s, 30), 13), lbg, 11);
  const lmuted = ensureContrast(hsl(b.h, Math.min(b.s, 14), 38), lbg, 4.6);
  const lbrand = ensureContrast(seeds.brand, lsurface, 4.6);
  const laccent = ensureContrast(seeds.accent, lbg, 3); // accent often carries small text
  const light: Tokens = {
    bg: lbg, surface: lsurface, text: ltext, muted: lmuted,
    brand: lbrand, onBrand: bestInk(lbrand, '#141414', '#FFFFFF'),
    accent: laccent, onAccent: bestInk(laccent),
    soft: mix(lbrand, lbg, 0.84), line: mix(ltext, lbg, 0.86),
    band: lbrand, onBand: bestInk(lbrand),
  };

  // ---- dark
  const dbg = hsl(b.h, Math.min(b.s, 22), 8);
  const dsurface = hsl(b.h, Math.min(b.s, 18), 13);
  const dtext = hsl(b.h, Math.min(b.s, 16), 93);
  const dmuted = ensureContrast(hsl(b.h, Math.min(b.s, 10), 68), dbg, 4.6);
  const acc = hexToHsl(seeds.accent);
  const daccent = ensureContrast(hsl(acc.h, acc.s, Math.max(acc.l, 60)), dbg, 4.5);
  // An ink-black brand has no color to lighten; in dark mode the accent carries the main button instead.
  const inkBrand = b.l < 22 && b.s < 45;
  const dbrand = inkBrand ? daccent : ensureContrast(hsl(b.h, Math.min(b.s + 6, 70), Math.max(b.l, 62)), dsurface, 4.6);
  const dband = hsl(b.h, Math.min(b.s, 45), 20);
  const dark: Tokens = {
    bg: dbg, surface: dsurface, text: dtext, muted: dmuted,
    brand: dbrand, onBrand: bestInk(dbrand, '#111111', '#FFFFFF'),
    accent: daccent, onAccent: bestInk(daccent),
    soft: mix(dbrand, dbg, 0.82), line: mix(dtext, dbg, 0.84),
    band: dband, onBand: bestInk(dband),
  };
  return { light, dark };
}

/* ---------------------------------------------------------------
   Curated palettes (the "Browse" row). Seeds only.
   --------------------------------------------------------------- */
export const PRESETS: { id: string; name: string; seeds: Seeds }[] = [
  { id: 'sage',      name: 'Sage Clinic',    seeds: { brand: '#2C3A28', accent: '#C4A44A', ground: '#F7F4EE' } },
  { id: 'midnight',  name: 'Midnight Gold',  seeds: { brand: '#1C2640', accent: '#C5A44B', ground: '#F2ECE4' } },
  { id: 'harbor',    name: 'Harbor',         seeds: { brand: '#12436B', accent: '#E07A3F', ground: '#F3F6F8' } },
  { id: 'clay',      name: 'Clay Studio',    seeds: { brand: '#7A3B2E', accent: '#2F6F6A', ground: '#F6EFE9' } },
  { id: 'orchid',    name: 'Orchid Salon',   seeds: { brand: '#5B2A5E', accent: '#E8A0B4', ground: '#FAF3F6' } },
  { id: 'citrus',    name: 'Citrus Kitchen', seeds: { brand: '#1F4D3A', accent: '#F2A900', ground: '#FBF7EC' } },
  { id: 'granite',   name: 'Granite',        seeds: { brand: '#2E3338', accent: '#B08D57', ground: '#F1F1EF' } },
  { id: 'coral',     name: 'Coral Reef',     seeds: { brand: '#0F5257', accent: '#FF6F59', ground: '#F2F7F6' } },
  { id: 'cathedral', name: 'Cathedral',      seeds: { brand: '#3A2C6B', accent: '#D4AF37', ground: '#F5F3FA' } },
  { id: 'denim',     name: 'Denim Works',    seeds: { brand: '#27408B', accent: '#F4C542', ground: '#F4F6FB' } },
  { id: 'terracotta',name: 'Terracotta',     seeds: { brand: '#8C3B22', accent: '#3E7C59', ground: '#FAF2EC' } },
  { id: 'ink',       name: 'Ink and Paper',  seeds: { brand: '#161616', accent: '#D0342C', ground: '#F4F2EE' } },
];

/* ---------------------------------------------------------------
   Randomizers. Harmony-based, not raw random, so results look designed.
   Locks let the user keep brand or accent while shuffling the rest.
   --------------------------------------------------------------- */
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)];

export type Harmony = 'complementary' | 'analogous' | 'triadic' | 'split' | 'monochrome';
export const HARMONIES: Harmony[] = ['complementary', 'analogous', 'triadic', 'split', 'monochrome'];

export function randomSeeds(lock: { brand?: string; accent?: string } = {}, harmony: Harmony = pick(HARMONIES)): Seeds & { harmony: Harmony } {
  const brand = lock.brand ?? hsl(rnd(0, 360), rnd(30, 62), rnd(20, 34));
  const h = hexToHsl(brand).h;
  const offset = { complementary: 180, analogous: pick([35, -35]), triadic: pick([120, -120]), split: pick([150, -150]), monochrome: 0 }[harmony];
  const accent = lock.accent ?? (harmony === 'monochrome'
    ? hsl(h, rnd(40, 70), rnd(62, 74))
    : hsl(h + offset + rnd(-8, 8), rnd(50, 80), rnd(46, 60)));
  const ground = hsl(h + rnd(-20, 20), rnd(12, 34), rnd(95, 97.5));
  return { brand, accent, ground, harmony };
}

export const BUTTON_SHAPES = ['pill', 'rounded', 'soft', 'square', 'leaf', 'chamfer', 'tab', 'arch'] as const;
export const BUTTON_SIZES = ['compact', 'regular', 'large'] as const;
export const BUTTON_STYLES = ['solid', 'soft', 'outline', 'glass', 'gradient', 'raised', 'neumorphic', 'ghost', 'duotone', 'inset', 'neon', 'hud'] as const;
export const BUTTON_TEXTURES = ['none', 'grain', 'linen', 'brushed', 'paper', 'satin', 'carbon', 'dots', 'scanline', 'circuit'] as const;

export function randomButton(lock: Partial<ButtonSpec> = {}): ButtonSpec {
  return {
    shape: lock.shape ?? pick(BUTTON_SHAPES),
    size: lock.size ?? pick(['regular', 'regular', 'large', 'compact'] as const),
    style: lock.style ?? pick(BUTTON_STYLES),
    // texture is the seasoning: most shuffles leave it clean
    texture: lock.texture ?? pick(['none', 'none', 'none', ...BUTTON_TEXTURES] as const),
  };
}

/* ---------------------------------------------------------------
   Fonts: curated Google pairs + brand-kit uploads.
   --------------------------------------------------------------- */
export const FONT_PAIRS: { id: string; name: string; display: string; body: string; mood: string }[] = [
  { id: 'playfair-dm',     name: 'Playfair and DM Sans',        display: 'Playfair Display', body: 'DM Sans',       mood: 'Calm, clinical, trusted' },
  { id: 'cormorant-man',   name: 'Cormorant and Manrope',       display: 'Cormorant Garamond', body: 'Manrope',     mood: 'Luxury, editorial' },
  { id: 'fraunces-inter',  name: 'Fraunces and Figtree',        display: 'Fraunces',         body: 'Figtree',       mood: 'Warm, friendly' },
  { id: 'dmserif-work',    name: 'DM Serif and Work Sans',      display: 'DM Serif Display', body: 'Work Sans',     mood: 'Classic, confident' },
  { id: 'syne-karla',      name: 'Syne and Karla',              display: 'Syne',             body: 'Karla',         mood: 'Creative, bold' },
  { id: 'bricolage-hanken',name: 'Bricolage and Hanken',        display: 'Bricolage Grotesque', body: 'Hanken Grotesk', mood: 'Modern, energetic' },
  { id: 'spacegrotesk',    name: 'Space Grotesk and IBM Plex',  display: 'Space Grotesk',    body: 'IBM Plex Sans', mood: 'Tech, precise' },
  { id: 'bodoni-jost',     name: 'Bodoni Moda and Jost',        display: 'Bodoni Moda',      body: 'Jost',          mood: 'Fashion, beauty' },
  { id: 'lora-nunito',     name: 'Lora and Nunito Sans',        display: 'Lora',             body: 'Nunito Sans',   mood: 'Gentle, community' },
  { id: 'oswald-source',   name: 'Oswald and Source Sans',      display: 'Oswald',           body: 'Source Sans 3', mood: 'Trades, strong' },
  { id: 'marcellus-mulish',name: 'Marcellus and Mulish',        display: 'Marcellus',        body: 'Mulish',        mood: 'Church, heritage' },
  { id: 'unbounded-outfit',name: 'Unbounded and Outfit',        display: 'Unbounded',        body: 'Outfit',        mood: 'Nightlife, events' },
];

export function googleFontsHref(families: string[]): string {
  const uniq = [...new Set(families.filter(Boolean))];
  const q = uniq.map((f) => `family=${encodeURIComponent(f).replace(/%20/g, '+')}:wght@400;500;600;700`).join('&');
  return `https://fonts.googleapis.com/css2?${q}&display=swap`;
}

/* ---------------------------------------------------------------
   Element registry: every recolorable part, its role fallback,
   and what it sits on (for the live contrast badge).
   --------------------------------------------------------------- */
export interface ElementDef { id: ElementId; label: string; group: 'Surfaces' | 'Text' | 'Buttons' | 'Details'; role: keyof Tokens; on: ElementId | null; }

export const ELEMENTS: ElementDef[] = [
  { id: 'pageBg',           label: 'Page background',        group: 'Surfaces', role: 'bg',      on: null },
  { id: 'cardBg',           label: 'Cards and tiles',        group: 'Surfaces', role: 'surface', on: null },
  { id: 'heroBand',         label: 'Hero band and dark tiles', group: 'Surfaces', role: 'band',  on: null },
  { id: 'dockBg',           label: 'Bottom dock',            group: 'Surfaces', role: 'surface', on: null },
  { id: 'name',             label: 'Name',                   group: 'Text',     role: 'text',    on: 'pageBg' },
  { id: 'title',            label: 'Title and credentials',  group: 'Text',     role: 'muted',   on: 'pageBg' },
  { id: 'body',             label: 'Body text',              group: 'Text',     role: 'text',    on: 'cardBg' },
  { id: 'caption',          label: 'Captions',               group: 'Text',     role: 'muted',   on: 'cardBg' },
  { id: 'links',            label: 'Text links',             group: 'Text',     role: 'brand',   on: 'pageBg' },
  { id: 'btnPrimaryBg',     label: 'Main button',            group: 'Buttons',  role: 'brand',   on: 'pageBg' },
  { id: 'btnPrimaryText',   label: 'Main button text',       group: 'Buttons',  role: 'onBrand', on: 'btnPrimaryBg' },
  { id: 'btnSecondaryBg',   label: 'Other buttons',          group: 'Buttons',  role: 'surface', on: null },
  { id: 'btnSecondaryText', label: 'Other button text',      group: 'Buttons',  role: 'text',    on: 'btnSecondaryBg' },
  { id: 'icons',            label: 'Icons',                  group: 'Details',  role: 'brand',   on: 'iconBg' },
  { id: 'iconBg',           label: 'Icon wells and chips',   group: 'Details',  role: 'soft',    on: null },
  { id: 'accentDetail',     label: 'Accent details',         group: 'Details',  role: 'accent',  on: 'pageBg' },
  { id: 'dividers',         label: 'Dividers and borders',   group: 'Details',  role: 'line',    on: null },
];

export const ELEMENT_BY_ID = Object.fromEntries(ELEMENTS.map((e) => [e.id, e])) as Record<ElementId, ElementDef>;

/** Resolved color of an element in a mode (override or role). */
export function resolveColor(theme: Theme, mode: Mode, id: ElementId): string {
  return theme.overrides[mode][id] ?? theme.tokens[mode][ELEMENT_BY_ID[id].role];
}

export function elementContrast(theme: Theme, mode: Mode, id: ElementId): number | null {
  const on = ELEMENT_BY_ID[id].on;
  if (!on) return null;
  return contrast(resolveColor(theme, mode, id), resolveColor(theme, mode, on));
}

/** Everything a card needs as CSS custom properties. */
export function themeVars(theme: Theme, mode: Mode): Record<string, string> {
  const t = theme.tokens[mode];
  const vars: Record<string, string> = {};
  (Object.keys(t) as (keyof Tokens)[]).forEach((k) => { vars[`--t-${k}`] = t[k]; });
  ELEMENTS.forEach((e) => { vars[`--c-${e.id}`] = theme.overrides[mode][e.id] ?? t[e.role]; });
  vars['--c-onBand'] = t.onBand;
  vars['--c-onAccent'] = t.onAccent;
  vars['--f-display'] = `'${theme.fonts.display}', Georgia, serif`;
  vars['--f-body'] = `'${theme.fonts.body}', system-ui, sans-serif`;
  vars['--r'] = `${Math.round(22 * theme.cornerScale)}px`;
  vars['--r-sm'] = `${Math.round(14 * theme.cornerScale)}px`;
  vars['--shadow-rgb'] = mode === 'dark' ? '0,0,0' : hexToRgbString(mix(t.text, '#000000', 0.3));
  return vars;
}

function hexToRgbString(hex: string) {
  const v = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16)).join(',');
}

export function themeFromSeeds(seeds: Seeds, base?: Partial<Theme>): Theme {
  return {
    modeDefault: base?.modeDefault ?? 'light',
    tokens: deriveTokens(seeds),
    overrides: { light: {}, dark: {} },
    fonts: base?.fonts ?? { display: 'Playfair Display', body: 'DM Sans' },
    button: base?.button ?? { shape: 'pill', size: 'regular', style: 'solid', texture: 'none' },
    cornerScale: base?.cornerScale ?? 1,
    kit: base?.kit ?? [],
  };
}

export function seedsOf(theme: Theme): Seeds {
  return { brand: theme.tokens.light.brand, accent: theme.tokens.light.accent, ground: theme.tokens.light.bg };
}

/** Layouts that are a dark screen by nature. They render in dark mode even when the visitor's phone is light. */
export const ALWAYS_DARK = new Set<string>(['terminal', 'santuario', 'celestial', 'vitral', 'frecuencia', 'constelacion', 'escenario', 'salmo']);
export const effectiveMode = (template: string, mode: Mode): Mode => (ALWAYS_DARK.has(template) ? 'dark' : mode);
