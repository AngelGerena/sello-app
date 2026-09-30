import type { ReactElement } from 'react';
import type { TemplateId } from '../lib/types';
import { Apparel, Creator, Esthetics, FoodTruck, Handyman, Mechanic, PhotoLayout, RealEstate, Retail } from './niche';
import { Tech } from './tech';
import { Advisor, Barber, Bistro, Church, Fitness, Stage } from './niche2';
import { Aurora, Blueprint, Circuit, Cyber, Quantum, Radar, Terminal } from './sig-tech';
import { Blush, Fade, Gloss, OldSchool, Silk, Velvet, Vanity } from './sig-beauty';
import { Estate, Garden, Marquee, Passport, Scoreboard, Signature } from './sig-more';
import { Cmdk, GoldLeaf, Hologram, Lash, Liquid, Mission, NowServing, Perfume, Pole, Poster, RoseGold, Starfield, Swatch, Synthwave } from './sig2-a';
import { Celestial, Constelacion, Escenario, Frecuencia, Salmo, Santuario, Vitral } from './worship/Worship';
import { Bag, CaseFile, Cluster, ContactSheet, Diner, Flash, FloorPlan, HangTag, HymnBoard, Ledger, OrderTicket, Postcard, Stopwatch, YardSign } from './sig4';
import { Bamboo, Blowout, Chalkboard, Clipper, Lotus, Magazine, NeonSign, Polish, Razor, Shimmer, Stations, Stones, Tips } from './sig3';
import { Boarding, Confetti, Inbox, Invitation, Monogram, Planner, Recipe, Stained, Toolbelt, Trading, Turntable, Vinyl, Waveform } from './sig2-b';
import {
  Arrow, Btn, Business, CalendarDays, ContactList, Crisis, Dock, Footer, Highlights, LocationCard, Logo, Name, Photo,
  QrBtn, SaveBtn, ShareBtn, SocialLinks, Title, el, useCard, useContactActions,
} from './blocks';
import { addressLine, mapsHref, prettyUrl, webHref } from '../lib/links';

export interface TemplateMeta { id: TemplateId; name: string; blurb: string; bestFor: string; niche?: string; }

