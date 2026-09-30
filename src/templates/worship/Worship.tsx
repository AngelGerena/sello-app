/* =====================================================================
   Worship collection (7 designs): Santuario HUD, Aurora Celestial, Vitral
   Digital, Frecuencia, Constelacion, Escenario, Salmo OS.
   Ported from the finesse-tap-card engine. The markup mirrors the engine's
   DOM (classes prefixed "w-") so worship-engine.css applies unchanged.
   Always dark. Gold and purple come from the card's own kit colors.
   ===================================================================== */
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useCard } from '../blocks';
import { ensureContrast, mix } from '../../lib/color';
import { NETWORK_BY_ID, socialUrl } from '../../lib/socials';
import { addressLine, mapsHref, prettyUrl, telHref, waHref, webHref } from '../../lib/links';
import type { CardData } from '../../lib/types';

export type SkinId = 'hud' | 'aurora' | 'vitral' | 'wave' | 'cosmos' | 'stage' | 'os';
type Layout = '' | 'rail' | 'float';

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const TXT = '\uFE0E'; // text presentation: symbols never turn into emoji
const short = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);

/* ---------------------------------------------------------------- icons (engine set) */
const S = ({ d, w = 1.8 }: { d: ReactNode; w?: number }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden>{d}</svg>
);
const F = ({ d }: { d: string }) => <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d={d} /></svg>;
const I = {
  phone: <S d={<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />} />,
  whatsapp: <F d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.48 1.34 5L2 22l5.18-1.36a9.9 9.9 0 0 0 4.85 1.24h.01c5.5 0 9.96-4.46 9.96-9.96 0-2.66-1.04-5.16-2.92-7.04A9.9 9.9 0 0 0 12.04 2Zm0 1.82c2.18 0 4.23.85 5.77 2.39a8.1 8.1 0 0 1 2.39 5.76c0 4.5-3.66 8.14-8.16 8.14a8.2 8.2 0 0 1-4.16-1.14l-.3-.18-3.07.8.82-3-.2-.31a8.07 8.07 0 0 1-1.25-4.31c0-4.5 3.66-8.14 8.16-8.14Zm-2.6 4.38c-.14 0-.36.05-.56.27-.19.21-.73.71-.73 1.74s.75 2.02.85 2.16c.11.14 1.45 2.3 3.58 3.16 1.77.72 2.13.58 2.52.54.39-.03 1.24-.5 1.42-1 .18-.49.18-.9.12-1-.05-.09-.19-.14-.4-.25-.21-.1-1.24-.61-1.43-.68-.19-.07-.33-.1-.47.11-.14.21-.54.68-.66.82-.12.14-.24.16-.45.05-.21-.11-.88-.32-1.68-1.04-.62-.55-1.04-1.23-1.16-1.44-.12-.21-.01-.32.09-.43.09-.09.21-.24.32-.36.1-.12.14-.21.21-.35.07-.14.03-.27-.02-.38-.05-.1-.46-1.13-.64-1.55-.17-.41-.34-.35-.47-.36l-.4-.01Z" />,
  mail: <S d={<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>} />,
  globe: <S d={<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>} />,
  pin: <S d={<><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></>} />,
  calendar: <S d={<><rect x="3" y="4.5" width="18" height="16" rx="2" /><path d="M3 9.5h18M8 2.5v4M16 2.5v4" /></>} />,
  music: <S d={<><path d="M9 18V5l11-2v13" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="17.5" cy="16" r="2.5" /></>} />,
  save: <S w={2} d={<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6M22 11h-6" /></>} />,
  check: <S w={2.2} d={<path d="M20 6 9 17l-5-5" />} />,
  share: <S d={<><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" /><path d="m16 6-4-4-4 4M12 2v13" /></>} />,
  qr: <S d={<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3" /></>} />,
  arrow: <S w={2} d={<path d="M7 17 17 7M9 7h8v8" />} />,
  sparkle: <S d={<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.5 2.5M15.2 15.2l2.5 2.5M6.3 17.7l2.5-2.5M15.2 8.8l2.5-2.5" />} />,
  heart: <S d={<path d="M12 20.5s-8-4.6-8-10.4A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 3.1c0 5.8-8 10.4-8 10.4Z" />} />,
};
const STAR_PATH = 'M12 0c.8 6.4 3.6 9.2 12 12-8.4 2.8-11.2 5.6-12 12-.8-6.4-3.6-9.2-12-12C8.4 9.2 11.2 6.4 12 0z';
const Star = () => <svg viewBox="0 0 24 24"><path d={STAR_PATH} /></svg>;
const Brand = ({ network }: { network: string }) => {
  const n = NETWORK_BY_ID[network];
  return n?.path ? <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d={n.path} /></svg> : I.globe;
};

/* ---------------------------------------------------------------- sounds (engine SFX, always on) */
let actx: AudioContext | null = null;
function ctx() {
  if (typeof window === 'undefined') return null;
  if (!actx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    try { const nav = navigator as unknown as { audioSession?: { type: string } }; if (nav.audioSession) nav.audioSession.type = 'playback'; } catch { /* ignore */ }
    actx = new AC();
  }
  if (actx.state === 'suspended') actx.resume();
  return actx;
}
function tone(f: number, dur: number, vol: number, delay = 0, type: OscillatorType = 'sine', to?: number) {
  const c = ctx(); if (!c) return;
  const t = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol * 0.32, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.02);
}
const sparkleSound = () => { [784, 880, 1047, 1175, 1319, 1568, 1760, 2093].forEach((f, i) => tone(f, 0.28, 0.42 - i * 0.035, i * 0.032, 'triangle')); tone(3136, 0.55, 0.07, 0.2); };
const orbSound = () => { tone(523, 0.5, 0.3); tone(784, 0.5, 0.2, 0.04); tone(1046, 0.6, 0.14, 0.08); };

/* ---------------------------------------------------------------- per-skin decor (skin-decor.js) */
function Bg({ skin }: { skin: SkinId }) {
  switch (skin) {
    case 'hud': return <><div className="w-hexgrid" /><div className="w-scan" /></>;
    case 'aurora': return <><div className="w-aur w-a1" /><div className="w-aur w-a2" /><div className="w-aur w-a3" /><div className="w-grain" /></>;
    case 'vitral': return (
      <svg className="w-circuit" viewBox="0 0 400 900" preserveAspectRatio="xMidYMid slice">
        <g fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M20 0v120h60l30 30v160" /><path d="M380 0v90h-50l-40 40v220" /><path d="M0 420h70l30 30h60" /><path d="M400 520h-90l-30-30h-50" />
          <path d="M40 900V720l40-40h70" /><path d="M360 900V760l-30-30h-80" /><path d="M200 0v60" /><path d="M200 900v-80" />
        </g>
        <g fill="currentColor"><circle cx="110" cy="310" r="3" /><circle cx="290" cy="350" r="3" /><circle cx="160" cy="450" r="3" /><circle cx="230" cy="490" r="3" /><circle cx="150" cy="680" r="3" /><circle cx="250" cy="730" r="3" /></g>
      </svg>
    );
    case 'wave': return <div className="w-spectrum">{Array.from({ length: 28 }, (_, i) => <i key={i} />)}</div>;
    case 'cosmos': return (
      <>
        <div className="w-stars w-s1" /><div className="w-stars w-s2" />
        <svg className="w-constel" viewBox="0 0 300 120">
          <g fill="none" stroke="currentColor" strokeWidth=".8"><path d="M40 95 L70 40 L110 78 L150 20 L190 78 L230 40 L260 95 Z" /><path d="M40 95 L260 95" /></g>
          <g fill="currentColor"><circle cx="40" cy="95" r="2.2" /><circle cx="70" cy="40" r="2.6" /><circle cx="110" cy="78" r="2" /><circle cx="150" cy="20" r="3.2" /><circle cx="190" cy="78" r="2" /><circle cx="230" cy="40" r="2.6" /><circle cx="260" cy="95" r="2.2" /></g>
        </svg>
      </>
    );
    case 'stage': return <><div className="w-beam w-b1" /><div className="w-beam w-b2" /><div className="w-beam w-b3" /><div className="w-haze" /></>;
    case 'os': return <div className="w-crt" />;
  }
}
function HeroDecor({ skin, data }: { skin: SkinId; data: CardData }) {
  const code = String((data.fullName || data.business || 'x').split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 9999, 7)).padStart(4, '0');
  switch (skin) {
    case 'hud': return (
      <>
        <span className="w-br w-tl" /><span className="w-br w-tr" /><span className="w-br w-bl" /><span className="w-br w-br2" /><span className="w-sweep" />
        <span className="w-hud-tag w-t1">ID · {code}</span><span className="w-hud-tag w-t2">{short((data.jobTitle.split('|')[0] || 'Worship').trim(), 16).toUpperCase()} ●{TXT} ONLINE</span>
      </>
    );
    case 'aurora': return <span className="w-halo" />;
    case 'vitral': return <><span className="w-lead" /><span className="w-facets" /></>;
    case 'wave': return <span className="w-rec"><b />LIVE</span>;
    case 'cosmos': return <><span className="w-orbit w-o1"><i /></span><span className="w-orbit w-o2"><i /></span></>;
    case 'stage': return <span className="w-fade" />;
    case 'os': return <><span className="w-os-bar"><i /><i /><i /><b>{short(((data.jobTitle.split('|')[0] || data.fullName.split(' ')[0] || 'card').trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]+/g, '') || 'card'), 14)}.exe</b></span><span className="w-pix" /></>;
  }
}
function defaultKicker(skin: SkinId, d: CardData) {
  const role = (d.jobTitle.split('|')[0] || '').trim();
  switch (skin) {
    case 'hud': return `[ ${role || 'Worship'} ] // ${d.business || d.fullName}`.toUpperCase();
    case 'aurora': return 'Worship · In Spirit and in Truth';
    case 'vitral': return `✚${TXT} ${d.business || 'Worship Ministry'} ✚${TXT}`;
    case 'wave': return `Now playing · ${d.music?.title || d.business || d.fullName}`;
    case 'cosmos': return 'The heavens declare the glory of God · Ps 19:1';
    case 'stage': return `●${TXT} Live · ${role || 'Worship'}`;
    case 'os': return '> starting worship…';
  }
}

