import { createContext, useContext, type ReactNode, type MouseEventHandler } from 'react';
import {
  Phone, MessageCircle, CalendarDays, MapPin, Share2, QrCode, UserPlus, Globe, Heart, ArrowUpRight, Mail,
  Pill, Monitor, Droplet, User, Star, Scissors, Sparkles, Hammer, Home, Car, Camera, Music, Utensils, Coffee,
  Church, BookOpen, Briefcase, Stethoscope, Leaf, Dumbbell, Palette, Wrench, ShieldCheck, Baby, PawPrint, Gem, MessageSquare,
} from 'lucide-react';
import type { CardData, ElementId, Mode, Theme } from '../lib/types';
import type { SfxName } from '../lib/sfx';
import { NETWORK_BY_ID, socialUrl } from '../lib/socials';
import { addressLine, formatPhone, mapsHref, prettyUrl, telHref, waHref, webHref } from '../lib/links';

/* ---------------------------------------------------------------- context */
export interface CardActions { save: () => void; share: () => void; qr: () => void; }
export interface CardCtx { data: CardData; theme: Theme; mode: Mode; actions: CardActions; play: (n: SfxName) => void; still: boolean; }
export const Ctx = createContext<CardCtx | null>(null);
export const useCard = () => useContext(Ctx)!;

/** Marks a part of the card as recolorable. The editor's picker reads this. */
export const el = (id: ElementId) => ({ 'data-el': id });

/* ---------------------------------------------------------------- icons */
export const HIGHLIGHT_ICONS: Record<string, typeof Phone> = {
  user: User, pill: Pill, screen: Monitor, drop: Droplet, star: Star, scissors: Scissors, sparkle: Sparkles,
  hammer: Hammer, home: Home, car: Car, camera: Camera, music: Music, food: Utensils, coffee: Coffee, church: Church,
  book: BookOpen, briefcase: Briefcase, health: Stethoscope, leaf: Leaf, fitness: Dumbbell, art: Palette,
  tools: Wrench, shield: ShieldCheck, baby: Baby, pets: PawPrint, gem: Gem, heart: Heart, chat: MessageSquare,
};
export function HIcon({ name, size = 20 }: { name: string; size?: number }) {
  const C = HIGHLIGHT_ICONS[name] ?? Star;
  return <C size={size} strokeWidth={1.8} aria-hidden />;
}

export function BrandGlyph({ network, size = 18 }: { network: string; size?: number }) {
  const n = NETWORK_BY_ID[network];
  if (!n?.path) return <Globe size={size} strokeWidth={1.8} aria-hidden />;
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d={n.path} /></svg>;
}

/* ---------------------------------------------------------------- buttons */
type BtnProps = {
  variant?: 'primary' | 'secondary';
  icon?: ReactNode; children?: ReactNode; href?: string; onClick?: MouseEventHandler;
  className?: string; ariaLabel?: string; block?: boolean; iconOnly?: boolean;
};
export function Btn({ variant = 'secondary', icon, children, href, onClick, className = '', ariaLabel, block, iconOnly }: BtnProps) {
  const { theme } = useCard();
  const b = theme.button;
  const cls = `fb fb--${variant} shape-${b.shape} size-${b.size} style-${b.style} tex-${b.texture}${block ? ' fb--block' : ''}${iconOnly ? ' fb--icon' : ''} ${className}`;
  const elBg = variant === 'primary' ? 'btnPrimaryBg' : 'btnSecondaryBg';
  const elTx = variant === 'primary' ? 'btnPrimaryText' : 'btnSecondaryText';
  const inner = <>{icon && <span className="fb__ic">{icon}</span>}{children && <span className="fb__tx" {...el(elTx)}>{children}</span>}</>;
  if (href) {
    const ext = /^https?:/i.test(href);
    return <a className={cls} href={href} {...(ext ? { target: '_blank', rel: 'noopener' } : {})} aria-label={ariaLabel} {...el(elBg)}>{inner}</a>;
  }
  return <button type="button" className={cls} onClick={onClick} aria-label={ariaLabel} {...el(elBg)}>{inner}</button>;
}

