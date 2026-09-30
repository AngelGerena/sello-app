import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import {
  Btn, CalendarDays, Gallery, HIcon, Hours, LocationCard, Logo, Phone, Photo, QrBtn, SaveBtn, ShareBtn,
  SocialLinks, Title, el, useCard,
} from './blocks';
import { Act, initials, useAllActions } from './sig-tech';
import { telHref, webHref } from '../lib/links';

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
export function priced(sub: string) {
  const [first, ...rest] = sub.split('·').map((x) => x.trim());
  return /^\$|^From \$/i.test(first ?? '') ? { price: first, note: rest.join(' · ') } : { price: '', note: sub };
}
export function BookRow({ label }: { label: string }) {
  const { data } = useCard();
  return (
    <div className="row">
      {data.bookingUrl && <Btn variant="primary" block href={webHref(data.bookingUrl)} icon={<CalendarDays size={18} />}>{label}</Btn>}
      {data.phone && <Btn href={telHref(data.phone)} icon={<Phone size={18} />} iconOnly={!!data.bookingUrl} block={!data.bookingUrl} ariaLabel="Call">{data.bookingUrl ? null : 'Call'}</Btn>}
    </div>
  );
}

/* ================================================================ HOLOGRAM: a 3D ID you can spin */
export function Hologram() {
  const { data, still } = useCard();
  const [rot, setRot] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number } | null>(null);
  const down = (e: PointerEvent) => { drag.current = { x: e.clientX - rot.y * 3, y: e.clientY + rot.x * 3 }; (e.target as HTMLElement).setPointerCapture?.(e.pointerId); };
  const move = (e: PointerEvent) => { if (!drag.current) return; setRot({ y: (e.clientX - drag.current.x) / 3, x: -(e.clientY - drag.current.y) / 3 }); };
  const up = () => { drag.current = null; };
  return (
    <div className="tpl tpl-ho">
      <div className="ho__beam" aria-hidden />
      <div className="pad stack center">
        <p className="ho__hint" {...el('caption')}>{still ? '' : 'Drag to spin'}</p>
        <div className="ho__stage" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
          <div className={`ho__card ${drag.current || rot.x || rot.y ? 'is-held' : ''}`} style={{ transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)` }} {...el('cardBg')}>
            <div className="ho__face front">
              <Logo className="ho__logo" />
              <Photo className="ho__img" />
              <h1 className="ho__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
              <Title className="ho__title" />
              <span className="ho__chip" aria-hidden />
              <span className="ho__foil" aria-hidden />
            </div>
            <div className="ho__face back">
              <b {...el('body')}>{data.business}</b>
              <span className="ho__id" {...el('accentDetail')}>{initials(data.fullName)} · {(data.slug || 'card').toUpperCase()}</span>
              <span className="ho__foil" aria-hidden />
            </div>
          </div>
          <span className="ho__base" aria-hidden />
        </div>
        <div className="stack-sm full"><SaveBtn /><div className="row"><ShareBtn className="grow" /><QrBtn className="grow" /></div></div>
        <div className="full"><ContactGrid /></div>
        <div className="full"><SocialLinks variant="pills" title="" /></div>
      </div>
    </div>
  );
}
function ContactGrid() {
  const acts = useAllActions().filter((a) => !['save', 'share', 'qr'].includes(a.key));
  return <div className="ho__grid">{acts.map((a) => <Act key={a.key} a={a} className="ho__tile" elId="cardBg"><span {...el('icons')}>{a.icon}</span><span>{a.label}</span></Act>)}</div>;
}

/* ================================================================ MISSION CONTROL */
export function Mission() {
  const { data } = useCard();
  const acts = useAllActions();
  const [t, setT] = useState(() => new Date());
  useEffect(() => { const i = window.setInterval(() => setT(new Date()), 1000); return () => window.clearInterval(i); }, []);
  const gauges = [
    { label: 'Channels', value: data.socials.length, max: 8 },
    { label: 'Services', value: data.highlights.length, max: 6 },
    { label: 'Contact', value: acts.length - 3, max: 6 },
  ];
  return (
    <div className="tpl tpl-mc">
      <header className="mc__top" {...el('dividers')}><span className="mc__live"><i /> LIVE</span><span>{t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span></header>
      <div className="pad stack">
        <section className="mc__panel mc__who" {...el('cardBg')}>
          <Photo className="mc__img" />
          <div><span className="mc__k">OPERATOR</span><h1 className="mc__name" {...el('name')}>{data.fullName || 'Your Name'}</h1><Title /></div>
        </section>
        <div className="mc__gauges">
          {gauges.map((g) => (
            <div key={g.label} className="mc__panel mc__gauge" {...el('cardBg')}>
              <span className="mc__dial" style={{ '--v': Math.min(1, g.value / g.max) } as CSSProperties}><b>{g.value}</b></span>
              <span className="mc__k">{g.label.toUpperCase()}</span>
            </div>
          ))}
        </div>
        <section className="mc__panel" {...el('cardBg')}>
          <span className="mc__k">CONTROLS</span>
          <div className="mc__switches">{acts.map((a, i) => (
            <Act key={a.key} a={a} className={`mc__sw ${i === 0 ? 'is-primary' : ''}`} elId={i === 0 ? 'accentDetail' : 'btnSecondaryBg'}><span className="mc__led" /><span className="mc__swl">{a.label}</span></Act>
          ))}</div>
        </section>
        {data.highlights.length > 0 && <section className="mc__panel" {...el('cardBg')}><span className="mc__k">SYSTEMS</span><ul className="mc__sys">{data.highlights.map((h) => <li key={h.id}><span className="mc__ok">OK</span><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></li>)}</ul></section>}
        <SocialLinks variant="icons" title="" />
      </div>
    </div>
  );
}

/* ================================================================ GLITCH POSTER (brutalist) */
export function Poster() {
  const { data } = useCard();
  const acts = useAllActions();
  const ticker = [data.business, ...data.highlights.map((h) => h.title), data.tagline].filter(Boolean).join('  ✶  ');
  return (
    <div className="tpl tpl-po">
      <div className="po__ticker" aria-hidden {...el('accentDetail')}><span>{`${ticker}  ✶  ${ticker}  ✶  `}</span></div>
      <div className="po__hero">
        <Photo className="po__img" />
        <h1 className="po__name" data-text={(data.fullName || 'Your Name').toUpperCase()} {...el('name')}>{(data.fullName || 'Your Name').toUpperCase()}</h1>
        <span className="po__sticker" {...el('accentDetail')}>{data.jobTitle || 'Available'}</span>
      </div>
      <div className="pad stack">
        <div className="po__acts">{acts.map((a, i) => <Act key={a.key} a={a} className={`po__act ${i === 0 ? 'is-primary' : ''}`} elId={i === 0 ? 'accentDetail' : 'cardBg'}><span className="po__n">{String(i + 1).padStart(2, '0')}</span>{a.label}</Act>)}</div>
        {data.highlights.length > 0 && <ol className="po__list">{data.highlights.map((h) => <li key={h.id} {...el('dividers')}><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></li>)}</ol>}
        <Gallery variant="grid" max={6} />
        <SocialLinks variant="text" title="" />
      </div>
    </div>
  );
}

/* ================================================================ LIQUID METAL */
export function Liquid() {
  const { data } = useCard();
  return (
    <div className="tpl tpl-lm">
      <svg className="lm__defs" aria-hidden><filter id="lmGoo"><feGaussianBlur in="SourceGraphic" stdDeviation="14" /><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" /></filter></svg>
      <div className="lm__blobs" aria-hidden><i /><i /><i /><i /></div>
      <div className="pad stack center">
        <div className="lm__ring"><Photo className="lm__img" /></div>
        <h1 className="lm__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
        <Title className="lm__title" />
        {data.business && <p className="lm__biz" {...el('caption')}>{data.business}</p>}
        <div className="stack-sm full"><SaveBtn />{data.bookingUrl && <Btn block href={webHref(data.bookingUrl)} icon={<CalendarDays size={18} />}>Book a call</Btn>}<div className="row"><ShareBtn className="grow" /><QrBtn className="grow" /></div></div>
        <div className="full"><ContactGrid /></div>
        {data.highlights.length > 0 && <div className="lm__chips full">{data.highlights.map((h) => <span key={h.id} className="lm__chip" {...el('cardBg')}><span {...el('icons')}><HIcon name={h.icon} size={15} /></span><span {...el('body')}>{h.title}</span></span>)}</div>}
        <div className="full"><SocialLinks variant="icons" title="" /></div>
      </div>
    </div>
  );
}

/* ================================================================ STARFIELD (warp intro) */
export function Starfield() {
  const { data, still } = useCard();
  const acts = useAllActions();
  const ref = useRef<HTMLCanvasElement>(null);
  const { theme, mode } = useCard();
  const star = theme.overrides[mode].accentDetail ?? theme.tokens[mode].accent;
  useEffect(() => {
    const cv = ref.current; if (!cv || still || reduced()) return;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0, h = 0, raf = 0, speed = 38;
    const size = () => { const r = cv.getBoundingClientRect(); w = r.width; h = r.height; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size();
    const stars = Array.from({ length: 170 }, () => ({ x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2, z: Math.random() }));
    const tick = () => {
      raf = requestAnimationFrame(tick);
      speed = Math.max(0.6, speed * 0.965);
      ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.globalCompositeOperation = 'destination-out'; ctx.fillRect(0, 0, w, h); ctx.globalCompositeOperation = 'source-over';
      for (const s of stars) {
        const pz = s.z; s.z -= 0.0025 * speed; if (s.z <= 0.01) { s.x = (Math.random() - 0.5) * 2; s.y = (Math.random() - 0.5) * 2; s.z = 1; continue; }
        const sx = w / 2 + (s.x / s.z) * w * 0.4, sy = h * 0.28 + (s.y / s.z) * h * 0.4;
        const px = w / 2 + (s.x / pz) * w * 0.4, py = h * 0.28 + (s.y / pz) * h * 0.4;
        ctx.strokeStyle = star; ctx.globalAlpha = Math.min(1, 1.2 - s.z); ctx.lineWidth = Math.max(0.6, 2 - s.z * 2);
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(sx, sy); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [still, star]);
  return (
    <div className="tpl tpl-sf">
      <canvas ref={ref} className="sf__canvas" aria-hidden />
      <div className="pad stack center">
        <div className="sf__planet" {...el('accentDetail')}><Photo className="sf__img" /><span className="sf__ring" /></div>
        <h1 className="sf__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
        <Title className="sf__title" />
        <div className="sf__dest full">{acts.map((a, i) => (
          <Act key={a.key} a={a} className={`sf__go ${i === 0 ? 'is-primary' : ''}`} elId={i === 0 ? 'btnPrimaryBg' : 'cardBg'}><span {...el('icons')}>{a.icon}</span><span className="sf__l">{a.label}</span><span className="sf__warp">{i === 0 ? 'ENGAGE' : `0${i}`}</span></Act>
        ))}</div>
        {data.highlights.length > 0 && <ul className="sf__svc full">{data.highlights.map((h) => <li key={h.id} {...el('dividers')}><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></li>)}</ul>}
        <div className="full"><SocialLinks variant="pills" title="" /></div>
      </div>
    </div>
  );
}

/* ================================================================ COMMAND PALETTE (searchable card) */
export function Cmdk() {
  const { data, play, still } = useCard();
  const acts = useAllActions();
  const items = useMemo(() => [
    ...acts.map((a) => ({ id: a.key, group: 'Actions', label: a.label, sub: a.sub, a })),
    ...data.highlights.map((h) => ({ id: h.id, group: data.highlightsTitle || 'Services', label: h.title, sub: h.subtitle, a: null })),
  ], [acts, data.highlights, data.highlightsTitle]);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const shown = items.filter((i) => `${i.label} ${i.sub}`.toLowerCase().includes(q.toLowerCase()));
  const run = (i: (typeof items)[number]) => { if (!i.a) return; play('tap'); if (i.a.run) i.a.run(); else window.open(i.a.href, /^https?:/.test(i.a.href) ? '_blank' : '_self'); };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(shown.length - 1, s + 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
    if (e.key === 'Enter' && shown[sel]) run(shown[sel]);
  };
  let lastGroup = '';
  return (
    <div className="tpl tpl-ck">
      <div className="pad stack">
        <header className="ck__who"><Photo className="ck__img" /><div><h1 className="ck__name" {...el('name')}>{data.fullName || 'Your Name'}</h1><Title /></div><Logo className="ck__logo" /></header>
        <div className="ck__palette" {...el('cardBg')}>
          <label className="ck__search"><HIcon name="chat" size={16} /><span className="sr">Search this card</span>
            <input value={q} onChange={(e) => { setQ(e.target.value); setSel(0); }} onKeyDown={onKey} placeholder={`Search ${data.fullName.split(' ')[0] || 'me'}...`} readOnly={still} />
            <kbd>⌘K</kbd>
          </label>
          <ul className="ck__list" role="listbox">
            {shown.map((i, n) => {
              const head = i.group !== lastGroup ? (lastGroup = i.group, <li key={`g-${i.group}`} className="ck__group" {...el('caption')}>{i.group}</li>) : null;
              return [head, (
                <li key={i.id} role="option" aria-selected={n === sel} className={`ck__item ${n === sel ? 'on' : ''} ${i.a ? '' : 'is-info'}`} onMouseEnter={() => setSel(n)} onClick={() => run(i)} {...el(n === sel ? 'accentDetail' : 'body')}>
                  <span className="ck__ic">{i.a ? i.a.icon : <HIcon name="star" size={16} />}</span>
                  <span className="ck__t"><b>{i.label}</b>{i.sub && <small>{i.sub}</small>}</span>
                  {i.a && <kbd>↵</kbd>}
                </li>
              )];
            })}
            {shown.length === 0 && <li className="ck__empty" {...el('caption')}>No results for "{q}"</li>}
          </ul>
          <footer className="ck__foot" {...el('caption')}><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>↵</kbd> open</span></footer>
        </div>
        <Gallery variant="strip" />
        <SocialLinks variant="pills" title="" />
      </div>
    </div>
  );
}

/* ================================================================ SYNTHWAVE */
export function Synthwave() {
  const { data } = useCard();
  return (
    <div className="tpl tpl-sw">
      <div className="sw__sky" aria-hidden>
        <span className="sw__sun" />
        <svg className="sw__mtn" viewBox="0 0 400 80" preserveAspectRatio="none"><path d="M0 80 L60 30 L110 60 L170 10 L230 55 L290 20 L350 50 L400 25 V80Z" /></svg>
        <span className="sw__grid" />
      </div>
      <div className="pad stack center sw__body">
        <h1 className="sw__name" data-text={data.fullName || 'Your Name'} {...el('name')}>{data.fullName || 'Your Name'}</h1>
        <p className="sw__title" {...el('accentDetail')}>{data.jobTitle || data.business}</p>
        <div className="sw__photo"><Photo className="sw__img" /></div>
        <div className="stack-sm full"><SaveBtn />{data.bookingUrl && <Btn block href={webHref(data.bookingUrl)} icon={<CalendarDays size={18} />}>Book me</Btn>}<div className="row"><ShareBtn className="grow" /><QrBtn className="grow" /></div></div>
        <div className="full"><ContactGrid /></div>
        {data.highlights.length > 0 && <ul className="sw__svc full">{data.highlights.map((h) => <li key={h.id} {...el('cardBg')}><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></li>)}</ul>}
        <div className="full"><SocialLinks variant="pills" title="" /></div>
      </div>
    </div>
  );
}

/* ================================================================ 3D BARBER POLE */
export function Pole() {
  const { data } = useCard();
  return (
    <div className="tpl tpl-bp3">
      <div className="pad stack">
        <header className="bp3__head">
          <div className="bp3__pole" aria-hidden><span className="cap top" /><span className="glass"><i /></span><span className="cap bottom" /></div>
          <div className="bp3__id">
            <Logo className="bp3__logo" />
            <h1 className="bp3__name" {...el('name')}>{data.business || data.fullName || 'Barber Shop'}</h1>
            {data.tagline && <p className="bp3__tag" {...el('caption')}>{data.tagline}</p>}
            <div className="bp3__barber"><Photo className="bp3__img" /><span><b {...el('body')}>{data.fullName}</b><Title withCreds={false} /></span></div>
          </div>
        </header>
        <BookRow label="Book a cut" />
        <PriceList />
        <Gallery variant="grid" title="Fresh cuts" max={6} />
        <Hours />
        <div className="row"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <LocationCard />
        <SocialLinks variant="pills" title="" />
      </div>
    </div>
  );
}
export function PriceList({ className = '' }: { className?: string }) {
  const { data } = useCard();
  if (!data.highlights.length) return null;
  return (
    <section className={`pl ${className}`} {...el('cardBg')}>
      <h2 className="pl__h" {...el('name')}>{data.highlightsTitle || 'Services'}</h2>
      <ul>{data.highlights.map((h) => { const p = priced(h.subtitle); return (
        <li key={h.id}><span className="pl__row"><b {...el('body')}>{h.title}</b><span className="pl__lead" />{p.price && <span className="pl__price" {...el('accentDetail')}>{p.price}</span>}</span>{(p.price ? p.note : h.subtitle) && <small {...el('caption')}>{p.price ? p.note : h.subtitle}</small>}</li>
      ); })}</ul>
    </section>
  );
}

/* ================================================================ GOLD LEAF */
export function GoldLeaf() {
  const { data } = useCard();
  const flakes = useMemo(() => Array.from({ length: 22 }, (_, i) => ({ l: (i * 47) % 100, t: (i * 29) % 100, r: (i * 71) % 360, d: (i % 7) * 0.12, s: 6 + (i % 5) * 4 })), []);
  return (
    <div className="tpl tpl-gd">
      <div className="gd__marble" aria-hidden />
      <div className="pad stack center">
        <div className="gd__frame">
          {flakes.map((f, i) => <i key={i} className="gd__flake" style={{ left: `${f.l}%`, top: `${f.t}%`, width: f.s, height: f.s * 0.7, transform: `rotate(${f.r}deg)`, animationDelay: `${f.d}s` }} />)}
          <Photo className="gd__img" />
        </div>
        <h1 className="gd__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
        <Title className="gd__title" />
        {data.business && <p className="gd__biz" {...el('accentDetail')}>{data.business}</p>}
        <div className="full"><BookRow label="Reserve an appointment" /></div>
        <div className="full"><PriceList className="pl--gold" /></div>
        <div className="full"><Gallery variant="grid" title="Portfolio" max={6} /></div>
        <div className="row full"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <div className="full"><SocialLinks variant="icons" title="" /></div>
      </div>
    </div>
  );
}

/* ================================================================ LASH CURL */
export function Lash() {
  const { data } = useCard();
  return (
    <div className="tpl tpl-la">
      <div className="pad stack center">
        <div className="la__eye">
          <svg className="la__lashes" viewBox="0 0 260 90" aria-hidden>
            <path className="la__lid" d="M10 80 Q130 -10 250 80" />
            {Array.from({ length: 15 }, (_, i) => {
              const t = 0.08 + i * 0.06; const x = 10 + 240 * t; const y = 80 - 180 * t * (1 - t) * 1.0;
              const ang = -90 + (t - 0.5) * 110; const len = 22 + Math.sin(t * Math.PI) * 18;
              const rad = (ang * Math.PI) / 180; const ex = x + Math.cos(rad) * len; const ey = y + Math.sin(rad) * len;
              return <path key={i} className="la__lash" style={{ animationDelay: `${0.4 + i * 0.05}s` }} d={`M${x.toFixed(1)} ${y.toFixed(1)} Q${(x + Math.cos(rad) * len * 0.5 + 6).toFixed(1)} ${(y + Math.sin(rad) * len * 0.5).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`} />;
            })}
          </svg>
          <div className="la__photo"><Photo className="la__img" /></div>
        </div>
        <h1 className="la__name" {...el('name')}>{data.business || data.fullName || 'Lash Studio'}</h1>
        <p className="la__who" {...el('caption')}>{[data.fullName, data.jobTitle].filter(Boolean).join(' · ')}</p>
        <div className="full"><BookRow label="Book your lashes" /></div>
        <div className="full"><PriceList /></div>
        <div className="full"><Gallery variant="strip" title="Sets" /></div>
        <div className="row full"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <div className="full"><SocialLinks variant="pills" title="" /></div>
      </div>
    </div>
  );
}

/* ================================================================ ROSE GOLD */
export function RoseGold() {
  const { data } = useCard();
  return (
    <div className="tpl tpl-rg">
      <div className="pad stack center">
        <section className="rg__plate">
          <span className="rg__sweep" aria-hidden />
          <Logo className="rg__logo" />
          <h1 className="rg__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
          <p className="rg__title">{[data.credentials, data.jobTitle].filter(Boolean).join(' · ')}</p>
          <p className="rg__biz">{data.business}</p>
        </section>
        <div className="rg__photo"><Photo className="rg__img" /></div>
        {data.tagline && <p className="rg__tag" {...el('body')}>{data.tagline}</p>}
        <div className="full"><BookRow label="Book now" /></div>
        <div className="full"><PriceList /></div>
        <div className="full"><Gallery variant="grid" max={6} /></div>
        <div className="row full"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <div className="full"><SocialLinks variant="icons" title="" /></div>
      </div>
    </div>
  );
}

/* ================================================================ SWATCH BOOK */
export function Swatch() {
  const { data, theme, mode } = useCard();
  const base = theme.overrides[mode].accentDetail ?? theme.tokens[mode].accent;
  const band = theme.tokens[mode].band;
  const tints = [base, `color-mix(in srgb, ${base} 70%, ${band})`, `color-mix(in srgb, ${base} 45%, #fff)`, `color-mix(in srgb, ${base} 55%, ${band} 20%, #fff)`, band, `color-mix(in srgb, ${base} 30%, ${band})`];
  return (
    <div className="tpl tpl-sx">
      <div className="pad stack center">
        <div className="sx__head"><Photo className="sx__img" /><div><h1 className="sx__name" {...el('name')}>{data.business || data.fullName || 'Color Studio'}</h1><p {...el('caption')}>{[data.fullName, data.jobTitle].filter(Boolean).join(' · ')}</p></div></div>
        <div className="sx__fan">
          {data.highlights.slice(0, 6).map((h, i, arr) => {
            const p = priced(h.subtitle);
            const spread = arr.length > 1 ? -42 + (84 / (arr.length - 1)) * i : 0;
            return (
              <article key={h.id} className="sx__chip" style={{ '--rot': `${spread}deg`, '--d': `${0.15 + i * 0.08}s`, background: tints[i % tints.length] } as CSSProperties}>
                <span className="sx__code">No. {String(i + 1).padStart(2, '0')}</span>
                <span className="sx__label"><b>{h.title}</b><small>{p.price || p.note}</small></span>
              </article>
            );
          })}
        </div>
        <div className="full"><BookRow label="Book a color consult" /></div>
        <div className="full"><PriceList /></div>
        <div className="full"><Gallery variant="grid" title="Recent color" max={6} /></div>
        <div className="row full"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <div className="full"><SocialLinks variant="pills" title="" /></div>
      </div>
    </div>
  );
}

/* ================================================================ NOW SERVING (barbershop ticket) */
export function NowServing() {
  const { data, still } = useCard();
  const target = 42;
  const [n, setN] = useState(still || reduced() ? target : 1);
  useEffect(() => {
    if (still || reduced()) return;
    let i = 1; const t = window.setInterval(() => { i += 3; setN(Math.min(target, i)); if (i >= target) window.clearInterval(t); }, 30);
    return () => window.clearInterval(t);
  }, [still]);
  return (
    <div className="tpl tpl-ns">
      <div className="pad stack center">
        <div className="ns__machine" {...el('heroBand')}>
          <span className="ns__label">NOW SERVING</span>
          <span className="ns__led" {...el('accentDetail')}>{String(n).padStart(2, '0')}</span>
          <span className="ns__shop">{(data.business || 'Barber Shop').toUpperCase()}</span>
        </div>
        {data.bookingUrl ? (
          <a className="ns__ticket" href={webHref(data.bookingUrl)} target="_blank" rel="noopener" {...el('accentDetail')}>
            <span className="ns__perf" aria-hidden />
            <small>TAKE A NUMBER</small>
            <b>{String(target + 1).padStart(2, '0')}</b>
            <span className="ns__cta">Book the next chair</span>
          </a>
        ) : null}
        <div className="ns__barber full"><Photo className="ns__img" /><div><b {...el('body')}>{data.fullName}</b><Title withCreds={false} /></div>{data.phone && <Btn href={telHref(data.phone)} iconOnly icon={<Phone size={18} />} ariaLabel="Call" />}</div>
        <div className="full"><PriceList /></div>
        <div className="full"><Hours /></div>
        <div className="full"><Gallery variant="grid" title="Fresh cuts" max={6} /></div>
        <div className="row full"><SaveBtn /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <div className="full"><LocationCard /></div>
        <div className="full"><SocialLinks variant="pills" title="" /></div>
      </div>
    </div>
  );
}

/* ================================================================ PERFUME (luxury spa) */
export function Perfume() {
  const { data } = useCard();
  return (
    <div className="tpl tpl-pf">
      <div className="pad stack center">
        <div className="pf__bottle" aria-hidden>
          <span className="pf__cap" /><span className="pf__neck" />
          <span className="pf__glass"><span className="pf__liquid" {...el('accentDetail')} /><span className="pf__shine" /></span>
          <span className="pf__label"><b>{(data.business || data.fullName || 'Maison').split(' ')[0]}</b><small>{data.address.city || 'Eau de spa'}</small></span>
        </div>
        <h1 className="pf__name" {...el('name')}>{data.business || data.fullName || 'Your Spa'}</h1>
        <p className="pf__who" {...el('caption')}>{[data.fullName, data.jobTitle].filter(Boolean).join(' · ')}</p>
        {data.tagline && <p className="pf__tag" {...el('body')}>{data.tagline}</p>}
        <div className="full"><BookRow label="Reserve a treatment" /></div>
        <div className="full"><PriceList /></div>
        <div className="pf__owner full"><Photo className="pf__img" /><div><b {...el('body')}>{data.fullName}</b><Title /></div></div>
        <div className="full"><Gallery variant="strip" /></div>
        <div className="row full"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <div className="full"><LocationCard variant="text" /></div>
        <div className="full"><SocialLinks variant="icons" title="" /></div>
      </div>
    </div>
  );
}