export const TEMPLATES: TemplateMeta[] = [
  { id: 'cover',   name: 'Editorial Cover',  blurb: 'Full-bleed photo that fades into the page, name set large like a magazine.', bestFor: 'Personal brands, stylists, realtors' },
  { id: 'arch',    name: 'Sanctuary Arch',   blurb: 'Arched portrait, centered serif name, calm stacked buttons.', bestFor: 'Wellness, spas, counselors, churches' },
  { id: 'header',  name: 'Clinic Header',    blurb: 'Brand band with logo, round portrait overlapping it, quick-action squares.', bestFor: 'Practices and teams that lead with the business' },
  { id: 'bizcard', name: 'Business Card',    blurb: 'A real-looking card up top, grouped rows below like a settings screen.', bestFor: 'Professionals, older audiences, trades' },
  { id: 'app',     name: 'App Profile',      blurb: 'Compact profile header and a big booking panel first.', bestFor: 'Anything booking-driven' },
  { id: 'rail',    name: 'Side Rail',        blurb: 'Slim brand column with every action always in reach.', bestFor: 'Designers, architects, studios' },
  { id: 'radial',  name: 'Radial Dial',      blurb: 'Portrait in a ring with actions orbiting it, swipeable highlights.', bestFor: 'Creators, events, youth ministries' },
  { id: 'swiss',   name: 'Swiss Type',       blurb: 'Huge type, strict grid, numbered text actions.', bestFor: 'Agencies, photographers, galleries' },
  { id: 'bento',   name: 'Bento Grid',       blurb: 'A tiled mosaic that packs everything on one screen.', bestFor: 'Restaurants, shops, busy owners' },
  { id: 'journey', name: 'Care Journey',     blurb: 'A friendly numbered path from saving your contact to visiting.', bestFor: 'Clinics, coaches, onboarding-heavy services' },
  // ---- niche layouts
  { id: 'tech',       name: 'Mainframe',   niche: 'Tech and IT',                  blurb: 'Boot sequence, neon grid, glitch type, holographic tilt, keyboard commands.', bestFor: 'Developers, IT, startups, AI and gaming' },
  { id: 'realestate', name: 'Keystone',    niche: 'Real Estate',           blurb: 'Property hero, agent card, home-value call to action, listings strip.', bestFor: 'Agents, brokers, property managers' },
  { id: 'photo',      name: 'Darkroom',    niche: 'Photo and Video',           blurb: 'Gallery first. Minimal type, masonry grid, book a session.', bestFor: 'Photographers, videographers, artists' },
  { id: 'foodtruck',  name: 'Street Menu', niche: 'Food Trucks',           blurb: 'Marquee sign, where-we-are-today, priced menu, order-ahead buttons.', bestFor: 'Food trucks, pop-ups, caterers' },
  { id: 'apparel',    name: 'Lookbook',    niche: 'Apparel and Accessories', blurb: 'Editorial cover, swipeable lookbook, shop the collection.', bestFor: 'Clothing brands, jewelry, boutiques' },
  { id: 'mechanic',   name: 'Garage',      niche: 'Auto and Mechanics',             blurb: 'Hazard stripe, giant call button, services grid, shop hours.', bestFor: 'Auto repair, detailing, tire shops' },
  { id: 'handyman',   name: 'Toolbox',     niche: 'Handyman',              blurb: 'Call or text first, job checklist, licensed badge, before and after.', bestFor: 'Handymen, contractors, cleaners, lawn care' },
  { id: 'esthetics',  name: 'Glow',        niche: 'Esthetics and Med Spa',             blurb: 'Soft aura, glowing portrait ring, treatment menu with times.', bestFor: 'Estheticians, lash and brow, med spas' },
  { id: 'creator',    name: 'Creator',     niche: 'Creators and Influencers',           blurb: 'Link-in-bio energy: gradient ring, big platform buttons, latest posts.', bestFor: 'Influencers, podcasters, musicians' },
  { id: 'retail',     name: 'Storefront',  niche: 'Retail and Boutiques',                blurb: 'Striped awning, hours, category tiles, visit or shop online.', bestFor: 'Boutiques, gift shops, local stores' },
  { id: 'barber',     name: 'Chair',       niche: 'Barbers and Salons',    blurb: 'Barber-pole stripe, book a chair, price list, fresh cuts.', bestFor: 'Barbers, hair salons, braiders, nail techs' },
  { id: 'church',     name: 'Sanctuary',   niche: 'Churches and Ministries', blurb: 'Service times, plan your visit, watch live, give, prayer requests.', bestFor: 'Churches, ministries, nonprofits' },
  { id: 'fitness',    name: 'Pulse',       niche: 'Fitness and Coaching',  blurb: 'Pulsing rings, programs, book a session, transformations.', bestFor: 'Trainers, gyms, coaches, yoga' },
  { id: 'advisor',    name: 'Advisor',     niche: 'Insurance and Finance', blurb: 'License badge, book a review, get a quote, clear services.', bestFor: 'Insurance, loan officers, lawyers, CPAs' },
  { id: 'bistro',     name: 'Bistro',      niche: 'Restaurants and Cafes', blurb: 'Menu card with prices, reserve, order online, dining room.', bestFor: 'Restaurants, cafes, bakeries, bars' },
  { id: 'stage',      name: 'Stage',       niche: 'DJs, Events and Music', blurb: 'Live equalizer, spinning vinyl, check my date, streaming links.', bestFor: 'DJs, bands, event planners, venues' },
  // ---- signature collection
  { id: 'quantum',    name: 'Quantum',       niche: 'Tech', blurb: 'Orbiting 3D rings around your photo, particle dust, glass tiles.', bestFor: 'AI, science, engineering' },
  { id: 'terminal',   name: 'Terminal',      niche: 'Tech', blurb: 'A CRT screen types out who you are, command by command.', bestFor: 'Developers, security, gamers' },
  { id: 'cyber',      name: 'Neon District', niche: 'Tech', blurb: 'Cyberpunk panels, neon rain, slashed buttons, glitch type.', bestFor: 'Streamers, esports, tattoo, DJs' },
  { id: 'aurora',     name: 'Aurora',        niche: 'Tech', blurb: 'Living northern-lights color behind floating glass.', bestFor: 'Startups, founders, med spas' },
  { id: 'radar',      name: 'Radar',         niche: 'Tech', blurb: 'A sweeping radar where every contact option is a blip.', bestFor: 'IT, security, drone pilots' },
  { id: 'circuit',    name: 'Circuit',       niche: 'Tech', blurb: 'Your photo on a chip with live current running to each action.', bestFor: 'Electronics, IoT, auto electrical' },
  { id: 'blueprint',  name: 'Blueprint',     niche: 'Architects and Engineers', blurb: 'A self-drawing blueprint with title block and specs.', bestFor: 'Architects, engineers, contractors' },
  { id: 'velvet',     name: 'Velvet',        niche: 'Hair Salons', blurb: 'Velvet and gold foil, a gilded arch mirror, sparkles.', bestFor: 'Luxury salons, stylists' },
  { id: 'fade',       name: 'Fade',          niche: 'Barbershops', blurb: 'Stacked streetwear type, letterboard prices, razor details.', bestFor: 'Modern barbers' },
  { id: 'oldschool',  name: 'Old School',    niche: 'Barbershops', blurb: 'Vintage badge, pole stripes, hand-lettered price card.', bestFor: 'Classic barbershops' },
  { id: 'blush',      name: 'Blush',         niche: 'Nails and Lashes', blurb: 'Morphing pastel blobs, polaroid stack, soft pill buttons.', bestFor: 'Nail techs, lash artists' },
  { id: 'vanity',     name: 'Vanity Mirror', niche: 'Beauty', blurb: 'Hollywood vanity mirror with bulbs that light in sequence.', bestFor: 'Makeup artists, salons, lashes' },
  { id: 'silk',       name: 'Silk',          niche: 'Beauty', blurb: 'Slow flowing silk waves and a calm treatment menu.', bestFor: 'Spas, massage, estheticians' },
  { id: 'gloss',      name: 'Chrome Gloss',  niche: 'Beauty', blurb: 'Iridescent chrome, glossy bubble buttons, sparkles.', bestFor: 'Nail art, beauty creators, boutiques' },
  { id: 'marquee',    name: 'Marquee',       niche: 'Events', blurb: 'Theater marquee with chasing bulbs and your name in lights.', bestFor: 'Venues, DJs, comedians, events' },
  { id: 'passport',   name: 'Passport',      niche: 'Travel Agents', blurb: 'Passport data page and visa stamps that land as it opens.', bestFor: 'Travel agents and creators' },
  { id: 'estate',     name: 'Estate',        niche: 'Real Estate', blurb: 'Full-screen cinematic slideshow with gold hairlines.', bestFor: 'Luxury realtors, photographers' },
  { id: 'garden',     name: 'Garden',        niche: 'Florists', blurb: 'A vine that grows and blooms down the page.', bestFor: 'Florists, landscapers, plant shops' },
  { id: 'scoreboard', name: 'Scoreboard',    niche: 'Fitness', blurb: 'Stadium LED scoreboard with floodlight glow.', bestFor: 'Coaches, trainers, sports' },
  { id: 'signature',  name: 'Signature',     niche: 'Professional', blurb: 'Letterpress card and a wax seal with your initials.', bestFor: 'Lawyers, advisors, luxury pros' },
  // ---- collection two
  { id: 'hologram',   name: 'Hologram',        niche: 'Tech', blurb: 'A 3D holographic ID card you can grab and spin.', bestFor: 'Tech, founders, creators' },
  { id: 'mission',    name: 'Mission Control', niche: 'Tech', blurb: 'Live clock, gauges and toggle switches for every action.', bestFor: 'IT, operations, engineers' },
  { id: 'poster',     name: 'Glitch Poster',   niche: 'Tech', blurb: 'Brutalist poster with RGB split type and a scrolling ticker.', bestFor: 'Designers, agencies, streetwear' },
  { id: 'liquid',     name: 'Liquid Metal',    niche: 'Tech', blurb: 'Molten chrome blobs that merge and split behind glass.', bestFor: 'Startups, product people' },
  { id: 'starfield',  name: 'Starfield',       niche: 'Tech', blurb: 'Warp-speed intro that settles into drifting stars.', bestFor: 'Tech, aerospace, gaming' },
  { id: 'cmdk',       name: 'Command Palette', niche: 'Tech', blurb: 'A searchable, keyboard-first card like a developer tool.', bestFor: 'Developers, product, SaaS' },
  { id: 'synthwave',  name: 'Synthwave',       niche: 'Tech', blurb: 'Retro sunset, neon grid and chrome type.', bestFor: 'DJs, gamers, creators' },
  { id: 'pole',       name: 'Barber Pole',     niche: 'Barbershops', blurb: 'A spinning 3D barber pole beside your shop name.', bestFor: 'Barbershops' },
  { id: 'goldleaf',   name: 'Gold Leaf',       niche: 'Beauty', blurb: 'Dark marble and gold flakes that settle around your photo.', bestFor: 'Luxury salons, med spas' },
  { id: 'lash',       name: 'Lash Line',       niche: 'Beauty', blurb: 'Lashes draw themselves over your photo, one by one.', bestFor: 'Lash and brow artists' },
  { id: 'rosegold',   name: 'Rose Gold',       niche: 'Beauty', blurb: 'Brushed rose-gold plate with a light sweep and engraved name.', bestFor: 'Salons, nails, jewelry' },
  { id: 'swatch',     name: 'Swatch Book',     niche: 'Beauty', blurb: 'Services fan out like a colorist swatch book.', bestFor: 'Hair colorists, nail techs' },
  { id: 'nowserving', name: 'Now Serving',     niche: 'Barbershops', blurb: 'A take-a-number machine; the ticket books the next chair.', bestFor: 'Barbershops, walk-in salons' },
  { id: 'perfume',    name: 'Perfume',         niche: 'Beauty', blurb: 'A glass bottle with your name on the label.', bestFor: 'Spas, fragrance, luxury beauty' },
  { id: 'vinyl',      name: 'Vinyl Sleeve',    niche: 'DJs', blurb: 'Your photo as an album cover, the record slides out.', bestFor: 'DJs, artists, producers' },
  { id: 'boarding',   name: 'Boarding Pass',   niche: 'Events', blurb: 'A first-class boarding pass with a barcode stub.', bestFor: 'Event planners, travel, promoters' },
  { id: 'recipe',     name: 'Recipe Card',     niche: 'Food', blurb: 'A handwritten recipe card taped under your photo.', bestFor: 'Chefs, bakers, caterers' },
  { id: 'toolbelt',   name: 'Toolbelt',        niche: 'Trades', blurb: 'A leather belt with a pocket for every action.', bestFor: 'Contractors, trades, handymen' },
  { id: 'stained',    name: 'Stained Glass',   niche: 'Churches', blurb: 'A glowing stained-glass window around your photo.', bestFor: 'Churches and ministries' },
  { id: 'trading',    name: 'Trading Card',    niche: 'Fitness', blurb: 'A holo trading card that flips to show your stats.', bestFor: 'Coaches, athletes, trainers' },
  { id: 'turntable',  name: 'Turntable',       niche: 'DJs', blurb: 'A spinning deck, a working crossfader and light-up pads.', bestFor: 'DJs' },
  { id: 'waveform',   name: 'Waveform',        niche: 'DJs', blurb: 'A playing waveform with a scrubber and tracklist.', bestFor: 'DJs, producers, podcasters' },
  { id: 'confetti',   name: 'Confetti',        niche: 'Event Planners', blurb: 'A confetti burst and a run-of-show timeline.', bestFor: 'Event planners, party rentals' },
  { id: 'invitation', name: 'Invitation',      niche: 'Wedding Planners', blurb: 'An envelope that opens to reveal your card.', bestFor: 'Wedding and event planners' },
  { id: 'monogram',   name: 'Monogram',        niche: 'Wedding Planners', blurb: 'Your initials in a blooming floral wreath.', bestFor: 'Wedding planners, florists' },
  { id: 'inbox',      name: 'Inbox',           niche: 'Virtual Assistants', blurb: 'An email inbox where every message is a way to reach you.', bestFor: 'Virtual assistants, admins' },
  { id: 'planner',    name: 'Planner',         niche: 'Virtual Assistants', blurb: 'A ring-bound planner with your week and a to-do list.', bestFor: 'Virtual assistants, coaches' },
  // ---- collection three
  { id: 'razor',      name: 'Straight Razor', niche: 'Barbershops', blurb: 'A chrome straight razor opens over an engraved steel price plate.', bestFor: 'Classic and upscale barbers' },
  { id: 'chalkboard', name: 'Chalkboard',     niche: 'Barbershops', blurb: 'A wood-framed chalk menu with hand-written prices.', bestFor: 'Neighborhood barbershops' },
  { id: 'neonsign',   name: 'Neon Sign',      niche: 'Barbershops', blurb: 'Your shop name as a flickering neon sign on brick.', bestFor: 'Modern barbershops' },
  { id: 'clipper',    name: 'Clipper Guards', niche: 'Barbershops', blurb: 'A buzzing clipper and guard sizes that label each service.', bestFor: 'Fade specialists' },
  { id: 'polish',     name: 'Polish Shelf',   niche: 'Nail Spas', blurb: 'A shelf of polish bottles; each one is a service and price.', bestFor: 'Nail salons and spas' },
  { id: 'shimmer',    name: 'Shimmer',        niche: 'Nail Spas', blurb: 'Twinkling glitter and a glossy service menu.', bestFor: 'Nail artists, lash studios' },
  { id: 'tips',       name: 'Tip Chart',      niche: 'Nail Spas', blurb: 'Your work shown inside real nail shapes: almond, coffin, stiletto.', bestFor: 'Nail artists' },
  { id: 'blowout',    name: 'Blowout',        niche: 'Hair Salons', blurb: 'Flowing hair strands sweep across an editorial portrait.', bestFor: 'Stylists, blowout bars' },
  { id: 'stations',   name: 'Salon Stations', niche: 'Hair Salons', blurb: 'Three lit salon mirrors, your photo in the center chair.', bestFor: 'Salons with a team' },
  { id: 'magazine',   name: 'Cover Story',    niche: 'Hair Salons', blurb: 'Your salon on a fashion magazine cover, services as cover lines.', bestFor: 'Salons, stylists, makeup artists' },
  { id: 'stones',     name: 'Hot Stones',     niche: 'Massage Spas', blurb: 'Balanced warm stones with rising steam.', bestFor: 'Massage therapists, day spas' },
  { id: 'lotus',      name: 'Lotus',          niche: 'Massage Spas', blurb: 'A lotus blooms on a rippling pond, with a gentle breathing guide.', bestFor: 'Spas, yoga, wellness' },
  { id: 'bamboo',     name: 'Bamboo',         niche: 'Massage Spas', blurb: 'Swaying bamboo and rice-paper panels, calm and zen.', bestFor: 'Massage, acupuncture, spas' },
  // ---- collection four
  { id: 'casefile',     name: 'Case File',      niche: 'Legal', blurb: 'A manila case folder with a clipped photo and numbered practice areas.', bestFor: 'Attorneys, consultants' },
  { id: 'contactsheet', name: 'Contact Sheet',  niche: 'Photo and Video', blurb: 'A film contact sheet with your pick circled in red grease pencil.', bestFor: 'Photographers, videographers' },
  { id: 'flash',        name: 'Flash Sheet',    niche: 'Tattoo', blurb: 'Old-school tattoo flash with your name on a ribbon banner.', bestFor: 'Tattoo artists and shops' },
  { id: 'orderticket',  name: 'Order Ticket',   niche: 'Food Trucks', blurb: 'A kitchen order ticket that prints your menu, stamped Order Up.', bestFor: 'Food trucks, pop-ups, caterers' },
  { id: 'hangtag',      name: 'Hang Tag',       niche: 'Apparel', blurb: 'A clothing hang tag on a string, with size chips.', bestFor: 'Clothing brands, boutiques' },
  { id: 'bag',          name: 'Shopping Bag',   niche: 'Retail', blurb: 'A branded shopping bag with gift-tag categories.', bestFor: 'Shops, boutiques, gift stores' },
  { id: 'postcard',     name: 'Postcard',       niche: 'Community', blurb: 'A picture postcard, with a handwritten note and stamp on the back.', bestFor: 'Nonprofits, travel, community groups' },
  { id: 'floorplan',    name: 'Floor Plan',     niche: 'Real Estate', blurb: 'Your services as rooms on an architectural floor plan.', bestFor: 'Realtors, builders, designers' },
  { id: 'ledger',       name: 'Ledger',         niche: 'Finance', blurb: 'A green ledger page with checked-off services and your signature.', bestFor: 'Accountants, insurance, advisors' },
  { id: 'hymnboard',    name: 'Hymn Board',     niche: 'Churches', blurb: 'A wooden hymn board showing your service times.', bestFor: 'Churches and ministries' },
  { id: 'cluster',      name: 'Dashboard',      niche: 'Auto', blurb: 'A car instrument cluster; gauges sweep up and warning lights are your buttons.', bestFor: 'Mechanics, detailers, dealers' },
  { id: 'stopwatch',    name: 'Stopwatch',      niche: 'Fitness', blurb: 'A running stopwatch, with your programs as laps.', bestFor: 'Trainers, run clubs, coaches' },
  { id: 'diner',        name: 'Diner',          niche: 'Restaurants', blurb: 'A retro diner sign, checkered floor and a specials board.', bestFor: 'Diners, cafes, breakfast spots' },
  { id: 'yardsign',     name: 'Yard Sign',      niche: 'Home Services', blurb: 'Your company on a lawn sign with a giant phone number.', bestFor: 'Lawn care, cleaning, contractors' },
  // ---- worship collection
  { id: 'santuario',    name: 'Santuario HUD',    niche: 'Worship', blurb: 'Chamfered HUD portrait with gold targeting brackets, a light sweep and a hex grid.', bestFor: 'Worship leaders, psalmists' },
  { id: 'celestial',    name: 'Aurora Celestial', niche: 'Worship', blurb: 'Drifting violet and gold light fields and a rotating ring of light.', bestFor: 'Worship leaders, ministries' },
  { id: 'vitral',       name: 'Vitral Digital',   niche: 'Worship', blurb: 'A cathedral-arch portrait with jewel facets over glowing circuit traces.', bestFor: 'Ministries, churches' },
  { id: 'frecuencia',   name: 'Frecuencia',       niche: 'Worship', blurb: 'A broadcast studio: live tag, moving waveforms and a rising spectrum.', bestFor: 'Worship bands, radio, podcasts' },
  { id: 'constelacion', name: 'Constelación',     niche: 'Worship', blurb: 'Twinkling stars, a crown constellation and orbiting rings around your photo.', bestFor: 'Psalmists, ministries' },
  { id: 'escenario',    name: 'Escenario',        niche: 'Worship', blurb: 'An edge-to-edge portrait under swaying stage spotlights.', bestFor: 'Worship leaders, singers' },
  { id: 'salmo',        name: 'Salmo OS',         niche: 'Worship', blurb: 'Your portrait in an app window with a pixel reveal and CRT glow.', bestFor: 'Worship tech teams, creators' },
];

