import { useEffect, useState, type CSSProperties } from 'react';
import {
  Gallery, HIcon, Hours, LocationCard, Logo, Photo, QrBtn, SaveBtn, ShareBtn, SocialLinks, Title, el, useCard,
} from './blocks';
import { BookRow, PriceList, priced } from './sig2-a';
import { initials } from './sig-tech';

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function Tail({ gallery = 'Fresh work' }: { gallery?: string }) {
  return (
    <>
      <div className="full"><Gallery variant="grid" title={gallery} max={6} /></div>
      <div className="full"><Hours /></div>
      <div className="row full"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
      <div className="full"><LocationCard /></div>
      <div className="full"><SocialLinks variant="pills" title="" /></div>
    </>
  );
}

/* ================================================================ BARBER 1: STRAIGHT RAZOR */
export function Razor() {
  const { data } = useCard();
  return (
    <div className="tpl tpl-rz">
      <div className="pad stack center">
        <div className="rz__razor" aria-hidden>
          <span className="rz__handle" />
          <span className="rz__blade"><i /></span>
          <span className="rz__pin" />
        </div>
        <Logo className="rz__logo" />
        <h1 className="rz__name" {...el('name')}>{data.business || data.fullName || 'Barber Shop'}</h1>
        {data.tagline && <p className="rz__tag" {...el('caption')}>{data.tagline}</p>}
        <div className="rz__barber full"><Photo className="rz__img" /><div><b {...el('body')}>{data.fullName}</b><Title withCreds={false} /></div></div>
        <div className="full"><BookRow label="Book a cut" /></div>
        <section className="rz__plate full" {...el('cardBg')}>
          <h2 className="rz__h" {...el('name')}>{data.highlightsTitle || 'Services'}</h2>
          <ul>{data.highlights.map((h) => { const p = priced(h.subtitle); return (
            <li key={h.id}><span className="rz__row"><b {...el('body')}>{h.title}</b><span className="rz__lead" /><span className="rz__price" {...el('accentDetail')}>{p.price}</span></span>{(p.price ? p.note : h.subtitle) && <small {...el('caption')}>{p.price ? p.note : h.subtitle}</small>}</li>
          ); })}</ul>
        </section>
        <Tail gallery="Fresh cuts" />
      </div>
    </div>
  );
}

/* ================================================================ BARBER 2: CHALKBOARD */
export function Chalkboard() {
  const { data } = useCard();
  return (
    <div className="tpl tpl-ch2">
      <div className="pad stack center">
        <section className="ch2__board">
          <span className="ch2__dust" aria-hidden />
          <p className="ch2__small">welcome to</p>
          <h1 className="ch2__name">{data.business || data.fullName || 'The Shop'}</h1>
          <span className="ch2__rule" aria-hidden />
          <ul className="ch2__menu">{data.highlights.map((h) => { const p = priced(h.subtitle); return (
            <li key={h.id}><span>{h.title}</span><span className="ch2__dots" /><span className="ch2__price">{p.price || ''}</span>{(p.price ? p.note : h.subtitle) && <small>{p.price ? p.note : h.subtitle}</small>}</li>
          ); })}</ul>
          {data.hours && <p className="ch2__hours">{data.hours}</p>}
          <span className="ch2__chalk" aria-hidden><i /><i /></span>
        </section>
        <div className="ch2__barber full"><Photo className="ch2__img" /><div><b {...el('body')}>{data.fullName}</b><Title withCreds={false} /></div></div>
        <div className="full"><BookRow label="Save my spot" /></div>
        <div className="full"><Gallery variant="grid" title="Fresh cuts" max={6} /></div>
        <div className="row full"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <div className="full"><LocationCard /></div>
        <div className="full"><SocialLinks variant="pills" title="" /></div>
      </div>
    </div>
  );
}

