import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import {
  Btn, CalendarDays, ContactList, Gallery, HIcon, Hours, LocationCard, Logo, Mail, MapPin, Phone, Photo,
  QrBtn, SaveBtn, ShareBtn, SocialLinks, Title, el, useCard, BrandGlyph,
} from './blocks';
import { Act, initials, useAllActions } from './sig-tech';
import { addressLine, mapsHref, telHref, webHref } from '../lib/links';
import { NETWORK_BY_ID, socialUrl } from '../lib/socials';

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
/** Stable pseudo-random numbers from a string, so art is the same every visit. */
function seeded(seed: string, n: number) {
  let h = 2166136261; for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return Array.from({ length: n }, () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 1000) / 1000; });
}
function streamLinks(ids = ['spotify', 'soundcloud', 'applemusic', 'youtube', 'twitch', 'kick']) {
  const { data } = useCard(); // eslint-disable-line react-hooks/rules-of-hooks
  return data.socials.filter((s) => ids.includes(s.network) && socialUrl(s.network, s.value));
}

/* ================================================================ VINYL SLEEVE */
export function Vinyl() {
  const { data } = useCard();
  const streams = streamLinks();
  return (
    <div className="tpl tpl-vy">
      <div className="pad stack">
        <div className="vy__stage">
          <div className="vy__record" aria-hidden><span className="vy__label" {...el('accentDetail')}>{initials(data.fullName)}</span></div>
          <div className="vy__sleeve"><Photo className="vy__img" /><span className="vy__adv">{(data.business || 'Original mix').toUpperCase()}</span><span className="vy__side">SIDE A</span></div>
        </div>
        <h1 className="vy__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
        <Title />
        {data.bookingUrl || data.email ? <Btn variant="primary" block href={data.bookingUrl ? webHref(data.bookingUrl) : `mailto:${data.email}?subject=${encodeURIComponent('Booking inquiry')}`} icon={<CalendarDays size={18} />}>Book a date</Btn> : null}
        {data.highlights.length > 0 && (
          <section className="vy__tracks" {...el('cardBg')}>
            <h2 className="fc-eyebrow" {...el('caption')}>Tracklist</h2>
            <ol>{data.highlights.map((h, i) => <li key={h.id}><span className="vy__n" {...el('accentDetail')}>A{i + 1}</span><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></li>)}</ol>
          </section>
        )}
        {streams.length > 0 && <div className="stack-sm">{streams.map((s) => <Btn key={s.id} block href={socialUrl(s.network, s.value)} icon={<BrandGlyph network={s.network} size={18} />}>Listen on {NETWORK_BY_ID[s.network]?.label}</Btn>)}</div>}
        <div className="row"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <Gallery variant="grid" max={6} />
        <SocialLinks variant="pills" title="" />
      </div>
    </div>
  );
}

