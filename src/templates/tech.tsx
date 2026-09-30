import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { HIcon, Photo, Logo, el, useCard, useContactActions, BrandGlyph, Gallery } from './blocks';
import { NETWORK_BY_ID, socialUrl } from '../lib/socials';
import { hexToRgb } from '../lib/color';
import { prettyUrl } from '../lib/links';

/* ==================================================================
   TECH: "Mainframe"
   Layered effects, all driven by theme colors so they recolor live:
   boot sequence, particle network, perspective grid, scanlines,
   cursor spotlight, glitch name, holographic tilt card, typewriter,
   command list with keyboard shortcuts and synth sounds.
   Every effect is skipped under prefers-reduced-motion and in
   thumbnails (still mode).
   ================================================================== */

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function useNeon() {
  const { theme, mode } = useCard();
  const hex = theme.overrides[mode].accentDetail ?? theme.tokens[mode].accent;
  return hexToRgb(hex).join(',');
}

/* ---------------------------------------------------------- particle network */
function Particles() {
  const ref = useRef<HTMLCanvasElement>(null);
  const neon = useNeon();
  const { still } = useCard();
  useEffect(() => {
    const cv = ref.current; if (!cv || still || reduced()) return;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    let w = 0, h = 0, raf = 0, visible = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pts = Array.from({ length: 38 }, () => ({ x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 0.0006, vy: (Math.random() - 0.5) * 0.0006 }));
    const size = () => { const r = cv.getBoundingClientRect(); w = r.width; h = r.height; cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size();
    const ro = new ResizeObserver(size); ro.observe(cv);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }); io.observe(cv);
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;
      }
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], ax = a.x * w, ay = a.y * h;
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j], d = Math.hypot(ax - b.x * w, ay - b.y * h);
          if (d < 110) { ctx.strokeStyle = `rgba(${neon},${0.22 * (1 - d / 110)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(b.x * w, b.y * h); ctx.stroke(); }
        }
        ctx.fillStyle = `rgba(${neon},0.7)`; ctx.beginPath(); ctx.arc(ax, ay, 1.4, 0, Math.PI * 2); ctx.fill();
      }
    };
    tick();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [neon, still]);
  return <canvas ref={ref} className="tx__particles" aria-hidden />;
}

/* ---------------------------------------------------------- boot sequence */
function Boot({ onDone }: { onDone: () => void }) {
  const { data, play } = useCard();
  const lines = [
    '> init card.runtime v2.6',
    `> resolving ${data.slug || 'profile'} ...... ok`,
    '> handshake secure ........... ok',
    `> loading ${data.fullName || 'identity'}`,
  ];
  const [n, setN] = useState(0);
  useEffect(() => {
    play('boot');
    const ts = lines.map((_, i) => window.setTimeout(() => setN(i + 1), 140 + i * 170));
    const end = window.setTimeout(onDone, 140 + lines.length * 170 + 260);
    return () => { ts.forEach(clearTimeout); clearTimeout(end); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="tx__boot" onClick={onDone} role="presentation">
      <pre>{lines.slice(0, n).join('\n')}<span className="tx__caret">_</span></pre>
      <span className="tx__bootbar"><i style={{ width: `${(n / lines.length) * 100}%` }} /></span>
    </div>
  );
}

/* ---------------------------------------------------------- typewriter */
function Typewriter({ words }: { words: string[] }) {
  const { still } = useCard();
  const [txt, setTxt] = useState(words[0] ?? '');
  useEffect(() => {
    if (still || reduced() || words.length === 0) { setTxt(words[0] ?? ''); return; }
    let w = 0, i = 0, del = false, t = 0;
    const step = () => {
      const word = words[w];
      i += del ? -1 : 1;
      setTxt(word.slice(0, i));
      let wait = del ? 28 : 55;
      if (!del && i === word.length) { del = true; wait = 1800; }
      else if (del && i === 0) { del = false; w = (w + 1) % words.length; wait = 300; }
      t = window.setTimeout(step, wait);
    };
    t = window.setTimeout(step, 900);
    return () => clearTimeout(t);
  }, [words.join('|'), still]); // eslint-disable-line react-hooks/exhaustive-deps
  return <span className="tx__type">{txt}<span className="tx__caret">|</span></span>;
}

/* ---------------------------------------------------------- clock */
function Clock() {
  const [t, setT] = useState(() => new Date());
  useEffect(() => { const i = window.setInterval(() => setT(new Date()), 1000); return () => clearInterval(i); }, []);
  return <span>{t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>;
}

/* ---------------------------------------------------------- layout */
export function Tech() {
  const { data, actions, play, still } = useCard();
  const acts = useContactActions();
  const [booted, setBooted] = useState(() => still || reduced() || sessionStorage.getItem(`fc.boot.${data.slug}`) === '1');
  const [tilt, setTilt] = useState({ x: 0, y: 0, gx: 50, gy: 50 });
  const [spot, setSpot] = useState({ x: 50, y: 20 });
  const [glitch, setGlitch] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  const done = () => { setBooted(true); try { sessionStorage.setItem(`fc.boot.${data.slug}`, '1'); } catch { /* ignore */ } };

  // Periodic glitch burst on the name.
  useEffect(() => {
    if (still || reduced()) return;
    let t = 0;
    const loop = () => { setGlitch(true); window.setTimeout(() => setGlitch(false), 380); t = window.setTimeout(loop, 4200 + Math.random() * 3000); };
    t = window.setTimeout(loop, 2200);
    return () => clearTimeout(t);
  }, [still]);

  // Keyboard shortcuts on the live card (desktop visitors).
  const commands = [
    { key: 'S', label: 'save_contact', run: actions.save },
    ...acts.map((a) => ({ key: ({ call: 'C', wa: 'W', book: 'B', email: 'E', map: 'D', web: 'O' } as Record<string, string>)[a.key] ?? '', label: ({ call: 'call', wa: 'whatsapp', book: 'book_session', email: 'send_email', map: 'directions', web: 'open_site' } as Record<string, string>)[a.key] ?? a.key, href: a.href, sub: a.sub })),
    { key: 'X', label: 'share_card', run: actions.share },
    { key: 'Q', label: 'show_qr', run: actions.qr },
  ];
  useEffect(() => {
    if (still) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement).tagName; if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const cmd = commands.find((c) => c.key && c.key.toLowerCase() === e.key.toLowerCase());
      if (!cmd) return;
      play('tap');
      if ('run' in cmd && cmd.run) cmd.run();
      else if ('href' in cmd && cmd.href) window.open(cmd.href, /^https?:/.test(cmd.href) ? '_blank' : '_self');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const onMove = (e: PointerEvent) => {
    if (still || reduced()) return;
    const r = root.current?.getBoundingClientRect(); if (!r) return;
    setSpot({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };
  const onTilt = (e: PointerEvent<HTMLDivElement>) => {
    if (still || reduced()) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    setTilt({ x: (0.5 - py) * 14, y: (px - 0.5) * 18, gx: px * 100, gy: py * 100 });
  };

  const words = [data.jobTitle, data.tagline, ...data.highlights.map((h) => h.title)].filter(Boolean) as string[];
  const links = data.socials.filter((s) => socialUrl(s.network, s.value));

  return (
    <div
      ref={root}
      className={`tpl tpl-tx ${booted ? 'is-on' : 'is-booting'} ${still ? 'is-still' : ''}`}
      onPointerMove={onMove}
      style={{ '--spot-x': `${spot.x}%`, '--spot-y': `${spot.y}%` } as CSSProperties}
    >
      <div className="tx__grid" aria-hidden />
      <Particles />
      <div className="tx__spot" aria-hidden />
      <div className="tx__scan" aria-hidden />
      {!booted && <Boot onDone={done} />}

      <header className="tx__bar" {...el('dividers')}>
        <span className="tx__status"><i /> ONLINE</span>
        <span className="tx__id">ID/{(data.slug || 'card').toUpperCase().slice(0, 18)}</span>
        {!still && <span className="tx__clock"><Clock /></span>}
      </header>

      <div className="pad stack">
        <div
          className="tx__holo" {...el('cardBg')}
          onPointerMove={onTilt}
          onPointerLeave={() => setTilt({ x: 0, y: 0, gx: 50, gy: 50 })}
          style={{ transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, '--gx': `${tilt.gx}%`, '--gy': `${tilt.gy}%` } as CSSProperties}
        >
          <span className="tx__corner tl" /><span className="tx__corner tr" /><span className="tx__corner bl" /><span className="tx__corner br" />
          <div className="tx__photo">
            <Photo className="tx__img" />
            <span className="tx__sweep" aria-hidden />
            <span className="tx__reticle" aria-hidden />
          </div>
          <div className="tx__who">
            <Logo className="tx__logo" />
            <h1 className={`tx__name ${glitch ? 'glitch' : ''}`} data-text={data.fullName || 'Your Name'} {...el('name')}>{data.fullName || 'Your Name'}</h1>
            <p className="tx__role" {...el('accentDetail')}><span className="tx__prompt">&gt;</span> <Typewriter words={words.length ? words : ['Your role']} /></p>
            {data.business && <p className="tx__org" {...el('caption')}>{data.business}</p>}
          </div>
          <span className="tx__holofoil" aria-hidden />
        </div>

        <nav className="tx__cmds" aria-label="Actions">
          {commands.map((c, i) => {
            const inner = (
              <>
                <span className="tx__idx" {...el('caption')}>{String(i).padStart(2, '0')}</span>
                <span className="tx__cmd"><span className="tx__prompt">$</span> {c.label}()</span>
                {'sub' in c && c.sub && <small className="tx__sub" {...el('caption')}>{c.sub}</small>}
                {c.key && <kbd className="tx__kbd">{c.key}</kbd>}
              </>
            );
            const cls = `tx__row ${i === 0 ? 'is-primary' : ''}`;
            return 'run' in c && c.run
              ? <button key={c.label} type="button" className={cls} onClick={c.run} onPointerEnter={() => play('hover')} {...el(i === 0 ? 'accentDetail' : 'btnSecondaryBg')}>{inner}</button>
              : <a key={c.label} className={cls} href={(c as { href: string }).href} {...(/^https?:/.test((c as { href: string }).href) ? { target: '_blank', rel: 'noopener' } : {})} onPointerEnter={() => play('hover')} {...el('btnSecondaryBg')}>{inner}</a>;
          })}
        </nav>

        {data.highlights.length > 0 && (
          <section className="fc-sec">
            <h2 className="tx__h" {...el('caption')}>// {data.highlightsTitle || 'modules'}</h2>
            <div className="tx__mods">
              {data.highlights.map((h, i) => (
                <article key={h.id} className="tx__mod" {...el('cardBg')} style={{ animationDelay: `${0.15 + i * 0.08}s` }}>
                  <span className="tx__hex" {...el('icons')}><HIcon name={h.icon} size={20} /></span>
                  <b {...el('body')}>{h.title}</b>
                  <small {...el('caption')}>{h.subtitle}</small>
                  <span className="tx__live">active</span>
                </article>
              ))}
            </div>
          </section>
        )}

        <Gallery variant="strip" title="// builds" />

        {links.length > 0 && (
          <section className="fc-sec">
            <h2 className="tx__h" {...el('caption')}>// uplinks</h2>
            <ul className="tx__links">
              {links.map((s) => (
                <li key={s.id}>
                  <a href={socialUrl(s.network, s.value)} target="_blank" rel="noopener" onPointerEnter={() => play('hover')} {...el('links')}>
                    <span {...el('icons')}><BrandGlyph network={s.network} size={16} /></span>
                    <span>{NETWORK_BY_ID[s.network]?.label.toLowerCase().replace(/\s+/g, '_')}</span>
                    <span className="tx__url" {...el('caption')}>{prettyUrl(socialUrl(s.network, s.value))}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
        <p className="tx__foot" {...el('caption')}>[ end of transmission ]</p>
      </div>
    </div>
  );
}
