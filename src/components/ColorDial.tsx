import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Pipette } from 'lucide-react';
import { contrast, hexToHsl, hslToHex, normalizeHex, wcagLabel } from '../lib/color';

/* HSV is what a picker square feels like; the app stores hex. */
function hexToHsv(hex: string) {
  const { h, s, l } = hexToHsl(hex);
  const S = s / 100, L = l / 100;
  const v = L + S * Math.min(L, 1 - L);
  return { h, s: v === 0 ? 0 : 2 * (1 - L / v), v };
}
function hsvToHex(h: number, s: number, v: number) {
  const l = v * (1 - s / 2);
  const sl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);
  return hslToHex({ h, s: sl * 100, l: l * 100 });
}

interface Props {
  value: string;
  onChange: (hex: string) => void;
  against?: string;          // background it sits on, for the contrast badge
  swatches?: { label: string; colors: string[] }[];
  label?: string;
}

export default function ColorDial({ value, onChange, against, swatches = [], label }: Props) {
  const [hsv, setHsv] = useState(() => hexToHsv(value));
  const [text, setText] = useState(value);
  const sv = useRef<HTMLDivElement>(null);
  const last = useRef(value);

  // Follow outside changes (dice, presets) without fighting the drag.
  useEffect(() => {
    if (value.toUpperCase() !== last.current.toUpperCase()) { setHsv(hexToHsv(value)); last.current = value; }
    setText(value);
  }, [value]);

  const commit = (h: number, s: number, v: number) => {
    setHsv({ h, s, v });
    const hex = hsvToHex(h, s, v);
    last.current = hex; setText(hex); onChange(hex);
  };

  const fromPointer = (e: PointerEvent) => {
    const r = sv.current!.getBoundingClientRect();
    const s = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const v = 1 - Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    commit(hsv.h, s, v);
  };

  const onKey = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 0.1 : 0.02;
    const m: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
    if (!m[e.key]) return;
    e.preventDefault();
    commit(hsv.h, Math.min(1, Math.max(0, hsv.s + m[e.key][0])), Math.min(1, Math.max(0, hsv.v + m[e.key][1])));
  };

  const eyedropper = 'EyeDropper' in window;
  const pickScreen = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = await new (window as any).EyeDropper().open();
      const hex = normalizeHex(r.sRGBHex); if (hex) { onChange(hex); }
    } catch { /* cancelled */ }
  };

  const ratio = against ? contrast(value, against) : null;
  const grade = ratio ? wcagLabel(ratio) : null;

  return (
    <div className="dial">
      <div
        ref={sv}
        className="dial__sv"
        style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hsvToHex(hsv.h, 1, 1)})` }}
        onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture(e.pointerId); fromPointer(e); }}
        onPointerMove={(e) => { if (e.buttons) fromPointer(e); }}
        role="slider" tabIndex={0} aria-label={`${label ?? 'Color'} saturation and brightness`}
        aria-valuetext={value} onKeyDown={onKey}
      >
        <span className="dial__knob" style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, background: value }} />
      </div>
      <label className="dial__hue">
        <span className="sr">Hue</span>
        <input type="range" min={0} max={359} value={Math.round(hsv.h)} onChange={(e) => commit(Number(e.target.value), hsv.s, hsv.v)} />
      </label>
      <div className="dial__row">
        <span className="dial__chip" style={{ background: value }} aria-hidden />
        <label className="dial__hex">
          <span className="sr">Hex code</span>
          <input
            value={text} spellCheck={false} maxLength={7} inputMode="text"
            onChange={(e) => { setText(e.target.value); const h = normalizeHex(e.target.value); if (h) { last.current = h; setHsv(hexToHsv(h)); onChange(h); } }}
            onBlur={() => setText(value)}
          />
        </label>
        {eyedropper && <button type="button" className="icon-btn" onClick={pickScreen} aria-label="Pick a color from your screen" title="Pick from screen"><Pipette size={18} /></button>}
        {grade && (
          <span className={`dial__grade ${grade.ok ? 'ok' : 'bad'}`} title="Contrast against what it sits on">
            {ratio!.toFixed(1)}:1 · {grade.label}
          </span>
        )}
      </div>
      {swatches.filter((g) => g.colors.length).map((g) => (
        <div key={g.label} className="dial__sw">
          <span className="dial__swl">{g.label}</span>
          <div className="dial__swr">
            {g.colors.map((c, i) => (
              <button key={c + i} type="button" className={`sw ${c.toUpperCase() === value.toUpperCase() ? 'is-on' : ''}`} style={{ background: c }} onClick={() => onChange(c)} aria-label={`Use ${c}`} title={c} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