/* ================================================================ BOARDING PASS */
export function Boarding() {
  const { data } = useCard();
  const acts = useAllActions();
  const bars = useMemo(() => seeded(data.slug || data.fullName, 46), [data.slug, data.fullName]);
  const code = (data.address.city || 'ANY').slice(0, 3).toUpperCase();
  return (
    <div className="tpl tpl-bd">
      <div className="pad stack">
        <section className="bd__pass" {...el('cardBg')}>
          <header className="bd__top" {...el('heroBand')}><Logo className="bd__logo" /><span>{(data.business || 'Boarding pass').toUpperCase()}</span><span className="bd__class">FIRST CLASS</span></header>
          <div className="bd__route">
            <div><small {...el('caption')}>FROM</small><b {...el('name')}>{code}</b><span {...el('caption')}>{data.address.city || 'Anywhere'}</span></div>
            <span className="bd__plane" {...el('accentDetail')}><HIcon name="star" size={18} /><i /></span>
            <div className="bd__to"><small {...el('caption')}>TO</small><b {...el('name')}>YOU</b><span {...el('caption')}>Your next event</span></div>
          </div>
          <div className="bd__fields">
            <p><small {...el('caption')}>PASSENGER</small><b {...el('body')}>{data.fullName || 'Your Name'}</b></p>
            <p><small {...el('caption')}>ROLE</small><b {...el('body')}>{data.jobTitle || 'Host'}</b></p>
            <p><small {...el('caption')}>GATE</small><b {...el('body')}>{initials(data.fullName)}1</b></p>
            <p><small {...el('caption')}>SEAT</small><b {...el('body')}>VIP</b></p>
          </div>
          <div className="bd__perf" aria-hidden />
          <div className="bd__stub">
            <Photo className="bd__img" />
            <span className="bd__bars" aria-hidden>{bars.map((b, i) => <i key={i} style={{ width: `${1 + Math.round(b * 3)}px` }} />)}</span>
          </div>
        </section>
        <div className="bd__acts">{acts.map((a, i) => <Act key={a.key} a={a} className={`bd__act ${i === 0 ? 'is-primary' : ''}`} elId={i === 0 ? 'btnPrimaryBg' : 'cardBg'}><span {...el('icons')}>{a.icon}</span><span>{a.label}</span></Act>)}</div>
        {data.highlights.length > 0 && <ul className="bd__svc">{data.highlights.map((h) => <li key={h.id} {...el('dividers')}><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></li>)}</ul>}
        <Gallery variant="strip" />
        <SocialLinks variant="icons" title="" />
      </div>
    </div>
  );
}

/* ================================================================ RECIPE CARD */
export function Recipe() {
  const { data } = useCard();
  return (
    <div className="tpl tpl-rc">
      <div className="pad stack center">
        <div className="rc__photo"><Photo className="rc__img" /><span className="rc__tape" aria-hidden /></div>
        <section className="rc__card" {...el('cardBg')}>
          <p className="rc__from" {...el('accentDetail')}>From the kitchen of</p>
          <h1 className="rc__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
          <p className="rc__biz" {...el('caption')}>{[data.business, data.jobTitle].filter(Boolean).join(' · ')}</p>
          <h2 className="rc__h" {...el('accentDetail')}>{data.highlightsTitle || 'On the menu'}</h2>
          <ul className="rc__ing">{data.highlights.map((h) => <li key={h.id}><span className="rc__box" /><b {...el('body')}>{h.title}</b> <small {...el('caption')}>{h.subtitle}</small></li>)}</ul>
          {data.hours && <p className="rc__note" {...el('body')}>Kitchen hours: {data.hours}</p>}
        </section>
        <div className="full"><div className="row">{data.bookingUrl && <Btn variant="primary" block href={webHref(data.bookingUrl)} icon={<CalendarDays size={18} />}>Order or book</Btn>}{data.phone && <Btn block={!data.bookingUrl} href={telHref(data.phone)} icon={<Phone size={18} />}>Call</Btn>}</div></div>
        <div className="full"><Gallery variant="grid" title="Fresh out the oven" max={6} /></div>
        <div className="row full"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <div className="full"><LocationCard /></div>
        <div className="full"><SocialLinks variant="pills" title="" /></div>
      </div>
    </div>
  );
}