/* ================================================================ BARBER 3: NEON SIGN */
export function NeonSign() {
  const { data } = useCard();
  return (
    <div className="tpl tpl-nn">
      <div className="nn__wall" aria-hidden />
      <div className="pad stack center">
        <div className="nn__sign">
          <span className="nn__open" {...el('accentDetail')}>OPEN</span>
          <h1 className="nn__name" data-text={data.business || data.fullName || 'Barber'} {...el('name')}>{data.business || data.fullName || 'Barber'}</h1>
          <span className="nn__sub" {...el('accentDetail')}>{(data.tagline || 'Cuts · Fades · Beards').toUpperCase()}</span>
        </div>
        <div className="nn__barber full"><Photo className="nn__img" /><div><b {...el('body')}>{data.fullName}</b><Title withCreds={false} /></div></div>
        <div className="full"><BookRow label="Book the chair" /></div>
        <div className="full"><PriceList className="nn__prices" /></div>
        <Tail gallery="Fresh cuts" />
      </div>
    </div>
  );
}

/* ================================================================ BARBER 4: CLIPPER GUARDS */
export function Clipper() {
  const { data } = useCard();
  const guards = ['0', '½', '1', '2', '3', '4'];
  return (
    <div className="tpl tpl-cl">
      <div className="pad stack">
        <header className="cl__head">
          <div className="cl__clipper" aria-hidden><span className="cl__body" /><span className="cl__teeth" /></div>
          <div className="cl__id">
            <Logo className="cl__logo" />
            <h1 className="cl__name" {...el('name')}>{data.business || data.fullName || 'Barber Shop'}</h1>
            <p {...el('caption')}>{[data.fullName, data.jobTitle].filter(Boolean).join(' · ')}</p>
          </div>
        </header>
        <div className="cl__guards" aria-hidden>{guards.map((g, i) => <span key={g} style={{ '--h': `${30 + i * 12}px`, animationDelay: `${i * 0.08}s` } as CSSProperties} {...el('accentDetail')}><b>#{g}</b></span>)}</div>
        <BookRow label="Book a cut" />
        {data.highlights.length > 0 && (
          <div className="cl__cards">{data.highlights.map((h, i) => { const p = priced(h.subtitle); return (
            <article key={h.id} {...el('cardBg')}><span className="cl__num" {...el('accentDetail')}>#{guards[i % guards.length]}</span><b {...el('body')}>{h.title}</b><small {...el('caption')}>{p.price ? p.note : h.subtitle}</small>{p.price && <span className="cl__price" {...el('accentDetail')}>{p.price}</span>}</article>
          ); })}</div>
        )}
        <Tail gallery="Fresh cuts" />
      </div>
    </div>
  );
}

/* ================================================================ NAILS 1: POLISH BOTTLES */
export function Polish() {
  const { data, theme, mode, play } = useCard();
  const acc = theme.overrides[mode].accentDetail ?? theme.tokens[mode].accent;
  const tints = [acc, `color-mix(in srgb, ${acc} 60%, #7a1f4b)`, `color-mix(in srgb, ${acc} 45%, #fff)`, `color-mix(in srgb, ${acc} 55%, #e8b04a)`, `color-mix(in srgb, ${acc} 50%, #5b3aa0)`, `color-mix(in srgb, ${acc} 35%, #111)`];
  const [shake, setShake] = useState<number | null>(null);
  return (
    <div className="tpl tpl-po2">
      <div className="pad stack center">
        <Logo className="po2__logo" />
        <h1 className="po2__name" {...el('name')}>{data.business || data.fullName || 'Nail Spa'}</h1>
        {data.tagline && <p className="po2__tag" {...el('caption')}>{data.tagline}</p>}
        <div className="po2__shelf">
          {data.highlights.slice(0, 5).map((h, i) => { const p = priced(h.subtitle); return (
            <button key={h.id} type="button" className={`po2__bottle ${shake === i ? 'shake' : ''}`} onClick={() => { setShake(i); play('tap'); window.setTimeout(() => setShake(null), 500); }} aria-label={`${h.title} ${p.price}`}>
              <span className="po2__cap" />
              <span className="po2__glass" style={{ '--polish': tints[i % tints.length] } as CSSProperties}><span className="po2__shine" /></span>
              <span className="po2__tag2"><b>{h.title}</b>{p.price && <small>{p.price}</small>}</span>
            </button>
          ); })}
          <span className="po2__ledge" aria-hidden />
        </div>
        <div className="po2__artist full"><Photo className="po2__img" /><div><b {...el('body')}>{data.fullName}</b><Title withCreds={false} /></div></div>
        <div className="full"><BookRow label="Book your nails" /></div>
        <div className="full"><PriceList /></div>
        <Tail gallery="Recent sets" />
      </div>
    </div>
  );
}

/* ================================================================ NAILS 2: SHIMMER (glitter) */
export function Shimmer() {
  const { data } = useCard();
  const bits = Array.from({ length: 40 }, (_, i) => i);
  return (
    <div className="tpl tpl-sh">
      <div className="sh__glitter" aria-hidden>{bits.map((i) => <i key={i} style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`, animationDelay: `${(i % 10) * 0.3}s`, width: 3 + (i % 4), height: 3 + (i % 4) }} />)}</div>
      <div className="pad stack center">
        <div className="sh__ring"><Photo className="sh__img" /></div>
        <h1 className="sh__name" {...el('name')}>{data.business || data.fullName || 'Nail Studio'}</h1>
        <p className="sh__who" {...el('caption')}>{[data.fullName, data.jobTitle].filter(Boolean).join(' · ')}</p>
        <div className="full"><BookRow label="Book your set" /></div>
        <div className="sh__menu full">{data.highlights.map((h) => { const p = priced(h.subtitle); return (
          <article key={h.id} {...el('cardBg')}><b {...el('body')}>{h.title}</b><small {...el('caption')}>{p.price ? p.note : h.subtitle}</small>{p.price && <span {...el('accentDetail')}>{p.price}</span>}</article>
        ); })}</div>
        <Tail gallery="Recent sets" />
      </div>
    </div>
  );
}

/* ================================================================ NAILS 3: TIP CHART (photos in nail shapes) */
export function Tips() {
  const { data } = useCard();
  const pics = data.gallery.length ? data.gallery.slice(0, 5) : [data.photoUrl, data.photoUrl, data.photoUrl, data.photoUrl, data.photoUrl].filter(Boolean);
  const shapes = ['almond', 'coffin', 'stiletto', 'square', 'oval'];
  return (
    <div className="tpl tpl-tp">
      <div className="pad stack center">
        <Logo className="tp__logo" />
        <h1 className="tp__name" {...el('name')}>{data.business || data.fullName || 'Nail Studio'}</h1>
        {data.tagline && <p className="tp__tag" {...el('accentDetail')}>{data.tagline}</p>}
        <div className="tp__chart">
          {pics.map((src, i) => (
            <figure key={i} className={`tp__nail ${shapes[i % shapes.length]}`} style={{ animationDelay: `${i * 0.1}s` }}>
              {src ? <img src={src} alt="" /> : null}
              <figcaption>{shapes[i % shapes.length]}</figcaption>
            </figure>
          ))}
        </div>
        <div className="tp__artist full"><Photo className="tp__img" /><div><b {...el('body')}>{data.fullName}</b><Title withCreds={false} /></div></div>
        <div className="full"><BookRow label="Book your shape" /></div>
        <div className="full"><PriceList /></div>
        <Tail gallery="Recent sets" />
      </div>
    </div>
  );
}

/* ================================================================ SALON 1: BLOWOUT */
export function Blowout() {
  const { data } = useCard();
  return (
    <div className="tpl tpl-bw">
      <svg className="bw__strands" viewBox="0 0 400 420" preserveAspectRatio="none" aria-hidden>
        {Array.from({ length: 9 }, (_, i) => <path key={i} className="bw__s" style={{ animationDelay: `${i * 0.25}s` }} d={`M-20 ${60 + i * 34} C 100 ${20 + i * 30}, 220 ${140 + i * 26}, 420 ${40 + i * 38}`} />)}
      </svg>
      <div className="pad stack center">
        <div className="bw__photo"><Photo className="bw__img" /></div>
        <p className="bw__biz" {...el('accentDetail')}>{data.business}</p>
        <h1 className="bw__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
        <Title className="bw__title" />
        <div className="full"><BookRow label="Book your blowout" /></div>
        <div className="full"><PriceList /></div>
        <Tail gallery="Recent looks" />
      </div>
    </div>
  );
}

/* ================================================================ SALON 2: STATIONS (salon mirrors) */
export function Stations() {
  const { data } = useCard();
  return (
    <div className="tpl tpl-st2">
      <div className="pad stack center">
        <h1 className="st2__name" {...el('name')}>{data.business || data.fullName || 'Salon'}</h1>
        {data.tagline && <p className="st2__tag" {...el('caption')}>{data.tagline}</p>}
        <div className="st2__row">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`st2__mirror ${i === 1 ? 'main' : ''}`}>
              <span className="st2__lamp" />
              <div className="st2__glass">{i === 1 ? <Photo className="st2__img" /> : data.gallery[i] ? <img src={data.gallery[i]} alt="" className="st2__img" /> : <span className="st2__empty" />}</div>
              <span className="st2__label">{i === 1 ? 'CHAIR 1' : i === 0 ? 'COLOR' : 'STYLE'}</span>
            </div>
          ))}
        </div>
        <p className="st2__who" {...el('body')}><b>{data.fullName}</b> · {data.jobTitle}</p>
        <div className="full"><BookRow label="Book a chair" /></div>
        <div className="st2__menu full">{data.highlights.map((h, i) => { const p = priced(h.subtitle); return (
          <article key={h.id} {...el('cardBg')}><span className="st2__n" {...el('accentDetail')}>0{i + 1}</span><span className="st2__t"><b {...el('body')}>{h.title}</b><small {...el('caption')}>{p.price ? p.note : h.subtitle}</small></span>{p.price && <span className="st2__price" {...el('accentDetail')}>{p.price}</span>}</article>
        ); })}</div>
        <Tail gallery="Recent looks" />
      </div>
    </div>
  );
}

/* ================================================================ SALON 3: COVER STORY (magazine) */
export function Magazine() {
  const { data } = useCard();
  const lines = data.highlights.slice(0, 4);
  return (
    <div className="tpl tpl-mz">
      <section className="mz__cover">
        <Photo className="mz__img" />
        <h1 className="mz__mast" {...el('accentDetail')}>{(data.business || 'Salon').split(' ')[0]}</h1>
        <span className="mz__issue">ISSUE {new Date().getMonth() + 1} · {new Date().getFullYear()}</span>
        <div className="mz__lines">
          {lines.map((h, i) => { const p = priced(h.subtitle); return <p key={h.id} className={`mz__line l${i}`}><b>{h.title}</b><span>{p.price || p.note}</span></p>; })}
        </div>
        <div className="mz__feature"><span>THE STYLIST</span><b>{data.fullName || 'Your Name'}</b></div>
        <span className="mz__bar" aria-hidden />
      </section>
      <div className="pad stack">
        <BookRow label="Book your appointment" />
        <PriceList />
        <Gallery variant="grid" title="Recent looks" max={6} />
        <Hours />
        <div className="row"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <LocationCard />
        <SocialLinks variant="pills" title="" />
      </div>
    </div>
  );
}

/* ================================================================ MASSAGE 1: HOT STONES */
export function Stones() {
  const { data } = useCard();
  return (
    <div className="tpl tpl-hs">
      <div className="pad stack center">
        <div className="hs__cairn" aria-hidden>
          <span className="hs__steam"><i /><i /><i /></span>
          <span className="hs__stone s1" /><span className="hs__stone s2" /><span className="hs__stone s3" /><span className="hs__stone s4" />
          <span className="hs__leaf" />
        </div>
        <h1 className="hs__name" {...el('name')}>{data.business || data.fullName || 'Massage Studio'}</h1>
        {data.tagline && <p className="hs__tag" {...el('caption')}>{data.tagline}</p>}
        <div className="hs__therapist full"><Photo className="hs__img" /><div><b {...el('body')}>{data.fullName}</b><Title /></div></div>
        <div className="full"><BookRow label="Book a massage" /></div>
        <section className="hs__menu full" {...el('cardBg')}>
          <h2 className="hs__h" {...el('name')}>{data.highlightsTitle || 'Treatments'}</h2>
          <ul>{data.highlights.map((h) => <li key={h.id} {...el('dividers')}><span className="hs__dot" {...el('accentDetail')} /><b {...el('body')}>{h.title}</b><span className="hs__time" {...el('caption')}>{h.subtitle}</span></li>)}</ul>
        </section>
        <Tail gallery="The space" />
      </div>
    </div>
  );
}

/* ================================================================ MASSAGE 2: LOTUS (with a breathing guide) */
export function Lotus() {
  const { data, still } = useCard();
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (still || reduced()) return;
    const t = window.setInterval(() => setPhase((p) => (p + 1) % 2), 4000);
    return () => window.clearInterval(t);
  }, [still]);
  return (
    <div className="tpl tpl-lo">
      <div className="pad stack center">
        <div className="lo__pond" aria-hidden>
          <span className="lo__ripple r1" /><span className="lo__ripple r2" /><span className="lo__ripple r3" />
          <svg className="lo__flower" viewBox="0 0 200 140">
            {[-64, -32, 0, 32, 64].map((r, i) => (
              <g key={r} transform={`rotate(${r} 100 120)`}>
                <ellipse className="lo__petal" style={{ animationDelay: `${i * 0.15}s` }} cx="100" cy="82" rx="16" ry="40" />
              </g>
            ))}
            <ellipse cx="100" cy="118" rx="44" ry="10" className="lo__pad" />
          </svg>
        </div>
        <p className="lo__breath" aria-live="polite" {...el('accentDetail')}>{phase === 0 ? 'Breathe in' : 'Breathe out'}</p>
        <h1 className="lo__name" {...el('name')}>{data.business || data.fullName || 'Spa'}</h1>
        <p className="lo__who" {...el('caption')}>{[data.fullName, data.credentials, data.jobTitle].filter(Boolean).join(' · ')}</p>
        <div className="full"><BookRow label="Reserve your session" /></div>
        <div className="lo__menu full">{data.highlights.map((h) => (
          <article key={h.id} {...el('cardBg')}><span {...el('icons')}><HIcon name={h.icon} size={18} /></span><span className="lo__t"><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></span></article>
        ))}</div>
        <div className="lo__therapist full"><Photo className="lo__img" /><p {...el('body')}>{data.tagline}</p></div>
        <Tail gallery="The space" />
      </div>
    </div>
  );
}

/* ================================================================ MASSAGE 3: BAMBOO (zen, shoji panels) */
export function Bamboo() {
  const { data } = useCard();
  return (
    <div className="tpl tpl-bb2">
      <div className="bb2__grove" aria-hidden>{[0, 1, 2].map((i) => <span key={i} className={`bb2__stalk k${i}`}><i /><i /><i /><i /><em /><em /></span>)}</div>
      <div className="pad stack center bb2__body">
        <div className="bb2__photo"><Photo className="bb2__img" /></div>
        <span className="bb2__seal" {...el('accentDetail')}>{initials(data.business || data.fullName)}</span>
        <h1 className="bb2__name" {...el('name')}>{data.business || data.fullName || 'Zen Spa'}</h1>
        <p className="bb2__who" {...el('caption')}>{[data.fullName, data.jobTitle].filter(Boolean).join(' · ')}</p>
        <div className="full"><BookRow label="Book your escape" /></div>
        <div className="bb2__shoji full">{data.highlights.map((h) => (
          <article key={h.id} {...el('cardBg')}><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></article>
        ))}</div>
        {data.tagline && <p className="bb2__tag" {...el('body')}>{data.tagline}</p>}
        <Tail gallery="The space" />
      </div>
    </div>
  );
}
