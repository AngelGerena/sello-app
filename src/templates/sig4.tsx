import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  Btn, CalendarDays, ContactList, Gallery, HIcon, Hours, LocationCard, Logo, MapPin, Phone, Photo, QrBtn,
  SaveBtn, ShareBtn, SocialLinks, Title, el, useCard, useContactActions,
} from './blocks';
import { BookRow, PriceList, priced } from './sig2-a';
import { initials } from './sig-tech';
import { addressLine, formatPhone, mapsHref, telHref, webHref } from '../lib/links';

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const ext = (h: string) => (/^https?:/.test(h) ? { target: '_blank', rel: 'noopener' } : {});

function Actions({ className }: { className: string }) {
  const acts = useContactActions();
  return <div className={className}>{acts.map((a) => <a key={a.key} href={a.href} {...ext(a.href)} {...el('btnSecondaryBg')}><span {...el('icons')}>{a.icon}</span><span>{a.label}</span></a>)}</div>;
}
function Bottom({ gallery }: { gallery?: string }) {
  return (
    <>
      {gallery !== undefined && <Gallery variant="grid" title={gallery} max={6} />}
      <div className="row"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
      <SocialLinks variant="pills" title="" />
    </>
  );
}

/* ================================================================ LEGAL: CASE FILE */
export function CaseFile() {
  const { data } = useCard();
  return (
    <div className="tpl tpl-cf2">
      <div className="pad stack">
        <section className="cf2__folder" {...el('cardBg')}>
          <span className="cf2__tab" {...el('accentDetail')}>{(data.business || 'Law office').toUpperCase()}</span>
          <span className="cf2__clip" aria-hidden />
          <div className="cf2__head">
            <Photo className="cf2__img" />
            <div>
              <p className="cf2__label" {...el('caption')}>COUNSEL</p>
              <h1 className="cf2__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
              <Title />
            </div>
          </div>
          <dl className="cf2__fields">
            <div><dt {...el('caption')}>Office</dt><dd {...el('body')}>{data.address.city || 'By appointment'}</dd></div>
            <div><dt {...el('caption')}>Phone</dt><dd {...el('body')}>{data.phone ? formatPhone(data.phone) : '—'}</dd></div>
          </dl>
          <span className="cf2__stamp" {...el('accentDetail')}>Consultations open</span>
        </section>
        {data.tagline && <p className="cf2__tag" {...el('body')}>{data.tagline}</p>}
        <BookRow label="Book a consultation" />
        {data.highlights.length > 0 && (
          <section className="fc-sec">
            <h2 className="cf2__h" {...el('caption')}>{(data.highlightsTitle || 'Practice areas').toUpperCase()}</h2>
            <ol className="cf2__list">{data.highlights.map((h, i) => <li key={h.id} {...el('dividers')}><span {...el('accentDetail')}>§ {i + 1}</span><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></li>)}</ol>
          </section>
        )}
        <ContactList />
        <Bottom />
      </div>
    </div>
  );
}

/* ================================================================ PHOTO: CONTACT SHEET */
export function ContactSheet() {
  const { data } = useCard();
  const frames = data.gallery.length ? data.gallery.slice(0, 5) : [data.photoUrl, data.photoUrl, data.photoUrl, data.photoUrl, data.photoUrl].filter(Boolean);
  return (
    <div className="tpl tpl-cs">
      <div className="pad stack">
        <header className="cs__head"><Logo className="cs__logo" /><span {...el('caption')}>{(data.business || 'Studio').toUpperCase()} · ROLL 01</span></header>
        <section className="cs__sheet">
          <span className="cs__sprockets top" aria-hidden /><span className="cs__sprockets bottom" aria-hidden />
          <div className="cs__frames">
            <figure className="cs__frame is-pick"><Photo className="cs__img" /><figcaption>01A</figcaption><span className="cs__circle" aria-hidden /></figure>
            {frames.map((src, i) => <figure key={i} className="cs__frame"><img src={src} alt="" className="cs__img" /><figcaption>{String(i + 2).padStart(2, '0')}A</figcaption></figure>)}
          </div>
        </section>
        <h1 className="cs__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
        <Title />
        {data.tagline && <p className="cs__tag" {...el('accentDetail')}>{data.tagline}</p>}
        <BookRow label="Book a session" />
        {data.highlights.length > 0 && <ul className="cs__svc">{data.highlights.map((h) => <li key={h.id} {...el('dividers')}><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></li>)}</ul>}
        <Bottom />
      </div>
    </div>
  );
}