/* ================================================================ TOOLBELT (trades) */
export function Toolbelt() {
  const { data } = useCard();
  const acts = useAllActions().slice(0, 6);
  return (
    <div className="tpl tpl-tb">
      <div className="pad stack">
        <header className="tb__head"><Photo className="tb__img" /><div><h1 className="tb__name" {...el('name')}>{data.business || data.fullName || 'Your Trade'}</h1><p {...el('caption')}>{[data.fullName, data.credentials].filter(Boolean).join(' · ')}</p></div></header>
        <section className="tb__belt" {...el('heroBand')}>
          <span className="tb__buckle" aria-hidden />
          <div className="tb__pockets">{acts.map((a, i) => (
            <Act key={a.key} a={a} className={`tb__pocket ${i === 0 ? 'is-primary' : ''}`} elId={i === 0 ? 'accentDetail' : 'heroBand'}><span className="tb__rivet" /><span className="tb__ic">{a.icon}</span><span className="tb__l">{a.label}</span></Act>
          ))}</div>
        </section>
        {data.tagline && <p className="tb__tag" {...el('body')}>{data.tagline}</p>}
        {data.highlights.length > 0 && <div className="tb__jobs">{data.highlights.map((h) => <article key={h.id} {...el('cardBg')}><span {...el('icons')}><HIcon name={h.icon} size={22} /></span><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></article>)}</div>}
        <Gallery variant="pair" title="Before and after" max={4} />
        <Hours />
        <SocialLinks variant="rows" title="Reviews and more" />
      </div>
    </div>
  );
}

/* ================================================================ STAINED GLASS (churches) */
export function Stained() {
  const { data } = useCard();
  const live = data.socials.find((s) => ['youtube', 'facebook'].includes(s.network) && socialUrl(s.network, s.value));
  const give = data.socials.find((s) => ['paypal', 'cashapp', 'zelle', 'venmo', 'square'].includes(s.network) && socialUrl(s.network, s.value));
  const panes = ['#C2410C', '#1D4ED8', '#B45309', '#15803D', '#7E22CE', '#0E7490', '#BE123C', '#CA8A04'];
  return (
    <div className="tpl tpl-sg2">
      <div className="pad stack center">
        <div className="sg2__window" aria-hidden>
          <svg viewBox="0 0 200 280">
            <defs><clipPath id="sgArch"><path d="M10 280 V100 A90 90 0 0 1 190 100 V280Z" /></clipPath></defs>
            <g clipPath="url(#sgArch)" className="sg2__panes">
              {Array.from({ length: 24 }, (_, i) => {
                const col = i % 4, row = Math.floor(i / 4);
                return <polygon key={i} points={`${col * 50},${row * 48} ${col * 50 + 50},${row * 48 + (i % 3) * 8} ${col * 50 + 50 - (i % 2) * 10},${row * 48 + 48} ${col * 50},${row * 48 + 48 - (i % 3) * 6}`} fill={panes[(i * 5) % panes.length]} style={{ animationDelay: `${(i % 8) * 0.4}s` }} />;
              })}
            </g>
            <path d="M10 280 V100 A90 90 0 0 1 190 100 V280Z" className="sg2__lead" />
            <line x1="100" y1="10" x2="100" y2="280" className="sg2__lead" /><line x1="10" y1="160" x2="190" y2="160" className="sg2__lead" />
          </svg>
          <div className="sg2__photo"><Photo className="sg2__img" /></div>
        </div>
        <h1 className="sg2__name" {...el('name')}>{data.business || 'Your Church'}</h1>
        <p className="sg2__pastor" {...el('caption')}>{[data.fullName, data.jobTitle].filter(Boolean).join(' · ')}</p>
        {data.hours && <p className="sg2__times" {...el('accentDetail')}>{data.hours}</p>}
        <div className="stack-sm full">
          {data.hasLocation && addressLine(data.address) && <Btn variant="primary" block href={mapsHref(data.address)} icon={<MapPin size={18} />}>Plan your visit</Btn>}
          <div className="row">
            {live && <Btn block href={socialUrl(live.network, live.value)} icon={<BrandGlyph network={live.network} size={17} />}>Watch live</Btn>}
            {give && <Btn block href={socialUrl(give.network, give.value)} icon={<HIcon name="heart" size={17} />}>Give</Btn>}
          </div>
          {data.email && <Btn block href={`mailto:${data.email}?subject=${encodeURIComponent('Prayer request')}`} icon={<Mail size={17} />}>Prayer request</Btn>}
        </div>
        {data.highlights.length > 0 && <ul className="sg2__mins full">{data.highlights.map((h) => <li key={h.id} {...el('cardBg')}><span {...el('icons')}><HIcon name={h.icon} size={18} /></span><span><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></span></li>)}</ul>}
        <div className="row full"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <div className="full"><SocialLinks variant="icons" title="" /></div>
      </div>
    </div>
  );
}