/* ---------------------------------------------------------------- living portrait */
function usePortraitVideo(src: string | undefined, still: boolean) {
  const vid = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const play = () => { const v = vid.current; if (!v || playing) return; try { v.currentTime = 0; } catch { /* ignore */ } v.play().catch(() => setPlaying(false)); };
  useEffect(() => {
    if (!src || still || reduced()) return;
    const t = window.setTimeout(play, 900);
    return () => window.clearTimeout(t);
  }, [src, still]); // eslint-disable-line react-hooks/exhaustive-deps
  return { vid, playing, setPlaying, play };
}

/* ---------------------------------------------------------------- background music (starts on first tap) */
function useMusic(url: string | undefined, root: React.RefObject<HTMLDivElement>, still: boolean) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const fade = useRef<number>(0);
  const [on, setOn] = useState(false);
  const [started, setStarted] = useState(false);
  const [userOff, setUserOff] = useState(false);
  const fadeTo = (target: number, ms: number, after?: () => void) => {
    const a = audio.current; if (!a) return;
    window.clearInterval(fade.current);
    const from = a.volume, steps = Math.max(1, Math.round(ms / 50)); let i = 0;
    fade.current = window.setInterval(() => { i++; a.volume = Math.max(0, Math.min(1, from + (target - from) * (i / steps))); if (i >= steps) { window.clearInterval(fade.current); after?.(); } }, 50);
  };
  const play = () => {
    if (!url) return;
    if (!audio.current) { audio.current = new Audio(url); audio.current.loop = true; audio.current.preload = 'auto'; audio.current.volume = 0; }
    const a = audio.current;
    a.play().then(() => { setOn(true); setStarted(true); fadeTo(0.32, started ? 1200 : 3000); }).catch(() => setOn(false));
  };
  const pause = () => { const a = audio.current; if (!a) return; setOn(false); fadeTo(0, 600, () => a.pause()); };
  const toggle = () => { if (on) { setUserOff(true); pause(); } else { setUserOff(false); play(); } };
  useEffect(() => {
    const el = root.current; if (!url || still || !el) return;
    const kick = (e: Event) => {
      if ((e.target as HTMLElement).closest?.('.w-music-pill')) return;
      if (!started && !userOff) play();
    };
    el.addEventListener('pointerdown', kick, true);
    const vis = () => { if (document.hidden && on) pause(); };
    document.addEventListener('visibilitychange', vis);
    return () => { el.removeEventListener('pointerdown', kick, true); document.removeEventListener('visibilitychange', vis); };
  }, [url, still, started, userOff, on]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { audio.current?.pause(); window.clearInterval(fade.current); }, []);
  return { on, started, toggle };
}

