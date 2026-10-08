import type { ButtonShape, ButtonSize, ButtonSpec, ButtonStyle, ButtonTexture, Card, Highlight, SoundProfile, TemplateId } from './types';
import { themeFromSeeds, type Seeds } from './theme';
import { uid } from './seed';

/* ------------------------------------------------------------------
   A niche is who the card is for (barbershop, realtor, IT pro).
   A design is one finished look for that niche: a layout plus the
   palette, type, buttons and sounds made for it. Niches can share
   layouts; each design still has its own style.
   ------------------------------------------------------------------ */
export interface Design {
  template: TemplateId;
  name: string;
  blurb: string;
  seeds: Seeds;
  mode: 'light' | 'dark';
  fonts: { display: string; body: string };
  button: ButtonSpec;
  sound: SoundProfile;
  cornerScale: number;
  isNew?: boolean;
}

export type NicheGroup = 'Tech' | 'Beauty and grooming' | 'Home and auto' | 'Wellness and fitness' | 'Food and drink' | 'Creative' | 'Professional' | 'Shops' | 'Community';
export const NICHE_GROUPS: NicheGroup[] = ['Tech', 'Beauty and grooming', 'Professional', 'Home and auto', 'Wellness and fitness', 'Food and drink', 'Creative', 'Shops', 'Community'];

export interface Niche {
  id: string;
  name: string;
  group: NicheGroup;
  icon: string;
  blurb: string;
  highlightsTitle: string;
  highlights: Omit<Highlight, 'id'>[];
  tagline: string;
  suggestedLinks: string[];
  designs: Design[];
}

/** Compact design builder: d(template, name, blurb, [brand, accent, ground], mode, [display, body], [shape, size, style, texture], sound, corners) */
function d(
  template: TemplateId, name: string, blurb: string, c: [string, string, string], mode: 'light' | 'dark',
  f: [string, string], b: [ButtonShape, ButtonSize, ButtonStyle, ButtonTexture], sound: SoundProfile, cornerScale: number, isNew = false,
): Design {
  return { template, name, blurb, seeds: { brand: c[0], accent: c[1], ground: c[2] }, mode, fonts: { display: f[0], body: f[1] }, button: { shape: b[0], size: b[1], style: b[2], texture: b[3] }, sound, cornerScale, isNew };
}

/* ----------------------------------------------------------- designs reused across niches */
const MAINFRAME = d('tech', 'Mainframe', 'Boot sequence, neon grid, glitch name, holographic tilt, keyboard commands.', ['#0B1020', '#22E3FF', '#EEF3FA'], 'dark', ['Space Grotesk', 'IBM Plex Sans'], ['chamfer', 'regular', 'hud', 'scanline'], 'tech', 0.35);
const QUANTUM = d('quantum', 'Quantum', 'Orbiting rings circle your photo in 3D, particle dust, frosted glass tiles.', ['#0A0F1F', '#8B7CFF', '#F1F0FA'], 'dark', ['Syncopate', 'Manrope'], ['pill', 'regular', 'glass', 'none'], 'tech', 1, true);
const TERMINAL = d('terminal', 'Terminal', 'A glowing CRT screen types out who you are, command by command.', ['#050A06', '#39FF88', '#EEF5EF'], 'dark', ['VT323', 'IBM Plex Mono'], ['square', 'regular', 'outline', 'scanline'], 'tech', 0, true);
const CYBER = d('cyber', 'Neon District', 'Cyberpunk panels, falling neon rain, slashed buttons and glitch type.', ['#12031F', '#FF2BD6', '#F7F0FA'], 'dark', ['Chakra Petch', 'Rajdhani'], ['chamfer', 'large', 'neon', 'none'], 'tech', 0.2, true);
const AURORA = d('aurora', 'Aurora', 'Living northern-lights color behind floating glass, like a spatial app.', ['#0E1330', '#5EEAD4', '#EEF4F7'], 'dark', ['Sora', 'Inter'], ['pill', 'large', 'glass', 'none'], 'tech', 1.3, true);
const RADAR = d('radar', 'Radar', 'A sweeping radar screen where every contact option is a blip.', ['#04130C', '#4ADE80', '#EEF5F0'], 'dark', ['Orbitron', 'Rajdhani'], ['chamfer', 'regular', 'hud', 'none'], 'tech', 0.3, true);
const CIRCUIT = d('circuit', 'Circuit', 'Your photo on a chip, with live current running through gold traces to each action.', ['#0E1411', '#F5B942', '#EEF4F0'], 'dark', ['Space Grotesk', 'IBM Plex Sans'], ['chamfer', 'regular', 'solid', 'circuit'], 'tech', 0.3, true);
const BLUEPRINT = d('blueprint', 'Blueprint', 'A drafted blueprint that draws itself: dimension lines, title block, spec sheet.', ['#123C7A', '#FFFFFF', '#EEF3FA'], 'light', ['Space Grotesk', 'IBM Plex Sans'], ['square', 'regular', 'outline', 'none'], 'tech', 0, true);
const SIGNATURE = d('signature', 'Signature', 'Letterpress card and a wax seal with your initials that stamps down as it opens.', ['#2A1E1A', '#8A1C2C', '#F4EDE3'], 'light', ['Cormorant Garamond', 'Manrope'], ['pill', 'regular', 'outline', 'paper'], 'calm', 0.8, true);
const VANITY = d('vanity', 'Vanity Mirror', 'Your photo in a Hollywood vanity mirror with bulbs that light up one by one.', ['#1B1416', '#F4C98B', '#F7F1EC'], 'dark', ['Bodoni Moda', 'Jost'], ['pill', 'regular', 'solid', 'satin'], 'bright', 1, true);
const GLOSS = d('gloss', 'Chrome Gloss', 'Iridescent holographic chrome, bubbly glossy buttons and sparkles.', ['#2A2350', '#FF7AC8', '#F6F2FF'], 'light', ['Unbounded', 'Outfit'], ['pill', 'large', 'raised', 'satin'], 'bright', 1.3, true);
const HOLOGRAM = d('hologram', 'Hologram', 'A 3D holographic ID card you can grab and spin.', ['#0A0E1A', '#7DF9FF', '#EEF3F8'], 'dark', ['Sora', 'Inter'], ['pill', 'regular', 'glass', 'none'], 'tech', 1, true);
const MISSION = d('mission', 'Mission Control', 'Live clock, gauges and toggle switches for every action.', ['#0B0F0D', '#FF8A00', '#EEF1EF'], 'dark', ['Rajdhani', 'IBM Plex Sans'], ['rounded', 'regular', 'inset', 'none'], 'tech', 0.5, true);
const POSTER = d('poster', 'Glitch Poster', 'Brutalist poster with RGB split type and a scrolling ticker.', ['#111111', '#FF3B30', '#F2F0EA'], 'light', ['Anton', 'Space Grotesk'], ['square', 'large', 'solid', 'none'], 'tech', 0, true);
const LIQUID = d('liquid', 'Liquid Metal', 'Molten chrome blobs merge and split behind glass.', ['#15161A', '#B8C1D6', '#EFF1F5'], 'dark', ['Syne', 'Manrope'], ['pill', 'large', 'glass', 'satin'], 'tech', 1.3, true);
const STARFIELD = d('starfield', 'Starfield', 'A warp-speed intro that settles into drifting stars.', ['#05070F', '#A5B4FC', '#EEF0F8'], 'dark', ['Orbitron', 'Inter'], ['pill', 'regular', 'glass', 'none'], 'tech', 1, true);
const CMDK = d('cmdk', 'Command Palette', 'A searchable, keyboard-first card like a developer tool.', ['#0F1115', '#7C9CFF', '#F1F3F7'], 'dark', ['Inter', 'Inter'], ['rounded', 'regular', 'solid', 'none'], 'tech', 0.7, true);
const SYNTHWAVE = d('synthwave', 'Synthwave', 'Retro sunset, neon grid and chrome type.', ['#1A0B2E', '#FF4FD8', '#F6F0FA'], 'dark', ['Monoton', 'Rajdhani'], ['pill', 'large', 'neon', 'none'], 'tech', 1, true);
const VINYL = d('vinyl', 'Vinyl Sleeve', 'Your photo as an album cover while the record slides out.', ['#141414', '#F2C14E', '#F2EFE8'], 'dark', ['Syne', 'Space Grotesk'], ['pill', 'large', 'solid', 'grain'], 'tech', 0.6, true);
const WAVEFORM = d('waveform', 'Waveform', 'A playing waveform with a scrubber and tracklist.', ['#0D0D12', '#FF5A36', '#F3F1EE'], 'dark', ['Space Grotesk', 'Inter'], ['pill', 'large', 'solid', 'none'], 'tech', 1, true);
const TURNTABLE = d('turntable', 'Turntable', 'A spinning deck, a working crossfader and light-up pads.', ['#101010', '#00E0B8', '#EFF3F2'], 'dark', ['Chakra Petch', 'Rajdhani'], ['rounded', 'regular', 'raised', 'carbon'], 'tech', 0.5, true);
const BOARDING = d('boarding', 'Boarding Pass', 'A first-class boarding pass with a barcode stub.', ['#0F2A4A', '#F2A541', '#F3F5F8'], 'light', ['Space Grotesk', 'IBM Plex Sans'], ['rounded', 'regular', 'solid', 'none'], 'bright', 0.7, true);
const CONFETTI = d('confetti', 'Confetti', 'A confetti burst and a run-of-show timeline.', ['#2B1A4A', '#FF6FB5', '#FFF7FB'], 'light', ['Bricolage Grotesque', 'Outfit'], ['pill', 'large', 'raised', 'none'], 'bright', 1.3, true);
const INVITATION = d('invitation', 'Invitation', 'An envelope that opens to reveal your card.', ['#3E4A3D', '#C9A27E', '#F7F3EC'], 'light', ['Cormorant Garamond', 'Manrope'], ['pill', 'regular', 'solid', 'paper'], 'calm', 1, true);
const MONOGRAM = d('monogram', 'Monogram', 'Your initials inside a blooming floral wreath.', ['#4A3B47', '#D8A7B1', '#FBF7F4'], 'light', ['Cormorant Garamond', 'Manrope'], ['pill', 'regular', 'solid', 'none'], 'calm', 1.2, true);
const INBOX = d('inbox', 'Inbox', 'An email inbox where every message is a way to reach you.', ['#1D3557', '#E76F51', '#F4F6F9'], 'light', ['Inter', 'Inter'], ['rounded', 'regular', 'solid', 'none'], 'calm', 0.8, true);
const PLANNER = d('planner', 'Planner', 'A ring-bound planner with your week and a to-do list.', ['#2F3E46', '#F4A261', '#F8F4EC'], 'light', ['Fraunces', 'Figtree'], ['rounded', 'regular', 'solid', 'paper'], 'calm', 0.9, true);
const TRADING = d('trading', 'Trading Card', 'A holo trading card that flips to show your stats.', ['#12151F', '#FFD23F', '#F1F3F8'], 'dark', ['Bebas Neue', 'Barlow'], ['rounded', 'large', 'solid', 'none'], 'bright', 0.7, true);
const MARQUEE = d('marquee', 'Marquee', 'A theater marquee with chasing bulbs and your name in lights.', ['#1A0E08', '#FFC53D', '#F7F0E6'], 'dark', ['Limelight', 'Work Sans'], ['rounded', 'large', 'raised', 'none'], 'bright', 0.6, true);

