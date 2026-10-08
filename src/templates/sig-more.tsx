import { useEffect, useState } from 'react';
import {
  Arrow, Btn, CalendarDays, ContactList, Gallery, HIcon, Hours, LocationCard, Logo, MapPin, Photo, QrBtn,
  SaveBtn, ShareBtn, SocialLinks, Title, el, useCard, useContactActions,
} from './blocks';
import { addressLine, mapsHref, prettyUrl, webHref } from '../lib/links';

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const initials = (name: string) => name.split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || 'S';

/* ================================================================ 15. MARQUEE */
export function Marquee() {
  const { data } = useCard();
  const title = (data.business || data.fullName || 'Now Showing').toUpperCase();
  return (
    <div className="tpl tpl-mq">
      <header className="mq__sign" {...el('heroBand')}>
        <span className="mq__bulbs" aria-hidden />
        <p className="mq__now" {...el('accentDetail')}>NOW BOOKING</p>
        <h1 className={`mq__title ${title.replace(/\s/g, '').length > 14 ? 'is-long' : ''}`} aria-label={title}>
          {title.split(' ').filter(Boolean).map((word, w) => (
            <span key={w} className="mq__word" aria-hidden>{word.split('').map((ch, i) => <span key={i} className="ltr">{ch}</span>)}</span>
          ))}
        </h1>
        {data.tagline && <p className="mq__tag">{data.tagline}</p>}
      </header>
      <div className="pad stack">
        <div className="mq__host"><Photo className="mq__img" /><div><b {...el('body')}>{data.fullName}</b><Title /></div><Logo className="mq__logo" /></div>
        {data.bookingUrl && <Btn variant="primary" block href={webHref(data.bookingUrl)} icon={<CalendarDays size={19} />}>Get tickets or book a date</Btn>}
        {data.highlights.length > 0 && (
          <section className="mq__bill" {...el('cardBg')}>
            <h2 className="mq__h" {...el('accentDetail')}>{(data.highlightsTitle || 'On the bill').toUpperCase()}</h2>
            <ul>{data.highlights.map((h) => <li key={h.id}><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></li>)}</ul>
          </section>
        )}
        <Gallery variant="strip" title="Scenes" />
        <div className="row"><SaveBtn /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <LocationCard />
        <SocialLinks variant="pills" title="" />
      </div>
    </div>
  );
}

/* ================================================================ 16. PASSPORT */
function mrz(first: string, last: string) {
  const clean = (s: string) => s.toUpperCase().replace(/[^A-Z]/g, '');
  const l1 = `P<USA${clean(last)}<<${clean(first)}`.padEnd(44, '<').slice(0, 44);
  const l2 = `SEYO${Math.abs([...first + last].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) % 1e9).toString().padStart(9, '0')}<USA`.padEnd(44, '<').slice(0, 44);
  return [l1, l2];
}
export function Passport() {
  const { data } = useCard();
  const acts = useContactActions();
  const [first, ...rest] = (data.fullName || 'Your Name').split(' ');
  const last = rest.join(' ') || first;
  const stamps = acts.slice(0, 4);
  return (
    <div className="tpl tpl-pp">
      <header className="pp__cover" {...el('heroBand')}>
        <span className="pp__country">{(data.business || 'Travel').toUpperCase()}</span>
        <Logo className="pp__crest" />
        <span className="pp__word">PASSPORT</span>
      </header>
      <div className="pad stack">
        <section className="pp__page" {...el('cardBg')}>
          <div className="pp__guilloche" aria-hidden />
          <div className="pp__data">
            <Photo className="pp__img" />
            <dl>
              <div><dt {...el('caption')}>Surname</dt><dd {...el('name')}>{last}</dd></div>
              <div><dt {...el('caption')}>Given names</dt><dd {...el('name')}>{first}</dd></div>
              <div><dt {...el('caption')}>Occupation</dt><dd {...el('body')}>{data.jobTitle || 'Travel advisor'}</dd></div>
              <div><dt {...el('caption')}>Based in</dt><dd {...el('body')}>{data.address.city || 'Worldwide'}</dd></div>
            </dl>
          </div>
          <pre className="pp__mrz" aria-hidden>{mrz(first, last).join('\n')}</pre>
        </section>
        <section className="pp__visas">
          {stamps.map((a, i) => (
            <a key={a.key} href={a.href} {...(/^https?:/.test(a.href) ? { target: '_blank', rel: 'noopener' } : {})} className={`pp__stamp s${i}`} style={{ animationDelay: `${0.4 + i * 0.35}s` }} {...el('accentDetail')}>
              <span className="pp__stampic">{a.icon}</span>
              <b>{a.label.toUpperCase()}</b>
              <small>{i === 0 ? 'ENTRY' : i === 1 ? 'APPROVED' : i === 2 ? 'VISA' : 'ARRIVAL'}</small>
            </a>
          ))}
        </section>
        <div className="row"><SaveBtn /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        {data.highlights.length > 0 && (
          <section className="fc-sec">
            <h2 className="fc-eyebrow" {...el('caption')}>{data.highlightsTitle}</h2>
            <ul className="pp__trips">{data.highlights.map((h) => <li key={h.id} {...el('cardBg')}><span {...el('icons')}><HIcon name={h.icon} size={18} /></span><span><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></span><span {...el('caption')}><Arrow size={16} /></span></li>)}</ul>
          </section>
        )}
        <Gallery variant="strip" title="Postcards" />
        <SocialLinks variant="icons" title="" />
      </div>
    </div>
  );
}