/* ================================================================ TRADING CARD */
export function Trading() {
  const { data } = useCard();
  const [flip, setFlip] = useState(false);
  return (
    <div className="tpl tpl-tc">
      <div className="pad stack center">
        <button type="button" className={`tc__card ${flip ? 'is-flipped' : ''}`} onClick={() => setFlip(!flip)} aria-label="Flip card">
          <span className="tc__face front" {...el('heroBand')}>
            <span className="tc__holo" />
            <span className="tc__top"><b>{(data.business || 'Team').toUpperCase()}</b><span className="tc__no" {...el('accentDetail')}>#{initials(data.fullName)}</span></span>
            <span className="tc__art"><Photo className="tc__img" /></span>
            <span className="tc__plate" {...el('accentDetail')}><b>{data.fullName || 'Your Name'}</b><small>{data.jobTitle || 'Coach'}</small></span>
            <span className="tc__rookie">{data.credentials || 'PRO'}</span>
          </span>
          <span className="tc__face back" {...el('cardBg')}>
            <b className="tc__bh" {...el('name')}>{data.fullName}</b>
            <ul>{data.highlights.map((h) => <li key={h.id}><span {...el('accentDetail')}>{h.title}</span><small {...el('caption')}>{h.subtitle}</small></li>)}</ul>
            <small className="tc__tap" {...el('caption')}>Tap to flip back</small>
          </span>
        </button>
        <p className="tc__hint" {...el('caption')}>Tap the card to flip it</p>
        <div className="stack-sm full">
          {data.bookingUrl && <Btn variant="primary" block href={webHref(data.bookingUrl)} icon={<CalendarDays size={18} />}>Book a session</Btn>}
          <div className="row"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        </div>
        <div className="full"><ContactList /></div>
        <div className="full"><Gallery variant="grid" title="Highlights" max={6} /></div>
        <div className="full"><SocialLinks variant="pills" title="" /></div>
      </div>
    </div>
  );
}

/* ================================================================ TURNTABLE (DJs) */
export function Turntable() {
  const { data, play } = useCard();
  const acts = useAllActions();
  const [fader, setFader] = useState(50);
  const [hit, setHit] = useState<string | null>(null);
  const tap = (k: string) => { setHit(k); play('tap'); window.setTimeout(() => setHit(null), 220); };
  return (
    <div className="tpl tpl-tt">
      <div className="pad stack">
        <header className="tt__head"><Logo className="tt__logo" /><div><h1 className="tt__name" {...el('name')}>{data.fullName || 'DJ Name'}</h1><Title /></div></header>
        <section className="tt__deck" {...el('heroBand')}>
          <div className="tt__platter" style={{ '--spd': `${3.4 - fader / 40}s` } as CSSProperties}><span className="tt__grooves" /><span className="tt__lbl"><Photo className="tt__img" /></span></div>
          <span className="tt__arm" style={{ transform: `rotate(${18 + fader / 8}deg)` }} aria-hidden><i /></span>
          <div className="tt__mixer">
            <span className="tt__vu" aria-hidden>{Array.from({ length: 8 }, (_, i) => <i key={i} style={{ animationDelay: `${i * 0.08}s` }} />)}</span>
            <label className="tt__fader"><span className="sr">Crossfader</span><input type="range" min={0} max={100} value={fader} onChange={(e) => setFader(Number(e.target.value))} /></label>
            <span className="tt__bpm">{Math.round(118 + fader / 5)} BPM</span>
          </div>
        </section>
        <div className="tt__pads">{acts.slice(0, 8).map((a, i) => (
          <Act key={a.key} a={{ ...a, hover: a.hover, run: a.run ? () => { tap(a.key); a.run!(); } : undefined }} className={`tt__pad c${i % 4} ${hit === a.key ? 'hit' : ''}`} elId={i === 0 ? 'accentDetail' : 'cardBg'}>
            <span className="tt__padic">{a.icon}</span><span className="tt__padl">{a.label}</span>
          </Act>
        ))}</div>
        {data.highlights.length > 0 && <div className="tt__genres">{data.highlights.map((h) => <span key={h.id} className="tt__genre" {...el('cardBg')}><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></span>)}</div>}
        <Gallery variant="strip" title="Live sets" />
        <SocialLinks variant="pills" title="" />
      </div>
    </div>
  );
}

