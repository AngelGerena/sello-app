import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Heart, Check, Pencil, Copy, Trash2, Wand2, X, Save, LayoutTemplate, History } from 'lucide-react';
import type { Look, Mode, Theme, TemplateId } from '../../lib/types';
import type { LooksApi, Roll } from '../../lib/useLooks';
import { googleFontsHref, themeVars } from '../../lib/theme';
import { TEMPLATES } from '../../templates';
import { sfx } from '../../lib/sfx';
import { Section, type PanelProps } from './Fields';

/* ------------------------------------------------------------ swatch */
/** A small, honest preview of a look: its ground, type, colors and real buttons. */
export function LookSwatch({ theme, template, mode, name, compact }: { theme: Theme; template: TemplateId; mode: Mode; name?: string; compact?: boolean }) {
  const b = theme.button;
  const t = theme.tokens[mode];
  const cls = (v: string) => `fb fb--${v} shape-${b.shape} size-compact style-${b.style} tex-${b.texture}`;
  return (
    <span className={`lsw mode-${mode}${compact ? ' lsw--compact' : ''}`} style={themeVars(theme, mode) as CSSProperties} aria-hidden>
      <span className="lsw__band" />
      <span className="lsw__body">
        <span className="lsw__aa">{name ? name.split(' ')[0] : 'Aa'}</span>
        {!compact && <span className="lsw__meta">{TEMPLATES.find((x) => x.id === template)?.name}</span>}
        <span className="lsw__dots">{[t.brand, t.accent, t.bg, t.soft].map((c, i) => <i key={i} style={{ background: c }} />)}</span>
        {!compact && (
          <span className="lsw__btns">
            <span className={cls('primary')}><span className="fb__tx">Save</span></span>
            <span className={cls('secondary')}><span className="fb__tx">Share</span></span>
          </span>
        )}
      </span>
    </span>
  );
}

/** Loads the Google fonts used by saved looks so swatches show the real type. */
function useLookFonts(looks: { theme: Theme }[]) {
  const families = [...new Set(looks.flatMap((l) => [l.theme.fonts.display, l.theme.fonts.body]))].sort().join('|');
  useEffect(() => {
    if (!families) return;
    const href = googleFontsHref(families.split('|'));
    if (document.querySelector(`link[data-fc-looks="${href}"]`)) return;
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; l.dataset.fcLooks = href;
    document.head.appendChild(l);
  }, [families]);
}