/* ------------------------------------------------------------ 1 Editorial Cover */
function Cover() {
  const { data } = useCard();
  return (
    <div className="tpl tpl-cover">
      <header className="cover__hero">
        <Photo className="cover__img" />
        <div className="cover__fade" {...el('pageBg')} />
        <div className="cover__id">
          {data.credentials && <span className="fc-kicker" {...el('accentDetail')}>{data.credentials}</span>}
          <Name split className="cover__name" />
        </div>
      </header>
      <div className="pad stack">
        <div><Title withCreds={false} /><Business /></div>
        <div className="row"><SaveBtn /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <hr {...el('dividers')} />
        <Highlights variant="numbered" />
        {data.bookingUrl && <Btn variant="secondary" block href={webHref(data.bookingUrl)} icon={<CalendarDays size={18} />}>Book your appointment</Btn>}
        <LocationCard variant="text" />
        <SocialLinks variant="pills" />
        <Crisis />
      </div>
      <Dock />
    </div>);
}

/* ------------------------------------------------------------ 2 Sanctuary Arch */
function Arch() {
  const { data } = useCard();
  return (
    <div className="tpl tpl-arch">
      <div className="pad stack center">
        <div className="arch__top"><Logo className="arch__logo" /></div>
        <div className="arch__frame" {...el('cardBg')}><Photo className="arch__img" /></div>
        <div className="stack-sm center">
          <Name className="arch__name" />
          <Title className="arch__title" />
          {data.business && <p className="arch__rule"><span {...el('accentDetail')} /><b {...el('accentDetail')}>{data.business}</b><span {...el('accentDetail')} /></p>}
        </div>
        <div className="stack-sm full">
          {data.bookingUrl && <Btn variant="primary" block href={webHref(data.bookingUrl)} icon={<CalendarDays size={19} />}>Book an appointment</Btn>}
          <SaveBtn variant={data.bookingUrl ? 'secondary' : 'primary'} />
          <div className="row"><ShareBtn className="grow" /><QrBtn className="grow" /></div>
        </div>
        <div className="full"><Highlights variant="grid" /></div>
        <div className="full"><LocationCard variant="map" /></div>
        <div className="full"><SocialLinks variant="icons" title="" /></div>
        <div className="full"><Crisis /></div>
      </div>
      <Dock />
    </div>);
}