export const NICHES: Niche[] = [
  /* ================================================================ TECH */
  {
    id: 'tech', name: 'Tech and IT', group: 'Tech', icon: 'screen',
    blurb: 'Futuristic designs with motion, effects and synth sounds.',
    highlightsTitle: 'Stack',
    highlights: [
      { icon: 'screen', title: 'Web and app builds', subtitle: 'React, Next.js, native' },
      { icon: 'shield', title: 'Cloud and security', subtitle: 'AWS, audits, hardening' },
      { icon: 'sparkle', title: 'AI integrations', subtitle: 'Agents, chat, automation' },
      { icon: 'tools', title: 'IT support', subtitle: 'Networks, devices, help desk' },
    ],
    tagline: 'Building what runs your business',
    suggestedLinks: ['github', 'linkedin', 'x', 'youtube', 'discord', 'calendly'],
    designs: [MAINFRAME, HOLOGRAM, QUANTUM, CMDK, CYBER, AURORA, STARFIELD, MISSION, LIQUID, TERMINAL, SYNTHWAVE, POSTER, RADAR, CIRCUIT],
  },
  {
    id: 'engineering', name: 'Architects and Engineers', group: 'Tech', icon: 'tools',
    blurb: 'Drafting-table precision and hardware-grade detail.',
    highlightsTitle: 'Disciplines',
    highlights: [
      { icon: 'home', title: 'Residential design', subtitle: 'New builds and additions' },
      { icon: 'briefcase', title: 'Commercial', subtitle: 'Tenant build-outs' },
      { icon: 'tools', title: 'Structural review', subtitle: 'Inspections and reports' },
      { icon: 'shield', title: 'Permitting', subtitle: 'Drawings that pass' },
    ],
    tagline: 'Measured twice. Built once.',
    suggestedLinks: ['linkedin', 'behance', 'houzz', 'google'],
    designs: [BLUEPRINT, MISSION, CIRCUIT, QUANTUM],
  },
  {
    id: 'gaming', name: 'Gamers and Streamers', group: 'Tech', icon: 'star',
    blurb: 'Neon, glitch and terminal energy for streamers and esports.',
    highlightsTitle: 'Where I play',
    highlights: [
      { icon: 'screen', title: 'Live streams', subtitle: 'Tue, Thu, Sat nights' },
      { icon: 'star', title: 'Tournaments', subtitle: 'Competitive and community' },
      { icon: 'chat', title: 'Community', subtitle: 'Join the Discord' },
      { icon: 'briefcase', title: 'Sponsorships', subtitle: 'Brand collabs welcome' },
    ],
    tagline: 'Live most nights',
    suggestedLinks: ['twitch', 'kick', 'youtube', 'discord', 'tiktok', 'x'],
    designs: [SYNTHWAVE, CYBER, STARFIELD, TERMINAL, MAINFRAME, RADAR],
  },

  /* ================================================================ BEAUTY AND GROOMING */
  {
    id: 'barber', name: 'Barbershops', group: 'Beauty and grooming', icon: 'scissors',
    blurb: 'Barbershop designs, from old-school to streetwear.',
    highlightsTitle: 'Services',
    highlights: [
      { icon: 'scissors', title: 'Haircut', subtitle: '$35 · 45 min' },
      { icon: 'scissors', title: 'Skin fade', subtitle: '$40 · 50 min' },
      { icon: 'sparkle', title: 'Beard trim and lineup', subtitle: '$20 · 20 min' },
      { icon: 'star', title: 'The works', subtitle: '$60 · cut, beard, hot towel' },
    ],
    tagline: 'Walk-ins welcome, appointments preferred',
    suggestedLinks: ['instagram', 'tiktok', 'google', 'cashapp', 'facebook'],
    designs: [
      d('neonsign', 'Neon Sign', 'Your shop name as a flickering neon sign on brick.', ['#121014', '#FF3D6E', '#F2EEE9'], 'dark', ['Monoton', 'Barlow'], ['pill', 'large', 'neon', 'none'], 'bright', 1, true),
      d('razor', 'Straight Razor', 'A chrome straight razor opens over an engraved steel price plate.', ['#141517', '#C8A45A', '#EFEEEB'], 'dark', ['Playfair Display', 'Barlow'], ['rounded', 'large', 'solid', 'brushed'], 'bright', 0.4, true),
      d('clipper', 'Clipper Guards', 'A buzzing clipper and guard sizes that label each service.', ['#0F1113', '#3BE3A8', '#EEF1EF'], 'dark', ['Bebas Neue', 'Barlow'], ['rounded', 'large', 'solid', 'carbon'], 'bright', 0.5, true),
      d('chalkboard', 'Chalkboard', 'A wood-framed chalk menu with hand-written prices.', ['#2A1E14', '#E0B34A', '#F3EDE3'], 'light', ['Caveat', 'Lato'], ['rounded', 'large', 'solid', 'paper'], 'bright', 0.6, true),
      d('pole', 'Barber Pole', 'A spinning 3D barber pole beside your shop name, with a price list.', ['#15213A', '#C8102E', '#F4EFE6'], 'light', ['Abril Fatface', 'Lato'], ['rounded', 'large', 'solid', 'none'], 'bright', 0.6, true),
      d('nowserving', 'Now Serving', 'A take-a-number machine; the ticket books the next chair.', ['#141414', '#FF3B30', '#F2F0EB'], 'dark', ['Bebas Neue', 'Barlow'], ['rounded', 'large', 'raised', 'none'], 'bright', 0.5, true),
      d('fade', 'Fade', 'Streetwear barber: giant stacked name, letterboard price list, razor details.', ['#0D0D0D', '#E8FF3A', '#F2F2EE'], 'dark', ['Anton', 'Archivo'], ['square', 'large', 'solid', 'none'], 'bright', 0, true),
      d('oldschool', 'Old School', 'Vintage barbershop badge, pole stripes and a hand-lettered price card.', ['#1D2B4F', '#B3262E', '#F3EBDD'], 'light', ['Abril Fatface', 'Lato'], ['rounded', 'large', 'solid', 'paper'], 'bright', 0.6, true),
      d('barber', 'Chair', 'Animated barber pole, book-a-chair up front, price list and fresh cuts.', ['#111827', '#E0B34A', '#F4F1EA'], 'dark', ['Oswald', 'Karla'], ['rounded', 'large', 'solid', 'brushed'], 'bright', 0.5),
      MARQUEE,
    ],
  },
  {
    id: 'salon', name: 'Hair Salons', group: 'Beauty and grooming', icon: 'sparkle',
    blurb: 'Luxury salon designs: velvet and gold, vanity lights, flowing silk.',
    highlightsTitle: 'Services',
    highlights: [
      { icon: 'scissors', title: 'Cut and style', subtitle: '$65 · 60 min' },
      { icon: 'art', title: 'Color and balayage', subtitle: 'From $150' },
      { icon: 'sparkle', title: 'Silk press', subtitle: '$85 · 90 min' },
      { icon: 'heart', title: 'Bridal and events', subtitle: 'Book a consult' },
    ],
    tagline: 'Hair that turns heads',
    suggestedLinks: ['instagram', 'tiktok', 'google', 'facebook', 'pinterest'],
    designs: [
      d('magazine', 'Cover Story', 'Your salon on a fashion magazine cover, services as cover lines.', ['#141414', '#E63946', '#F5F2EE'], 'light', ['Bodoni Moda', 'Jost'], ['square', 'regular', 'solid', 'none'], 'bright', 0.2, true),
      d('blowout', 'Blowout', 'Flowing hair strands sweep across an editorial portrait.', ['#3A2433', '#D4A373', '#FAF5F1'], 'light', ['Italiana', 'Mulish'], ['pill', 'regular', 'solid', 'satin'], 'calm', 1.2, true),
      d('stations', 'Salon Stations', 'Three lit salon mirrors, your photo in the center chair.', ['#1E1B1D', '#F2C38B', '#F6F1EC'], 'dark', ['Cormorant Garamond', 'Manrope'], ['pill', 'regular', 'solid', 'none'], 'calm', 1, true),
      d('goldleaf', 'Gold Leaf', 'Dark marble with gold flakes that settle around your photo.', ['#161311', '#D4AF37', '#F5F1EA'], 'dark', ['Cinzel', 'Montserrat'], ['pill', 'regular', 'solid', 'brushed'], 'calm', 1, true),
      d('swatch', 'Swatch Book', 'Services fan out like a colorist swatch book.', ['#3A2A40', '#C06C84', '#FAF4F5'], 'light', ['DM Serif Display', 'DM Sans'], ['pill', 'regular', 'solid', 'none'], 'bright', 1.1, true),
      d('velvet', 'Velvet', 'Deep velvet and shimmering gold foil, an arched gilded mirror and sparkles.', ['#24131F', '#E8C27A', '#F8F1F4'], 'dark', ['Cinzel', 'Montserrat'], ['pill', 'regular', 'gradient', 'satin'], 'calm', 1.2, true),
      VANITY,
      d('silk', 'Silk', 'Flowing silk waves in slow motion, serif elegance and a calm menu.', ['#5B3A4A', '#D8A7B1', '#FBF6F4'], 'light', ['Italiana', 'Mulish'], ['pill', 'regular', 'solid', 'satin'], 'calm', 1.4, true),
      d('barber', 'Chair', 'Pole-stripe header, book up front, price list and fresh looks.', ['#2B2233', '#E6A8C0', '#F7F2F5'], 'dark', ['Oswald', 'Karla'], ['pill', 'large', 'solid', 'none'], 'bright', 1),
    ],
  },
  {
    id: 'nails', name: 'Nail Spas and Lashes', group: 'Beauty and grooming', icon: 'gem',
    blurb: 'Soft pastels, polaroids and Y2K chrome for nail and lash artists.',
    highlightsTitle: 'Menu',
    highlights: [
      { icon: 'gem', title: 'Gel-X full set', subtitle: '$70 · 90 min' },
      { icon: 'sparkle', title: 'Classic lashes', subtitle: '$110 · 2 hrs' },
      { icon: 'art', title: 'Nail art', subtitle: 'From $10 per nail' },
      { icon: 'heart', title: 'Fills', subtitle: '$55 · 60 min' },
    ],
    tagline: 'Booked, polished, obsessed',
    suggestedLinks: ['instagram', 'tiktok', 'google', 'cashapp', 'pinterest'],
    designs: [
      d('polish', 'Polish Shelf', 'A shelf of polish bottles; each one is a service and price.', ['#4A2340', '#FF5C8A', '#FFF5F8'], 'light', ['Playfair Display', 'DM Sans'], ['pill', 'regular', 'solid', 'none'], 'bright', 1.3, true),
      d('shimmer', 'Shimmer', 'Twinkling glitter and a glossy service menu.', ['#1A1024', '#F7A8D8', '#FBF3FA'], 'dark', ['Unbounded', 'Outfit'], ['pill', 'large', 'gradient', 'satin'], 'bright', 1.4, true),
      d('tips', 'Tip Chart', 'Your work shown inside real nail shapes: almond, coffin, stiletto.', ['#3C2A3F', '#E07A9B', '#FCF6F7'], 'light', ['DM Serif Display', 'DM Sans'], ['pill', 'regular', 'solid', 'none'], 'bright', 1.2, true),
      d('lash', 'Lash Line', 'Lashes draw themselves over your photo, one by one.', ['#2B1B2E', '#E7A4C0', '#FCF6F8'], 'light', ['Playfair Display', 'DM Sans'], ['pill', 'regular', 'solid', 'none'], 'bright', 1.4, true),
      d('rosegold', 'Rose Gold', 'Brushed rose-gold plate with a light sweep and engraved name.', ['#4A2C2A', '#E0A899', '#FBF4F1'], 'light', ['Cormorant Garamond', 'Manrope'], ['pill', 'regular', 'gradient', 'brushed'], 'calm', 1.2, true),
      d('blush', 'Blush', 'Morphing pastel blobs, a tilted polaroid stack and soft pill buttons.', ['#7A3E5C', '#FFB5C8', '#FFF6F8'], 'light', ['Playfair Display', 'DM Sans'], ['pill', 'regular', 'solid', 'none'], 'bright', 1.5, true),
      GLOSS,
      VANITY,
    ],
  },
  {
    id: 'esthetics', name: 'Esthetics and Med Spa', group: 'Beauty and grooming', icon: 'sparkle',
    blurb: 'Glowing, calm and clinical-luxe designs for skin pros.',
    highlightsTitle: 'Treatments',
    highlights: [
      { icon: 'sparkle', title: 'Signature facial', subtitle: '60 min' },
      { icon: 'drop', title: 'Hydrafacial', subtitle: '45 min' },
      { icon: 'leaf', title: 'Brows and lashes', subtitle: '30 min' },
      { icon: 'gem', title: 'Chemical peel', subtitle: '45 min' },
    ],
    tagline: 'Skin that feels like you again',
    suggestedLinks: ['instagram', 'tiktok', 'google', 'facebook'],
    designs: [
      d('perfume', 'Perfume', 'A glass bottle with your name on the label.', ['#3B3A4F', '#C8B6E2', '#F8F6FB'], 'light', ['Italiana', 'Mulish'], ['pill', 'regular', 'solid', 'satin'], 'calm', 1.3, true),
      d('goldleaf', 'Gold Leaf', 'Marble and gold for luxury med spas.', ['#161311', '#D4AF37', '#F5F1EA'], 'dark', ['Cinzel', 'Montserrat'], ['pill', 'regular', 'solid', 'brushed'], 'calm', 1, true),
      d('esthetics', 'Glow', 'Soft breathing aura, a halo portrait ring and a treatment menu with times.', ['#6B4A5B', '#D9A6A0', '#FBF5F2'], 'light', ['Cormorant Garamond', 'Manrope'], ['pill', 'regular', 'soft', 'satin'], 'calm', 1.3),
      d('silk', 'Silk', 'Slow silk waves and a spa-calm menu.', ['#3E5A57', '#B9D4CC', '#F5F8F6'], 'light', ['Italiana', 'Mulish'], ['pill', 'regular', 'solid', 'none'], 'calm', 1.4, true),
      d('aurora', 'Aurora', 'Glass panels over living color, for modern med spas.', ['#1A1433', '#F0ABFC', '#F7F3FA'], 'dark', ['Sora', 'Inter'], ['pill', 'large', 'glass', 'none'], 'calm', 1.3, true),
    ],
  },

  {
    id: 'massage', name: 'Massage and Day Spas', group: 'Wellness and fitness', icon: 'leaf',
    blurb: 'Hot stones, a blooming lotus, swaying bamboo and slow silk for calm, restorative spas.',
    highlightsTitle: 'Treatments',
    highlights: [
      { icon: 'leaf', title: 'Swedish massage', subtitle: '60 or 90 min' },
      { icon: 'fitness', title: 'Deep tissue', subtitle: '60 or 90 min' },
      { icon: 'sparkle', title: 'Hot stone therapy', subtitle: '75 min' },
      { icon: 'heart', title: 'Couples massage', subtitle: '60 min' },
    ],
    tagline: 'Slow down. Breathe. Recover.',
    suggestedLinks: ['google', 'instagram', 'facebook', 'yelp'],
    designs: [
      d('stones', 'Hot Stones', 'Balanced warm stones with rising steam.', ['#3B2F2A', '#C08457', '#F6F1EA'], 'light', ['Cormorant Garamond', 'Manrope'], ['pill', 'regular', 'solid', 'paper'], 'calm', 1.2, true),
      d('lotus', 'Lotus', 'A lotus blooms on a rippling pond, with a gentle breathing guide.', ['#2E3A4A', '#E7A6B8', '#F4F6F8'], 'light', ['Italiana', 'Mulish'], ['pill', 'regular', 'solid', 'none'], 'calm', 1.4, true),
      d('bamboo', 'Bamboo', 'Swaying bamboo and rice-paper panels, calm and zen.', ['#26352A', '#9DBF6B', '#F4F2EA'], 'light', ['Marcellus', 'Mulish'], ['pill', 'regular', 'solid', 'linen'], 'calm', 1, true),
      d('silk', 'Silk', 'Slow flowing silk waves and a calm treatment menu.', ['#3E5A57', '#B9D4CC', '#F5F8F6'], 'light', ['Italiana', 'Mulish'], ['pill', 'regular', 'solid', 'none'], 'calm', 1.4, true),
      d('perfume', 'Perfume', 'A glass bottle with your spa name on the label.', ['#3B3A4F', '#C8B6E2', '#F8F6FB'], 'light', ['Italiana', 'Mulish'], ['pill', 'regular', 'solid', 'satin'], 'calm', 1.3, true),
    ],
  },

  /* ================================================================ PROFESSIONAL */
  {
    id: 'realestate', name: 'Real Estate', group: 'Professional', icon: 'home',
    blurb: 'Listing-first designs, including a luxury slideshow.',
    highlightsTitle: 'Areas I serve',
    highlights: [
      { icon: 'home', title: 'Buying', subtitle: 'First homes to forever homes' },
      { icon: 'briefcase', title: 'Selling', subtitle: 'Pricing, staging, marketing' },
      { icon: 'gem', title: 'Luxury', subtitle: 'Waterfront and estates' },
      { icon: 'car', title: 'Relocation', subtitle: 'Moving to Central Florida' },
    ],
    tagline: 'Helping families find home',
    suggestedLinks: ['zillow', 'instagram', 'facebook', 'youtube', 'google'],
    designs: [
      d('floorplan', 'Floor Plan', 'Your services as rooms on an architectural floor plan.', ['#1D2A3A', '#C9A96E', '#F5F3EE'], 'light', ['DM Serif Display', 'Work Sans'], ['square', 'regular', 'solid', 'none'], 'calm', 0.3, true),
      d('estate', 'Estate', 'Full-screen listing slideshow with slow cinematic zoom and gold hairlines.', ['#15130F', '#C9A96E', '#F5F1EA'], 'dark', ['Cinzel', 'Lato'], ['square', 'regular', 'outline', 'none'], 'calm', 0.2, true),
      d('realestate', 'Keystone', 'Property hero, agent card, home-value call to action, listings strip.', ['#14213D', '#B8925A', '#F6F4EF'], 'light', ['DM Serif Display', 'Work Sans'], ['rounded', 'regular', 'solid', 'none'], 'calm', 0.7),
      SIGNATURE,
    ],
  },
  {
    id: 'advisor', name: 'Insurance and Finance', group: 'Professional', icon: 'shield',
    blurb: 'Trust-first designs with license badges and review booking.',
    highlightsTitle: 'How I help',
    highlights: [
      { icon: 'home', title: 'Home and auto', subtitle: 'Bundle and save' },
      { icon: 'heart', title: 'Life insurance', subtitle: 'Protect your family' },
      { icon: 'briefcase', title: 'Business coverage', subtitle: 'Liability, property, fleet' },
      { icon: 'shield', title: 'Annual review', subtitle: 'Make sure you are covered' },
    ],
    tagline: 'Plain answers. Real coverage.',
    suggestedLinks: ['linkedin', 'facebook', 'google', 'calendly'],
    designs: [
      d('ledger', 'Ledger', 'A green ledger page with checked-off services and your signature.', ['#1E4D3A', '#B08D57', '#F3F6F0'], 'light', ['Libre Baskerville', 'Work Sans'], ['rounded', 'regular', 'solid', 'none'], 'calm', 0.5, true),
      d('advisor', 'Advisor', 'License badge, book a review, get a quote, clear services.', ['#0B3D5C', '#2BA88A', '#F3F7F9'], 'light', ['DM Serif Display', 'Work Sans'], ['rounded', 'regular', 'solid', 'none'], 'calm', 0.8),
      SIGNATURE,
      d('aurora', 'Aurora', 'Modern glass panels for fintech and advisors who want to look ahead.', ['#0B2447', '#34D399', '#EEF6F4'], 'dark', ['Sora', 'Inter'], ['pill', 'large', 'glass', 'none'], 'calm', 1.2, true),
    ],
  },
  {
    id: 'legal', name: 'Legal and Consulting', group: 'Professional', icon: 'briefcase',
    blurb: 'Classic, confident designs for attorneys and consultants.',
    highlightsTitle: 'Practice areas',
    highlights: [
      { icon: 'briefcase', title: 'Business law', subtitle: 'Formation and contracts' },
      { icon: 'home', title: 'Real estate', subtitle: 'Closings and disputes' },
      { icon: 'shield', title: 'Estate planning', subtitle: 'Wills and trusts' },
      { icon: 'chat', title: 'Consultations', subtitle: 'In person or virtual' },
    ],
    tagline: 'Clear counsel when it matters',
    suggestedLinks: ['linkedin', 'google', 'calendly'],
    designs: [
      d('casefile', 'Case File', 'A manila case folder with a clipped photo and numbered practice areas.', ['#2B2A26', '#9E1B32', '#F4EFE4'], 'light', ['Libre Baskerville', 'Work Sans'], ['square', 'regular', 'solid', 'paper'], 'calm', 0.2, true),
      SIGNATURE,
      d('advisor', 'Advisor', 'Navy and brass, consultations and practice areas.', ['#1B2A41', '#B08D57', '#F5F3EF'], 'light', ['Cormorant Garamond', 'Manrope'], ['square', 'regular', 'solid', 'none'], 'calm', 0.3),
    ],
  },
  {
    id: 'travel', name: 'Travel Agents', group: 'Professional', icon: 'car',
    blurb: 'A passport data page with visa stamps that land as it opens.',
    highlightsTitle: 'Trips I plan',
    highlights: [
      { icon: 'heart', title: 'Honeymoons', subtitle: 'Caribbean and Europe' },
      { icon: 'star', title: 'Cruises', subtitle: 'All major lines' },
      { icon: 'home', title: 'Family resorts', subtitle: 'Parks and all-inclusives' },
      { icon: 'briefcase', title: 'Group travel', subtitle: 'Churches, reunions, teams' },
    ],
    tagline: 'Your next trip, handled',
    suggestedLinks: ['instagram', 'facebook', 'tiktok', 'google'],
    designs: [
      d('postcard', 'Postcard', 'A picture postcard from your favorite destination.', ['#14254A', '#E4572E', '#F4F1E8'], 'light', ['Caveat', 'Nunito Sans'], ['pill', 'regular', 'solid', 'paper'], 'bright', 1, true),
      BOARDING,
      d('passport', 'Passport', 'Passport cover, data page with your details and animated visa stamps.', ['#14254A', '#C9A04C', '#F4F1E8'], 'light', ['Cinzel', 'IBM Plex Sans'], ['rounded', 'regular', 'solid', 'paper'], 'bright', 0.6, true),
      SIGNATURE,
    ],
  },

  /* ================================================================ HOME AND AUTO */
  {
    id: 'mechanic', name: 'Auto and Mechanics', group: 'Home and auto', icon: 'car',
    blurb: 'Rugged shop layouts with a giant call button.',
    highlightsTitle: 'Services',
    highlights: [
      { icon: 'tools', title: 'Diagnostics', subtitle: 'Check engine, electrical' },
      { icon: 'car', title: 'Brakes and tires', subtitle: 'Same-day most jobs' },
      { icon: 'drop', title: 'Oil and fluids', subtitle: 'All makes and models' },
      { icon: 'shield', title: 'AC and cooling', subtitle: 'Florida-ready' },
    ],
    tagline: 'Honest work. Fair prices.',
    suggestedLinks: ['google', 'facebook', 'yelp', 'instagram'],
    designs: [
      d('cluster', 'Dashboard', 'A car instrument cluster; gauges sweep up and warning lights are your buttons.', ['#0C0E10', '#FF3B30', '#EEF0F2'], 'dark', ['Orbitron', 'Rajdhani'], ['rounded', 'large', 'solid', 'carbon'], 'tech', 0.4, true),
      d('toolbelt', 'Toolbelt', 'A leather tool belt for mobile mechanics.', ['#2A2A2A', '#FF6A13', '#F1EFEA'], 'dark', ['Oswald', 'Source Sans 3'], ['rounded', 'large', 'solid', 'carbon'], 'bright', 0.6, true),
      d('mechanic', 'Garage', 'Hazard stripe, giant call button, services grid, shop hours.', ['#C2410C', '#FFB000', '#F1EFEA'], 'dark', ['Oswald', 'Source Sans 3'], ['chamfer', 'large', 'solid', 'carbon'], 'bright', 0.3),
      d('circuit', 'Circuit', 'Electrical-diagnostics look with live traces, for auto electricians and EV techs.', ['#101418', '#FF6A13', '#F0EFEC'], 'dark', ['Space Grotesk', 'IBM Plex Sans'], ['chamfer', 'regular', 'solid', 'carbon'], 'tech', 0.3, true),
    ],
  },
  {
    id: 'handyman', name: 'Handyman and Contractors', group: 'Home and auto', icon: 'hammer',
    blurb: 'Call-first checklists and a drafted blueprint for builders.',
    highlightsTitle: 'Jobs I take',
    highlights: [
      { icon: 'hammer', title: 'Repairs', subtitle: 'Doors, drywall, trim' },
      { icon: 'tools', title: 'Installs', subtitle: 'Fans, fixtures, TVs' },
      { icon: 'art', title: 'Painting', subtitle: 'Rooms and touch-ups' },
      { icon: 'home', title: 'Remodels', subtitle: 'Kitchens and baths' },
    ],
    tagline: 'No job too small',
    suggestedLinks: ['google', 'nextdoor', 'facebook', 'thumbtack', 'yelp'],
    designs: [
      d('yardsign', 'Yard Sign', 'A lawn sign with your number big enough to read from the street.', ['#1F3A5F', '#F2A900', '#F3F5F8'], 'light', ['Archivo Black', 'Hanken Grotesk'], ['rounded', 'large', 'solid', 'none'], 'bright', 0.6, true),
      d('toolbelt', 'Toolbelt', 'A leather belt with a pocket for every action.', ['#3B2A1E', '#F2A900', '#F5F0E8'], 'dark', ['Oswald', 'Source Sans 3'], ['rounded', 'large', 'solid', 'linen'], 'bright', 0.6, true),
      d('handyman', 'Toolbox', 'Call or text first, job checklist, licensed badge, before and after.', ['#1F4D3A', '#F2A900', '#F7F5EE'], 'light', ['Bricolage Grotesque', 'Hanken Grotesk'], ['rounded', 'large', 'solid', 'none'], 'bright', 0.9),
      d('blueprint', 'Blueprint', 'A drafted blueprint with dimension lines and a spec sheet.', ['#1E3A5F', '#F2A900', '#F0F4F8'], 'light', ['Space Grotesk', 'IBM Plex Sans'], ['square', 'regular', 'outline', 'none'], 'bright', 0, true),
    ],
  },
  {
    id: 'homeservices', name: 'Cleaning and Lawn Care', group: 'Home and auto', icon: 'leaf',
    blurb: 'Fresh, friendly designs, including a growing garden.',
    highlightsTitle: 'Services',
    highlights: [
      { icon: 'home', title: 'Home cleaning', subtitle: 'Weekly, biweekly, one-time' },
      { icon: 'sparkle', title: 'Deep clean', subtitle: 'Move-in and move-out' },
      { icon: 'leaf', title: 'Lawn care', subtitle: 'Mow, edge, blow' },
      { icon: 'tools', title: 'Pressure washing', subtitle: 'Driveways and siding' },
    ],
    tagline: 'Spotless, on schedule',
    suggestedLinks: ['google', 'nextdoor', 'facebook', 'thumbtack', 'yelp'],
    designs: [
      d('yardsign', 'Yard Sign', 'Your company on a lawn sign with a giant phone number.', ['#0E6E3A', '#FFD23F', '#F2F8F2'], 'light', ['Archivo Black', 'Hanken Grotesk'], ['rounded', 'large', 'solid', 'none'], 'bright', 0.6, true),
      d('handyman', 'Toolbox', 'Fresh teal: call, text, services and before-and-after.', ['#0E6E6E', '#7ED957', '#F2F8F6'], 'light', ['Bricolage Grotesque', 'Hanken Grotesk'], ['pill', 'large', 'solid', 'none'], 'bright', 1.2),
      d('garden', 'Garden', 'A vine that grows and blooms down the page as you scroll.', ['#1F4332', '#E98A9E', '#F6F3EA'], 'light', ['Fraunces', 'Figtree'], ['pill', 'regular', 'solid', 'paper'], 'calm', 1.2, true),
    ],
  },

  /* ================================================================ WELLNESS AND FITNESS */
  {
    id: 'fitness', name: 'Fitness and Coaching', group: 'Wellness and fitness', icon: 'fitness',
    blurb: 'High-energy designs, including an LED stadium scoreboard.',
    highlightsTitle: 'Programs',
    highlights: [
      { icon: 'fitness', title: '1:1 training', subtitle: 'In person or online' },
      { icon: 'leaf', title: 'Nutrition coaching', subtitle: 'Plans that fit your life' },
      { icon: 'star', title: '12-week transformation', subtitle: 'Accountability built in' },
      { icon: 'heart', title: 'Small group', subtitle: 'Train with your crew' },
    ],
    tagline: 'Stronger every week',
    suggestedLinks: ['instagram', 'tiktok', 'youtube', 'calendly', 'cashapp'],
    designs: [
      d('stopwatch', 'Stopwatch', 'A running stopwatch, with your programs as laps.', ['#101214', '#FF6B00', '#F2F2F0'], 'dark', ['Bebas Neue', 'Barlow'], ['rounded', 'large', 'solid', 'none'], 'bright', 0.6, true),
      TRADING,
      d('scoreboard', 'Scoreboard', 'Stadium LED scoreboard, floodlight glow and a lineup of programs.', ['#0B0F14', '#FF9F1C', '#EEF0F2'], 'dark', ['Bebas Neue', 'Barlow'], ['rounded', 'large', 'solid', 'none'], 'bright', 0.4, true),
      d('fitness', 'Pulse', 'Pulsing rings, programs, book a session, transformations.', ['#0E0E10', '#C6FF3D', '#F2F4EE'], 'dark', ['Unbounded', 'Outfit'], ['pill', 'large', 'solid', 'none'], 'bright', 1),
    ],
  },

  /* ================================================================ FOOD AND DRINK */
  {
    id: 'bistro', name: 'Restaurants and Cafes', group: 'Food and drink', icon: 'coffee',
    blurb: 'A real menu card with prices, reserve and order online.',
    highlightsTitle: 'From the menu',
    highlights: [
      { icon: 'coffee', title: 'Cafe con leche', subtitle: '$4 · Cuban roast' },
      { icon: 'food', title: 'Ropa vieja', subtitle: '$18 · rice, beans, maduros' },
      { icon: 'food', title: 'Pastelitos', subtitle: '$2 · guava and cheese' },
      { icon: 'star', title: 'Weekend brunch', subtitle: 'Sat and Sun, 9am-2pm' },
    ],
    tagline: 'Made from scratch, every day',
    suggestedLinks: ['instagram', 'google', 'yelp', 'ubereats', 'doordash', 'tripadvisor'],
    designs: [
      d('diner', 'Diner', 'A retro diner sign, checkered floor and a specials board.', ['#B3202A', '#2EC4B6', '#FFF6EA'], 'light', ['Righteous', 'Nunito Sans'], ['pill', 'large', 'raised', 'none'], 'bright', 1, true),
      d('recipe', 'Recipe Card', 'A handwritten recipe card taped under your photo.', ['#5A2A1E', '#D9480F', '#FBF6EE'], 'light', ['Caveat', 'Figtree'], ['pill', 'regular', 'solid', 'paper'], 'bright', 1, true),
      d('bistro', 'Bistro', 'Menu card with prices, reserve, order online, dining room.', ['#5A2A1E', '#C9A227', '#FBF6EE'], 'light', ['Fraunces', 'Figtree'], ['pill', 'regular', 'solid', 'paper'], 'bright', 1),
      MARQUEE,
    ],
  },
  {
    id: 'foodtruck', name: 'Food Trucks', group: 'Food and drink', icon: 'food',
    blurb: 'Where we are today, the menu and order-ahead links, loud and hungry.',
    highlightsTitle: 'Menu',
    highlights: [
      { icon: 'food', title: 'Birria tacos', subtitle: '$14 · three with consomme' },
      { icon: 'food', title: 'Cuban sandwich', subtitle: '$12 · pressed to order' },
      { icon: 'coffee', title: 'Horchata', subtitle: '$5 · house made' },
      { icon: 'star', title: 'Loaded fries', subtitle: '$9 · the fan favorite' },
    ],
    tagline: 'Rolling flavor across Central Florida',
    suggestedLinks: ['instagram', 'tiktok', 'ubereats', 'doordash', 'google', 'cashapp'],
    designs: [
      d('orderticket', 'Order Ticket', 'A kitchen order ticket that prints your menu, stamped Order Up.', ['#1D1D1B', '#E4572E', '#FFF8EC'], 'light', ['Space Mono', 'Outfit'], ['rounded', 'large', 'raised', 'none'], 'bright', 0.6, true),
      d('recipe', 'Recipe Card', 'A handwritten recipe card for caterers and home chefs.', ['#1D1D1B', '#FFB400', '#FFF6E5'], 'light', ['Caveat', 'Outfit'], ['pill', 'large', 'raised', 'none'], 'bright', 1.1, true),
      d('foodtruck', 'Street Menu', 'Marquee sign, where-we-are-today, priced menu, order-ahead buttons.', ['#1D1D1B', '#FFB400', '#FFF6E5'], 'light', ['Unbounded', 'Outfit'], ['pill', 'large', 'raised', 'none'], 'bright', 1.1),
    ],
  },

  /* ================================================================ CREATIVE */
  {
    id: 'creator', name: 'Creators and Influencers', group: 'Creative', icon: 'star',
    blurb: 'Link-in-bio energy, chrome gloss and neon.',
    highlightsTitle: 'Work with me',
    highlights: [
      { icon: 'camera', title: 'UGC content', subtitle: 'Reels, TikToks, shorts' },
      { icon: 'star', title: 'Sponsorships', subtitle: 'Integrations and reviews' },
      { icon: 'chat', title: 'Events and hosting', subtitle: 'Launches and panels' },
      { icon: 'sparkle', title: 'Coaching', subtitle: 'Grow your audience' },
    ],
    tagline: 'Creator · Speaker · Your next collab',
    suggestedLinks: ['instagram', 'tiktok', 'youtube', 'threads', 'x', 'spotify'],
    designs: [
      d('creator', 'Creator', 'Gradient ring, big platform buttons, latest posts.', ['#1B1033', '#FF4FA3', '#F7F2FF'], 'dark', ['Bricolage Grotesque', 'Outfit'], ['pill', 'large', 'gradient', 'none'], 'bright', 1.2),
      HOLOGRAM,
      GLOSS,
      SYNTHWAVE,
      CYBER,
      AURORA,
      POSTER,
    ],
  },
  {
    id: 'photo', name: 'Photo and Video', group: 'Creative', icon: 'camera',
    blurb: 'Gallery-first and cinematic designs.',
    highlightsTitle: 'Sessions',
    highlights: [
      { icon: 'camera', title: 'Portraits', subtitle: 'Headshots and families' },
      { icon: 'heart', title: 'Weddings', subtitle: 'Full-day coverage' },
      { icon: 'briefcase', title: 'Brand shoots', subtitle: 'For businesses and creators' },
      { icon: 'star', title: 'Events', subtitle: 'Galas, launches, worship' },
    ],
    tagline: 'Light, story and a little magic',
    suggestedLinks: ['instagram', 'pinterest', 'behance', 'tiktok', 'google'],
    designs: [
      d('contactsheet', 'Contact Sheet', 'A film contact sheet with your pick circled in red grease pencil.', ['#141414', '#E5484D', '#EDEBE6'], 'dark', ['Space Grotesk', 'Inter'], ['square', 'regular', 'outline', 'none'], 'calm', 0.1, true),
      d('photo', 'Darkroom', 'Gallery first. Minimal type, masonry grid, book a session.', ['#111111', '#E8C07D', '#F2F0EC'], 'dark', ['Bodoni Moda', 'Jost'], ['square', 'regular', 'outline', 'none'], 'calm', 0.1),
      d('estate', 'Cinema', 'Your work as a full-screen slideshow with slow cinematic zoom.', ['#0E0E0E', '#E8C07D', '#F2F0EC'], 'dark', ['Italiana', 'Jost'], ['square', 'regular', 'outline', 'none'], 'calm', 0.1, true),
    ],
  },
  {
    id: 'stage', name: 'DJs and Musicians', group: 'Creative', icon: 'music',
    blurb: 'Turntables, waveforms, vinyl and neon for DJs, bands and producers.',
    highlightsTitle: 'Book me for',
    highlights: [
      { icon: 'music', title: 'Weddings', subtitle: 'Ceremony to last dance' },
      { icon: 'star', title: 'Private parties', subtitle: 'Birthdays, quinces, reunions' },
      { icon: 'briefcase', title: 'Corporate events', subtitle: 'Galas and launches' },
      { icon: 'sparkle', title: 'Clubs and venues', subtitle: 'Latin, hip-hop, open format' },
    ],
    tagline: 'Keep the floor full',
    suggestedLinks: ['instagram', 'soundcloud', 'spotify', 'youtube', 'tiktok', 'applemusic'],
    designs: [
      TURNTABLE,
      WAVEFORM,
      VINYL,
      d('stage', 'Stage', 'Live equalizer, spinning vinyl, check my date, streaming links.', ['#140A24', '#FF3D81', '#F5F1FA'], 'dark', ['Syne', 'Space Grotesk'], ['pill', 'large', 'neon', 'none'], 'tech', 1),
      SYNTHWAVE,
      MARQUEE,
      CYBER,
    ],
  },
  {
    id: 'events', name: 'Event Planners', group: 'Creative', icon: 'star',
    blurb: 'Confetti, boarding passes and marquee lights for planners and party pros.',
    highlightsTitle: 'What we plan',
    highlights: [
      { icon: 'star', title: 'Doors and welcome', subtitle: 'Guests arrive, drinks served' },
      { icon: 'food', title: 'Dinner service', subtitle: 'Plated or family style' },
      { icon: 'music', title: 'First dance and toasts', subtitle: 'Timed to the minute' },
      { icon: 'sparkle', title: 'Party and send-off', subtitle: 'Sparklers and a clean exit' },
    ],
    tagline: 'You enjoy it. We handle it.',
    suggestedLinks: ['instagram', 'pinterest', 'facebook', 'tiktok', 'google'],
    designs: [CONFETTI, BOARDING, MARQUEE, d('invitation', 'Invitation', 'An envelope that opens, for galas and corporate events.', ['#1B263B', '#C9A227', '#F4F3EF'], 'light', ['Cormorant Garamond', 'Manrope'], ['pill', 'regular', 'solid', 'none'], 'calm', 1, true)],
  },
  {
    id: 'wedding', name: 'Wedding Planners', group: 'Creative', icon: 'heart',
    blurb: 'An opening envelope, a floral monogram and letterpress elegance.',
    highlightsTitle: 'Our services',
    highlights: [
      { icon: 'heart', title: 'Full planning', subtitle: 'From yes to send-off' },
      { icon: 'star', title: 'Partial planning', subtitle: 'We pick up where you are' },
      { icon: 'sparkle', title: 'Day-of coordination', subtitle: 'You just show up' },
      { icon: 'leaf', title: 'Design and florals', subtitle: 'Your vision, styled' },
    ],
    tagline: 'Your day, beautifully handled',
    suggestedLinks: ['instagram', 'pinterest', 'facebook', 'tiktok', 'google'],
    designs: [INVITATION, MONOGRAM, SIGNATURE, CONFETTI],
  },
  {
    id: 'va', name: 'Virtual Assistants', group: 'Professional', icon: 'chat',
    blurb: 'An inbox, a planner and a command palette for VAs and admins.',
    highlightsTitle: 'I can take off your plate',
    highlights: [
      { icon: 'chat', title: 'Inbox management', subtitle: 'Zero by Friday' },
      { icon: 'book', title: 'Calendar and scheduling', subtitle: 'No more back-and-forth' },
      { icon: 'briefcase', title: 'Bookkeeping support', subtitle: 'Invoices and receipts' },
      { icon: 'star', title: 'Social media', subtitle: 'Posts, captions, replies' },
    ],
    tagline: 'Your time back, handled.',
    suggestedLinks: ['linkedin', 'instagram', 'calendly', 'facebook'],
    designs: [INBOX, PLANNER, d('cmdk', 'Command Palette', 'A searchable card for tech-savvy assistants.', ['#1F2433', '#8B7CFF', '#F3F2FA'], 'light', ['Inter', 'Inter'], ['rounded', 'regular', 'solid', 'none'], 'calm', 0.7, true), SIGNATURE],
  },
  {
    id: 'tattoo', name: 'Tattoo and Art', group: 'Creative', icon: 'art',
    blurb: 'Portfolio-first darkroom in ink and red.',
    highlightsTitle: 'Styles',
    highlights: [
      { icon: 'art', title: 'Fine line', subtitle: 'Delicate and detailed' },
      { icon: 'star', title: 'Black and grey', subtitle: 'Realism and portraits' },
      { icon: 'sparkle', title: 'Color', subtitle: 'Neo-traditional' },
      { icon: 'chat', title: 'Custom designs', subtitle: 'Start with a consult' },
    ],
    tagline: 'Custom work only',
    suggestedLinks: ['instagram', 'tiktok', 'google', 'cashapp'],
    designs: [
      d('flash', 'Flash Sheet', 'Old-school tattoo flash with your name on a ribbon banner.', ['#1B1B1B', '#C8102E', '#F1E7D4'], 'light', ['Rye', 'Karla'], ['rounded', 'large', 'solid', 'paper'], 'bright', 0.5, true),
      d('photo', 'Darkroom', 'Ink black and blood red: portfolio first, book a consult.', ['#0D0D0D', '#D7263D', '#EFECE8'], 'dark', ['Syne', 'Karla'], ['square', 'regular', 'outline', 'grain'], 'bright', 0.1),
      d('cyber', 'Neon District', 'Neon and glitch for modern tattoo studios.', ['#0D0612', '#FF3B3B', '#F6F0F0'], 'dark', ['Chakra Petch', 'Rajdhani'], ['chamfer', 'large', 'neon', 'none'], 'tech', 0.2, true),
    ],
  },

  /* ================================================================ SHOPS */
  {
    id: 'apparel', name: 'Apparel and Accessories', group: 'Shops', icon: 'gem',
    blurb: 'Editorial lookbook and chrome gloss for brands and boutiques.',
    highlightsTitle: 'Collections',
    highlights: [
      { icon: 'gem', title: 'New drop', subtitle: 'Limited run' },
      { icon: 'star', title: 'Best sellers', subtitle: 'Back in stock' },
      { icon: 'heart', title: 'Accessories', subtitle: 'Hats, bags, jewelry' },
      { icon: 'sparkle', title: 'Custom orders', subtitle: 'Made for you' },
    ],
    tagline: 'Wear the story',
    suggestedLinks: ['instagram', 'tiktok', 'shopify', 'etsy', 'pinterest'],
    designs: [
      d('hangtag', 'Hang Tag', 'A clothing hang tag on a string, with size chips.', ['#1A1A1A', '#D97706', '#F3EEE6'], 'light', ['Syne', 'Karla'], ['square', 'regular', 'solid', 'linen'], 'bright', 0.3, true),
      d('apparel', 'Lookbook', 'Editorial cover, swipeable lookbook, shop the collection.', ['#1A1A1A', '#E5484D', '#F4F1EC'], 'light', ['Syne', 'Karla'], ['square', 'regular', 'solid', 'grain'], 'bright', 0.2),
      GLOSS,
    ],
  },
  {
    id: 'retail', name: 'Retail and Boutiques', group: 'Shops', icon: 'briefcase',
    blurb: 'Storefront awning, hours, categories, and a flower-shop garden.',
    highlightsTitle: 'Shop by category',
    highlights: [
      { icon: 'gem', title: 'Gifts', subtitle: 'Wrapped for free' },
      { icon: 'home', title: 'Home', subtitle: 'Decor and candles' },
      { icon: 'heart', title: 'Local makers', subtitle: 'Made in Florida' },
      { icon: 'star', title: 'Sale', subtitle: 'Updated weekly' },
    ],
    tagline: 'Your neighborhood shop',
    suggestedLinks: ['instagram', 'facebook', 'google', 'shopify', 'yelp'],
    designs: [
      d('bag', 'Shopping Bag', 'A branded shopping bag with gift-tag categories.', ['#0F5257', '#F2A541', '#F7F3EC'], 'light', ['Fraunces', 'Figtree'], ['pill', 'regular', 'solid', 'paper'], 'bright', 1, true),
      d('retail', 'Storefront', 'Striped awning, hours, category tiles, visit or shop online.', ['#0F5257', '#FF6F59', '#F4F8F6'], 'light', ['Fraunces', 'Figtree'], ['soft', 'regular', 'solid', 'none'], 'bright', 1),
      d('garden', 'Garden', 'A growing, blooming vine for florists and plant shops.', ['#2F4A2E', '#E3729A', '#F7F4EC'], 'light', ['Fraunces', 'Figtree'], ['pill', 'regular', 'solid', 'none'], 'calm', 1.2, true),
    ],
  },

  /* ================================================================ COMMUNITY */
  {
    id: 'church', name: 'Churches and Ministries', group: 'Community', icon: 'church',
    blurb: 'Service times first, plan your visit, watch live, give, prayer requests.',
    highlightsTitle: 'Ministries',
    highlights: [
      { icon: 'church', title: 'Sunday worship', subtitle: 'All ages welcome' },
      { icon: 'baby', title: 'Kids ministry', subtitle: 'Safe, fun, Bible-centered' },
      { icon: 'music', title: 'Worship team', subtitle: 'Join the band and choir' },
      { icon: 'heart', title: 'Outreach', subtitle: 'Serving our city' },
    ],
    tagline: 'There is a place for you here',
    suggestedLinks: ['youtube', 'facebook', 'instagram', 'spotify', 'paypal', 'cashapp', 'zelle'],
    designs: [
      d('hymnboard', 'Hymn Board', 'A wooden hymn board showing your service times.', ['#3B2A1E', '#D4AF37', '#F7F3EC'], 'light', ['Marcellus', 'Mulish'], ['pill', 'regular', 'solid', 'none'], 'calm', 1, true),
      d('stained', 'Stained Glass', 'A glowing stained-glass window around your photo.', ['#2B2350', '#E0B84A', '#F7F4EE'], 'light', ['Marcellus', 'Mulish'], ['pill', 'regular', 'solid', 'none'], 'calm', 1, true),
      d('church', 'Sanctuary', 'Light rays, service times, watch live, give, prayer requests.', ['#3A2C6B', '#D4AF37', '#F7F5FB'], 'light', ['Marcellus', 'Mulish'], ['pill', 'regular', 'solid', 'none'], 'calm', 1.1),
      d('marquee', 'Marquee', 'Your church name in lights, for conferences and youth events.', ['#1A0E08', '#FFC53D', '#F7F0E6'], 'dark', ['Limelight', 'Work Sans'], ['rounded', 'large', 'raised', 'none'], 'bright', 0.6, true),
    ],
  },
  {
    id: 'worship', name: 'Worship Leaders and Ministries', group: 'Community', icon: 'music',
    blurb: 'The Worship Collection: high tech meets worship, with living portraits, music and gold-and-purple light.',
    highlightsTitle: 'Ministries',
    highlights: [
      { icon: 'music', title: 'Invitations', subtitle: 'Churches, conferences and events' },
      { icon: 'church', title: 'Worship nights', subtitle: 'Live praise and prayer' },
      { icon: 'heart', title: 'Conferences', subtitle: 'Ministry and teaching' },
      { icon: 'star', title: 'Recordings', subtitle: 'Singles and live albums' },
    ],
    tagline: '"Sing to the Lord a new song; sing to the Lord, all the earth." Psalm 96:1',
    suggestedLinks: ['youtube', 'spotify', 'instagram', 'facebook', 'applemusic'],
    designs: [
      d('santuario', 'Santuario HUD', 'Chamfered HUD portrait with gold targeting brackets, a light sweep and a hex grid.', ['#5B2F86', '#FCC004', '#F4EFF8'], 'dark', ['Cinzel', 'Manrope'], ['pill', 'large', 'gradient', 'none'], 'calm', 1, true),
      d('celestial', 'Aurora Celestial', 'Drifting violet and gold light fields and a rotating ring of light.', ['#5B2F86', '#FCC004', '#F4EFF8'], 'dark', ['Cinzel', 'Manrope'], ['pill', 'large', 'gradient', 'none'], 'calm', 1, true),
      d('vitral', 'Vitral Digital', 'A cathedral-arch portrait with jewel facets over glowing circuit traces.', ['#5B2F86', '#FCC004', '#F4EFF8'], 'dark', ['Cinzel', 'Manrope'], ['pill', 'large', 'gradient', 'none'], 'calm', 1, true),
      d('frecuencia', 'Frecuencia', 'A broadcast studio: live tag, moving waveforms and a rising spectrum.', ['#5B2F86', '#FCC004', '#F4EFF8'], 'dark', ['Cinzel', 'Manrope'], ['pill', 'large', 'gradient', 'none'], 'tech', 1, true),
      d('constelacion', 'Constelación', 'Twinkling stars, a crown constellation and orbiting rings around your photo.', ['#5B2F86', '#FCC004', '#F4EFF8'], 'dark', ['Cinzel', 'Manrope'], ['pill', 'large', 'gradient', 'none'], 'calm', 1, true),
      d('escenario', 'Escenario', 'An edge-to-edge portrait under swaying stage spotlights.', ['#5B2F86', '#FCC004', '#F4EFF8'], 'dark', ['Cinzel', 'Manrope'], ['pill', 'large', 'gradient', 'none'], 'calm', 1, true),
      d('salmo', 'Salmo OS', 'Your portrait in an app window with a pixel reveal and CRT glow.', ['#5B2F86', '#FCC004', '#F4EFF8'], 'dark', ['Cinzel', 'Manrope'], ['pill', 'large', 'gradient', 'none'], 'tech', 1, true),
    ],
  },
  {
    id: 'nonprofit', name: 'Nonprofits', group: 'Community', icon: 'heart',
    blurb: 'Events, volunteer, donate and share.',
    highlightsTitle: 'Get involved',
    highlights: [
      { icon: 'heart', title: 'Volunteer', subtitle: 'Saturdays and events' },
      { icon: 'food', title: 'Food pantry', subtitle: 'Open to all families' },
      { icon: 'book', title: 'Youth programs', subtitle: 'Tutoring and mentoring' },
      { icon: 'star', title: 'Partner with us', subtitle: 'Businesses and churches' },
    ],
    tagline: 'Neighbors helping neighbors',
    suggestedLinks: ['facebook', 'instagram', 'paypal', 'cashapp', 'youtube'],
    designs: [
      d('postcard', 'Postcard', 'A picture postcard, with a handwritten note and stamp on the back.', ['#1F5E3B', '#E4572E', '#F6F1E7'], 'light', ['Caveat', 'Nunito Sans'], ['pill', 'regular', 'solid', 'paper'], 'calm', 1, true),
      d('church', 'Sanctuary', 'Warm green and orange for causes and community groups.', ['#1F5E3B', '#F28C28', '#F4F8F3'], 'light', ['Lora', 'Nunito Sans'], ['pill', 'regular', 'solid', 'none'], 'calm', 1.1),
      d('garden', 'Garden', 'A growing vine for community gardens and green causes.', ['#1F5E3B', '#F28C28', '#F4F8F3'], 'light', ['Fraunces', 'Figtree'], ['pill', 'regular', 'solid', 'none'], 'calm', 1.2, true),
    ],
  },
];

