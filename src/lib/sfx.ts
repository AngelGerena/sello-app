/* Interface sounds, synthesized live (no audio files).
   calm   soft singing-bowl partials, warm low-pass       (wellness, pros, default)
   tech   crisp synth blips, glides and a boot arpeggio   (tech niche)
   bright short marimba-like plucks                       (food, retail, creators)
   Muted when the OS asks for reduced motion or the card sets sound to off. */
import type { SoundProfile } from './types';

let ctx: AudioContext | null = null;
let out: GainNode | null = null;
let lp: BiquadFilterNode | null = null;
let enabled = true;

export const setSound = (on: boolean) => { enabled = on; };
export const soundOn = () => enabled;

export type SfxName = 'tap' | 'primary' | 'success' | 'open' | 'close' | 'dice' | 'hover' | 'boot';

function ensure() {
  if (ctx) return ctx;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  out = ctx.createGain(); out.gain.value = 0.16;
  lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2200; lp.Q.value = 0.4;
  out.connect(lp); lp.connect(ctx.destination);
  return ctx;
}

function tone(f: number, dur: number, vol: number, opts: { delay?: number; to?: number; type?: OscillatorType; attack?: number; cutoff?: number } = {}) {
  const c = ensure(); if (!c || !out || !lp) return;
  const t = c.currentTime + (opts.delay ?? 0);
  const o = c.createOscillator(), g = c.createGain();
  o.type = opts.type ?? 'sine';
  o.frequency.setValueAtTime(f, t);
  if (opts.to) o.frequency.exponentialRampToValueAtTime(opts.to, t + dur * 0.8);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + (opts.attack ?? 0.035));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  lp.frequency.setValueAtTime(opts.cutoff ?? 2200, t);
  o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.05);
}

const bowl = (f: number, dur: number, vol: number, delay = 0) => { tone(f, dur, vol, { delay }); tone(f * 2.76, dur * 0.6, vol * 0.18, { delay: delay + 0.01 }); };
const blip = (f: number, dur: number, vol: number, delay = 0, to?: number) => tone(f, dur, vol, { delay, to, type: 'square', attack: 0.004, cutoff: 5200 });
const pluck = (f: number, vol: number, delay = 0) => { tone(f, 0.28, vol, { delay, type: 'triangle', attack: 0.004, cutoff: 3800 }); tone(f * 4, 0.08, vol * 0.25, { delay, attack: 0.002, cutoff: 3800 }); };

function calm(name: SfxName) {
  switch (name) {
    case 'primary': bowl(392, 1.1, 0.42); bowl(587.3, 1.2, 0.2, 0.06); break;
    case 'success': [523.3, 659.3, 784].forEach((f, i) => bowl(f, 1.0, 0.3, i * 0.14)); break;
    case 'open': tone(440, 0.6, 0.3, { to: 523.3 }); break;
    case 'close': tone(523.3, 0.5, 0.26, { to: 392 }); break;
    case 'dice': [659.3, 523.3, 784, 587.3].forEach((f, i) => bowl(f, 0.5, 0.18, i * 0.06)); break;
    case 'hover': case 'boot': break;
    default: bowl(523.3, 0.5, 0.26);
  }
}
function tech(name: SfxName) {
  switch (name) {
    case 'primary': blip(880, 0.09, 0.22); blip(1318.5, 0.14, 0.2, 0.07); tone(220, 0.3, 0.18, { type: 'sawtooth', to: 110, cutoff: 900 }); break;
    case 'success': [659.3, 880, 1174.7, 1760].forEach((f, i) => blip(f, 0.1, 0.16, i * 0.06)); break;
    case 'open': blip(440, 0.18, 0.16, 0, 1760); break;
    case 'close': blip(1760, 0.16, 0.14, 0, 440); break;
    case 'dice': for (let i = 0; i < 6; i++) blip(600 + Math.random() * 1200, 0.05, 0.12, i * 0.035); break;
    case 'hover': blip(2093, 0.03, 0.05); break;
    case 'boot': [110, 220, 330, 440, 660, 880].forEach((f, i) => blip(f, 0.12, 0.12, i * 0.07)); tone(55, 0.9, 0.2, { type: 'sawtooth', to: 110, cutoff: 600, delay: 0.1 }); break;
    default: blip(1046.5, 0.06, 0.18);
  }
}
function bright(name: SfxName) {
  switch (name) {
    case 'primary': pluck(659.3, 0.34); pluck(987.8, 0.28, 0.07); break;
    case 'success': [523.3, 659.3, 784, 1046.5].forEach((f, i) => pluck(f, 0.26, i * 0.08)); break;
    case 'open': pluck(784, 0.24); break;
    case 'close': pluck(523.3, 0.22); break;
    case 'dice': [880, 659.3, 1046.5, 784].forEach((f, i) => pluck(f, 0.2, i * 0.05)); break;
    case 'hover': case 'boot': break;
    default: pluck(880, 0.24);
  }
}

export function sfx(name: SfxName, profile: SoundProfile = 'calm') {
  if (!enabled || profile === 'off' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  if (ctx?.state === 'suspended') ctx.resume();
  if (profile === 'tech') tech(name); else if (profile === 'bright') bright(name); else calm(name);
}
