import type { CSSProperties } from 'react';
import {
  Btn, CalendarDays, Gallery, HIcon, Hours, LocationCard, Logo, MapPin, Phone, Photo, QrBtn, SaveBtn, ShareBtn,
  SocialLinks, Title, el, useCard,
} from './blocks';
import { addressLine, mapsHref, telHref, webHref } from '../lib/links';

/** "$35 · 45 min" -> price and note */
function priced(sub: string) {
  const [first, ...rest] = sub.split('·').map((x) => x.trim());
  return /^\$|^From \$/i.test(first ?? '') ? { price: first, note: rest.join(' · ') } : { price: '', note: sub };
}

function BookRow({ label = 'Book now' }: { label?: string }) {
  const { data } = useCard();
  return (
    <div className="row">
      {data.bookingUrl && <Btn variant="primary" block href={webHref(data.bookingUrl)} icon={<CalendarDays size={18} />}>{label}</Btn>}
      {data.phone && <Btn block={!data.bookingUrl} href={telHref(data.phone)} icon={<Phone size={18} />} iconOnly={!!data.bookingUrl} ariaLabel="Call">{data.bookingUrl ? null : 'Call'}</Btn>}
    </div>
  );
}

/* ================================================================ 8. VELVET */
export function Velvet() {
  const { data } = useCard();
  return (
    <div className="tpl tpl-ve">
      <div className="ve__sheen" aria-hidden />
      <div className="ve__sparkles" aria-hidden>{Array.from({ length: 9 }, (_, i) => <i key={i} style={{ left: `${(i * 29 + 7) % 92}%`, top: `${(i * 41 + 5) % 60}%`, animationDelay: `${i * 0.6}s` }} />)}</div>
      <div className="pad stack center">
        <Logo className="ve__logo" />
        <div className="ve__mirror" {...el('accentDetail')}><Photo className="ve__img" /></div>
        <p className="ve__biz" {...el('accentDetail')}>{data.business || 'Salon'}</p>
        <h1 className="ve__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
        <Title className="ve__title" />
        <div className="full"><BookRow label="Reserve your chair" /></div>
        <section className="fc-sec full">
          <div className="ve__rule" {...el('accentDetail')}><i /><span>{data.highlightsTitle || 'Services'}</span><i /></div>
          <ul className="ve__menu">{data.highlights.map((h) => {
            const p = priced(h.subtitle);
            return p.price
              ? <li key={h.id}><b {...el('body')}>{h.title}</b><span className="ve__lead" /><span className="ve__price" {...el('accentDetail')}>{p.price}</span>{p.note && <small {...el('caption')}>{p.note}</small>}</li>
              : <li key={h.id} className="ve__plain"><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></li>;
          })}</ul>
        </section>
        <div className="full"><Gallery variant="grid" title="Recent work" max={6} /></div>
        <div className="row full"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <div className="full"><Hours /></div>
        <div className="full"><LocationCard /></div>
        <div className="full"><SocialLinks variant="icons" title="" /></div>
      </div>
    </div>
  );
}

/* ================================================================ 9. FADE (streetwear barber) */
export function Fade() {
  const { data } = useCard();
  const words = (data.business || data.fullName || 'Fresh Cuts').split(' ').filter(Boolean);
  const longest = Math.max(...words.map((w) => w.length), 4);
  const size = Math.min(78, Math.floor(340 / (longest * 0.56)));
  return (
    <div className="tpl tpl-fa">
      <header className="fa__hero">
        <Photo className="fa__img" />
        <div className="fa__shade" />
        <h1 className="fa__name" style={{ fontSize: `${size}px` }} {...el('name')}>{words.map((w, i) => <span key={i} className={i % 2 ? 'fa__outline' : ''}>{w}</span>)}</h1>
        <span className="fa__tag" {...el('accentDetail')}>{data.tagline || 'Walk-ins welcome'}</span>
      </header>
      <div className="pad stack">
        <div className="fa__barber"><Logo className="fa__logo" /><span><b {...el('body')}>{data.fullName}</b><Title withCreds={false} /></span></div>
        <BookRow label="Book the chair" />
        <svg className="fa__razor" viewBox="0 0 320 24" aria-hidden><path d="M0 12 H130 M190 12 H320" /><path d="M136 12 l14 -8 h22 a6 6 0 0 1 0 16 h-22 z" /></svg>
        <section className="fa__board" {...el('heroBand')}>
          <h2 className="fa__boardh">{(data.highlightsTitle || 'Price list').toUpperCase()}</h2>
          <ul>{data.highlights.map((h) => {
            const p = priced(h.subtitle);
            return <li key={h.id}><span>{h.title.toUpperCase()}</span><span>{p.price || ''}</span></li>;
          })}</ul>
        </section>
        <Gallery variant="grid" title="Fresh cuts" max={6} />
        <Hours />
        <div className="row"><SaveBtn /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        {data.hasLocation && addressLine(data.address) && <Btn block href={mapsHref(data.address)} icon={<MapPin size={18} />}>Pull up</Btn>}
        <SocialLinks variant="pills" title="" />
      </div>
    </div>
  );
}