/* ------------------------------------------------------------ save button (toolbar) */
export function SaveLookButton({ api, card, onSaved }: { api: LooksApi; card: PanelProps['card']; onSaved?: (msg: string) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const saved = api.currentSavedAs;

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, [open]);

  const save = async () => {
    setBusy(true);
    const look = await api.saveCurrent(name);
    setBusy(false);
    if (look) { sfx('success'); setOpen(false); onSaved?.(`Saved "${look.name}" to Favorites`); }
  };

  return (
    <div className="savelook" ref={box}>
      <button
        type="button"
        className={`pv-btn ${saved ? 'pv-btn--saved' : ''}`}
        onClick={() => { if (saved) { onSaved?.(`Already in Favorites as "${saved.name}"`); return; } setName(api.suggestName(card.theme)); setOpen(!open); }}
        aria-expanded={open}
        title={saved ? `Saved as ${saved.name}` : 'Save this look to Favorites'}
      >
        <Heart size={17} fill={saved ? 'currentColor' : 'none'} /><span>{saved ? 'Saved' : 'Save look'}</span>
      </button>
      {open && (
        <div className="savelook__pop" role="dialog" aria-label="Save this look">
          <LookSwatch theme={card.theme} template={card.template} mode="light" name={name} />
          <label className="fld">
            <span className="sr">Name this look</span>
            <input autoFocus value={name} maxLength={40} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') save(); }} placeholder="Name this look" />
          </label>
          <p className="note">Saves colors, custom colors, fonts, buttons and layout.</p>
          <button type="button" className="btn btn--gold" onClick={save} disabled={busy}><Heart size={16} /> {busy ? 'Saving...' : 'Save to Favorites'}</button>
          {api.error && <p className="err" role="alert">{api.error}</p>}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ editing bar */
export function EditingBar({ api, goFavorites }: { api: LooksApi; goFavorites: () => void }) {
  const [justSaved, setJustSaved] = useState(false);
  if (!api.active) return null;
  return (
    <div className="editbar" role="status">
      <span className="editbar__tx"><Pencil size={15} /> Editing favorite <b>{api.active.name}</b>{api.activeDirty ? <em>unsaved changes</em> : justSaved ? <em className="ok">saved</em> : null}</span>
      <span className="editbar__acts">
        <button type="button" className="btn btn--gold btn--sm" disabled={!api.activeDirty} onClick={async () => { await api.updateActive(); sfx('success'); setJustSaved(true); setTimeout(() => setJustSaved(false), 2000); }}><Save size={14} /> Save changes</button>
        <button type="button" className="btn btn--ghost btn--sm" onClick={goFavorites}>Favorites</button>
        <button type="button" className="icon-btn" aria-label="Stop editing this favorite" onClick={api.stopEditing}><X size={16} /></button>
      </span>
    </div>
  );
}

/* ------------------------------------------------------------ favorites panel */
export function FavoritesPanel(p: PanelProps) {
  const api = p.looks!;
  const { card } = p;
  const [name, setName] = useState(() => api.suggestName(card.theme));
  const [renaming, setRenaming] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  useLookFonts([...api.looks, ...api.recent]);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(null), 2400); };
  const saveNow = async () => { const l = await api.saveCurrent(name); if (l) { sfx('success'); flash(`Saved "${l.name}"`); setName(api.suggestName(card.theme)); } };

  return (
    <>
      <Section title="Save the current look" hint="Roll the dice until something clicks, then keep it here. Favorites work on any card you make.">
        <div className="favsave">
          <LookSwatch theme={card.theme} template={card.template} mode={p.mode} name={name} />
          <div className="stack-ed">
            <div className="fld">
              <label htmlFor="lookname">Name</label>
              <input id="lookname" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') saveNow(); }} />
            </div>
            {api.currentSavedAs
              ? <p className="note"><Check size={14} /> This exact look is saved as <b>{api.currentSavedAs.name}</b>.</p>
              : <button type="button" className="btn btn--gold" onClick={saveNow}><Heart size={16} /> Save to Favorites</button>}
          </div>
        </div>
        {msg && <p className="note" role="status">{msg}</p>}
        {api.error && <p className="err" role="alert">{api.error}</p>}
      </Section>

      <Section title={`Favorites${api.looks.length ? ` (${api.looks.length})` : ''}`} hint="Apply one to this card, or open it to fine-tune and save your changes back.">
        {api.loading && <p className="note">Loading favorites...</p>}
        {!api.loading && api.looks.length === 0 && (
          <div className="empty">
            <p>No favorites yet. Tap <b>Shuffle all</b> or the dice on Colors and Buttons, then hit the heart when you see one you like.</p>
          </div>
        )}
        <ul className="favs">
          {api.looks.map((l: Look) => {
            const isActive = api.activeId === l.id;
            return (
              <li key={l.id} className={isActive ? 'on' : ''}>
                <button type="button" className="favs__prev" onClick={() => { sfx('tap'); api.apply(l); }} aria-label={`Apply ${l.name}`}>
                  <LookSwatch theme={l.theme} template={l.template} mode={p.mode} name={l.name} />
                </button>
                <div className="favs__meta">
                  {renaming === l.id ? (
                    <input
                      autoFocus className="favs__rename" value={draft} maxLength={40}
                      onChange={(e) => setDraft(e.target.value)}
                      onBlur={() => { api.rename(l.id, draft); setRenaming(null); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') setRenaming(null); }}
                      aria-label="Rename favorite"
                    />
                  ) : (
                    <button type="button" className="favs__name" onClick={() => { setRenaming(l.id); setDraft(l.name); }} title="Rename">{l.name}</button>
                  )}
                  <small>{TEMPLATES.find((t) => t.id === l.template)?.name}{isActive ? ' · editing' : ''}</small>
                </div>
                <div className="favs__acts">
                  <button type="button" className="btn btn--ink btn--sm" onClick={() => { sfx('tap'); api.apply(l); flash(`Applied "${l.name}"`); }}><Wand2 size={14} /> Apply</button>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => { api.apply(l, { edit: true }); p.goStep?.('colors'); }}><Pencil size={14} /> Edit</button>
                  <button type="button" className="icon-btn" title="Apply colors and buttons, keep my layout" aria-label={`Apply ${l.name} but keep my layout`} onClick={() => { api.apply(l, { keepLayout: true }); flash(`Applied "${l.name}" style, kept your layout`); }}><LayoutTemplate size={16} /></button>
                  <button type="button" className="icon-btn" aria-label={`Duplicate ${l.name}`} onClick={() => api.duplicate(l.id)}><Copy size={16} /></button>
                  <button type="button" className="icon-btn" aria-label={`Delete ${l.name}`} onClick={() => { if (window.confirm(`Delete "${l.name}" from Favorites?`)) api.remove(l.id); }}><Trash2 size={16} /></button>
                </div>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section title="Recent rolls" hint="Every dice roll this session. Rolled past a good one? Bring it back or save it.">
        {api.recent.length === 0
          ? <p className="note"><History size={14} /> Nothing rolled yet.</p>
          : (
            <ul className="rolls">
              {api.recent.map((r: Roll) => (
                <li key={r.key}>
                  <button type="button" className="rolls__prev" onClick={() => { sfx('tap'); api.apply(r); }} aria-label="Bring back this roll">
                    <LookSwatch theme={r.theme} template={r.template} mode={p.mode} compact />
                  </button>
                  <button type="button" className="icon-btn" aria-label="Save this roll to Favorites" onClick={async () => { const l = await api.saveRoll(r, ''); if (l) { sfx('success'); flash(`Saved "${l.name}"`); } }}><Heart size={16} /></button>
                </li>
              ))}
            </ul>
          )}
      </Section>
    </>
  );
}