/** Every distinct design, for "Browse all designs". */
export const ALL_DESIGNS: { niche: Niche; design: Design }[] = NICHES.flatMap((n) => n.designs.map((design) => ({ niche: n, design })));
export const NEW_DESIGN_COUNT = new Set(ALL_DESIGNS.filter((x) => x.design.isNew).map((x) => x.design.template)).size;

/** Put a design on a card. Style always changes; content is only filled where the card is still empty. */
export function applyDesign(card: Card, niche: Niche, design: Design, opts: { layoutOnly?: boolean } = {}): Card {
  if (opts.layoutOnly) return { ...card, template: design.template, data: { ...card.data, niche: card.data.niche || niche.id } };
  const theme = themeFromSeeds(design.seeds, { modeDefault: design.mode, fonts: design.fonts, button: design.button, cornerScale: design.cornerScale, kit: card.theme.kit });
  const dd = card.data;
  return {
    ...card,
    template: design.template,
    theme: { ...theme, sound: design.sound },
    data: {
      ...dd,
      highlightsTitle: dd.highlights.length ? dd.highlightsTitle : niche.highlightsTitle,
      highlights: dd.highlights.length ? dd.highlights : niche.highlights.map((h) => ({ ...h, id: uid() })),
      tagline: dd.tagline || niche.tagline,
      niche: niche.id,
    },
  };
}