/* ---------------------------------------------------------------- identity */
export function Name({ className = '', split }: { className?: string; split?: boolean }) {
  const { data } = useCard();
  const [first, ...rest] = (data.fullName || 'Your Name').split(' ');
  return (
    <h1 className={`fc-name ${className}`} {...el('name')}>
      {split ? <>{first}<br />{rest.join(' ')}</> : data.fullName || 'Your Name'}
    </h1>
  );
}
export function Title({ className = '', withCreds = true }: { className?: string; withCreds?: boolean }) {
  const { data } = useCard();
  const t = [withCreds && data.credentials, data.jobTitle].filter(Boolean).join(' · ');
  return t ? <p className={`fc-title ${className}`} {...el('title')}>{t}</p> : null;
}
export function Business({ className = '' }: { className?: string }) {
  const { data } = useCard();
  return data.business ? <p className={`fc-biz ${className}`} {...el('accentDetail')}>{data.business}</p> : null;
}
export function Photo({ className = '', alt }: { className?: string; alt?: string }) {
  const { data } = useCard();
  if (!data.photoUrl) return <div className={`fc-photo fc-photo--empty ${className}`} {...el('iconBg')}><User size={40} strokeWidth={1.4} /></div>;
  return <img className={`fc-photo ${className}`} src={data.photoUrl} alt={alt ?? data.fullName} />;
}
export function Logo({ className = '' }: { className?: string }) {
  const { data } = useCard();
  return data.logoUrl ? <img className={`fc-logo ${className}`} src={data.logoUrl} alt={data.business ? `${data.business} logo` : 'Logo'} /> : null;
}

/* ---------------------------------------------------------------- actions */
export function SaveBtn({ block = true, label = 'Save contact', className = '', variant = 'primary' }: { block?: boolean; label?: string; className?: string; variant?: 'primary' | 'secondary' }) {
  const { actions } = useCard();
  return <Btn variant={variant} block={block} className={className} icon={<UserPlus size={19} />} onClick={actions.save}>{label}</Btn>;
}
export function ShareBtn(p: { iconOnly?: boolean; className?: string }) {
  const { actions } = useCard();
  return <Btn icon={<Share2 size={18} />} onClick={actions.share} iconOnly={p.iconOnly} ariaLabel="Share this card" className={p.className}>{p.iconOnly ? null : 'Share'}</Btn>;
}
export function QrBtn(p: { iconOnly?: boolean; className?: string }) {
  const { actions } = useCard();
  return <Btn icon={<QrCode size={18} />} onClick={actions.qr} iconOnly={p.iconOnly} ariaLabel="Show QR code" className={p.className}>{p.iconOnly ? null : 'QR code'}</Btn>;
}

/** Every contact method the owner filled in, in a stable order. */
export function useContactActions() {
  const { data } = useCard();
  const out: { key: string; label: string; href: string; icon: ReactNode; sub?: string }[] = [];
  if (data.phone) out.push({ key: 'call', label: 'Call', href: telHref(data.phone), icon: <Phone size={20} />, sub: formatPhone(data.phone) });
  if (data.whatsapp) out.push({ key: 'wa', label: 'WhatsApp', href: waHref(data.whatsapp, `Hi, I found your card and have a question.`), icon: <BrandGlyph network="whatsapp" size={20} />, sub: 'Message us' });
  if (data.bookingUrl) out.push({ key: 'book', label: 'Book', href: webHref(data.bookingUrl), icon: <CalendarDays size={20} />, sub: 'Choose a time online' });
  if (data.email) out.push({ key: 'email', label: 'Email', href: `mailto:${data.email}`, icon: <Mail size={20} />, sub: data.email });
  if (data.hasLocation && addressLine(data.address)) out.push({ key: 'map', label: 'Directions', href: mapsHref(data.address), icon: <MapPin size={20} />, sub: addressLine(data.address) });
  if (data.website) out.push({ key: 'web', label: 'Website', href: webHref(data.website), icon: <Globe size={20} />, sub: prettyUrl(data.website) });
  return out;
}

export function Dock() {
  const acts = useContactActions().filter((a) => ['call', 'wa', 'book', 'map', 'email'].includes(a.key)).slice(0, 4);
  if (!acts.length) return null;
  return (
    <nav className="fc-dock" aria-label="Quick actions" {...el('dockBg')}>
      {acts.map((a) => (
        <a key={a.key} href={a.href} {...(/^https?:/.test(a.href) ? { target: '_blank', rel: 'noopener' } : {})} className={`fc-dock__a ${a.key === 'wa' ? 'is-wa' : ''}`}>
          <span {...el('icons')}>{a.icon}</span><span {...el('body')}>{a.label}</span>
        </a>
      ))}
    </nav>
  );
}