/* ================================================================ WAVEFORM (DJs, producers) */
export function Waveform() {
  const { data, still } = useCard();
  const bars = useMemo(() => seeded(data.fullName || 'wave', 64), [data.fullName]);
  const [pos, setPos] = useState(0.18);
  const [playing, setPlaying] = useState(!still && !reduced());
  const raf = useRef(0);
  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const tick = (t: number) => { setPos((p) => (p + (t - last) / 40000) % 1); last = t; raf.current = requestAnimationFrame(tick); };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [playing]);
  const streams = streamLinks();
  const secs = Math.round(pos * 214);
  return (
    <div className="tpl tpl-wf">
      <div className="pad stack">
        <header className="wf__head"><Photo className="wf__img" /><div><small {...el('caption')}>NOW PLAYING</small><h1 className="wf__name" {...el('name')}>{data.fullName || 'Your Name'}</h1><p {...el('accentDetail')}>{data.tagline || data.jobTitle}</p></div></header>
        <section className="wf__player" {...el('cardBg')}>
          <div className="wf__wave" onClick={(e) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); setPos((e.clientX - r.left) / r.width); }} role="slider" aria-label="Seek" aria-valuenow={Math.round(pos * 100)} tabIndex={0}>
            {bars.map((b, i) => <i key={i} className={i / bars.length < pos ? 'on' : ''} style={{ height: `${18 + b * 82}%` }} />)}
          </div>
          <div className="wf__ctl">
            <span className="wf__time" {...el('caption')}>{Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}</span>
            <button type="button" className="wf__play" onClick={() => setPlaying(!playing)} aria-label={playing ? 'Pause' : 'Play'} {...el('btnPrimaryBg')}>{playing ? '❚❚' : '▶'}</button>
            <span className="wf__time" {...el('caption')}>3:34</span>
          </div>
        </section>
        {data.bookingUrl || data.email ? <Btn variant="primary" block href={data.bookingUrl ? webHref(data.bookingUrl) : `mailto:${data.email}?subject=${encodeURIComponent('Booking inquiry')}`} icon={<CalendarDays size={18} />}>Check my date</Btn> : null}
        {data.highlights.length > 0 && <ol className="wf__tracks">{data.highlights.map((h, i) => <li key={h.id} {...el('dividers')}><span {...el('caption')}>{String(i + 1).padStart(2, '0')}</span><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></li>)}</ol>}
        {streams.length > 0 && <div className="stack-sm">{streams.map((s) => <Btn key={s.id} block href={socialUrl(s.network, s.value)} icon={<BrandGlyph network={s.network} size={18} />}>{NETWORK_BY_ID[s.network]?.label}</Btn>)}</div>}
        <div className="row"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <SocialLinks variant="icons" title="" />
      </div>
    </div>
  );
}