/* ---------------------------------------------------------------- sparkle burst (Save) */
function sparkleBurst(host: HTMLElement, x: number, y: number) {
  if (reduced()) return;
  const r = host.getBoundingClientRect();
  const layer = document.createElement('div'); layer.className = 'w-spark-layer'; layer.setAttribute('aria-hidden', 'true');
  const cs = getComputedStyle(host);
  const colors = [cs.getPropertyValue('--gold-1'), cs.getPropertyValue('--gold-3'), '#FFF8E1', cs.getPropertyValue('--plum-4'), cs.getPropertyValue('--gold-2')];
  for (let i = 0; i < 22; i++) {
    const p = document.createElement('i'), ang = (i / 22) * Math.PI * 2 + Math.random() * 0.35, dist = 46 + Math.random() * 64, size = 9 + Math.random() * 11;
    p.style.cssText = `left:${x - r.left}px;top:${y - r.top}px;width:${size}px;height:${size}px;color:${colors[i % colors.length]};` +
      `--dx:${Math.cos(ang) * dist}px;--dy:${Math.sin(ang) * dist - 14}px;--r:${(Math.random() * 240 - 120) | 0}deg;--t:${0.6 + Math.random() * 0.35}s;--dl:${Math.random() * 0.08}s`;
    p.innerHTML = `<svg viewBox="0 0 24 24"><path d="${STAR_PATH}"/></svg>`;
    layer.appendChild(p);
  }
  host.appendChild(layer); window.setTimeout(() => layer.remove(), 1200);
}