/* ---------------------------------------------------------------- highlights */
type HVariant = 'tiles' | 'numbered' | 'chips' | 'rows' | 'carousel' | 'grid' | 'plain' | 'swiss';
export function Highlights({ variant = 'tiles', label = true }: { variant?: HVariant; label?: boolean }) {
  const { data } = useCard();
  if (!data.highlights.length) return null;
  const head = label && data.highlightsTitle ? <h2 className="fc-eyebrow" {...el('caption')}>{data.highlightsTitle}</h2> : null;
  const items = data.highlights;
  switch (variant) {
    case 'numbered':
      return <section className="fc-sec">{head}<ol className="hl-num">{items.map((h, i) => (
        <li key={h.id}><span className="hl-num__n" {...el('accentDetail')}>{String(i + 1).padStart(2, '0')}</span><span><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></span></li>))}</ol></section>;
    case 'chips':
      return <section className="fc-sec">{head}<ul className="hl-chips">{items.map((h) => (
        <li key={h.id} {...el('cardBg')}><span {...el('icons')}><HIcon name={h.icon} size={16} /></span><span {...el('body')}>{h.title}</span></li>))}</ul></section>;
    case 'rows':
      return <section className="fc-sec">{head}<ul className="hl-rows" {...el('cardBg')}>{items.map((h) => (
        <li key={h.id}><span {...el('icons')}><HIcon name={h.icon} size={18} /></span><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></li>))}</ul></section>;
    case 'carousel':
      return <section className="fc-sec">{head}<div className="hl-carousel" tabIndex={0} aria-label="Swipe for more">{items.map((h, i) => (
        <article key={h.id} className={`hl-car hl-car--${i % 4}`} {...el('cardBg')}><span className="hl-car__ic" {...el('icons')}><HIcon name={h.icon} size={22} /></span><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></article>))}</div></section>;
    case 'grid':
      return <section className="fc-sec">{head}<div className="hl-grid">{items.map((h) => (
        <article key={h.id} {...el('cardBg')}><span className="hl-well" {...el('iconBg')}><span {...el('icons')}><HIcon name={h.icon} /></span></span><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></article>))}</div></section>;
    case 'plain':
      return <section className="fc-sec">{head}<ul className="hl-plain">{items.map((h) => (
        <li key={h.id}><span {...el('icons')}><HIcon name={h.icon} size={18} /></span><span><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></span></li>))}</ul></section>;
    case 'swiss':
      return <section className="fc-sec">{head}<div className="hl-swiss">{items.map((h) => (
        <div key={h.id} {...el('dividers')}><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></div>))}</div></section>;
    default:
      return <section className="fc-sec">{head}<div className="hl-tiles">{items.map((h) => (
        <article key={h.id} {...el('cardBg')}><span className="hl-well" {...el('iconBg')}><span {...el('icons')}><HIcon name={h.icon} /></span></span><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></article>))}</div></section>;
  }
}

/* ---------------------------------------------------------------- links and socials */
export function SocialLinks({ variant = 'rows', title = 'Connect' }: { variant?: 'rows' | 'icons' | 'pills' | 'text'; title?: string }) {
  const { data } = useCard();
  const items = data.socials.map((s) => ({ ...s, url: socialUrl(s.network, s.value), n: NETWORK_BY_ID[s.network] })).filter((s) => s.url);
  if (!items.length) return null;
  const head = title ? <h2 className="fc-eyebrow" {...el('caption')}>{title}</h2> : null;
  if (variant === 'icons') return <section className="fc-sec">{head}<div className="sl-icons">{items.map((s) => (
    <a key={s.id} href={s.url} target="_blank" rel="noopener" aria-label={s.n?.label ?? 'Link'} {...el('cardBg')}><span {...el('icons')}><BrandGlyph network={s.network} size={20} /></span></a>))}</div></section>;
  if (variant === 'pills') return <section className="fc-sec">{head}<div className="sl-pills">{items.map((s) => (
    <a key={s.id} href={s.url} target="_blank" rel="noopener" {...el('cardBg')}><span {...el('icons')}><BrandGlyph network={s.network} size={16} /></span><span {...el('body')}>{s.n?.label ?? 'Link'}</span></a>))}</div></section>;
  if (variant === 'text') return <section className="fc-sec">{head}<div className="sl-text">{items.map((s) => (
    <a key={s.id} href={s.url} target="_blank" rel="noopener" {...el('links')}>{s.n?.label ?? 'Link'}</a>))}</div></section>;
  return <section className="fc-sec">{head}<div className="sl-rows">{items.map((s) => (
    <a key={s.id} href={s.url} target="_blank" rel="noopener" {...el('cardBg')}>
      <span className="sl-rows__ic" {...el('iconBg')}><span {...el('icons')}><BrandGlyph network={s.network} size={19} /></span></span>
      <span className="sl-rows__tx"><b {...el('body')}>{s.n?.label ?? 'Link'}</b><small {...el('caption')}>{prettyUrl(s.url)}</small></span>
      <span {...el('caption')}><ArrowUpRight size={16} /></span>
    </a>))}</div></section>;
}

