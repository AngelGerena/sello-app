import { useRef, useState, type FormEvent } from 'react';
import { BadgeCheck, Check, Clock, Navigation, Play, Pause, Send, Star } from 'lucide-react';
import {
  Btn, CalendarDays, Gallery, HIcon, MapPin, Phone, Photo, Logo, SaveBtn, ShareBtn, QrBtn, SocialLinks,
  el, useCard, useContactActions,
} from './blocks';
import { priced } from './sig2-a';
import { addressLine, mapsHref, telHref, waHref, webHref } from '../lib/links';
import { NETWORK_BY_ID, socialUrl } from '../lib/socials';

/* =================================================================
   Collection five: photo-led cards built on card UX research.
   Photo, name and Save contact sit on the first screen, one main
   action, 3 to 5 other ways to reach the owner, 44px targets.
   ================================================================= */

const ext = (h: string) => (/^https?:/.test(h) ? { target: '_blank', rel: 'noopener' } : {});
const firstName = (n: string) => (n || 'there').replace(/^(Pastor|Pastora|Dr\.?|Coach)\s+/i, '').split(' ')[0];

/** The main action: booking when the owner has it, otherwise a call. */
function MainCta({ label, className = '' }: { label: string; className?: string }) {
  const { data } = useCard();
  if (data.bookingUrl) return <Btn variant="primary" block className={className} href={webHref(data.bookingUrl)} icon={<CalendarDays size={18} />}>{label}</Btn>;
  if (data.phone) return <Btn variant="primary" block className={className} href={telHref(data.phone)} icon={<Phone size={18} />}>Call now</Btn>;
  return null;
}

/** Contact methods other than booking, for small action grids. */
function useQuick(max: number) {
  return useContactActions().filter((a) => a.key !== 'book').slice(0, max);
}

function useGoogleReviews() {
  const { data } = useCard();
  const g = data.socials.find((s) => s.network === 'google');
  return g ? socialUrl(g.network, g.value) : '';
}

/* ================================================================ 1 PROFILE SHEET */
export function Sheet() {
  const { data } = useCard();
  const acts = useQuick(4);
  const where = addressLine(data.address);
  return (
    <div className="tpl tpl-sh5">
      <div className="sh5__hero">
        <Photo className="sh5__img" />
        <div className="sh5__top">
          {data.kicker ? <span className="sh5__chip"><i aria-hidden />{data.kicker}</span> : <span />}
          <ShareBtn iconOnly className="sh5__share" />
        </div>
      </div>
      <section className="sh5__sheet" {...el('cardBg')}>
        <span className="sh5__grab" {...el('dividers')} aria-hidden />
        <div>
          <div className="sh5__nm">
            <h1 className="fc-name sh5__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
            {data.credentials && <span className="sh5__ok" {...el('accentDetail')} title={data.credentials}><BadgeCheck size={22} aria-label={data.credentials} /></span>}
          </div>
          <p className="sh5__role" {...el('caption')}>{[data.jobTitle, data.business].filter(Boolean).join(' · ')}</p>
        </div>
        {acts.length > 0 && (
          <div className="sh5__acts">{acts.map((a) => (
            <a key={a.key} href={a.href} {...ext(a.href)}>
              <span className="sh5__well" {...el('iconBg')}><span {...el('icons')}>{a.icon}</span></span>
              <span {...el('body')}>{a.label}</span>
            </a>))}</div>
        )}
        <MainCta label="Book an appointment" />
        {(data.hours || (data.hasLocation && where)) && (
          <dl className="sh5__info" {...el('iconBg')}>
            {data.hours && <div {...el('dividers')}><dt {...el('caption')}>Hours</dt><dd {...el('body')}>{data.hours}</dd></div>}
            {data.hasLocation && where && <div {...el('dividers')}><dt {...el('caption')}>Visit</dt><dd {...el('body')}><a href={mapsHref(data.address)} {...ext(mapsHref(data.address))}>{data.address.street || where}</a></dd></div>}
          </dl>
        )}
        <SaveBtn variant="secondary" />
        {data.tagline && <p className="sh5__tag" {...el('body')}>{data.tagline}</p>}
        <SocialLinks variant="pills" title="" />
        <Gallery variant="strip" title="" max={6} />
      </section>
    </div>
  );
}

