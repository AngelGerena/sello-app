import type { Card, CardData } from './types';
import { themeFromSeeds } from './theme';
import portrait from '../assets/sample-portrait.jpg';
import logo from '../assets/sample-logo.svg';
import g1 from '../assets/gallery-1.svg';
import g2 from '../assets/gallery-2.svg';
import g3 from '../assets/gallery-3.svg';
import g4 from '../assets/gallery-4.svg';
import g5 from '../assets/gallery-5.svg';
import g6 from '../assets/gallery-6.svg';

export const uid = () => Math.random().toString(36).slice(2, 10);

export function blankData(): CardData {
  return {
    slug: '', fullName: '', credentials: '', jobTitle: '', business: '', tagline: '',
    photoUrl: '', logoUrl: '', phone: '', whatsapp: '', email: '', website: '', bookingUrl: '',
    hasLocation: false, address: { street: '', city: '', region: '', zip: '', country: 'USA' },
    socials: [], highlightsTitle: 'What we offer', highlights: [], showCrisis: false, niche: '', gallery: [], hours: '',
  };
}

/** Seeded sample so the demo opens on a finished card, not an empty form.
    Fictional person and business. 555-01xx numbers are reserved for fiction. */
export function sampleCard(): Card {
  return {
    id: 'sample',
    template: 'arch',
    published: true,
    updatedAt: new Date().toISOString(),
    theme: themeFromSeeds({ brand: '#173F45', accent: '#C0714F', ground: '#F5F0EA' }, {
      fonts: { display: 'Fraunces', body: 'Figtree' },
      button: { shape: 'pill', size: 'regular', style: 'solid', texture: 'none' },
    }),
    data: {
      slug: 'sofia-delgado',
      fullName: 'Sofia Delgado',
      credentials: 'NCIDQ',
      jobTitle: 'Interior Designer and Founder',
      business: 'Palmetto & Oak Interiors',
      tagline: 'Warm, livable homes across Central Florida',
      photoUrl: portrait,
      logoUrl: logo,
      phone: '4075550148',
      whatsapp: '14075550148',
      email: 'hello@palmettoandoak.com',
      website: 'palmettoandoak.com',
      bookingUrl: 'https://palmettoandoak.com/consult',
      hasLocation: true,
      address: { street: '450 Palmetto Lane, Suite 2', city: 'Winter Park', region: 'FL', zip: '32789', country: 'USA' },
      socials: [
        { id: uid(), network: 'instagram', value: '@palmettoandoak' },
        { id: uid(), network: 'pinterest', value: 'palmettoandoak' },
        { id: uid(), network: 'houzz', value: 'https://www.houzz.com/professionals/palmetto-and-oak' },
        { id: uid(), network: 'google', value: 'https://g.page/r/palmetto-and-oak/review' },
      ],
      highlightsTitle: 'What I do',
      highlights: [
        { id: uid(), icon: 'home', title: 'Full-home design', subtitle: 'Concept to final styling' },
        { id: uid(), icon: 'tools', title: 'Kitchen and bath', subtitle: 'Remodel planning and finishes' },
        { id: uid(), icon: 'art', title: 'Color consulting', subtitle: 'Paint, fabric and finishes' },
        { id: uid(), icon: 'screen', title: 'Virtual design', subtitle: 'Room plans you can shop' },
      ],
      showCrisis: false,
      niche: 'realestate',
      gallery: [g1, g2, g3, g4, g5, g6],
      hours: 'Mon-Fri 9am-5pm, weekends by appointment',
    },
  };
}

/** Older saved cards predate newer fields; fill them so every layout can render. */
export function withDefaults(card: Card): Card {
  const d = blankData();
  return {
    ...card,
    data: { ...d, ...card.data, address: { ...d.address, ...card.data.address }, gallery: card.data.gallery ?? [], hours: card.data.hours ?? '', niche: card.data.niche ?? '' },
    theme: { ...card.theme, kit: card.theme.kit ?? [], sound: card.theme.sound ?? 'calm' },
  };
}