/* ================================================================ TATTOO: FLASH SHEET */
export function Flash() {
  const { data } = useCard();
  return (
    <div className="tpl tpl-fl">
      <div className="pad stack center">
        <div className="fl__art">
          <svg className="fl__banner" viewBox="0 0 320 90" aria-hidden><path d="M8 34 L40 24 L40 64 L8 56 L22 45Z M312 34 L280 24 L280 64 L312 56 L298 45Z" /><path className="fl__ribbon" d="M34 20 Q160 -4 286 20 L286 62 Q160 38 34 62Z" /></svg>
          <span className="fl__bname" {...el('name')}>{data.business || data.fullName || 'Tattoo'}</span>
          <div className="fl__photo"><Photo className="fl__img" /></div>
          {[0, 1, 2, 3].map((i) => <span key={i} className={`fl__star s${i}`} aria-hidden {...el('accentDetail')}>✦</span>)}
        </div>
        <p className="fl__who" {...el('body')}><b>{data.fullName}</b> · {data.jobTitle || 'Tattoo artist'}</p>
        {data.tagline && <p className="fl__tag" {...el('accentDetail')}>{data.tagline}</p>}
        <div className="full"><BookRow label="Book a consult" /></div>
        <div className="fl__styles full">{data.highlights.map((h) => <article key={h.id} {...el('cardBg')}><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></article>)}</div>
        <div className="full"><Gallery variant="grid" title="Healed work" max={6} /></div>
        <div className="full"><Hours /></div>
        <div className="row full"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <div className="full"><SocialLinks variant="pills" title="" /></div>
      </div>
    </div>
  );
}

/* ================================================================ FOOD TRUCK: ORDER TICKET */
export function OrderTicket() {
  const { data } = useCard();
  const no = useMemo(() => 100 + ((data.fullName || 'x').length * 37) % 900, [data.fullName]);
  return (
    <div className="tpl tpl-ot">
      <div className="pad stack center">
        <section className="ot__ticket" {...el('cardBg')}>
          <Logo className="ot__logo" />
          <h1 className="ot__name" {...el('name')}>{(data.business || 'Street Eats').toUpperCase()}</h1>
          <p className="ot__meta" {...el('caption')}>ORDER #{no} · {data.address.city ? data.address.city.toUpperCase() : 'ON THE MOVE'}</p>
          <span className="ot__rule" />
          <ul className="ot__items">{data.highlights.map((h) => { const p = priced(h.subtitle); return (
            <li key={h.id}><span className="ot__qty">1x</span><span className="ot__item"><b {...el('body')}>{h.title.toUpperCase()}</b>{(p.price ? p.note : h.subtitle) && <small {...el('caption')}>{p.price ? p.note : h.subtitle}</small>}</span><span className="ot__price" {...el('body')}>{p.price}</span></li>
          ); })}</ul>
          <span className="ot__rule" />
          {data.hours && <p className="ot__hours" {...el('body')}>{data.hours}</p>}
          <span className="ot__stamp" {...el('accentDetail')}>ORDER UP</span>
          <span className="ot__tear" aria-hidden />
        </section>
        <div className="full row">
          {data.bookingUrl && <Btn variant="primary" block href={webHref(data.bookingUrl)} icon={<CalendarDays size={18} />}>Order ahead</Btn>}
          {data.hasLocation && addressLine(data.address) && <Btn block href={mapsHref(data.address)} icon={<MapPin size={18} />}>Find the truck</Btn>}
        </div>
        <div className="full"><Gallery variant="grid" title="Off the grill" max={6} /></div>
        <div className="row full"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <div className="full"><SocialLinks variant="pills" title="" /></div>
      </div>
    </div>
  );
}