/* ================================================================ 10. OLD SCHOOL (vintage barber) */
export function OldSchool() {
  const { data } = useCard();
  const ring = `${(data.business || data.fullName || 'Barber Shop').toUpperCase()} · ${(data.address.city || 'Est. local').toUpperCase()} · `;
  return (
    <div className="tpl tpl-os">
      <div className="os__stripes" aria-hidden {...el('heroBand')} />
      <div className="pad stack center">
        <div className="os__badge">
          <svg viewBox="0 0 300 300" aria-hidden>
            <defs><path id="osring" d="M150,150 m-118,0 a118,118 0 1,1 236,0 a118,118 0 1,1 -236,0" /></defs>
            <circle cx="150" cy="150" r="146" className="os__c1" /><circle cx="150" cy="150" r="136" className="os__c2" /><circle cx="150" cy="150" r="100" className="os__c3" />
            <text className="os__ringtext"><textPath href="#osring" startOffset="0">{ring.repeat(2).slice(0, 64)}</textPath></text>
          </svg>
          <Photo className="os__img" />
        </div>
        <h1 className="os__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
        <Title className="os__title" />
        <div className="os__divider" {...el('accentDetail')}><i /><HIcon name="scissors" size={18} /><i /></div>
        <div className="full"><BookRow label="Book a cut" /></div>
        <section className="os__card full" {...el('cardBg')}>
          <h2 className="os__h" {...el('name')}>{data.highlightsTitle || 'Services'}</h2>
          <ul className="os__menu">{data.highlights.map((h) => {
            const p = priced(h.subtitle);
            return <li key={h.id}><span className="os__row"><b {...el('body')}>{h.title}</b><span className="os__lead" /><span className="os__price" {...el('accentDetail')}>{p.price}</span></span>{p.note && <small {...el('caption')}>{p.note}</small>}</li>;
          })}</ul>
          {data.hours && <p className="os__hours" {...el('caption')}>{data.hours}</p>}
        </section>
        <div className="full"><Gallery variant="grid" max={6} /></div>
        <div className="row full"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <div className="full"><LocationCard /></div>
        <div className="full"><SocialLinks variant="icons" title="" /></div>
      </div>
    </div>
  );
}

/* ================================================================ 11. BLUSH (nails and lashes) */
export function Blush() {
  const { data } = useCard();
  const pics = data.gallery.slice(0, 3);
  return (
    <div className="tpl tpl-bl">
      <div className="bl__blob a" aria-hidden /><div className="bl__blob b" aria-hidden /><div className="bl__blob c" aria-hidden />
      <div className="pad stack center">
        <Logo className="bl__logo" />
        <div className="bl__stack">
          {pics.length > 0
            ? pics.map((src, i) => <figure key={src + i} className={`bl__polaroid p${i}`}><img src={src} alt={`Work ${i + 1}`} /></figure>)
            : null}
          <figure className="bl__polaroid me"><Photo className="bl__img" /><figcaption {...el('caption')}>{data.fullName.split(' ')[0] || 'Hi'}</figcaption></figure>
        </div>
        <h1 className="bl__name" {...el('name')}>{data.business || data.fullName || 'Your Studio'}</h1>
        <Title className="bl__title" />
        {data.tagline && <p className="bl__tag" {...el('accentDetail')}>{data.tagline}</p>}
        <div className="full"><BookRow label="Book your set" /></div>
        <section className="fc-sec full">
          <h2 className="bl__h" {...el('caption')}>{data.highlightsTitle || 'Menu'}</h2>
          <div className="bl__menu">{data.highlights.map((h) => {
            const p = priced(h.subtitle);
            return <article key={h.id} {...el('cardBg')}><span className="bl__ic" {...el('iconBg')}><span {...el('icons')}><HIcon name={h.icon} size={18} /></span></span><span className="bl__t"><b {...el('body')}>{h.title}</b><small {...el('caption')}>{p.note || h.subtitle}</small></span>{p.price && <span className="bl__price" {...el('accentDetail')}>{p.price}</span>}</article>;
          })}</div>
        </section>
        <div className="full"><Gallery variant="strip" /></div>
        <div className="row full"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <div className="full"><SocialLinks variant="pills" title="" /></div>
      </div>
    </div>
  );
}