/* ------------------------------------------------------------ 3 Clinic Header */
function Header() {
  const { data } = useCard();
  const acts = useContactActions().slice(0, 4);
  return (
    <div className="tpl tpl-header">
      <header className="hdr__band" {...el('heroBand')}>
        <Logo className="hdr__logo" />
        <span className="hdr__biz">{data.business || 'Your business'}</span>
      </header>
      <div className="pad stack hdr__body">
        <div className="hdr__ph"><Photo className="hdr__img" />{data.credentials && <span className="hdr__badge" {...el('iconBg')}><span {...el('icons')}>{data.credentials}</span></span>}</div>
        <div><Name /><Title withCreds={false} />{data.tagline && <p className="fc-sub" {...el('caption')}>{data.tagline}</p>}</div>
        {acts.length > 0 && <div className="hdr__quick">{acts.map((a) => (
          <a key={a.key} href={a.href} {...(/^https?:/.test(a.href) ? { target: '_blank', rel: 'noopener' } : {})} {...el('cardBg')}>
            <span {...el('icons')}>{a.icon}</span><span {...el('body')}>{a.label}</span></a>))}</div>}
        <div className="row"><SaveBtn /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <Highlights variant="chips" />
        <SocialLinks variant="rows" title="More ways to connect" />
        <Crisis />
        <Footer />
      </div>
    </div>);
}