/* ================================================================ APPAREL: HANG TAG */
export function HangTag() {
  const { data } = useCard();
  return (
    <div className="tpl tpl-ht">
      <div className="pad stack center">
        <div className="ht__string" aria-hidden />
        <section className="ht__tag" {...el('cardBg')}>
          <span className="ht__hole" aria-hidden />
          <Logo className="ht__logo" />
          <h1 className="ht__name" {...el('name')}>{data.business || data.fullName || 'Brand'}</h1>
          {data.tagline && <p className="ht__tagline" {...el('caption')}>{data.tagline}</p>}
          <div className="ht__photo"><Photo className="ht__img" /></div>
          <p className="ht__who" {...el('body')}>{data.fullName}{data.jobTitle ? ` · ${data.jobTitle}` : ''}</p>
          <div className="ht__sizes">{['XS', 'S', 'M', 'L', 'XL'].map((s, i) => <span key={s} className={i === 2 ? 'on' : ''} {...el(i === 2 ? 'accentDetail' : 'dividers')}>{s}</span>)}</div>
        </section>
        <div className="full"><BookRow label="Shop the collection" /></div>
        <div className="ht__drops full">{data.highlights.map((h) => <article key={h.id} {...el('cardBg')}><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></article>)}</div>
        <div className="full"><Gallery variant="grid" title="Lookbook" max={6} /></div>
        <div className="row full"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <div className="full"><SocialLinks variant="pills" title="" /></div>
      </div>
    </div>
  );
}

/* ================================================================ RETAIL: SHOPPING BAG */
export function Bag() {
  const { data } = useCard();
  return (
    <div className="tpl tpl-bg">
      <div className="pad stack center">
        <div className="bg__bag">
          <span className="bg__handles" aria-hidden />
          <div className="bg__body" {...el('heroBand')}>
            <Logo className="bg__logo" />
            <h1 className="bg__name">{data.business || data.fullName || 'The Shop'}</h1>
            {data.tagline && <p className="bg__tag">{data.tagline}</p>}
          </div>
        </div>
        <div className="bg__owner full"><Photo className="bg__img" /><div><b {...el('body')}>{data.fullName}</b><Title withCreds={false} /></div></div>
        <div className="full row">
          {data.bookingUrl && <Btn variant="primary" block href={webHref(data.bookingUrl)} icon={<CalendarDays size={18} />}>Shop online</Btn>}
          {data.hasLocation && addressLine(data.address) && <Btn block href={mapsHref(data.address)} icon={<MapPin size={18} />}>Visit the shop</Btn>}
        </div>
        <div className="bg__tags full">{data.highlights.map((h) => <article key={h.id} {...el('cardBg')}><span className="bg__hole" aria-hidden /><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></article>)}</div>
        <div className="full"><Gallery variant="grid" title="New in" max={6} /></div>
        <div className="full"><Hours /></div>
        <div className="row full"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <div className="full"><SocialLinks variant="icons" title="" /></div>
      </div>
    </div>
  );
}