/** Google fonts a layout uses beyond the theme pair (mono readouts, LED type). */
export const TEMPLATE_EXTRA_FONTS: Partial<Record<TemplateId, string[]>> = {
  tech: ['IBM Plex Mono', 'Space Grotesk'],
  terminal: ['VT323', 'IBM Plex Mono'],
  radar: ['Share Tech Mono'],
  circuit: ['IBM Plex Mono'],
  blueprint: ['IBM Plex Mono'],
  cyber: ['Share Tech Mono'],
  quantum: ['IBM Plex Mono'],
  passport: ['IBM Plex Mono'],
  scoreboard: ['Bebas Neue'],
  signature: ['Pinyon Script'],
  invitation: ['Pinyon Script'],
  mission: ['Share Tech Mono'],
  cmdk: ['IBM Plex Mono'],
  boarding: ['IBM Plex Mono'],
  nowserving: ['Share Tech Mono'],
  recipe: ['Caveat'],
  planner: ['Caveat'],
  chalkboard: ['Caveat'],
  neonsign: ['Monoton'],
  casefile: ['Courier Prime'],
  orderticket: ['Space Mono'],
  ledger: ['Homemade Apple'],
  postcard: ['Caveat'],
  santuario: ['Cinzel', 'JetBrains Mono'], celestial: ['Cinzel', 'JetBrains Mono'], vitral: ['Cinzel', 'JetBrains Mono'],
  frecuencia: ['Cinzel', 'JetBrains Mono'], constelacion: ['Cinzel', 'JetBrains Mono'], escenario: ['Cinzel', 'JetBrains Mono'], salmo: ['Cinzel', 'JetBrains Mono'],
};

