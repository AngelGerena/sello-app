import { useId, useRef, useState, type ReactNode } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import type { Card, ElementId, Mode } from '../../lib/types';
import type { LooksApi } from '../../lib/useLooks';

export interface PanelProps {
  card: Card;
  set: (fn: (c: Card) => Card) => void;
  mode: Mode;
  setMode: (m: Mode) => void;
  selected: ElementId | null;
  setSelected: (id: ElementId | null) => void;
  looks?: LooksApi;          // favorites and recent rolls
  goStep?: (id: string) => void;
}

export function Section({ title, hint, children, action }: { title: string; hint?: ReactNode; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="ed-sec">
      {(title || hint || action) && <header className="ed-sec__h"><div>{title && <h3>{title}</h3>}{hint && <p>{hint}</p>}</div>{action}</header>}
      {children}
    </section>
  );
}

export function Field({ label, hint, value, onChange, placeholder, type = 'text', autoComplete, inputMode, maxLength }: {
  label: string; hint?: string; value: string; onChange: (v: string) => void; placeholder?: string;
  type?: string; autoComplete?: string; inputMode?: 'text' | 'tel' | 'email' | 'url' | 'numeric'; maxLength?: number;
}) {
  const id = useId();
  return (
    <div className="fld">
      <label htmlFor={id}>{label}</label>
      <input id={id} type={type} value={value} placeholder={placeholder} autoComplete={autoComplete} inputMode={inputMode} maxLength={maxLength} onChange={(e) => onChange(e.target.value)} />
      {hint && <small>{hint}</small>}
    </div>
  );
}

export function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  const id = useId();
  return (
    <div className="tgl">
      <div><label htmlFor={id}>{label}</label>{hint && <small>{hint}</small>}</div>
      <button id={id} type="button" role="switch" aria-checked={checked} className={`tgl__sw ${checked ? 'on' : ''}`} onClick={() => onChange(!checked)}><span /></button>
    </div>
  );
}

export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { v: T; l: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="seg" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.v} type="button" role="radio" aria-checked={value === o.v} className={value === o.v ? 'on' : ''} onClick={() => onChange(o.v)}>{o.l}</button>
      ))}
    </div>
  );
}

export function ImageUpload({ label, hint, value, onFile, onClear, shape = 'round', busyLabel = 'Uploading' }: {
  label: string; hint?: string; value: string; onFile: (f: File) => Promise<void>; onClear: () => void; shape?: 'round' | 'square'; busyLabel?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const take = async (f?: File | null) => {
    if (!f) return;
    if (!/^image\//.test(f.type)) { setErr('That file is not an image. Use JPG, PNG, WebP or SVG.'); return; }
    if (f.size > 15 * 1024 * 1024) { setErr('That image is over 15 MB. Try a smaller export.'); return; }
    setErr(null); setBusy(true);
    try { await onFile(f); } catch (e) { setErr(e instanceof Error ? e.message : 'Upload failed. Try again.'); } finally { setBusy(false); }
  };
  return (
    <div className="upl">
      <span className="upl__l">{label}</span>
      <div
        className={`upl__box ${shape} ${drag ? 'drag' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); take(e.dataTransfer.files[0]); }}
      >
        {value ? <img src={value} alt="" /> : <ImagePlus size={26} strokeWidth={1.5} />}
        {busy && <span className="upl__busy"><Loader2 className="spin" size={20} /> {busyLabel}</span>}
      </div>
      <div className="upl__acts">
        <button type="button" className="btn btn--ghost" onClick={() => ref.current?.click()}>{value ? 'Replace' : 'Upload'}</button>
        {value && <button type="button" className="icon-btn" aria-label={`Remove ${label.toLowerCase()}`} onClick={onClear}><Trash2 size={17} /></button>}
      </div>
      {hint && !err && <small>{hint}</small>}
      {err && <small className="err" role="alert">{err}</small>}
      <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => { take(e.target.files?.[0]); e.target.value = ''; }} />
    </div>
  );
}