/* ================================================================ NONPROFIT / COMMUNITY: POSTCARD */
export function Postcard() {
  const { data } = useCard();
  return (
    <div className="tpl tpl-pc">
      <div className="pad stack">
        <section className="pc__front">
          <Photo className="pc__img" />
          <span className="pc__greet">Greetings from</span>
          <h1 className="pc__big">{data.business || data.fullName || 'Our Community'}</h1>
        </section>
        <section className="pc__back" {...el('cardBg')}>
          <div className="pc__msg">
            <p className="pc__hand" {...el('body')}>{data.tagline || 'Thanks for stopping by. We would love to hear from you.'}</p>
            <p className="pc__sign" {...el('accentDetail')}>{data.fullName}</p>
            <small {...el('caption')}>{data.jobTitle}</small>
          </div>
          <div className="pc__addr">
            <span className="pc__stamp" {...el('accentDetail')}><Logo className="pc__logo" /></span>
            <span className="pc__post" aria-hidden>{data.address.city || 'Central FL'}</span>
            <span className="pc__line" /><span className="pc__line" /><span className="pc__line" />
          </div>
        </section>
        <Actions className="pc__acts" />
        {data.highlights.length > 0 && <div className="pc__ways">{data.highlights.map((h) => <article key={h.id} {...el('cardBg')}><span {...el('icons')}><HIcon name={h.icon} size={18} /></span><span><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></span></article>)}</div>}
        <Bottom gallery="Snapshots" />
      </div>
    </div>
  );
}

/* ================================================================ REAL ESTATE: FLOOR PLAN */
export function FloorPlan() {
  const { data } = useCard();
  const rooms = data.highlights.slice(0, 4);
  return (
    <div className="tpl tpl-fp">
      <div className="pad stack">
        <header className="fp__head"><Logo className="fp__logo" /><span {...el('caption')}>{(data.business || '').toUpperCase()}</span></header>
        <section className="fp__plan" {...el('cardBg')}>
          <div className="fp__grid">
            {rooms.map((h, i) => <div key={h.id} className={`fp__room r${i}`}><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></div>)}
            <div className="fp__agent"><Photo className="fp__img" /></div>
          </div>
          <span className="fp__compass" aria-hidden>N</span>
        </section>
        <h1 className="fp__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
        <Title />
        {data.tagline && <p className="fp__tag" {...el('body')}>{data.tagline}</p>}
        <BookRow label="Tour a home with me" />
        <ContactList />
        <Bottom gallery="Recent listings" />
      </div>
    </div>
  );
}

/* ================================================================ FINANCE: LEDGER */
export function Ledger() {
  const { data } = useCard();
  return (
    <div className="tpl tpl-lg">
      <div className="pad stack">
        <section className="lg__book" {...el('cardBg')}>
          <header className="lg__top"><span {...el('caption')}>{(data.business || 'Account').toUpperCase()}</span><span {...el('caption')}>{new Date().getFullYear()}</span></header>
          <div className="lg__who"><Photo className="lg__img" /><div><h1 className="lg__name" {...el('name')}>{data.fullName || 'Your Name'}</h1><Title /></div></div>
          <table className="lg__table">
            <thead><tr><th {...el('caption')}>Service</th><th {...el('caption')}>Detail</th><th {...el('caption')} aria-label="Included">✓</th></tr></thead>
            <tbody>{data.highlights.map((h) => <tr key={h.id}><td {...el('body')}>{h.title}</td><td {...el('caption')}>{h.subtitle}</td><td {...el('accentDetail')}>✓</td></tr>)}</tbody>
          </table>
          <p className="lg__sign" {...el('accentDetail')}>{data.fullName}</p>
        </section>
        {data.tagline && <p className="lg__tag" {...el('body')}>{data.tagline}</p>}
        <BookRow label="Book a review" />
        <ContactList />
        <Bottom />
      </div>
    </div>
  );
}