/* ------------------------------------------------------------ 4 Business Card */
function BizCard() {
  const { data } = useCard();
  return (
    <div className="tpl tpl-biz">
      <div className="pad stack">
        <div className="biz__card" {...el('heroBand')}>
          <Logo className="biz__wm" />
          <div className="biz__top"><Photo className="biz__img" /><Logo className="biz__logo" /></div>
          <div className="biz__id">
            <span className="biz__name">{data.fullName || 'Your Name'}</span>
            <span className="biz__role">{[data.credentials, data.jobTitle].filter(Boolean).join(' · ')}</span>
            <span className="biz__org">{data.business}</span>
          </div>
        </div>
        <div className="row"><SaveBtn /><QrBtn /><ShareBtn iconOnly /></div>
        <h2 className="fc-eyebrow" {...el('caption')}>Contact</h2>
        <ContactList />
        <Highlights variant="rows" />
        <SocialLinks variant="rows" title="Follow" />
        <Crisis />
      </div>
    </div>);
}

/* ------------------------------------------------------------ 5 App Profile */
function AppProfile() {
  const { data } = useCard();
  return (
    <div className="tpl tpl-app">
      <div className="pad stack">
        <header className="app__head">
          <div className="app__av"><Photo className="app__img" /><Logo className="app__badge" /></div>
          <div className="app__id"><Name className="app__name" /><Title /><Business /></div>
        </header>
        {data.bookingUrl && (
          <a className="app__book" href={webHref(data.bookingUrl)} target="_blank" rel="noopener" {...el('heroBand')}>
            <span className="fc-kicker">{data.tagline || 'New and returning clients'}</span>
            <span className="app__bookh">Book your<br />appointment</span>
            <span className="app__pill" {...el('accentDetail')}>Choose a time <Arrow size={16} /></span>
          </a>)}
        <div className="app__acts"><SaveBtn block={false} label="Save" /><ShareBtn /><QrBtn /></div>
        <Highlights variant="plain" />
        <ContactList />
        <SocialLinks variant="pills" />
        <Crisis />
      </div>
    </div>);
}

