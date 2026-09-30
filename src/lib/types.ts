/* Shapes mirror the Supabase schema (supabase/migrations). camelCase here = snake_case in Postgres. */

export type Mode = 'light' | 'dark';

/** The color roles every template paints with. */
export interface Tokens {
  bg: string;        // page ground
  surface: string;   // cards and tiles
  text: string;      // body copy and headings
  muted: string;     // captions
  brand: string;     // structural color (primary buttons, bands)
  onBrand: string;   // text on brand
  accent: string;    // the one thing the eye should catch
  onAccent: string;
  soft: string;      // tinted fills (chips, badges, icon wells)
  line: string;      // hairlines and borders
  band: string;      // deep hero bands and dark tiles (stays deep in both modes)
  onBand: string;
}

/** Individually recolorable parts of the card. Unset = follows its role token. */
export type ElementId =
  | 'pageBg' | 'cardBg' | 'name' | 'title' | 'body' | 'caption'
  | 'btnPrimaryBg' | 'btnPrimaryText' | 'btnSecondaryBg' | 'btnSecondaryText'
  | 'icons' | 'iconBg' | 'accentDetail' | 'links' | 'dockBg' | 'dividers' | 'heroBand';

export type ButtonShape = 'pill' | 'rounded' | 'soft' | 'square' | 'leaf' | 'chamfer' | 'tab' | 'arch';
export type ButtonSize = 'compact' | 'regular' | 'large';
export type ButtonStyle = 'solid' | 'soft' | 'outline' | 'glass' | 'gradient' | 'raised' | 'neumorphic' | 'ghost' | 'duotone' | 'inset' | 'neon' | 'hud';
export type ButtonTexture = 'none' | 'grain' | 'linen' | 'brushed' | 'paper' | 'satin' | 'carbon' | 'dots' | 'scanline' | 'circuit';

/** How the card sounds when tapped. */
export type SoundProfile = 'calm' | 'tech' | 'bright' | 'off';

export interface ButtonSpec { shape: ButtonShape; size: ButtonSize; style: ButtonStyle; texture: ButtonTexture; }

export interface FontSpec {
  display: string;            // family name
  body: string;
  customDisplayUrl?: string;  // uploaded font file from a brand kit
  customBodyUrl?: string;
}

export interface Theme {
  modeDefault: Mode | 'auto';   // what visitors see first
  tokens: Record<Mode, Tokens>;
  overrides: Record<Mode, Partial<Record<ElementId, string>>>;
  fonts: FontSpec;
  button: ButtonSpec;
  cornerScale: number;          // 0 to 1.5, multiplies card radii
  kit: string[];
  sound?: SoundProfile;         // default calm                // brand kit swatches (from logo, pasted hex codes or an imported kit)
}

export type TemplateId =
  | 'cover' | 'arch' | 'header' | 'bizcard' | 'app'
  | 'rail' | 'radial' | 'swiss' | 'bento' | 'journey'
  // niche layouts
  | 'realestate' | 'photo' | 'foodtruck' | 'apparel' | 'mechanic'
  | 'handyman' | 'esthetics' | 'creator' | 'retail' | 'tech'
  | 'barber' | 'church' | 'fitness' | 'advisor' | 'bistro' | 'stage'
  // signature collection
  | 'quantum' | 'terminal' | 'cyber' | 'aurora' | 'radar' | 'circuit' | 'blueprint'
  | 'velvet' | 'fade' | 'oldschool' | 'blush' | 'vanity' | 'silk' | 'gloss'
  | 'marquee' | 'passport' | 'estate' | 'garden' | 'scoreboard' | 'signature'
  // collection two
  | 'hologram' | 'mission' | 'poster' | 'liquid' | 'starfield' | 'cmdk' | 'synthwave'
  | 'pole' | 'goldleaf' | 'lash' | 'rosegold' | 'swatch' | 'nowserving' | 'perfume'
  | 'vinyl' | 'boarding' | 'recipe' | 'toolbelt' | 'stained' | 'trading'
  | 'turntable' | 'waveform' | 'confetti' | 'invitation' | 'monogram' | 'inbox' | 'planner'
  // collection three: barber, nails, salon, massage
  | 'razor' | 'chalkboard' | 'neonsign' | 'clipper' | 'polish' | 'shimmer' | 'tips'
  | 'blowout' | 'stations' | 'magazine' | 'stones' | 'lotus' | 'bamboo'
  // collection four
  | 'casefile' | 'contactsheet' | 'flash' | 'orderticket' | 'hangtag' | 'bag' | 'postcard'
  | 'floorplan' | 'ledger' | 'hymnboard' | 'cluster' | 'stopwatch' | 'diner' | 'yardsign'
  // worship collection
  | 'santuario' | 'celestial' | 'vitral' | 'frecuencia' | 'constelacion' | 'escenario' | 'salmo';

export interface SocialLink { id: string; network: string; value: string; }   // value = handle or full URL
export interface Highlight { id: string; icon: string; title: string; subtitle: string; }

export interface Address { street: string; city: string; region: string; zip: string; country: string; }

export interface CardData {
  slug: string;
  fullName: string;
  credentials: string;     // e.g. PMHNP-BC
  jobTitle: string;
  business: string;
  tagline: string;
  photoUrl: string;
  logoUrl: string;
  phone: string;
  whatsapp: string;        // WhatsApp Business number, digits with country code
  email: string;
  website: string;
  bookingUrl: string;
  hasLocation: boolean;    // brick and mortar
  address: Address;
  socials: SocialLink[];
  highlightsTitle: string;
  highlights: Highlight[];
  showCrisis: boolean;     // 988 safety card for health and counseling practices
  niche: string;           // niche id the owner picked (drives designs, suggestions)
  gallery: string[];       // up to 9 photos (work, menu, listings, lookbook)
  hours: string;           // free text, e.g. Tue-Sat 11am-8pm
  /* optional extras used by the Worship collection (any design may read them) */
  orgLogoUrl?: string;     // full logo lockup (wide), shown under the name
  kicker?: string;         // short accent line above the name
  photoVideoUrl?: string;  // living portrait: silent clip over the photo, plays once
  music?: { url: string; title: string; sub?: string };  // background music, starts on first tap
}

export interface Card {
  id: string;
  template: TemplateId;
  data: CardData;
  theme: Theme;
  published: boolean;
  updatedAt: string;
  badge?: boolean;   // free plan shows "Made with" on the public page
}

/** A saved style: colors, custom element colors, fonts, buttons and corners, plus the layout it was saved with. */
export interface Look {
  id: string;
  name: string;
  theme: Theme;
  template: TemplateId;
  createdAt: string;
  updatedAt: string;
}