/* ================================================================ CHURCH: HYMN BOARD */
export function HymnBoard() {
  const { data } = useCard();
  const times = (data.hours || 'Sundays 10am').split(/,|and|&/).map((t) => t.trim()).filter(Boolean).slice(0, 3);
  return (
    <div className="tpl tpl-hb">
      <div className="pad stack center">
        <section className="hb__board">
          <span className="hb__cross" aria-hidden />
          <h1 className="hb__church">{data.business || 'Our Church'}</h1>
          <p className="hb__label">SERVICES</p>
          <div className="hb__slots">{times.map((t, i) => <span key={i} className="hb__slot">{t}</span>)}</div>
          {data.tagline && <p className="hb__verse">{data.tagline}</p>}
        </section>
        <div className="hb__pastor full"><Photo className="hb__img" /><div><b {...el('body')}>{data.fullName}</b><Title /></div></div>
        <div className="full stack-sm">
          {data.hasLocation && addressLine(data.address) && <Btn variant="primary" block href={mapsHref(data.address)} icon={<MapPin size={18} />}>Plan your visit</Btn>}
          {data.phone && <Btn block href={telHref(data.phone)} icon={<Phone size={18} />}>Call the church</Btn>}
        </div>
        {data.highlights.length > 0 && <div className="hb__mins full">{data.highlights.map((h) => <article key={h.id} {...el('cardBg')}><span {...el('icons')}><HIcon name={h.icon} size={18} /></span><span><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></span></article>)}</div>}
        <div className="full"><Gallery variant="strip" title="Our family" /></div>
        <div className="row full"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <div className="full"><SocialLinks variant="icons" title="" /></div>
      </div>
    </div>
  );
}

/* ================================================================ AUTO: INSTRUMENT CLUSTER */
export function Cluster() {
  const { data, still } = useCard();
  const acts = useContactActions().slice(0, 6);
  const [on, setOn] = useState(still || reduced());
  useEffect(() => { if (on) return; const t = window.setTimeout(() => setOn(true), 200); return () => window.clearTimeout(t); }, [on]);
  return (
    <div className="tpl tpl-ic">
      <div className="pad stack">
        <section className="ic__dash" {...el('heroBand')}>
          <div className="ic__gauge"><span className="ic__ticks" /><span className={`ic__needle ${on ? 'on' : ''}`} /><span className="ic__hub" /><b className="ic__read">MPH</b></div>
          <div className="ic__center"><Photo className="ic__img" /><span className="ic__odo">{initials(data.business || data.fullName)} · {String((data.fullName || 'x').length * 1234).padStart(6, '0')}</span></div>
          <div className="ic__gauge rpm"><span className="ic__ticks" /><span className={`ic__needle ${on ? 'on' : ''}`} /><span className="ic__hub" /><b className="ic__read">RPM</b></div>
        </section>
        <h1 className="ic__name" {...el('name')}>{(data.business || data.fullName || 'Auto Shop').toUpperCase()}</h1>
        <p className="ic__who" {...el('caption')}>{[data.fullName, data.jobTitle].filter(Boolean).join(' · ')}</p>
        <div className="ic__lights">{acts.map((a) => <a key={a.key} href={a.href} {...ext(a.href)} className="ic__light" {...el('cardBg')}><span className="ic__lamp" {...el('accentDetail')}>{a.icon}</span><span {...el('body')}>{a.label}</span></a>)}</div>
        <PriceList />
        <Hours />
        <Bottom gallery="In the shop" />
      </div>
    </div>
  );
}