/* ------------------------------------------------------------ 6 Side Rail */
function Rail() {
  const { data, actions } = useCard();
  const acts = useContactActions().slice(0, 4);
  return (
    <div className="tpl tpl-rail">
      <nav className="rail__bar" aria-label="Quick actions" {...el('heroBand')}>
        <Logo className="rail__logo" />
        {acts.map((a) => <a key={a.key} href={a.href} {...(/^https?:/.test(a.href) ? { target: '_blank', rel: 'noopener' } : {})}>{a.icon}<span>{a.label}</span></a>)}
        <button type="button" onClick={actions.share}><ShareGlyph /><span>Share</span></button>
        <span className="rail__vert">{data.business}</span>
      </nav>
      <div className="rail__main stack">
        <Photo className="rail__img" />
        <div><Name split /><Title /></div>
        {data.tagline && <p className="fc-sub" {...el('body')}>{data.tagline}</p>}
        <SaveBtn />
        <QrBtn />
        <Highlights variant="plain" />
        <LocationCard variant="text" />
        <SocialLinks variant="text" title="Online" />
        <Crisis />
      </div>
    </div>);
}

/* ------------------------------------------------------------ 7 Radial Dial */
function Radial() {
  const { actions } = useCard();
  const acts = useContactActions().slice(0, 4);
  const ring = [...acts.map((a) => ({ ...a, onClick: undefined as undefined | (() => void) })),
    { key: 'qr', label: 'QR code', href: '', icon: null, onClick: actions.qr },
    { key: 'share', label: 'Share', href: '', icon: null, onClick: actions.share }].slice(0, 6);
  return (
    <div className="tpl tpl-radial">
      <div className="radial__stage">
        <div className="radial__ring" {...el('dividers')} />
        <div className="radial__photo" {...el('accentDetail')}><Photo className="radial__img" /></div>
        {ring.map((r, i) => {
          const ang = (180 + i * (360 / ring.length)) * Math.PI / 180;
          const style = { left: `calc(50% + ${Math.cos(ang) * 138}px)`, top: `calc(50% + ${Math.sin(ang) * 138}px)` };
          const content = <><span className="radial__dot" {...el('cardBg')}><span {...el('icons')}>{r.icon ?? (r.key === 'qr' ? <QrGlyph /> : <ShareGlyph />)}</span></span><span className="radial__lbl" {...el('body')}>{r.label}</span></>;
          return r.onClick
            ? <button key={r.key} type="button" className="radial__btn" style={style} onClick={r.onClick}>{content}</button>
            : <a key={r.key} className="radial__btn" style={style} href={r.href} {...(/^https?:/.test(r.href) ? { target: '_blank', rel: 'noopener' } : {})}>{content}</a>;
        })}
      </div>
      <div className="pad stack center">
        <Name /><Title />
        <SaveBtn />
        <div className="full"><Highlights variant="carousel" /></div>
        <div className="full"><SocialLinks variant="pills" title="" /></div>
        <div className="full"><LocationCard /></div>
        <div className="full"><Crisis /></div>
      </div>
    </div>);
}
function QrGlyph() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3M21 21h-4v-4" /></svg>; }
function ShareGlyph() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" /></svg>; }

