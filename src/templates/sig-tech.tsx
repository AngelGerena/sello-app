import { useEffect, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react';
import {
  Arrow, Btn, CalendarDays, Gallery, HIcon, Logo, Photo, QrBtn, SaveBtn, ShareBtn, SocialLinks, Title, el,
  useCard, useContactActions,
} from './blocks';
import { NETWORK_BY_ID, socialUrl } from '../lib/socials';
import { addressLine, prettyUrl, webHref } from '../lib/links';
import { ensureContrast, mix } from '../lib/color';

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const ext = (h: string) => (/^https?:/.test(h) ? { target: '_blank', rel: 'noopener' } : {});
export const initials = (name: string) => name.split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || 'S';

/** All actions: contact methods plus save, share and QR. */
export function useAllActions() {
  const { actions, play } = useCard();
  const contact = useContactActions();
  return [
    { key: 'save', label: 'Save contact', icon: <HIcon name="user" size={20} />, run: actions.save, href: '', sub: '' },
    ...contact.map((a) => ({ ...a, run: undefined as undefined | (() => void) })),
    { key: 'share', label: 'Share', icon: <HIcon name="chat" size={20} />, run: actions.share, href: '', sub: '' },
    { key: 'qr', label: 'QR code', icon: <HIcon name="star" size={20} />, run: actions.qr, href: '', sub: '' },
  ].map((a) => ({ ...a, hover: () => play('hover') }));
}

export function Act({ a, className, children, elId = 'btnSecondaryBg' }: { a: ReturnType<typeof useAllActions>[number]; className: string; children: ReactNode; elId?: Parameters<typeof el>[0] }) {
  return a.run
    ? <button type="button" className={className} onClick={a.run} onPointerEnter={a.hover} {...el(elId)}>{children}</button>
    : <a className={className} href={a.href} {...ext(a.href)} onPointerEnter={a.hover} {...el(elId)}>{children}</a>;
}

/* ================================================================ 1. QUANTUM */
export function Quantum() {
  const { data } = useCard();
  const acts = useAllActions();
  return (
    <div className="tpl tpl-qu">
      <div className="qu__dust" aria-hidden />
      <div className="qu__stage">
        <div className="qu__orbit o1"><i /></div>
        <div className="qu__orbit o2"><i /></div>
        <div className="qu__orbit o3"><i /></div>
        <div className="qu__core" {...el('accentDetail')}><Photo className="qu__img" /></div>
      </div>
      <div className="pad stack center">
        <h1 className="qu__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
        <Title className="qu__title" />
        {data.business && <p className="qu__biz" {...el('caption')}>{data.business}</p>}
        <div className="qu__grid full">
          {acts.slice(0, 6).map((a) => (
            <Act key={a.key} a={a} className={`qu__tile ${a.key === 'save' ? 'is-primary' : ''}`} elId={a.key === 'save' ? 'btnPrimaryBg' : 'cardBg'}>
              <span className="qu__ic" {...el('icons')}>{a.icon}</span><span className="qu__lbl">{a.label}</span>
            </Act>
          ))}
        </div>
        {data.highlights.length > 0 && (
          <section className="fc-sec full">
            <h2 className="qu__h" {...el('caption')}>{data.highlightsTitle}</h2>
            <ul className="qu__list">{data.highlights.map((h, i) => (
              <li key={h.id} {...el('cardBg')}><span className="qu__idx" {...el('accentDetail')}>{String(i + 1).padStart(2, '0')}</span><span><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></span></li>
            ))}</ul>
          </section>
        )}
        <div className="full"><Gallery variant="strip" /></div>
        <div className="full"><SocialLinks variant="icons" title="" /></div>
      </div>
    </div>
  );
}

/* ================================================================ 2. TERMINAL */
/** Phosphor palette for the Terminal screen. Every text color is derived from the glow color
    and pushed until it reads clearly on the dark screen (WCAG AA or better). Owner overrides still win. */
function usePhosphor(): CSSProperties {
  const { theme } = useCard();
  const o = theme.overrides.dark;
  const t = theme.tokens.dark;
  const screen = o.pageBg ?? mix(t.bg, '#000000', 0.35);
  const glow = ensureContrast(o.accentDetail ?? t.accent, screen, 7);
  return {
    '--c-pageBg': screen,
    '--c-cardBg': o.cardBg ?? mix(screen, glow, 0.06),
    '--c-accentDetail': glow,
    '--c-name': o.name ?? ensureContrast(mix(glow, '#FFFFFF', 0.45), screen, 12),
    '--c-body': o.body ?? ensureContrast(mix(glow, '#FFFFFF', 0.2), screen, 9),
    '--c-caption': o.caption ?? ensureContrast(mix(glow, screen, 0.3), screen, 5),
    '--c-links': o.links ?? glow,
    '--c-dividers': o.dividers ?? mix(glow, screen, 0.7),
    '--c-onAccent': screen,
  } as CSSProperties;
}

export function Terminal() {
  const { data, still } = useCard();
  const phosphor = usePhosphor();
  const acts = useAllActions();
  const user = (data.slug || 'guest').split('-')[0];
  const lines: { cmd: string; out: ReactNode }[] = [
    { cmd: 'whoami', out: <span className="te__big" {...el('name')}>{data.fullName || 'Your Name'}</span> },
    { cmd: 'cat role.txt', out: <span {...el('body')}>{[data.credentials, data.jobTitle].filter(Boolean).join(' / ')}{data.business ? ` @ ${data.business}` : ''}</span> },
  ];
  if (data.tagline) lines.push({ cmd: 'echo $MOTTO', out: <span {...el('caption')}>"{data.tagline}"</span> });
  const [shown, setShown] = useState(still || reduced() ? 99 : 0);
  useEffect(() => {
    if (still || reduced()) return;
    const t = window.setInterval(() => setShown((n) => (n >= 6 ? (window.clearInterval(t), n) : n + 1)), 420);
    return () => window.clearInterval(t);
  }, [still]);
  return (
    <div className="tpl tpl-te" style={phosphor}>
      <div className="te__crt">
        <div className="te__bar"><i /><i /><i /><span>{user}@sello: ~</span></div>
        <div className="te__screen">
          <div className="te__row">
            <div className="te__photo"><Photo className="te__img" /><span className="te__photoscan" /></div>
            <pre className="te__ascii" aria-hidden>{`  _____\n / ${initials(data.fullName).padEnd(2)}  \\\n|  ::  |\n \\_____/`}</pre>
          </div>
          {lines.map((l, i) => i < shown && (
            <div key={l.cmd} className="te__line">
              <p className="te__cmd"><span className="te__ps">{user}@sello:~$</span> <span className="te__typed">{l.cmd}</span></p>
              <p className="te__out">{l.out}</p>
            </div>
          ))}
          {shown > lines.length && (
            <div className="te__line">
              <p className="te__cmd"><span className="te__ps">{user}@sello:~$</span> <span className="te__typed">ls ./contact</span></p>
              <div className="te__ls">
                {acts.map((a) => <Act key={a.key} a={a} className={`te__item ${a.key === 'save' ? 'is-primary' : ''}`} elId={a.key === 'save' ? 'btnPrimaryBg' : 'links'}>{a.key === 'save' ? './save_contact.vcf' : `${a.label.toLowerCase().replace(/\s+/g, '_')}${a.key === 'web' || a.key === 'map' ? '/' : ''}`}</Act>)}
              </div>
            </div>
          )}
          {shown > lines.length + 1 && data.highlights.length > 0 && (
            <div className="te__line">
              <p className="te__cmd"><span className="te__ps">{user}@sello:~$</span> <span className="te__typed">./services --list</span></p>
              <ul className="te__svc">{data.highlights.map((h) => <li key={h.id}><span {...el('accentDetail')}>[+]</span> <b {...el('body')}>{h.title}</b> <small {...el('caption')}>{h.subtitle}</small></li>)}</ul>
            </div>
          )}
          {shown > lines.length + 2 && data.socials.length > 0 && (
            <div className="te__line">
              <p className="te__cmd"><span className="te__ps">{user}@sello:~$</span> <span className="te__typed">open --links</span></p>
              <div className="te__ls">{data.socials.map((s) => socialUrl(s.network, s.value) && <a key={s.id} className="te__item" href={socialUrl(s.network, s.value)} target="_blank" rel="noopener" {...el('links')}>{NETWORK_BY_ID[s.network]?.label.toLowerCase().replace(/\s+/g, '_')}</a>)}</div>
            </div>
          )}
          <p className="te__cmd"><span className="te__ps">{user}@sello:~$</span> <span className="te__cursor" /></p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================ 3. NEON DISTRICT (cyberpunk) */
export function Cyber() {
  const { data } = useCard();
  const acts = useAllActions();
  return (
    <div className="tpl tpl-cy">
      <div className="cy__rain" aria-hidden>{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i * 0.23) % 2}s`, animationDuration: `${0.9 + ((i * 7) % 10) / 10}s` }} />)}</div>
      <header className="cy__head">
        <span className="cy__tag" {...el('accentDetail')}>// {(data.business || 'independent').toUpperCase()}</span>
        <Logo className="cy__logo" />
      </header>
      <div className="pad stack">
        <div className="cy__hero">
          <div className="cy__frame" {...el('accentDetail')}><Photo className="cy__img" /></div>
          <div className="cy__id">
            <h1 className="cy__name" data-text={data.fullName || 'Your Name'} {...el('name')}>{data.fullName || 'Your Name'}</h1>
            <Title className="cy__role" />
            <span className="cy__status"><i /> available</span>
          </div>
        </div>
        {data.tagline && <p className="cy__quote" {...el('body')}>{data.tagline}</p>}
        <div className="cy__acts">
          {acts.map((a, i) => (
            <Act key={a.key} a={a} className={`cy__act ${i === 0 ? 'is-primary' : ''}`} elId={i === 0 ? 'accentDetail' : 'cardBg'}>
              <span className="cy__n">{String(i).padStart(2, '0')}</span><span className="cy__ic" {...el('icons')}>{a.icon}</span><span className="cy__l">{a.label}</span>
            </Act>
          ))}
        </div>
        {data.highlights.length > 0 && (
          <div className="cy__svc">{data.highlights.map((h) => (
            <article key={h.id} {...el('cardBg')}><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></article>
          ))}</div>
        )}
        <Gallery variant="strip" />
        <SocialLinks variant="pills" title="" />
      </div>
    </div>
  );
}

/* ================================================================ 4. AURORA */
export function Aurora() {
  const { data, still } = useCard();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (still || reduced()) return;
    const r = e.currentTarget.getBoundingClientRect();
    setTilt({ x: ((e.clientX - r.left) / r.width - 0.5) * 16, y: ((e.clientY - r.top) / r.height - 0.5) * 16 });
  };
  return (
    <div className="tpl tpl-au" onPointerMove={onMove} onPointerLeave={() => setTilt({ x: 0, y: 0 })}>
      <div className="au__sky" aria-hidden><i className="b1" /><i className="b2" /><i className="b3" /><i className="b4" /></div>
      <div className="pad stack center">
        <div className="au__orb" style={{ transform: `translate(${tilt.x}px, ${tilt.y}px)` } as CSSProperties}><Photo className="au__img" /></div>
        <div className="au__panel full" {...el('cardBg')} style={{ transform: `translate(${-tilt.x * 0.4}px, ${-tilt.y * 0.4}px)` }}>
          <Logo className="au__logo" />
          <h1 className="au__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
          <Title className="au__title" />
          {data.tagline && <p className="au__tag" {...el('caption')}>{data.tagline}</p>}
          <div className="stack-sm">
            <SaveBtn />
            {data.bookingUrl && <Btn block href={webHref(data.bookingUrl)} icon={<CalendarDays size={18} />}>Book time with me</Btn>}
            <div className="row"><ShareBtn className="grow" /><QrBtn className="grow" /></div>
          </div>
        </div>
        {data.highlights.length > 0 && (
          <div className="au__chips full">{data.highlights.map((h) => (
            <span key={h.id} className="au__chip" {...el('cardBg')}><span {...el('icons')}><HIcon name={h.icon} size={16} /></span><span {...el('body')}>{h.title}</span></span>
          ))}</div>
        )}
        <div className="full"><Gallery variant="strip" /></div>
        <div className="full au__glass" {...el('cardBg')}><SocialLinks variant="rows" title="Elsewhere" /></div>
      </div>
    </div>
  );
}

/* ================================================================ 5. RADAR */
export function Radar() {
  const { data } = useCard();
  const acts = useAllActions().filter((a) => a.key !== 'qr').slice(0, 6);
  const spots = [[0.72, 0.28], [0.3, 0.22], [0.2, 0.62], [0.62, 0.74], [0.82, 0.55], [0.44, 0.84]];
  return (
    <div className="tpl tpl-ra">
      <header className="ra__bar"><span className="ra__live"><i /> SCANNING</span><span>{data.business ? data.business.toUpperCase() : 'CONTACT RADAR'}</span></header>
      <div className="pad stack center">
        <div className="ra__scope" {...el('dividers')}>
          <span className="ra__ring r1" /><span className="ra__ring r2" /><span className="ra__ring r3" />
          <span className="ra__cross" />
          <span className="ra__sweep" />
          <div className="ra__center"><Photo className="ra__img" /></div>
          {acts.map((a, i) => (
            <Act key={a.key} a={a} className="ra__blip" elId="accentDetail">
              <span className="ra__dot" style={{ animationDelay: `${(Math.atan2(spots[i][1] - 0.5, spots[i][0] - 0.5) / (2 * Math.PI) + 1.25) % 1 * 4}s` } as CSSProperties} />
              <span className="ra__lbl" {...el('body')}>{a.label}</span>
            </Act>
          )).map((node, i) => <span key={i} className="ra__pos" style={{ left: `${spots[i][0] * 100}%`, top: `${spots[i][1] * 100}%` }}>{node}</span>)}
        </div>
        <h1 className="ra__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
        <Title className="ra__title" />
        <div className="ra__tele full" {...el('cardBg')}>
          <p><span {...el('caption')}>CALLSIGN</span><b {...el('body')}>{(data.slug || 'unit').toUpperCase()}</b></p>
          <p><span {...el('caption')}>SECTOR</span><b {...el('body')}>{data.address.city ? `${data.address.city}${data.address.region ? ', ' + data.address.region : ''}` : 'Remote'}</b></p>
          <p><span {...el('caption')}>STATUS</span><b className="ra__ok">ONLINE</b></p>
        </div>
        {data.highlights.length > 0 && <ul className="ra__svc full">{data.highlights.map((h) => <li key={h.id} {...el('dividers')}><span {...el('icons')}><HIcon name={h.icon} size={18} /></span><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></li>)}</ul>}
        <div className="row full"><SaveBtn /><QrBtn iconOnly /></div>
        <div className="full"><SocialLinks variant="pills" title="" /></div>
      </div>
    </div>
  );
}

/* ================================================================ 6. CIRCUIT */
export function Circuit() {
  const { data } = useCard();
  const acts = useAllActions();
  return (
    <div className="tpl tpl-ci">
      <div className="ci__board" aria-hidden />
      <div className="pad stack">
        <div className="ci__chip" {...el('cardBg')}>
          <span className="ci__pins top" /><span className="ci__pins bottom" /><span className="ci__pins left" /><span className="ci__pins right" />
          <Photo className="ci__img" />
          <div className="ci__label">
            <span className="ci__part" {...el('accentDetail')}>{(data.slug || 'SELLO').toUpperCase().slice(0, 10)}-01</span>
            <h1 className="ci__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
            <Title />
          </div>
        </div>
        <div className="ci__bus">
          <span className="ci__trace" aria-hidden><i /></span>
          {acts.map((a, i) => (
            <Act key={a.key} a={a} className={`ci__pad ${i === 0 ? 'is-primary' : ''}`} elId={i === 0 ? 'btnPrimaryBg' : 'cardBg'}>
              <span className="ci__via" aria-hidden />
              <span className="ci__ic" {...el('icons')}>{a.icon}</span>
              <span className="ci__txt"><b>{a.label}</b>{a.sub && <small {...el('caption')}>{a.sub}</small>}</span>
              <span className="ci__pin" {...el('caption')}>P{String(i + 1).padStart(2, '0')}</span>
            </Act>
          ))}
        </div>
        {data.highlights.length > 0 && (
          <div className="ci__mods">{data.highlights.map((h) => (
            <article key={h.id} {...el('cardBg')}><span className="ci__led" /><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></article>
          ))}</div>
        )}
        <Gallery variant="grid" max={6} />
        <SocialLinks variant="icons" title="" />
      </div>
    </div>
  );
}

/* ================================================================ 7. BLUEPRINT */
export function Blueprint() {
  const { data } = useCard();
  const acts = useAllActions();
  const today = new Date().toLocaleDateString(undefined, { month: 'short', year: 'numeric' }).toUpperCase();
  return (
    <div className="tpl tpl-bp">
      <div className="pad stack">
        <div className="bp__sheet" {...el('heroBand')}>
          <svg className="bp__draw" viewBox="0 0 320 260" aria-hidden>
            <rect x="60" y="30" width="200" height="200" rx="4" />
            <line x1="40" y1="30" x2="40" y2="230" /><line x1="34" y1="30" x2="46" y2="30" /><line x1="34" y1="230" x2="46" y2="230" />
            <line x1="60" y1="248" x2="260" y2="248" /><line x1="60" y1="242" x2="60" y2="254" /><line x1="260" y1="242" x2="260" y2="254" />
            <circle cx="160" cy="130" r="118" strokeDasharray="4 6" />
            <line x1="160" y1="4" x2="160" y2="30" /><line x1="286" y1="130" x2="260" y2="130" />
          </svg>
          <span className="bp__dim v">200</span><span className="bp__dim h">200</span>
          <div className="bp__photo"><Photo className="bp__img" /></div>
          <span className="bp__note">DETAIL A · PORTRAIT</span>
        </div>
        <div className="bp__block" {...el('cardBg')}>
          <div className="bp__cell wide"><small {...el('caption')}>NAME</small><b className="bp__name" {...el('name')}>{data.fullName || 'Your Name'}</b></div>
          <div className="bp__cell"><small {...el('caption')}>TITLE</small><b {...el('body')}>{data.jobTitle || 'Title'}</b></div>
          <div className="bp__cell"><small {...el('caption')}>FIRM</small><b {...el('body')}>{data.business || 'Studio'}</b></div>
          <div className="bp__cell"><small {...el('caption')}>LOCATION</small><b {...el('body')}>{data.address.city || 'Remote'}</b></div>
          <div className="bp__cell"><small {...el('caption')}>SHEET</small><b {...el('body')}>1 OF 1 · {today}</b></div>
        </div>
        <div className="bp__acts">{acts.map((a, i) => (
          <Act key={a.key} a={a} className={`bp__act ${i === 0 ? 'is-primary' : ''}`} elId={i === 0 ? 'btnPrimaryBg' : 'cardBg'}>
            <span className="bp__code" {...el('accentDetail')}>A-{String(i + 1).padStart(2, '0')}</span><span className="bp__l">{a.label}</span><Arrow size={16} />
          </Act>
        ))}</div>
        {data.highlights.length > 0 && (
          <section className="fc-sec">
            <h2 className="bp__h" {...el('caption')}>SPECIFICATIONS</h2>
            <ul className="bp__spec">{data.highlights.map((h, i) => <li key={h.id} {...el('dividers')}><span {...el('accentDetail')}>S-{String(i + 1).padStart(2, '0')}</span><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></li>)}</ul>
          </section>
        )}
        <Gallery variant="grid" max={6} title="Recent work" />
        {data.hasLocation && addressLine(data.address) && <p className="bp__foot" {...el('caption')}>{addressLine(data.address)}{data.website ? ` · ${prettyUrl(data.website)}` : ''}</p>}
        <SocialLinks variant="text" title="" />
      </div>
    </div>
  );
}