/* ================================================================ CONFETTI (event planners) */
export function Confetti() {
  const { data, still } = useCard();
  const bits = useMemo(() => seeded(data.fullName || 'party', 60), [data.fullName]);
  const [again, setAgain] = useState(0);
  const colors = ['var(--c-accentDetail)', 'var(--c-btnPrimaryBg)', '#FFC53D', '#FF6FB5', '#5EEAD4'];
  return (
    <div className="tpl tpl-cf">
      {!still && !reduced() && (
        <div className="cf__burst" key={again} aria-hidden>{bits.map((b, i) => (
          <i key={i} style={{ left: `${b * 100}%`, background: colors[i % colors.length], animationDelay: `${(i % 12) * 0.05}s`, animationDuration: `${2.4 + b * 1.6}s`, '--dx': `${(bits[(i + 7) % bits.length] - 0.5) * 160}px`, '--rot': `${b * 900}deg`, width: i % 3 ? 8 : 6, height: i % 3 ? 12 : 6, borderRadius: i % 4 === 0 ? '50%' : 2 } as CSSProperties} />
        ))}</div>
      )}
      <div className="pad stack center">
        <button type="button" className="cf__photo" onClick={() => setAgain((n) => n + 1)} aria-label="Celebrate"><Photo className="cf__img" /></button>
        <p className="cf__kicker" {...el('accentDetail')}>Let's celebrate</p>
        <h1 className="cf__name" {...el('name')}>{data.business || data.fullName || 'Your Events'}</h1>
        <p {...el('caption')}>{[data.fullName, data.jobTitle].filter(Boolean).join(' · ')}</p>
        <div className="stack-sm full">{data.bookingUrl && <Btn variant="primary" block href={webHref(data.bookingUrl)} icon={<CalendarDays size={18} />}>Plan my event</Btn>}<div className="row"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div></div>
        {data.highlights.length > 0 && (
          <section className="cf__show full" {...el('cardBg')}>
            <h2 className="cf__h" {...el('name')}>Run of show</h2>
            <ol>{data.highlights.map((h, i) => <li key={h.id}><span className="cf__time" {...el('accentDetail')}>{['6:00', '7:00', '8:30', '9:30', '10:30', '11:30'][i] ?? ''}</span><span className="cf__dot" {...el('accentDetail')} /><span><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></span></li>)}</ol>
          </section>
        )}
        <div className="full"><Gallery variant="grid" title="Past events" max={6} /></div>
        <div className="full"><ContactList /></div>
        <div className="full"><SocialLinks variant="icons" title="" /></div>
      </div>
    </div>
  );
}

/* ================================================================ INVITATION (wedding planners) */
export function Invitation() {
  const { data, still } = useCard();
  const [open, setOpen] = useState(still || reduced());
  useEffect(() => { if (open) return; const t = window.setTimeout(() => setOpen(true), 700); return () => window.clearTimeout(t); }, [open]);
  return (
    <div className="tpl tpl-iv">
      <div className="pad stack center">
        <div className={`iv__env ${open ? 'is-open' : ''}`} onClick={() => setOpen(true)}>
          <span className="iv__back" {...el('heroBand')} />
          <div className="iv__card" {...el('cardBg')}>
            <p className="iv__req" {...el('caption')}>The pleasure of your company</p>
            <h1 className="iv__name" {...el('name')}>{data.business || data.fullName || 'Your Studio'}</h1>
            <p className="iv__script" {...el('accentDetail')}>{data.fullName}</p>
            <p className="iv__title" {...el('caption')}>{data.jobTitle}</p>
          </div>
          <span className="iv__front" {...el('heroBand')} />
          <span className="iv__flap" {...el('heroBand')}><span className="iv__seal" {...el('accentDetail')}>{initials(data.fullName)}</span></span>
        </div>
        {data.tagline && <p className="iv__tag" {...el('body')}>{data.tagline}</p>}
        <div className="stack-sm full">{data.bookingUrl && <Btn variant="primary" block href={webHref(data.bookingUrl)} icon={<CalendarDays size={18} />}>Book a consultation</Btn>}<div className="row"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div></div>
        {data.highlights.length > 0 && <section className="full"><div className="iv__rule" {...el('accentDetail')}><i /><span>{data.highlightsTitle}</span><i /></div><ul className="iv__list">{data.highlights.map((h) => <li key={h.id}><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></li>)}</ul></section>}
        <div className="iv__planner full"><Photo className="iv__img" /><div><b {...el('body')}>{data.fullName}</b><Title /></div></div>
        <div className="full"><Gallery variant="strip" title="Celebrations" /></div>
        <div className="full"><SocialLinks variant="icons" title="" /></div>
      </div>
    </div>
  );
}