export const NICHE_BY_ID = Object.fromEntries(NICHES.map((n) => [n.id, n])) as Record<string, Niche>;

/** The card's niche: the one the owner picked, or a best guess from its layout. */
export function nicheOf(card: Card): Niche | null {
  if (card.data.niche && NICHE_BY_ID[card.data.niche]) return NICHE_BY_ID[card.data.niche];
  return NICHES.find((n) => n.designs.some((d) => d.template === card.template)) ?? null;
}

/** Designs in a niche the card is not using yet, newest first. */
export function untriedDesigns(card: Card, niche: Niche): Design[] {
  const seen = new Set<string>();
  return niche.designs
    .filter((d) => d.template !== card.template)
    .filter((d) => (seen.has(d.template) ? false : (seen.add(d.template), true)))
    .sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
}

/* ------------------------------------------------------------------
   Sample content per niche, so previews read like that trade
   (a barbershop preview says "Urban Cutz", not an interior designer).
   All businesses are fictional.
   ------------------------------------------------------------------ */
export interface NicheSample { business: string; fullName: string; jobTitle: string; tagline: string; hours: string; credentials?: string; }
export const NICHE_SAMPLES: Record<string, NicheSample> = {
  tech:         { business: 'Vector Labs', fullName: 'Maya Reyes', jobTitle: 'Full-Stack Engineer', tagline: 'Building what runs your business', hours: 'Mon-Fri 9am-6pm' },
  engineering:  { business: 'Keel Structural', fullName: 'Dana Whitfield', jobTitle: 'Licensed Architect', credentials: 'AIA', tagline: 'Measured twice. Built once.', hours: 'Mon-Fri 8am-5pm' },
  gaming:       { business: 'NovaByte', fullName: 'Jade "Nova" Cruz', jobTitle: 'Streamer and Creator', tagline: 'Live most nights', hours: 'Live Tue, Thu, Sat 8pm' },
  barber:       { business: 'Urban Cutz', fullName: 'Kiara "Kay" Thomas', jobTitle: 'Master Barber', tagline: 'Walk-ins welcome, appointments preferred', hours: 'Tue-Sat 9am-7pm, Sun 10am-3pm' },
  salon:        { business: 'Maison Lumière Salon', fullName: 'Camila Ortiz', jobTitle: 'Lead Stylist and Colorist', tagline: 'Hair that turns heads', hours: 'Tue-Sat 9am-7pm' },
  nails:        { business: 'Polished Nail Spa', fullName: 'Kim Tran', jobTitle: 'Nail Artist and Owner', tagline: 'Booked, polished, obsessed', hours: 'Mon-Sat 10am-7pm' },
  esthetics:    { business: 'Glow Theory Skin Studio', fullName: 'Priya Shah', jobTitle: 'Licensed Esthetician', tagline: 'Skin that feels like you again', hours: 'Tue-Sat 10am-6pm' },
  massage:      { business: 'Stillwater Massage & Spa', fullName: 'Elena Marsh', jobTitle: 'Licensed Massage Therapist', credentials: 'LMT', tagline: 'Slow down. Breathe. Recover.', hours: 'Mon-Sat 10am-8pm, Sun 11am-5pm' },
  realestate:   { business: 'Palmetto & Oak Realty', fullName: 'Sofia Delgado', jobTitle: 'Realtor', tagline: 'Helping families find home', hours: 'By appointment, 7 days' },
  advisor:      { business: 'Harbor Point Insurance', fullName: 'Danielle Brooks', jobTitle: 'Insurance Advisor', credentials: 'Lic. W123456', tagline: 'Plain answers. Real coverage.', hours: 'Mon-Fri 9am-5pm' },
  legal:        { business: 'Whitmore Law Group', fullName: 'Rachel Whitmore', jobTitle: 'Attorney at Law', credentials: 'Esq.', tagline: 'Clear counsel when it matters', hours: 'Mon-Fri 8:30am-5:30pm' },
  travel:       { business: 'Wanderwell Travel', fullName: 'Nina Alvarez', jobTitle: 'Travel Advisor', tagline: 'Your next trip, handled', hours: 'Mon-Sat 10am-6pm' },
  va:           { business: 'Clear Desk Assist', fullName: 'Tasha Greene', jobTitle: 'Virtual Assistant', tagline: 'Your time back, handled.', hours: 'Mon-Fri 8am-4pm EST' },
  mechanic:     { business: 'Torque & Tread Auto', fullName: 'Lucia Romero', jobTitle: 'ASE Master Technician', tagline: 'Honest work. Fair prices.', hours: 'Mon-Fri 8am-6pm, Sat 8am-1pm' },
  handyman:     { business: 'Fix-It Fran Co.', fullName: 'Fran Delaney', jobTitle: 'Handyman and Contractor', credentials: 'Licensed and insured', tagline: 'No job too small', hours: 'Mon-Sat 7am-6pm' },
  homeservices: { business: 'Fresh Start Cleaning', fullName: 'Maria Lopez', jobTitle: 'Owner', credentials: 'Bonded and insured', tagline: 'Spotless, on schedule', hours: 'Mon-Sat 8am-5pm' },
  fitness:      { business: 'Iron Pulse Training', fullName: 'Coach Toni Rivera', jobTitle: 'Certified Personal Trainer', tagline: 'Stronger every week', hours: 'Mon-Sat 5am-8pm' },
  bistro:       { business: 'Café Ceiba', fullName: 'Rosa Martinez', jobTitle: 'Chef and Owner', tagline: 'Made from scratch, every day', hours: 'Tue-Sun 7am-3pm' },
  foodtruck:    { business: 'Fuego Street Eats', fullName: 'Carla Vega', jobTitle: 'Chef and Owner', tagline: 'Rolling flavor across Central Florida', hours: 'Thu-Sun 11am-9pm' },
  creator:      { business: 'Bree Daily', fullName: 'Bree Johnson', jobTitle: 'Lifestyle Creator', tagline: 'Creator · Speaker · Your next collab', hours: 'Collabs: reply within 48 hrs' },
  photo:        { business: 'Lumen & Grain Studio', fullName: 'Jordan Hale', jobTitle: 'Photographer', tagline: 'Light, story and a little magic', hours: 'Sessions by appointment' },
  stage:        { business: 'DJ Solaris', fullName: 'Mia "Solaris" Ruiz', jobTitle: 'DJ and Producer', tagline: 'Keep the floor full', hours: 'Booking weekends year-round' },
  events:       { business: 'Confetti & Co. Events', fullName: 'Alana Price', jobTitle: 'Event Planner', tagline: 'You enjoy it. We handle it.', hours: 'Consults Mon-Fri 10am-6pm' },
  wedding:      { business: 'Ever After Weddings', fullName: 'Isabel Moreno', jobTitle: 'Wedding Planner', tagline: 'Your day, beautifully handled', hours: 'Consults by appointment' },
  tattoo:       { business: 'Black Rose Tattoo', fullName: 'Rita Santana', jobTitle: 'Tattoo Artist', tagline: 'Custom work only', hours: 'Tue-Sat 12pm-9pm' },
  apparel:      { business: 'Kinfolk Supply', fullName: 'Tiana Brooks', jobTitle: 'Founder and Designer', tagline: 'Wear the story', hours: 'Online 24/7' },
  retail:       { business: 'The Corner Nook', fullName: 'Hannah Lee', jobTitle: 'Owner', tagline: 'Your neighborhood shop', hours: 'Mon-Sat 10am-7pm' },
  worship:      { business: 'Kingdom Harmony', fullName: 'Isabel Rivera', jobTitle: 'Psalmist | Worship Ministry', tagline: '"Sing to the Lord a new song; sing to the Lord, all the earth." Psalm 96:1', hours: 'Booking conferences and worship nights' },
  church:       { business: 'Grace Harbor Church', fullName: 'Pastor Joanna Allen', jobTitle: 'Lead Pastor', tagline: 'There is a place for you here', hours: 'Sundays 9am and 11am' },
  nonprofit:    { business: 'Neighbors United', fullName: 'Grace Okafor', jobTitle: 'Executive Director', tagline: 'Neighbors helping neighbors', hours: 'Mon-Fri 9am-5pm' },
};