/* ------------------------------------------------------------ 8 Swiss Type */
function Swiss() {
  const { data, actions } = useCard();
  const acts = useContactActions();
  const rows = [{ key: 'save', label: 'Save contact', onClick: actions.save, href: '' }, ...acts.map((a) => ({ ...a, onClick: undefined as undefined | (() => void) })), { key: 'share', label: 'Share this card', onClick: actions.share, href: '' }, { key: 'qr', label: 'QR code', onClick: actions.qr, href: '' }];
  return (
    <div className="tpl tpl-swiss">
      <div className="pad stack">
        <div className="swiss__meta" {...el('caption')}><Logo className="swiss__logo" />{[data.address.city, data.address.region].filter(Boolean).join(', ') || data.business}</div>
        <hr className="swiss__bar" {...el('name')} />
        <h1 className="swiss__name" {...el('name')}>{(data.fullName || 'Your Name').split(' ').map((w, i) => <span key={i}>{w}<br /></span>)}<i {...el('accentDetail')}>.</i></h1>
        <div className="swiss__intro"><Photo className="swiss__img" /><div><Title /><p className="fc-sub" {...el('body')}>{data.business}</p>{data.tagline && <p className="fc-sub" {...el('caption')}>{data.tagline}</p>}</div></div>
        <ol className="swiss__acts" {...el('dividers')}>
          {rows.map((r, i) => {
            const inner = <><span className="swiss__n" {...el('accentDetail')}>{String(i + 1).padStart(2, '0')}</span><span className="swiss__l">{r.label}</span><Arrow size={20} /></>;
            return <li key={r.key} className={i === 0 ? 'is-first' : ''} {...(i === 0 ? el('btnPrimaryBg') : {})}>{r.onClick
              ? <button type="button" onClick={r.onClick}>{inner}</button>
              : <a href={r.href} {...(/^https?:/.test(r.href) ? { target: '_blank', rel: 'noopener' } : {})}>{inner}</a>}</li>;
          })}
        </ol>
        <Highlights variant="swiss" />
        <SocialLinks variant="text" title="Online" />
        <Crisis />
      </div>
    </div>);
}

/* ------------------------------------------------------------ 9 Bento Grid */
function Bento() {
  const { data, actions } = useCard();
  const acts = useContactActions();
  const call = acts.find((a) => a.key === 'call'), wa = acts.find((a) => a.key === 'wa');
  return (
    <div className="tpl tpl-bento">
      <div className="pad stack">
        <div className="bento">
          <div className="b-photo" {...el('cardBg')}><Photo className="bento__img" /></div>
          <div className="b-name" {...el('heroBand')}><span className="bento__name">{data.fullName || 'Your Name'}</span><span className="fc-kicker">{data.credentials}</span></div>
          <div className="b-logo" {...el('cardBg')}><Logo className="bento__logo" /><span {...el('body')}>{data.business}</span></div>
          <button type="button" className="b-save" onClick={actions.save} {...el('btnPrimaryBg')}><span {...el('btnPrimaryText')}>Save contact</span></button>
          {data.bookingUrl && <a className="b-book" href={webHref(data.bookingUrl)} target="_blank" rel="noopener" {...el('accentDetail')}><span><small>{data.tagline || 'Book online'}</small><b>Book your<br />appointment</b></span><span className="b-go"><Arrow size={22} /></span></a>}
          {call && <a className="b-sm" href={call.href} {...el('cardBg')}><span {...el('icons')}>{call.icon}</span><span {...el('body')}>Call</span></a>}
          {wa && <a className="b-sm" href={wa.href} target="_blank" rel="noopener" {...el('cardBg')}><span {...el('icons')}>{wa.icon}</span><span {...el('body')}>WhatsApp</span></a>}
          {data.hasLocation && addressLine(data.address) && <a className="b-map" href={mapsHref(data.address)} target="_blank" rel="noopener" {...el('iconBg')}><b {...el('body')}>{data.address.city || 'Visit us'}</b><small {...el('caption')}>{data.address.street}</small><span {...el('links')}>Get directions</span></a>}
          {data.highlights.length > 0 && <div className="b-hl" {...el('cardBg')}><small {...el('caption')}>{data.highlightsTitle}</small>{data.highlights.slice(0, 4).map((h) => <span key={h.id} {...el('body')}>{h.title}</span>)}</div>}
          <button type="button" className="b-sm b-dark" onClick={actions.share} {...el('heroBand')}>Share</button>
          <button type="button" className="b-sm b-dark" onClick={actions.qr} {...el('heroBand')}>QR code</button>
          {data.website && <a className="b-wide" href={webHref(data.website)} target="_blank" rel="noopener" {...el('cardBg')}><span {...el('body')}>{prettyUrl(data.website)}</span><span {...el('icons')}><Arrow /></span></a>}
        </div>
        <SocialLinks variant="icons" title="" />
        <Crisis />
      </div>
    </div>);
}