/* ================================================================ MONOGRAM (weddings) */
export function Monogram() {
  const { data } = useCard();
  const leaves = Array.from({ length: 18 }, (_, i) => i);
  return (
    <div className="tpl tpl-mg">
      <div className="pad stack center">
        <div className="mg__wreath" aria-hidden>
          <svg viewBox="0 0 260 260">
            <circle cx="130" cy="130" r="96" className="mg__vine" />
            {leaves.map((i) => {
              const a = (i / leaves.length) * Math.PI * 2 - Math.PI / 2; const x = 130 + Math.cos(a) * 96; const y = 130 + Math.sin(a) * 96;
              const deg = (a * 180) / Math.PI + (i % 2 ? 60 : 120);
              return <g key={i} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${deg.toFixed(1)})`} className="mg__leaf" style={{ animationDelay: `${i * 0.06}s` }}><path d="M0 0 C 6 -9, 18 -8, 22 0 C 18 8, 6 9, 0 0Z" /></g>;
            })}
            {[0, 6, 12].map((i) => { const a = (i / 18) * Math.PI * 2 - Math.PI / 2; return <g key={i} transform={`translate(${(130 + Math.cos(a) * 96).toFixed(1)} ${(130 + Math.sin(a) * 96).toFixed(1)})`} className="mg__bloom">{[0, 72, 144, 216, 288].map((r) => <ellipse key={r} rx="6" ry="11" transform={`rotate(${r}) translate(0 -8)`} />)}<circle r="4.5" /></g>; })}
          </svg>
          <span className="mg__letters" {...el('name')}>{initials(data.fullName)}</span>
        </div>
        <h1 className="mg__name" {...el('name')}>{data.business || data.fullName || 'Your Studio'}</h1>
        <p className="mg__who" {...el('caption')}>{[data.fullName, data.jobTitle].filter(Boolean).join(' · ')}</p>
        {data.tagline && <p className="mg__tag" {...el('accentDetail')}>{data.tagline}</p>}
        <div className="stack-sm full">{data.bookingUrl && <Btn variant="primary" block href={webHref(data.bookingUrl)} icon={<CalendarDays size={18} />}>Check our availability</Btn>}<div className="row"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div></div>
        {data.highlights.length > 0 && <div className="mg__svc full">{data.highlights.map((h) => <article key={h.id} {...el('cardBg')}><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></article>)}</div>}
        <div className="full"><Gallery variant="grid" title="Real weddings" max={6} /></div>
        <div className="full"><ContactList /></div>
        <div className="full"><SocialLinks variant="icons" title="" /></div>
      </div>
    </div>
  );
}

/* ================================================================ INBOX (virtual assistants) */
export function Inbox() {
  const { data } = useCard();
  const acts = useAllActions();
  const first = (data.fullName || 'Me').split(' ')[0];
  const subjects: Record<string, string> = {
    save: `Add ${first} to your contacts`, call: 'Quick call? I pick up', wa: 'Message me on WhatsApp', book: 'Grab a time on my calendar',
    email: 'Send me your to-do list', map: 'Where to find me', web: 'See my full services', share: 'Forward this card', qr: 'Scan to save',
  };
  const [read, setRead] = useState<Record<string, boolean>>({});
  return (
    <div className="tpl tpl-ib">
      <div className="pad stack">
        <section className="ib__app" {...el('cardBg')}>
          <header className="ib__bar"><Photo className="ib__img" /><div><b className="ib__name" {...el('name')}>{data.fullName || 'Your Name'}</b><small {...el('caption')}>{data.jobTitle || 'Virtual assistant'}</small></div><span className="ib__count" {...el('accentDetail')}>{acts.length - Object.keys(read).length}</span></header>
          <div className="ib__tabs" {...el('dividers')}><span className="on">Inbox</span><span>Priority</span><span>Done</span></div>
          <ul className="ib__list">{acts.map((a, i) => (
            <li key={a.key} className={read[a.key] ? 'is-read' : ''}>
              <Act a={{ ...a, run: a.run ? () => { setRead((r) => ({ ...r, [a.key]: true })); a.run!(); } : undefined }} className={`ib__mail ${i === 0 ? 'is-primary' : ''}`} elId={i === 0 ? 'iconBg' : 'cardBg'}>
                <span className="ib__dot" {...el('accentDetail')} />
                <span className="ib__av" {...el('iconBg')}><span {...el('icons')}>{a.icon}</span></span>
                <span className="ib__txt"><b {...el('body')}>{subjects[a.key] ?? a.label}</b><small {...el('caption')}>{a.sub || data.business || 'Tap to open'}</small></span>
                <span className="ib__when" {...el('caption')}>{i === 0 ? 'now' : `${i * 7}m`}</span>
              </Act>
            </li>
          ))}</ul>
        </section>
        {data.highlights.length > 0 && <section className="fc-sec"><h2 className="fc-eyebrow" {...el('caption')}>{data.highlightsTitle || 'I can take off your plate'}</h2><div className="ib__labels">{data.highlights.map((h, i) => <span key={h.id} className={`ib__label l${i % 4}`}><HIcon name={h.icon} size={14} /> {h.title}</span>)}</div></section>}
        <SocialLinks variant="rows" title="Elsewhere" />
      </div>
    </div>
  );
}

/* ================================================================ PLANNER (virtual assistants, coaches) */
export function Planner() {
  const { data } = useCard();
  const [done, setDone] = useState<Record<string, boolean>>({});
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const today = new Date().getDay();
  return (
    <div className="tpl tpl-pn">
      <div className="pad stack">
        <section className="pn__book" {...el('cardBg')}>
          <span className="pn__rings" aria-hidden>{Array.from({ length: 7 }, (_, i) => <i key={i} />)}</span>
          <header className="pn__head"><Photo className="pn__img" /><div><h1 className="pn__name" {...el('name')}>{data.fullName || 'Your Name'}</h1><Title /><small {...el('caption')}>{data.business}</small></div></header>
          <div className="pn__week">{days.map((d, i) => <span key={d} className={`pn__day ${i + 1 === today ? 'is-today' : ''}`} {...el(i + 1 === today ? 'accentDetail' : 'dividers')}><b>{d}</b><small>{i + 1 === today ? 'Today' : 'Open'}</small></span>)}</div>
          {data.hours && <p className="pn__hours" {...el('body')}><HIcon name="star" size={14} /> {data.hours}</p>}
          <h2 className="pn__h" {...el('caption')}>{data.highlightsTitle || 'What I handle'}</h2>
          <ul className="pn__todo">{data.highlights.map((h) => (
            <li key={h.id}><button type="button" className={`pn__check ${done[h.id] ? 'on' : ''}`} onClick={() => setDone((x) => ({ ...x, [h.id]: !x[h.id] }))} aria-pressed={!!done[h.id]} aria-label={`Mark ${h.title}`} {...el('accentDetail')} /><span className={done[h.id] ? 'pn__struck' : ''}><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></span></li>
          ))}</ul>
          <p className="pn__sticky" {...el('accentDetail')}>{data.tagline || 'Your time back, handled.'}</p>
        </section>
        <div className="stack-sm">{data.bookingUrl && <Btn variant="primary" block href={webHref(data.bookingUrl)} icon={<CalendarDays size={18} />}>Book a discovery call</Btn>}<div className="row"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div></div>
        <ContactList />
        <SocialLinks variant="pills" title="" />
      </div>
    </div>
  );
}