/** A card dressed in a niche's sample content, for previews only. The photo stays; unrelated gallery images are dropped. */
export function sampleFor(card: Card, niche: Niche): Card {
  const s = NICHE_SAMPLES[niche.id];
  if (!s) return card;
  return {
    ...card,
    data: {
      ...card.data,
      business: s.business, fullName: s.fullName, jobTitle: s.jobTitle, tagline: s.tagline, hours: s.hours, credentials: s.credentials ?? '',
      highlightsTitle: niche.highlightsTitle, highlights: niche.highlights.map((h, i) => ({ ...h, id: `s${i}` })),
      gallery: niche.id === 'realestate' ? card.data.gallery : [], niche: niche.id,
      slug: s.business.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    },
  };
}

/** The free Lite designs, dressed in a niche's first-design colors and fonts. */
export function liteDesigns(niche: Niche): Design[] {
  const base = niche.designs[0];
  const names: Record<string, string> = { arch: 'Lite Arch', header: 'Lite Header', swiss: 'Lite Swiss' };
  return (['arch', 'header', 'swiss'] as TemplateId[]).map((t) => ({
    ...base, template: t, name: names[t], isNew: false,
    blurb: 'Free on every plan. Clean, simple and ready to share.',
    button: { ...base.button, style: base.button.style === 'neon' || base.button.style === 'hud' ? 'solid' : base.button.style },
  }));
}