/* ================================================================ 17. ESTATE (cinematic slideshow) */
export function Estate() {
  const { data, still } = useCard();
  const slides = data.gallery.length ? data.gallery.slice(0, 5) : [data.photoUrl].filter(Boolean);
  const [i, setI] = useState(0);
  useEffect(() => {
    if (still || reduced() || slides.length < 2) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % slides.length), 4200);
    return () => window.clearInterval(t);
  }, [slides.length, still]);
  return (
    <div className="tpl tpl-ee">
      <header className="ee__show">
        {slides.map((src, n) => <img key={src + n} src={src} alt="" className={`ee__slide ${n === i ? 'on' : ''}`} />)}
        <div className="ee__shade" />
        <div className="ee__top"><Logo className="ee__logo" /><span {...el('accentDetail')}>{(data.business || '').toUpperCase()}</span></div>
        <div className="ee__cap">
          <span className="ee__rule" {...el('accentDetail')} />
          <h1 className="ee__name">{data.fullName || 'Your Name'}</h1>
          <p className="ee__role">{data.jobTitle}</p>
        </div>
        {slides.length > 1 && <div className="ee__dots">{slides.map((_, n) => <button key={n} type="button" aria-label={`Show image ${n + 1}`} className={n === i ? 'on' : ''} onClick={() => setI(n)} />)}</div>}
      </header>
      <div className="pad stack">
        <div className="ee__agent"><Photo className="ee__img" /><p {...el('body')}>{data.tagline || 'Private, personal service'}</p></div>
        {data.bookingUrl && <Btn variant="primary" block href={webHref(data.bookingUrl)} icon={<CalendarDays size={18} />}>Schedule a private showing</Btn>}
        <div className="row"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        {data.highlights.length > 0 && (
          <section className="ee__svc">{data.highlights.map((h, n) => (
            <article key={h.id} {...el('dividers')}><span className="ee__n" {...el('accentDetail')}>{['I', 'II', 'III', 'IV', 'V', 'VI'][n]}</span><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></article>
          ))}</section>
        )}
        <ContactList />
        <SocialLinks variant="text" title="" />
      </div>
    </div>
  );
}

/* ================================================================ 18. GARDEN */
export function Garden() {
  const { data } = useCard();
  return (
    <div className="tpl tpl-ga">
      <svg className="ga__vine" viewBox="0 0 60 900" preserveAspectRatio="none" aria-hidden>
        <path className="ga__stem" d="M30 0 C 10 80, 50 150, 28 230 S 8 380, 32 460 S 52 620, 26 700 S 12 840, 30 900" />
        {[120, 260, 400, 540, 680, 820].map((y, i) => (
          <g key={y} className="ga__leaf" style={{ animationDelay: `${0.6 + i * 0.35}s` }} transform={`translate(${i % 2 ? 38 : 20} ${y}) rotate(${i % 2 ? 35 : -35})`}>
            <path d="M0 0 C 10 -14, 26 -10, 30 0 C 26 10, 10 14, 0 0Z" />
          </g>
        ))}
        {[190, 470, 750].map((y, i) => (
          <g key={y} className="ga__bloom" style={{ animationDelay: `${1.2 + i * 0.6}s` }} transform={`translate(${i % 2 ? 22 : 36} ${y})`}>
            {[0, 72, 144, 216, 288].map((r) => <ellipse key={r} rx="5" ry="10" transform={`rotate(${r}) translate(0 -8)`} />)}
            <circle r="4" className="ga__heart" />
          </g>
        ))}
      </svg>
      <div className="ga__body pad stack">
        <Logo className="ga__logo" />
        <div className="ga__arch"><Photo className="ga__img" /></div>
        <h1 className="ga__name" {...el('name')}>{data.business || data.fullName || 'Your Garden'}</h1>
        <p className="ga__who" {...el('caption')}>{[data.fullName, data.jobTitle].filter(Boolean).join(' · ')}</p>
        {data.tagline && <p className="ga__tag" {...el('body')}>{data.tagline}</p>}
        <div className="row">
          {data.bookingUrl && <Btn variant="primary" block href={webHref(data.bookingUrl)} icon={<CalendarDays size={18} />}>Order or book</Btn>}
          {data.hasLocation && addressLine(data.address) && <Btn block href={mapsHref(data.address)} icon={<MapPin size={18} />}>Visit</Btn>}
        </div>
        {data.highlights.length > 0 && (
          <div className="ga__cards">{data.highlights.map((h) => (
            <article key={h.id} {...el('cardBg')}><span className="ga__ic" {...el('iconBg')}><span {...el('icons')}><HIcon name={h.icon} size={18} /></span></span><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></article>
          ))}</div>
        )}
        <Gallery variant="grid" title="Fresh this week" max={6} />
        <Hours />
        <div className="row"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <SocialLinks variant="icons" title="" />
      </div>
    </div>
  );
}