/* ================================================================ 12. VANITY MIRROR */
export function Vanity() {
  const { data } = useCard();
  const bulbs = 16;
  return (
    <div className="tpl tpl-va">
      <div className="pad stack center">
        <div className="va__mirror">
          {Array.from({ length: bulbs }, (_, i) => {
            const t = i / bulbs;
            // bulbs around a rounded rectangle, lit in sequence
            const side = Math.floor(t * 4), f = (t * 4) % 1;
            const pos: CSSProperties = side === 0 ? { left: `${6 + f * 88}%`, top: '0%' } : side === 1 ? { left: '100%', top: `${6 + f * 88}%` } : side === 2 ? { left: `${94 - f * 88}%`, top: '100%' } : { left: '0%', top: `${94 - f * 88}%` };
            return <i key={i} className="va__bulb" style={{ ...pos, animationDelay: `${i * 0.09}s` }} {...(i === 0 ? el('accentDetail') : {})} />;
          })}
          <div className="va__glass"><Photo className="va__img" /></div>
        </div>
        <h1 className="va__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
        <Title className="va__title" />
        {data.business && <p className="va__biz" {...el('accentDetail')}>{data.business}</p>}
        <div className="full"><BookRow label="Book your glam" /></div>
        <section className="fc-sec full">
          <h2 className="va__h" {...el('caption')}>{data.highlightsTitle || 'Services'}</h2>
          <div className="va__svc">{data.highlights.map((h) => {
            const p = priced(h.subtitle);
            return <article key={h.id} {...el('cardBg')}><b {...el('body')}>{h.title}</b><small {...el('caption')}>{p.note || h.subtitle}</small>{p.price && <span {...el('accentDetail')}>{p.price}</span>}</article>;
          })}</div>
        </section>
        <div className="full"><Gallery variant="grid" title="The looks" max={6} /></div>
        <div className="row full"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <div className="full"><SocialLinks variant="icons" title="" /></div>
      </div>
    </div>
  );
}

/* ================================================================ 13. SILK */
export function Silk() {
  const { data } = useCard();
  return (
    <div className="tpl tpl-si">
      <svg className="si__waves" viewBox="0 0 400 260" preserveAspectRatio="none" aria-hidden>
        <path className="w1" d="M0 120 C 80 60, 160 180, 240 110 S 360 70, 400 120 V260 H0Z" />
        <path className="w2" d="M0 150 C 90 110, 170 210, 250 140 S 350 110, 400 150 V260 H0Z" />
        <path className="w3" d="M0 185 C 100 150, 180 240, 260 175 S 350 150, 400 185 V260 H0Z" />
      </svg>
      <div className="pad stack center si__body">
        <Logo className="si__logo" />
        <div className="si__photo"><Photo className="si__img" /></div>
        <h1 className="si__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
        <Title className="si__title" />
        {data.tagline && <p className="si__tag" {...el('caption')}>{data.tagline}</p>}
        <div className="full"><BookRow label="Book a session" /></div>
        <section className="fc-sec full">
          <h2 className="si__h" {...el('name')}>{data.highlightsTitle || 'Treatments'}</h2>
          <ul className="si__menu">{data.highlights.map((h) => (
            <li key={h.id} {...el('dividers')}><span className="si__ic" {...el('icons')}><HIcon name={h.icon} size={18} /></span><b {...el('body')}>{h.title}</b><span className="si__time" {...el('accentDetail')}>{h.subtitle}</span></li>
          ))}</ul>
        </section>
        <div className="full"><Gallery variant="strip" /></div>
        <div className="full"><Hours /></div>
        <div className="row full"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <div className="full"><LocationCard variant="text" /></div>
        <div className="full"><SocialLinks variant="text" title="" /></div>
      </div>
    </div>
  );
}

/* ================================================================ 14. CHROME GLOSS (Y2K) */
export function Gloss() {
  const { data } = useCard();
  return (
    <div className="tpl tpl-gl">
      <div className="gl__holo" aria-hidden />
      <div className="gl__stars" aria-hidden>{Array.from({ length: 8 }, (_, i) => <i key={i} style={{ left: `${(i * 31 + 9) % 90}%`, top: `${(i * 23 + 4) % 70}%`, animationDelay: `${i * 0.5}s` }}>✦</i>)}</div>
      <div className="pad stack center">
        <div className="gl__bubble"><Photo className="gl__img" /></div>
        <h1 className="gl__name" data-text={data.fullName || 'Your Name'} {...el('name')}>{data.fullName || 'Your Name'}</h1>
        <Title className="gl__title" />
        {data.business && <p className="gl__biz" {...el('accentDetail')}>{data.business}</p>}
        <div className="full"><BookRow label="Book me" /></div>
        <div className="gl__pills full">{data.highlights.map((h) => (
          <span key={h.id} className="gl__pill" {...el('cardBg')}><span {...el('icons')}><HIcon name={h.icon} size={16} /></span><span><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></span></span>
        ))}</div>
        <div className="full"><Gallery variant="grid" max={6} /></div>
        <div className="row full"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <div className="full"><SocialLinks variant="pills" title="" /></div>
      </div>
    </div>
  );
}