/* ================================================================ 2 MONOCHROME STUDIO */
export function Studio() {
  const { data } = useCard();
  const acts = useContactActions().filter((a) => a.key !== 'book');
  const socials = data.socials.map((s) => ({ ...s, url: socialUrl(s.network, s.value), n: NETWORK_BY_ID[s.network] })).filter((s) => s.url);
  const rows = [...acts.map((a) => ({ key: a.key, label: a.label, href: a.href })), ...socials.map((s) => ({ key: s.id, label: s.n?.label ?? 'Link', href: s.url }))].slice(0, 6);
  const [first, ...rest] = (data.fullName || 'Your Name').split(' ');
  return (
    <div className="tpl tpl-st5">
      <header className="st5__hero">
        <Photo className="st5__img" />
        <div className="st5__top"><span>{data.business}</span><span>{data.address.city}</span></div>
        <h1 className="st5__name" {...el('name')}>{first}{rest.length > 0 && <><br /><em>{rest.join(' ')}</em></>}</h1>
      </header>
      <div className="pad stack st5__body">
        <p className="st5__meta" {...el('caption')}><span>{data.jobTitle}</span>{data.credentials && <span>{data.credentials}</span>}</p>
        <div className="st5__two">
          <SaveBtn />
          {data.bookingUrl ? <Btn href={webHref(data.bookingUrl)}>Book</Btn> : <ShareBtn />}
        </div>
        {rows.length > 0 && (
          <ol className="st5__list">{rows.map((r, i) => (
            <li key={r.key} {...el('dividers')}><a href={r.href} {...ext(r.href)}><span className="st5__n" {...el('caption')}>{String(i + 1).padStart(2, '0')}</span><span {...el('body')}>{r.label}</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden><path d="M7 17 17 7M8 7h9v9" /></svg></a></li>))}</ol>
        )}
        {data.tagline && <p className="st5__tag" {...el('body')}>{data.tagline}</p>}
        {data.highlights.length > 0 && (
          <section className="fc-sec"><h2 className="fc-eyebrow" {...el('caption')}>{data.highlightsTitle || 'Services'}</h2>
            <div className="st5__hl">{data.highlights.map((h) => <div key={h.id} {...el('dividers')}><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></div>)}</div></section>
        )}
        <Gallery variant="grid" title="Selected work" max={6} />
        <div className="row"><QrBtn /><ShareBtn iconOnly /></div>
      </div>
    </div>
  );
}