/* ---------------------------------------------------------------- the card */
function WorshipCard({ skin, layout }: { skin: SkinId; layout: Layout }) {
  const { data, theme, actions, still } = useCard();
  const root = useRef<HTMLDivElement>(null);
  const [booted, setBooted] = useState(still);
  const [saved, setSaved] = useState(false);
  useEffect(() => { if (still) return; const t = requestAnimationFrame(() => setBooted(true)); return () => cancelAnimationFrame(t); }, [still]);

  // Gold and purple from the kit, in dark mode (these designs are always dark).
  const tokens = useMemo(() => {
    const t = theme.tokens.dark, o = theme.overrides.dark;
    const gold1 = o.accentDetail ?? t.accent;
    const plum1 = t.band;
    const plum2 = mix(t.band, '#000000', 0.45);
    const bg = mix(plum2, '#000000', 0.55);
    return {
      '--gold-1': gold1, '--gold-2': mix(gold1, '#FFFFFF', 0.12), '--gold-3': mix(gold1, '#FFFFFF', 0.55), '--gold-4': mix(gold1, '#000000', 0.35),
      '--plum-1': plum1, '--plum-2': plum2, '--plum-3': mix(plum1, '#FFFFFF', 0.18), '--plum-4': mix(plum1, '#FFFFFF', 0.55), '--plum-ink': mix(plum2, '#000000', 0.6),
      '--cream': mix(gold1, '#FFFFFF', 0.85), '--bg': bg,
      '--accent': ensureContrast(gold1, bg, 4.5), '--accent-soft': mix(gold1, '#FFFFFF', 0.4),
      '--ink': o.name ?? '#F2F0EA', '--ink-2': o.body ?? 'rgba(242,240,234,.74)', '--ink-3': o.caption ?? 'rgba(242,240,234,.56)',
      '--icon-ink': mix(gold1, '#FFFFFF', 0.25), '--badge-a': mix(gold1, '#FFFFFF', 0.75), '--badge-b': gold1, '--badge-ink': plum2,
      '--prominent': gold1, '--prominent-ink': plum2,
      '--royal-a': plum1, '--royal-b': plum2,
      '--rail-bg': `linear-gradient(180deg, ${plum1} 0%, ${mix(plum1, plum2, 0.5)} 55%, ${mix(plum2, '#000000', 0.25)} 100%)`,
      '--rail-ink': mix(gold1, '#FFFFFF', 0.85), '--rail-icon': mix(gold1, '#FFFFFF', 0.1),
      '--field-1': plum1, '--field-2': mix(plum1, '#FF7AC8', 0.25), '--field-3': mix(gold1, '#000000', 0.35), '--field-4': mix(plum2, '#3040C0', 0.3),
      '--display-font': 'var(--f-display), "Cinzel", Georgia, serif', '--mono': '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace',
      '--sans': 'var(--f-body), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    } as CSSProperties;
  }, [theme]);

  const pv = usePortraitVideo(data.photoVideoUrl, still);
  const music = useMusic(data.music?.url, root, still);
  const roles = data.jobTitle.split('|').map((r) => r.trim()).filter(Boolean);
  const kicker = data.kicker?.trim() || defaultKicker(skin, data);
  const socials = data.socials.filter((s) => socialUrl(s.network, s.value));
  const wa = data.whatsapp || data.phone;

  const dockItems = [
    data.phone && <a key="call" className="w-press" href={telHref(data.phone)}>{I.phone}<span>Call</span></a>,
    wa && <a key="wa" className="w-press w-wa" href={waHref(wa, `Hi ${data.fullName.split(' ')[0]}, I just tapped your card.`)} target="_blank" rel="noopener">{I.whatsapp}<span>WhatsApp</span></a>,
    data.email && <a key="em" className="w-press w-em" href={`mailto:${data.email}`}>{I.mail}<span>Email</span></a>,
  ].filter(Boolean);
  const railExtra = [
    <button key="share" className="w-press" type="button" onClick={actions.share}>{I.share}<span>Share</span></button>,
    <button key="qr" className="w-press" type="button" onClick={actions.qr}>{I.qr}<span>QR</span></button>,
  ];
  const musicBtn = data.music?.url ? (
    <button type="button" className={`w-pill w-glass w-music-pill w-press ${music.on ? 'w-on' : ''}`} aria-pressed={music.on} aria-label={music.on ? 'Pause music' : 'Play music'} title={data.music.title} onClick={(e) => { e.stopPropagation(); music.toggle(); }}>
      <span className="w-eq" aria-hidden><i /><i /><i /><i /></span>
      <span className="w-m-txt"><span className="w-m-title">{data.music.title}</span><span className="w-m-sub">{music.started ? (data.music.sub || data.business) : 'Tap to listen'}</span></span>
      <span className="w-m-short">Music</span>
    </button>
  ) : null;

  const onSave = (e: React.MouseEvent<HTMLButtonElement>) => {
    sparkleSound();
    if (root.current) sparkleBurst(root.current, e.clientX || e.currentTarget.getBoundingClientRect().left + 40, e.clientY || e.currentTarget.getBoundingClientRect().top + 20);
    actions.save();
    setSaved(true); window.setTimeout(() => setSaved(false), 4000);
  };

  const cls = ['tpl', 'tpl-ws', `w-skin-${skin}`, layout && `w-layout-${layout}`, booted && 'w-booted', !dockItems.length && !layout && 'w-no-dock'].filter(Boolean).join(' ');
  return (
    <div className={cls} ref={root} style={tokens}>
      {/* fixed-style layers: sticky to the viewport while the card scrolls */}
      <div className="ws-stage" aria-hidden><div className="ws-stage__in">
        <div className="w-fields"><i className="w-f1" /><i className="w-f2" /><i className="w-f3" /><i className="w-f4" /></div>
        <div className="w-skin-bg"><Bg skin={skin} /></div>
      </div></div>

      <main className="w-card">
        {(musicBtn && !layout) && <div className="w-topbar w-reveal" style={{ '--i': 0 } as CSSProperties}>{musicBtn}<span className="w-tb-right" /></div>}

        <div className="w-hero w-portrait w-reveal" style={{ '--i': 1 } as CSSProperties}>
          <div className="w-tilt">
            <span className="w-rim w-glass" aria-hidden />
            <figure className={`w-photo ${pv.playing ? 'w-playing' : ''}`} onClick={data.photoVideoUrl ? pv.play : undefined} style={data.photoVideoUrl ? { cursor: 'pointer' } : undefined}>
              {data.photoUrl ? <img src={data.photoUrl} alt={data.fullName} decoding="async" /> : <span className="ws-noimg" />}
              {data.photoVideoUrl && !still && (
                <video ref={pv.vid} className="w-pv" src={data.photoVideoUrl} muted playsInline preload="auto" disablePictureInPicture aria-hidden
                  onPlaying={() => pv.setPlaying(true)} onEnded={() => pv.setPlaying(false)} onError={() => pv.setPlaying(false)} />
              )}
            </figure>
            <div className="w-skin-hero" aria-hidden><HeroDecor skin={skin} data={data} /></div>
          </div>
          {data.logoUrl && (
            <button type="button" className="w-badge-orb w-press w-fx-harmony" aria-label={data.business || data.fullName} onClick={orbSound}>
              <span className="w-hw" aria-hidden /><span className="w-hw" aria-hidden /><span className="w-hw" aria-hidden />
              <span className="w-notes" aria-hidden>
                <i style={{ '--a': '0deg' } as CSSProperties}><svg viewBox="0 0 24 24"><path d="M9 18.5a3 3 0 1 1-2-2.83V4l10-2v11.5a3 3 0 1 1-2-2.83V5.4L9 6.6z" /></svg></i>
                <i style={{ '--a': '130deg' } as CSSProperties}><svg viewBox="0 0 24 24"><path d="M12 17.5a3 3 0 1 1-2-2.83V3h2c0 3 4 4 4 8-1-1.6-2.4-2.3-4-2.5z" /></svg></i>
                <i style={{ '--a': '245deg' } as CSSProperties}><svg viewBox="0 0 24 24"><path d="M12 17.5a3 3 0 1 1-2-2.83V3h2c0 3 4 4 4 8-1-1.6-2.4-2.3-4-2.5z" /></svg></i>
              </span>
              <img className="w-logo" src={data.logoUrl} alt="" />
            </button>
          )}
        </div>

        <p className="w-kicker w-reveal" aria-hidden style={{ '--i': 2 } as CSSProperties}>{kicker}</p>
        <h1 className="w-reveal" style={{ '--i': 2 } as CSSProperties}>{data.fullName || 'Your Name'}</h1>
        {roles.length > 0 && (
          <p className="w-role w-reveal" style={{ '--i': 3 } as CSSProperties}>
            {roles.map((r, i) => <span key={i} className="w-r">{r}{i < roles.length - 1 && <> <span className="w-s">|</span></>} </span>)}
          </p>
        )}
        {skin === 'wave' && (
          <div className="w-after-role" aria-hidden>
            <svg className="w-wline" viewBox="0 0 300 40" preserveAspectRatio="none"><path d="M0 20 Q 15 2 30 20 T 60 20 T 90 20 T 120 20 T 150 20 T 180 20 T 210 20 T 240 20 T 270 20 T 300 20" /><path className="w-w2" d="M0 20 Q 20 34 40 20 T 80 20 T 120 20 T 160 20 T 200 20 T 240 20 T 280 20 T 320 20" /></svg>
          </div>
        )}
        {(data.orgLogoUrl || data.business) && (
          <p className={`w-org w-reveal ${data.orgLogoUrl ? 'w-has-logo' : ''}`} style={{ '--i': 4 } as CSSProperties}>
            {data.orgLogoUrl ? (
              <span className="w-org-fx" style={{ '--mask': `url('${data.orgLogoUrl}')` } as CSSProperties}>
                <img className="w-org-logo" src={data.orgLogoUrl} alt={data.business} />
                <span className="w-sheen" aria-hidden />
                <i className="w-spark" style={{ left: '28.3%', top: '5%', '--d': '0s' } as CSSProperties}><Star /></i>
                <i className="w-spark" style={{ left: '16.5%', top: '15%', '--d': '1.1s' } as CSSProperties}><Star /></i>
                <i className="w-spark" style={{ left: '41%', top: '15%', '--d': '2.2s' } as CSSProperties}><Star /></i>
              </span>
            ) : data.business}
          </p>
        )}

        <button type="button" className={`w-save w-glass w-press w-reveal w-fx-sparkle ${saved ? 'w-done' : ''}`} style={{ '--i': 5 } as CSSProperties} onClick={onSave}>
          <span className="w-ic" aria-hidden>{saved ? I.check : I.save}</span><span>{saved ? 'Contact ready' : 'Save contact'}</span>
        </button>
        <div className="w-pair w-reveal" style={{ '--i': 6 } as CSSProperties}>
          <button type="button" className="w-cap w-glass w-press" onClick={actions.share}>{I.share}<span>Share</span></button>
          <button type="button" className="w-cap w-glass w-press" onClick={actions.qr}>{I.qr}<span>QR code</span></button>
        </div>

        <div className="w-reveal w-id-sections" style={{ '--i': 7 } as CSSProperties}>
          {data.bookingUrl && (
            <div className="w-section w-s-cta">
              <a className="w-cta w-glass w-press" href={webHref(data.bookingUrl)} target="_blank" rel="noopener">
                <span className="w-cta-ic">{I.calendar}</span>
                <span className="w-tx"><b>{data.highlights[0]?.title || 'Invitations and bookings'}</b><small>{data.highlights[0]?.subtitle || 'Churches, conferences and events'}</small></span>
                <span className="w-cta-btn">Book</span>
              </a>
            </div>
          )}
          {data.tagline && <div className="w-section w-s-about"><div className="w-about w-glass"><p>{data.tagline}</p></div></div>}
          {data.highlights.length > (data.bookingUrl ? 1 : 0) && (
            <>
              <p className="w-sec">{data.highlightsTitle || 'Ministries'}</p>
              <div className="w-section w-s-services"><div className="w-svc">
                {data.highlights.slice(data.bookingUrl ? 1 : 0).map((h) => <div key={h.id} className="w-tile w-glass"><span className="w-ti">{I.sparkle}</span><b>{h.title}</b>{h.subtitle && <small>{h.subtitle}</small>}</div>)}
              </div></div>
            </>
          )}
          {(data.website || socials.length > 0) && (
            <>
              <p className="w-sec">Connect</p>
              <div className="w-section w-s-links"><nav className="w-list">
                {data.website && <a className="w-row w-glass w-press" href={webHref(data.website)} target="_blank" rel="noopener"><span className="w-badge">{I.globe}</span><span className="w-tx"><b>{prettyUrl(data.website)}</b><small>{data.business || 'Website'}</small></span><span className="w-go">{I.arrow}</span></a>}
                {socials.map((s) => (
                  <a key={s.id} className="w-row w-glass w-press" href={socialUrl(s.network, s.value)} target="_blank" rel="noopener">
                    <span className="w-badge"><Brand network={s.network} /></span>
                    <span className="w-tx"><b>{NETWORK_BY_ID[s.network]?.label ?? 'Link'}</b><small>{s.value.replace(/^https?:\/\/(www\.)?/, '').slice(0, 40)}</small></span>
                    <span className="w-go">{I.arrow}</span>
                  </a>
                ))}
              </nav></div>
            </>
          )}
          {data.hasLocation && addressLine(data.address) && (
            <div className="w-section w-s-location"><div className="w-loc w-glass">
              <span className="w-badge">{I.pin}</span><span className="w-tx"><b>Visit us</b><small>{addressLine(data.address)}</small></span>
              <a className="w-mini w-press" href={mapsHref(data.address)} target="_blank" rel="noopener">Directions</a>
            </div></div>
          )}
        </div>

        <footer className="w-reveal" style={{ '--i': 8 } as CSSProperties}>
          {data.website && <a href={webHref(data.website)} target="_blank" rel="noopener">{prettyUrl(data.website)}</a>}
          <p>{[data.business, roles[1] || roles[0]].filter(Boolean).join(' · ')}</p>
        </footer>
      </main>

      {/* contact dock (bottom), side rail, or floating arch rail */}
      {!layout && dockItems.length > 0 && (
        <div className="ws-dockwrap"><div className="ws-dockstick">
          <nav className="w-dock w-glass w-reveal" aria-label="Contact" style={{ gridTemplateColumns: `repeat(${dockItems.length},1fr)` }}>{dockItems}</nav>
        </div></div>
      )}
      {layout && (
        <div className="ws-railwrap"><div className="ws-railstick">
          <nav className="w-dock w-glass w-reveal" aria-label="Contact">
            {layout === 'rail' && data.logoUrl && <><span className="w-rail-logo"><img src={data.logoUrl} alt="" /></span><i className="w-rail-div" aria-hidden /></>}
            {dockItems}{railExtra}
            {musicBtn}
            {layout === 'rail' && <><span className="w-rail-fill" aria-hidden /><span className="w-rail-org" aria-hidden>{data.business}</span></>}
          </nav>
        </div></div>
      )}
    </div>
  );
}

/* one exported component per template id */
export const Santuario = () => <WorshipCard skin="hud" layout="" />;
export const Celestial = () => <WorshipCard skin="aurora" layout="" />;
export const Vitral = () => <WorshipCard skin="vitral" layout="float" />;
export const Frecuencia = () => <WorshipCard skin="wave" layout="rail" />;
export const Constelacion = () => <WorshipCard skin="cosmos" layout="" />;
export const Escenario = () => <WorshipCard skin="stage" layout="" />;
export const Salmo = () => <WorshipCard skin="os" layout="" />;