/* ------------------------------------------------------------ 10 Care Journey */
function Journey() {
  const { data, actions } = useCard();
  const acts = useContactActions();
  const steps: { title: string; body: string; btns: ReactElement[] }[] = [
    { title: 'Save my contact', body: 'Keep us in your phone so you can reach us any time.', btns: [<SaveBtn key="s" block={false} />, <ShareBtn key="sh" iconOnly />, <QrBtn key="q" iconOnly />] },
  ];
  if (data.bookingUrl) steps.push({ title: 'Book a visit', body: data.highlights.map((h) => h.title).join(', ') || 'Pick a time that works for you.', btns: [<Btn key="b" variant="primary" href={webHref(data.bookingUrl)} icon={<CalendarDays size={16} />}>Book online</Btn>] });
  if (data.hasLocation && addressLine(data.address)) steps.push({ title: 'Come see us', body: addressLine(data.address), btns: [<Btn key="d" variant="primary" href={mapsHref(data.address)}>Directions</Btn>, ...(acts.find((a) => a.key === 'call') ? [<Btn key="c" href={acts.find((a) => a.key === 'call')!.href}>Call</Btn>] : [])] });
  const wa = acts.find((a) => a.key === 'wa');
  steps.push({ title: 'Stay connected', body: 'Questions before your visit? Send a message any time.', btns: [...(wa ? [<Btn key="w" href={wa.href} icon={wa.icon}>WhatsApp</Btn>] : []), <Btn key="sh" onClick={actions.share}>Share</Btn>] });
  return (
    <div className="tpl tpl-journey">
      <div className="pad stack">
        <header className="jr__head"><Photo className="jr__img" /><div className="jr__id"><Logo className="jr__logo" /><Name /><Title /></div></header>
        {data.tagline && <p className="jr__welcome" {...el('iconBg')}><span {...el('body')}>{data.tagline}</span></p>}
        <h2 className="fc-eyebrow" {...el('caption')}>Your path to {data.business ? data.business.split(' ')[0] : 'us'}</h2>
        <ol className="jr__steps">{steps.map((s, i) => (
          <li key={s.title}>
            <span className="jr__n" {...el('heroBand')}>{i + 1}</span>
            <div className="stack-sm"><b className="jr__t" {...el('name')}>{s.title}</b><p {...el('caption')}>{s.body}</p><div className="row wrap">{s.btns}</div></div>
          </li>))}</ol>
        <SocialLinks variant="pills" />
        <Crisis />
      </div>
    </div>);
}

export const TEMPLATE_COMPONENTS: Record<TemplateId, () => ReactElement> = {
  cover: Cover, arch: Arch, header: Header, bizcard: BizCard, app: AppProfile,
  rail: Rail, radial: Radial, swiss: Swiss, bento: Bento, journey: Journey,
  tech: Tech, realestate: RealEstate, photo: PhotoLayout, foodtruck: FoodTruck, apparel: Apparel,
  mechanic: Mechanic, handyman: Handyman, esthetics: Esthetics, creator: Creator, retail: Retail,
  barber: Barber, church: Church, fitness: Fitness, advisor: Advisor, bistro: Bistro, stage: Stage,
  quantum: Quantum, terminal: Terminal, cyber: Cyber, aurora: Aurora, radar: Radar, circuit: Circuit, blueprint: Blueprint,
  velvet: Velvet, fade: Fade, oldschool: OldSchool, blush: Blush, vanity: Vanity, silk: Silk, gloss: Gloss,
  marquee: Marquee, passport: Passport, estate: Estate, garden: Garden, scoreboard: Scoreboard, signature: Signature,
  hologram: Hologram, mission: Mission, poster: Poster, liquid: Liquid, starfield: Starfield, cmdk: Cmdk, synthwave: Synthwave,
  pole: Pole, goldleaf: GoldLeaf, lash: Lash, rosegold: RoseGold, swatch: Swatch, nowserving: NowServing, perfume: Perfume,
  vinyl: Vinyl, boarding: Boarding, recipe: Recipe, toolbelt: Toolbelt, stained: Stained, trading: Trading,
  turntable: Turntable, waveform: Waveform, confetti: Confetti, invitation: Invitation, monogram: Monogram, inbox: Inbox, planner: Planner,
  razor: Razor, chalkboard: Chalkboard, neonsign: NeonSign, clipper: Clipper, polish: Polish, shimmer: Shimmer, tips: Tips,
  blowout: Blowout, stations: Stations, magazine: Magazine, stones: Stones, lotus: Lotus, bamboo: Bamboo,
  casefile: CaseFile, contactsheet: ContactSheet, flash: Flash, orderticket: OrderTicket, hangtag: HangTag, bag: Bag, postcard: Postcard,
  floorplan: FloorPlan, ledger: Ledger, hymnboard: HymnBoard, cluster: Cluster, stopwatch: Stopwatch, diner: Diner, yardsign: YardSign,
  santuario: Santuario, celestial: Celestial, vitral: Vitral, frecuencia: Frecuencia, constelacion: Constelacion, escenario: Escenario, salmo: Salmo,
};