/* ================================================================ 19. SCOREBOARD */
export function Scoreboard() {
  const { data } = useCard();
  const now = new Date();
  return (
    <div className="tpl tpl-sb">
      <div className="sb__lights" aria-hidden><i /><i /></div>
      <div className="pad stack">
        <section className="sb__board" {...el('heroBand')}>
          <div className="sb__row"><span className="sb__lbl">HOME</span><span className="sb__lbl">{now.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase()}</span></div>
          <h1 className="sb__led" {...el('accentDetail')}>{(data.fullName || 'YOUR NAME').toUpperCase()}</h1>
          <div className="sb__row"><span className="sb__small">{(data.jobTitle || 'COACH').toUpperCase()}</span><span className="sb__small">{(data.business || '').toUpperCase()}</span></div>
          <div className="sb__photo"><Photo className="sb__img" /></div>
        </section>
        {data.bookingUrl && <Btn variant="primary" block href={webHref(data.bookingUrl)} icon={<CalendarDays size={19} />}>Book training</Btn>}
        <div className="row"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        {data.highlights.length > 0 && (
          <section className="fc-sec">
            <h2 className="sb__h" {...el('caption')}>{(data.highlightsTitle || 'Lineup').toUpperCase()}</h2>
            <ul className="sb__lineup">{data.highlights.map((h, i) => (
              <li key={h.id} {...el('cardBg')}><span className="sb__num" {...el('accentDetail')}>{String(i + 1).padStart(2, '0')}</span><span><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></span></li>
            ))}</ul>
          </section>
        )}
        <Gallery variant="pair" title="Results" max={4} />
        <ContactList />
        <SocialLinks variant="pills" title="" />
      </div>
    </div>
  );
}

/* ================================================================ 20. SIGNATURE (letterpress + wax seal) */
export function Signature() {
  const { data, play, still } = useCard();
  // The seal lands with a soft thud once, when the card opens.
  useEffect(() => { if (!still && !reduced()) { const t = window.setTimeout(() => play('primary'), 650); return () => window.clearTimeout(t); } }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="tpl tpl-sg">
      <div className="pad stack center">
        <section className="sg__card" {...el('cardBg')}>
          <span className="sg__edge" aria-hidden />
          <Logo className="sg__logo" />
          <p className="sg__biz" {...el('caption')}>{(data.business || '').toUpperCase()}</p>
          <h1 className="sg__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
          <Title className="sg__title" />
          <span className="sg__script" aria-hidden {...el('accentDetail')}>{data.fullName || 'Your Name'}</span>
          <div className="sg__seal" {...el('accentDetail')}>
            <svg viewBox="0 0 100 100" aria-hidden><path d="M50 3 C58 6 64 2 71 8 C78 12 85 12 89 20 C94 27 98 33 97 42 C99 50 94 57 96 64 C93 72 88 78 83 84 C76 89 70 95 61 95 C53 98 46 96 38 97 C30 94 23 90 17 84 C11 78 6 72 5 63 C2 55 5 48 3 40 C6 32 9 25 15 19 C21 12 28 8 36 6 C41 3 45 4 50 3Z" /></svg>
            <span className="sg__ring" /><b>{initials(data.fullName)}</b>
          </div>
        </section>
        {data.tagline && <p className="sg__tag" {...el('body')}>{data.tagline}</p>}
        <div className="stack-sm full">
          <SaveBtn />
          {data.bookingUrl && <Btn block href={webHref(data.bookingUrl)} icon={<CalendarDays size={18} />}>Book a consultation</Btn>}
          <div className="row"><ShareBtn className="grow" /><QrBtn className="grow" /></div>
        </div>
        {data.highlights.length > 0 && (
          <section className="fc-sec full">
            <div className="sg__rule" {...el('accentDetail')}><i /><span>{data.highlightsTitle}</span><i /></div>
            <ul className="sg__list">{data.highlights.map((h) => <li key={h.id}><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></li>)}</ul>
          </section>
        )}
        <div className="full"><ContactList /></div>
        {data.website && <a className="sg__site" href={webHref(data.website)} target="_blank" rel="noopener" {...el('links')}>{prettyUrl(data.website)}</a>}
        <div className="full"><SocialLinks variant="icons" title="" /></div>
      </div>
    </div>
  );
}