/* ================================================================ FITNESS: STOPWATCH */
export function Stopwatch() {
  const { data, still } = useCard();
  const [ms, setMs] = useState(0);
  useEffect(() => {
    if (still || reduced()) return;
    const start = performance.now(); let raf = 0;
    const tick = (t: number) => { setMs(t - start); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [still]);
  const s = Math.floor(ms / 1000) % 60, m = Math.floor(ms / 60000) % 60, cs = Math.floor(ms / 10) % 100;
  return (
    <div className="tpl tpl-sw2">
      <div className="pad stack center">
        <div className="sw2__watch" {...el('accentDetail')}>
          <span className="sw2__crown" aria-hidden />
          <div className="sw2__face">
            <Photo className="sw2__img" />
            <span className="sw2__time">{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}<small>.{String(cs).padStart(2, '0')}</small></span>
            <span className="sw2__hand" style={{ transform: `rotate(${(ms / 60000) * 360}deg)` } as CSSProperties} />
          </div>
        </div>
        <h1 className="sw2__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
        <Title className="sw2__title" />
        {data.tagline && <p className="sw2__tag" {...el('accentDetail')}>{data.tagline}</p>}
        <div className="full"><BookRow label="Start your first session" /></div>
        <ol className="sw2__laps full">{data.highlights.map((h, i) => <li key={h.id} {...el('dividers')}><span className="sw2__lap" {...el('caption')}>LAP {i + 1}</span><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></li>)}</ol>
        <div className="full"><Gallery variant="pair" title="Results" max={4} /></div>
        <div className="row full"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <div className="full"><SocialLinks variant="pills" title="" /></div>
      </div>
    </div>
  );
}

/* ================================================================ RESTAURANT: DINER */
export function Diner() {
  const { data } = useCard();
  return (
    <div className="tpl tpl-dn">
      <header className="dn__sign" {...el('heroBand')}>
        <span className="dn__chrome" aria-hidden />
        <p className="dn__eat">EAT</p>
        <h1 className="dn__name">{data.business || 'The Diner'}</h1>
        {data.hours && <p className="dn__open">OPEN · {data.hours}</p>}
      </header>
      <div className="dn__checks" aria-hidden />
      <div className="pad stack">
        <section className="dn__board">
          <h2>TODAY'S SPECIALS</h2>
          <ul>{data.highlights.map((h) => { const p = priced(h.subtitle); return <li key={h.id}><span>{h.title.toUpperCase()}</span><span>{p.price}</span></li>; })}</ul>
        </section>
        <div className="row">
          {data.bookingUrl && <Btn variant="primary" block href={webHref(data.bookingUrl)} icon={<CalendarDays size={18} />}>Reserve or order</Btn>}
          {data.phone && <Btn block={!data.bookingUrl} href={telHref(data.phone)} icon={<Phone size={18} />}>Call</Btn>}
        </div>
        <div className="dn__host"><Photo className="dn__img" /><div><b {...el('body')}>{data.fullName}</b><Title withCreds={false} /></div></div>
        <Gallery variant="grid" title="From the kitchen" max={6} />
        <LocationCard variant="map" />
        <Bottom />
      </div>
    </div>
  );
}

/* ================================================================ HOME SERVICES: YARD SIGN */
export function YardSign() {
  const { data } = useCard();
  return (
    <div className="tpl tpl-ys">
      <div className="ys__lawn" aria-hidden />
      <div className="pad stack center">
        <div className="ys__sign">
          <section className="ys__panel" {...el('heroBand')}>
            <Logo className="ys__logo" />
            <h1 className="ys__name">{data.business || data.fullName || 'Your Company'}</h1>
            {data.tagline && <p className="ys__tag">{data.tagline}</p>}
            {data.phone && <a className="ys__phone" href={telHref(data.phone)} {...el('accentDetail')}>{formatPhone(data.phone)}</a>}
            {data.credentials && <span className="ys__cred">{data.credentials}</span>}
          </section>
          <span className="ys__stake l" aria-hidden /><span className="ys__stake r" aria-hidden />
        </div>
        <div className="ys__owner full"><Photo className="ys__img" /><div><b {...el('body')}>{data.fullName}</b><Title withCreds={false} /></div></div>
        <div className="full"><BookRow label="Get a free quote" /></div>
        <div className="ys__svc full">{data.highlights.map((h) => <article key={h.id} {...el('cardBg')}><span {...el('icons')}><HIcon name={h.icon} size={20} /></span><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></article>)}</div>
        <div className="full"><Gallery variant="pair" title="Before and after" max={4} /></div>
        <div className="full"><Hours /></div>
        <div className="row full"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <div className="full"><SocialLinks variant="rows" title="Reviews" /></div>
      </div>
    </div>
  );
}