export function LocationCard({ variant = 'row' }: { variant?: 'row' | 'map' | 'text' }) {
  const { data } = useCard();
  if (!data.hasLocation || !addressLine(data.address)) return null;
  const a = data.address;
  if (variant === 'text') return (
    <section className="fc-sec loc-text"><h2 className="fc-eyebrow" {...el('caption')}>Visit</h2>
      <p {...el('body')}>{a.street}<br />{[a.city, a.region].filter(Boolean).join(', ')} {a.zip}</p>
      <a href={mapsHref(a)} target="_blank" rel="noopener" {...el('links')}>Get directions</a></section>);
  return (
    <section className={`fc-sec loc loc--${variant}`} {...el('cardBg')}>
      {variant === 'map' && <div className="loc__map" {...el('iconBg')}><span {...el('icons')}><MapPin size={30} strokeWidth={1.5} /></span></div>}
      <div className="loc__row">
        <span className="loc__tx"><b {...el('body')}>Visit us</b><small {...el('caption')}>{addressLine(a)}</small></span>
        <Btn variant="primary" href={mapsHref(a)} icon={<MapPin size={17} />}>Directions</Btn>
      </div>
    </section>);
}

export function ContactList() {
  const acts = useContactActions();
  if (!acts.length) return null;
  return <div className="ct-list" {...el('cardBg')}>{acts.map((a) => (
    <a key={a.key} href={a.href} {...(/^https?:/.test(a.href) ? { target: '_blank', rel: 'noopener' } : {})}>
      <span className="ct-list__ic" {...el('iconBg')}><span {...el('icons')}>{a.icon}</span></span>
      <span className="ct-list__tx"><b {...el('body')}>{a.label}</b>{a.sub && <small {...el('caption')}>{a.sub}</small>}</span>
      <span {...el('caption')}><ArrowUpRight size={16} /></span>
    </a>))}</div>;
}

export function Crisis() {
  const { data } = useCard();
  if (!data.showCrisis) return null;
  return (
    <aside className="fc-crisis" {...el('cardBg')}>
      <p className="fc-crisis__h"><span {...el('icons')}><Heart size={18} /></span><b {...el('body')}>Need help right now?</b></p>
      <p {...el('caption')}>Call or text 988 to reach the Suicide &amp; Crisis Lifeline. Free, confidential and available 24/7, in English and Spanish.</p>
      <div className="fc-crisis__b">
        <Btn variant="primary" href="tel:988" icon={<Phone size={16} />}>Call 988</Btn>
        <Btn href="sms:988" icon={<MessageCircle size={16} />}>Text 988</Btn>
      </div>
      <p className="fc-crisis__e" {...el('caption')}>For a medical emergency, call <a href="tel:911" {...el('links')}>911</a></p>
    </aside>);
}

export function Footer() {
  const { data } = useCard();
  return <footer className="fc-foot" {...el('caption')}>{data.website ? prettyUrl(data.website) : data.business}</footer>;
}

export function Arrow({ size = 18 }: { size?: number }) { return <ArrowUpRight size={size} />; }
export { CalendarDays, Phone, MapPin, Globe, MessageCircle, Mail };

/* ---------------------------------------------------------------- gallery and hours */
type GVariant = 'grid' | 'masonry' | 'strip' | 'film' | 'pair';
export function Gallery({ variant = 'grid', title = '', max = 9 }: { variant?: GVariant; title?: string; max?: number }) {
  const { data } = useCard();
  const pics = data.gallery.slice(0, max);
  if (!pics.length) return null;
  const head = title ? <h2 className="fc-eyebrow" {...el('caption')}>{title}</h2> : null;
  return (
    <section className="fc-sec">
      {head}
      <div className={`gal gal--${variant}`} tabIndex={variant === 'strip' || variant === 'film' ? 0 : undefined} aria-label={variant === 'strip' || variant === 'film' ? 'Swipe for more photos' : undefined}>
        {pics.map((src, i) => (
          <figure key={src + i} className="gal__item" {...el('cardBg')}>
            <img src={src} alt={`${data.business || data.fullName} photo ${i + 1}`} loading="lazy" />
            {variant === 'pair' && i < 2 && <figcaption>{i === 0 ? 'Before' : 'After'}</figcaption>}
          </figure>
        ))}
      </div>
    </section>
  );
}

export function Hours({ label = 'Hours', className = '' }: { label?: string; className?: string }) {
  const { data } = useCard();
  if (!data.hours.trim()) return null;
  return (
    <p className={`fc-hours ${className}`} {...el('cardBg')}>
      <span className="fc-hours__l" {...el('caption')}>{label}</span>
      <span {...el('body')}>{data.hours}</span>
    </p>
  );
}