/* ================================================================ 3 VIDEO INTRO */
export function Intro() {
  const { data, still } = useCard();
  const vid = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const quick = useQuick(3);
  const toggle = () => {
    const v = vid.current; if (!v) return;
    if (v.paused) { v.muted = false; v.play().then(() => setPlaying(true)).catch(() => setPlaying(false)); }
    else { v.pause(); setPlaying(false); }
  };
  return (
    <div className="tpl tpl-in5">
      <div className="pad stack">
        <div className="in5__frame">
          {data.photoVideoUrl && !still
            ? <video ref={vid} className="in5__media" src={data.photoVideoUrl} poster={data.photoUrl || undefined} playsInline preload="metadata" onEnded={() => setPlaying(false)} />
            : <Photo className="in5__media" />}
          <span className="in5__chip">{data.photoVideoUrl ? 'Meet ' + firstName(data.fullName) : data.business || data.jobTitle}</span>
          {data.photoVideoUrl && (
            <button type="button" className="in5__play" onClick={toggle} aria-label={playing ? 'Pause intro video' : 'Play intro video'}>
              {playing ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
            </button>
          )}
          {data.tagline && <p className="in5__quote">&ldquo;{data.tagline}&rdquo;</p>}
        </div>
        <div>
          <h1 className="fc-name in5__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
          <p className="fc-title" {...el('title')}>{[data.credentials, data.jobTitle, data.address.city].filter(Boolean).join(' · ')}</p>
        </div>
        <MainCta label="Book a free call" />
        {quick.length > 0 && <div className="in5__grid">{quick.map((a) => <a key={a.key} href={a.href} {...ext(a.href)} {...el('btnSecondaryBg')}><span {...el('icons')}>{a.icon}</span><span {...el('btnSecondaryText')}>{a.label}</span></a>)}</div>}
        <SaveBtn variant="secondary" />
        {data.highlights.length > 0 && (
          <section className="fc-sec"><h2 className="fc-eyebrow" {...el('caption')}>{data.highlightsTitle || 'How I help'}</h2>
            <ul className="in5__hl">{data.highlights.map((h) => <li key={h.id} {...el('cardBg')}><span {...el('icons')}><HIcon name={h.icon} size={18} /></span><span><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></span></li>)}</ul></section>
        )}
        <SocialLinks variant="pills" title="" />
      </div>
    </div>
  );
}

/* ================================================================ 4 DUOTONE */
export function Duotone() {
  const { data } = useCard();
  const quick = useQuick(3);
  const [first, ...rest] = (data.fullName || 'Your Name').split(' ');
  return (
    <div className="tpl tpl-dt5">
      <header className="dt5__hero">
        <div className="dt5__ph" {...el('accentDetail')}><Photo className="dt5__img" /><span className="dt5__shade" {...el('heroBand')} /></div>
        <div className="dt5__fade" {...el('pageBg')} />
        <div className="dt5__tags">
          {data.jobTitle && <span className="dt5__tag" {...el('accentDetail')}><span>{data.jobTitle}</span></span>}
          {data.address.city && <span className="dt5__tag dt5__tag--glass">{data.address.city}</span>}
        </div>
        <h1 className="dt5__name" {...el('name')}>{first}{rest.length > 0 && <><br /><span {...el('accentDetail')}>{rest.join(' ')}</span></>}</h1>
      </header>
      <div className="pad stack dt5__body">
        {data.tagline && <p className="dt5__line" {...el('body')}>{data.tagline}</p>}
        <MainCta label="Claim a free session" className="dt5__cta" />
        {quick.length > 0 && <div className="dt5__grid">{quick.map((a) => <a key={a.key} href={a.href} {...ext(a.href)} {...el('btnSecondaryBg')}><span {...el('btnSecondaryText')}>{a.label}</span></a>)}</div>}
        <SaveBtn variant="secondary" />
        {data.highlights.length > 0 && (
          <section className="fc-sec"><h2 className="dt5__h" {...el('name')}>{data.highlightsTitle || 'Programs'}</h2>
            <ol className="dt5__list">{data.highlights.map((h, i) => <li key={h.id} {...el('dividers')}><span className="dt5__n" {...el('accentDetail')}>{String(i + 1).padStart(2, '0')}</span><span><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></span></li>)}</ol></section>
        )}
        <Gallery variant="strip" title="" max={6} />
        <SocialLinks variant="pills" title="" />
      </div>
    </div>
  );
}

/* ================================================================ 5 TRUST BUILDER */
export function Trust() {
  const { data } = useCard();
  const quick = useQuick(2);
  const reviews = useGoogleReviews();
  const creds = (data.credentials || '').split(/[,·|]/).map((x) => x.trim()).filter(Boolean);
  const facts = [
    reviews ? { k: 'Reviews', v: 'Google', star: true } : null,
    data.hours ? { k: 'Hours', v: data.hours.split(',')[0], star: false } : null,
    data.address.city ? { k: 'Serving', v: data.address.city, star: false } : null,
  ].filter(Boolean).slice(0, 3) as { k: string; v: string; star: boolean }[];
  return (
    <div className="tpl tpl-tr5">
      <div className="pad stack tr5__body">
        <section className="tr5__card" {...el('cardBg')}>
          <div className="tr5__id">
            <Photo className="tr5__img" />
            <div>
              {data.business && <p className="tr5__biz" {...el('accentDetail')}>{data.business.toUpperCase()}</p>}
              <h1 className="fc-name tr5__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
              {data.jobTitle && <p className="tr5__role" {...el('caption')}>{data.jobTitle}</p>}
            </div>
          </div>
          {facts.length > 0 && (
            <div className="tr5__facts" {...el('dividers')}>{facts.map((f) => (
              <div key={f.k} {...el('dividers')}><b {...el('body')}>{f.star && <Star size={15} fill="#E8A417" color="#E8A417" aria-hidden />}{f.v}</b><small {...el('caption')}>{f.k}</small></div>))}</div>
          )}
        </section>
        <MainCta label="Get a free estimate" />
        {quick.length > 0 && <div className="tr5__two">{quick.map((a) => <Btn key={a.key} href={a.href} icon={a.icon}>{a.label}</Btn>)}</div>}
        {data.highlights.length > 0 && (
          <section className="tr5__svc" {...el('cardBg')}>
            <h2 className="fc-eyebrow" {...el('caption')}>{data.highlightsTitle || 'Services'}</h2>
            <ul>{data.highlights.map((h) => { const p = priced(h.subtitle); return (
              <li key={h.id} {...el('dividers')}><span {...el('icons')}><Check size={19} strokeWidth={2.4} /></span><span className="tr5__svct"><b {...el('body')}>{h.title}</b>{!p.price && h.subtitle && <small {...el('caption')}>{h.subtitle}</small>}</span>{p.price && <b className="tr5__price" {...el('body')}>{p.price}</b>}</li>); })}</ul>
          </section>
        )}
        {reviews && (
          <a className="tr5__rev" href={reviews} target="_blank" rel="noopener" {...el('cardBg')}>
            <span className="tr5__stars" aria-hidden>{[0, 1, 2, 3, 4].map((i) => <Star key={i} size={16} fill="#E8A417" color="#E8A417" />)}</span>
            <b {...el('body')}>Read our Google reviews</b>
            <small {...el('caption')}>See what neighbors say before you call.</small>
          </a>
        )}
        {creds.length > 0 && <div className="tr5__chips">{creds.map((c) => <span key={c} {...el('iconBg')}><span {...el('icons')}><BadgeCheck size={15} /></span><span {...el('body')}>{c}</span></span>)}</div>}
        <SaveBtn />
        <SocialLinks variant="pills" title="" />
      </div>
    </div>
  );
}

/* ================================================================ 6 LOCAL */
export function Local() {
  const { data } = useCard();
  const where = addressLine(data.address);
  const acts = useContactActions().filter((a) => ['call', 'wa', 'web', 'email'].includes(a.key)).slice(0, 3);
  return (
    <div className="tpl tpl-lc5">
      <div className="lc5__map" {...el('iconBg')} aria-hidden>
        <svg viewBox="0 0 390 340" preserveAspectRatio="xMidYMid slice">
          <path d="M250 -10 C300 40 330 60 400 70 L400 -10 Z" className="lc5__water" />
          <path d="M-10 250 C40 230 70 260 120 250 L130 300 L-10 320 Z" className="lc5__park" />
          <rect x="210" y="190" width="90" height="70" rx="6" className="lc5__park" />
          <g className="lc5__roads">
            <path d="M-10 120 L400 150" strokeWidth="16" /><path d="M150 -10 L130 370" strokeWidth="16" />
            <path d="M-10 200 L400 210" strokeWidth="9" /><path d="M60 -10 L80 370" strokeWidth="9" />
            <path d="M300 -10 L280 370" strokeWidth="9" /><path d="M-10 300 L400 290" strokeWidth="9" /><path d="M200 140 L360 60" strokeWidth="7" />
          </g>
        </svg>
        <span className="lc5__pin" {...el('btnPrimaryBg')}><span className="lc5__pinin">{data.logoUrl ? <Logo /> : <Photo />}</span></span>
      </div>
      {data.hours && <span className="lc5__chip lc5__chip--l"><Clock size={15} aria-hidden />{data.hours.split(',')[0]}</span>}
      {data.address.city && <span className="lc5__chip lc5__chip--r"><MapPin size={15} aria-hidden />{data.address.city}</span>}
      <section className="lc5__sheet" {...el('pageBg')}>
        <div>
          {data.jobTitle && <p className="lc5__kick" {...el('accentDetail')}>{data.jobTitle}</p>}
          <h1 className="fc-name lc5__name" {...el('name')}>{data.business || data.fullName || 'Your Business'}</h1>
          <p className="lc5__who" {...el('caption')}>{[data.business ? data.fullName : '', data.tagline].filter(Boolean).join(' · ')}</p>
        </div>
        <div className="lc5__two">
          {data.hasLocation && where && <Btn variant="primary" href={mapsHref(data.address)} icon={<Navigation size={18} />}>Directions</Btn>}
          {data.bookingUrl && <Btn href={webHref(data.bookingUrl)} className="lc5__dark">Order ahead</Btn>}
        </div>
        <div className="lc5__grid">
          {acts.map((a) => <a key={a.key} href={a.href} {...ext(a.href)} {...el('btnSecondaryBg')}><span {...el('icons')}>{a.icon}</span><span {...el('btnSecondaryText')}>{a.label}</span></a>)}
          <SaveBtn block={false} variant="secondary" label="Save" className="lc5__save" />
        </div>
        {(data.hours || where) && (
          <dl className="lc5__info" {...el('cardBg')}>
            {data.hours && <div {...el('dividers')}><dt {...el('caption')}>Hours</dt><dd {...el('body')}>{data.hours}</dd></div>}
            {data.hasLocation && where && <div {...el('dividers')}><dt {...el('caption')}>Address</dt><dd {...el('body')}>{data.address.street || where}</dd></div>}
          </dl>
        )}
        <Gallery variant="strip" title="" max={6} />
        <SocialLinks variant="pills" title="" />
      </section>
    </div>
  );
}

/* ================================================================ 7 SERVICE MENU */
export function ServiceMenu() {
  const { data } = useCard();
  const call = data.phone ? telHref(data.phone) : '';
  const text = data.whatsapp ? waHref(data.whatsapp, 'Hi, I found your card and have a question.') : data.phone ? `sms:${data.phone.replace(/[^\d+]/g, '')}` : '';
  const cover = data.gallery[0] || data.photoUrl;
  return (
    <div className="tpl tpl-mn5">
      <div className="pad stack mn5__body">
        <header className="mn5__head">
          <span className="mn5__ring" {...el('accentDetail')}><Photo className="mn5__img" /></span>
          <div>
            <h1 className="fc-name mn5__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
            <p className="mn5__role" {...el('caption')}>{[data.jobTitle, data.business].filter(Boolean).join(' · ')}</p>
          </div>
        </header>
        <div className="mn5__row">
          <SaveBtn />
          {call && <Btn href={call} icon={<Phone size={19} />} iconOnly ariaLabel="Call" />}
          {text && <Btn href={text} icon={<Send size={18} />} iconOnly ariaLabel="Message" />}
        </div>
        {data.highlights.length > 0 && (
          <section className="fc-sec">
            <h2 className="mn5__h" {...el('name')}>{data.highlightsTitle || 'Services'}</h2>
            <div className="mn5__cars" tabIndex={0} aria-label="Swipe for more services">
              {data.highlights.map((h, i) => { const p = priced(h.subtitle); return (
                <article key={h.id} className={`mn5__car mn5__car--${i === 0 && cover ? 'photo' : i % 2 ? 'brand' : 'band'}`} {...el(i % 2 ? 'btnPrimaryBg' : 'heroBand')}>
                  {i === 0 && cover && <img src={cover} alt="" loading="lazy" />}
                  <div className="mn5__cart"><b>{h.title}</b><span><span>{p.price ? p.note : h.subtitle}</span>{p.price && <strong>{p.price}</strong>}</span></div>
                </article>); })}
            </div>
          </section>
        )}
        <MainCta label="Book an appointment" />
        {data.hours && <p className="mn5__hours" {...el('caption')}><Clock size={15} aria-hidden /> {data.hours}</p>}
        <SocialLinks variant="pills" title="" />
        <Gallery variant="grid" title="Recent work" max={6} />
      </div>
    </div>
  );
}

/* ================================================================ 8 LIVE STATUS */
export function Status() {
  const { data } = useCard();
  const quick = useQuick(3);
  return (
    <div className="tpl tpl-ls5">
      <div className="ls5__back" {...el('heroBand')}><Photo className="ls5__blur" alt="" /></div>
      <div className="ls5__bar"><span>{data.business}</span>{data.credentials && <span className="ls5__glass">{data.credentials}</span>}</div>
      <div className="pad stack ls5__body">
        <section className="ls5__card" {...el('cardBg')}>
          <Photo className="ls5__av" />
          <span className="ls5__status"><i aria-hidden />{data.kicker || 'Taking new clients'}</span>
          <div>
            <h1 className="fc-name ls5__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
            {data.jobTitle && <p className="ls5__role" {...el('caption')}>{data.jobTitle}</p>}
          </div>
          {(data.hours || data.address.city) && (
            <div className="ls5__tiles">
              {data.hours && <div {...el('iconBg')}><small {...el('caption')}>Hours</small><b {...el('body')}>{data.hours.split(',')[0]}</b></div>}
              {data.address.city && <div {...el('iconBg')}><small {...el('caption')}>Service area</small><b {...el('body')}>{data.address.city}</b></div>}
            </div>
          )}
          <MainCta label="Request a time" />
          {quick.length > 0 && <div className="ls5__grid">{quick.map((a) => <a key={a.key} href={a.href} {...ext(a.href)} {...el('btnSecondaryBg')}><span {...el('btnSecondaryText')}>{a.label}</span></a>)}</div>}
        </section>
        {data.highlights.length > 0 && (
          <section className="fc-sec"><h2 className="fc-eyebrow" {...el('caption')}>{data.highlightsTitle || 'What I do'}</h2>
            <ul className="ls5__chips">{data.highlights.map((h) => <li key={h.id} {...el('cardBg')}><span {...el('icons')}><HIcon name={h.icon} size={15} /></span><span {...el('body')}>{h.title}</span></li>)}</ul></section>
        )}
        {data.tagline && <p className="ls5__note" {...el('caption')}>{data.tagline}</p>}
        <SaveBtn />
        <SocialLinks variant="pills" title="" />
      </div>
    </div>
  );
}

/* ================================================================ 9 CONVERSATION */
export function Chat() {
  const { data, actions } = useCard();
  const [msg, setMsg] = useState('');
  const all = useContactActions();
  const call = all.find((a) => a.key === 'call');
  const email = all.find((a) => a.key === 'email');
  const replies = all.filter((a) => ['book', 'wa', 'web', 'map'].includes(a.key)).slice(0, 3);
  const name = firstName(data.fullName);
  const send = (e: FormEvent) => {
    e.preventDefault();
    const body = msg.trim() || `Hi ${name}, I found your card and have a question.`;
    const href = data.whatsapp ? waHref(data.whatsapp, body) : data.phone ? `sms:${data.phone.replace(/[^\d+]/g, '')}?&body=${encodeURIComponent(body)}` : data.email ? `mailto:${data.email}?body=${encodeURIComponent(body)}` : '';
    if (href) window.open(href, /^https?:/.test(href) ? '_blank' : '_self');
  };
  return (
    <div className="tpl tpl-ch5">
      <header className="ch5__head" {...el('cardBg')}>
        <Photo className="ch5__av" />
        <h1 className="fc-name ch5__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
        <p className="ch5__role" {...el('caption')}>{[data.jobTitle, data.business].filter(Boolean).join(' · ')}</p>
        <div className="ch5__pills">
          {call && <a href={call.href} {...el('iconBg')}><span {...el('icons')}><Phone size={15} /></span><span {...el('body')}>Call</span></a>}
          {email && <a href={email.href} {...el('iconBg')}><span {...el('icons')}>{email.icon}</span><span {...el('body')}>Email</span></a>}
          <button type="button" onClick={actions.save} className="ch5__savep" {...el('btnPrimaryBg')}><span {...el('btnPrimaryText')}>Save contact</span></button>
        </div>
      </header>
      <div className="ch5__thread" aria-label={`Messages from ${name}`}>
        <p className="ch5__day" {...el('caption')}>TODAY</p>
        <p className="ch5__in" {...el('iconBg')}><span {...el('body')}>Hi, I'm {name}.{data.jobTitle ? ` ${data.jobTitle}${data.business ? ` at ${data.business}` : ''}.` : ''}</span></p>
        {data.tagline && <p className="ch5__in ch5__in--next" {...el('iconBg')}><span {...el('body')}>{data.tagline}</span></p>}
        {data.highlights.length > 0 && (
          <div className="ch5__in ch5__in--next ch5__list" {...el('iconBg')}>
            <span {...el('body')}>{data.highlightsTitle || 'What I can help with'}:</span>
            <ul>{data.highlights.slice(0, 4).map((h) => <li key={h.id} {...el('body')}>{h.title}</li>)}</ul>
          </div>
        )}
        <p className="ch5__out" {...el('btnPrimaryBg')}><span {...el('btnPrimaryText')}>How do I get started?</span></p>
        {data.bookingUrl ? (
          <a className="ch5__booking" href={webHref(data.bookingUrl)} target="_blank" rel="noopener" {...el('cardBg')}>
            <span className="ch5__bk" {...el('heroBand')}><span>Book a time with {name}</span></span>
            <span className="ch5__bkf"><small {...el('caption')}>Pick a time that works for you</small><b {...el('links')}>Book</b></span>
          </a>
        ) : (
          <p className="ch5__in" {...el('iconBg')}><span {...el('body')}>Send me a message below or call any time.</span></p>
        )}
      </div>
      <form className="ch5__compose" onSubmit={send} {...el('cardBg')}>
        {replies.length > 0 && <div className="ch5__quick">{replies.map((r) => <a key={r.key} href={r.href} {...ext(r.href)} {...el('btnPrimaryBg')}><span {...el('btnPrimaryText')}>{r.key === 'book' ? 'Book now' : r.key === 'wa' ? 'WhatsApp' : r.label}</span></a>)}</div>}
        <div className="ch5__bar">
          <label className="ch5__sr" htmlFor="ch5-msg">Message {name}</label>
          <input id="ch5-msg" value={msg} onChange={(e) => setMsg(e.target.value)} placeholder={`Message ${name}`} {...el('iconBg')} />
          <button type="submit" aria-label="Send message" {...el('btnPrimaryBg')}><span {...el('btnPrimaryText')}><Send size={18} /></span></button>
        </div>
      </form>
    </div>
  );
}

