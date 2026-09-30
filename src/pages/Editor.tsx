import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { NicheBadge } from '../components/editor/NichePicker';
import { nicheOf } from '../lib/niches';
import {
  ArrowLeft, Contact, Dices, Eye, LayoutTemplate, Link2, MousePointerClick, Moon, Palette, Redo2, Send, Sparkles,
  Sun, Type, Undo2, User, Volume2, VolumeX, X, SquareStack, Check, Loader2, Heart,
} from 'lucide-react';
import { useLooks } from '../lib/useLooks';
import { EditingBar, FavoritesPanel, SaveLookButton } from '../components/editor/Favorites';
import ProBanner from '../components/editor/ProLock';
import type { Card, ElementId, Mode } from '../lib/types';
import { store } from '../lib/store';
import { setSound, soundOn } from '../lib/sfx';
import CardRenderer from '../components/CardRenderer';
import { ContactPanel, HighlightsPanel, LinksPanel, ProfilePanel, PublishPanel } from '../components/editor/ContentPanels';
import { BrandPanel, ButtonsPanel, ColorsPanel, ShuffleAll, TemplatePanel } from '../components/editor/StylePanels';
import type { PanelProps } from '../components/editor/Fields';

const STEPS = [
  { id: 'profile', label: 'Profile', icon: User, Panel: ProfilePanel },
  { id: 'contact', label: 'Contact', icon: Contact, Panel: ContactPanel },
  { id: 'links', label: 'Links', icon: Link2, Panel: LinksPanel },
  { id: 'highlights', label: 'Services', icon: Sparkles, Panel: HighlightsPanel },
  { id: 'layout', label: 'Layout', icon: LayoutTemplate, Panel: TemplatePanel },
  { id: 'colors', label: 'Colors', icon: Palette, Panel: ColorsPanel },
  { id: 'buttons', label: 'Buttons', icon: SquareStack, Panel: ButtonsPanel },
  { id: 'brand', label: 'Brand kit', icon: Type, Panel: BrandPanel },
  { id: 'favorites', label: 'Favorites', icon: Heart, Panel: FavoritesPanel },
  { id: 'publish', label: 'Publish', icon: Send, Panel: PublishPanel },
] as const;

export default function Editor() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const [card, setCard] = useState<Card | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [step, setStep] = useState<(typeof STEPS)[number]['id']>(() => (STEPS.some((x) => x.id === params.get('step')) ? params.get('step') : 'profile') as (typeof STEPS)[number]['id']);
  const [mode, setMode] = useState<Mode>('light');
  const [picking, setPicking] = useState(false);
  const [selected, setSelected] = useState<ElementId | null>(null);
  const [save, setSave] = useState<'saved' | 'saving' | 'error'>('saved');
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sound, setSnd] = useState(soundOn());
  const past = useRef<Card[]>([]), future = useRef<Card[]>([]);
  const [, force] = useState(0);
  const lastPush = useRef(0);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    store.card(id ?? '').then((c) => { if (!alive) return; if (c) { setCard(c); setMode(c.theme.modeDefault === 'dark' ? 'dark' : 'light'); } else setErr('This card does not exist or you do not have access to it.'); })
      .catch((e) => setErr(e.message ?? 'Could not load the card.'));
    return () => { alive = false; };
  }, [id]);

  // Autosave, debounced. The last write wins; errors surface in the bar, never only in the console.
  useEffect(() => {
    if (!card) return;
    setSave('saving');
    const t = setTimeout(() => {
      store.save(card).then(() => { setSave('saved'); setSaveErr(null); }).catch((e) => { setSave('error'); setSaveErr(e.message ?? 'Could not save.'); });
    }, 700);
    return () => clearTimeout(t);
  }, [card]);

  const set = useCallback((fn: (c: Card) => Card) => {
    setCard((c) => {
      if (!c) return c;
      const now = Date.now();
      if (now - lastPush.current > 600) { past.current = [...past.current.slice(-40), c]; future.current = []; lastPush.current = now; }
      return fn(c);
    });
    force((n) => n + 1);
  }, []);
  const undo = () => setCard((c) => { const p = past.current.pop(); if (!p || !c) return c; future.current.push(c); force((n) => n + 1); return p; });
  const redo = () => setCard((c) => { const f = future.current.pop(); if (!f || !c) return c; past.current.push(c); force((n) => n + 1); return f; });

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'z') return;
      const tag = (e.target as HTMLElement).tagName; if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      e.preventDefault(); if (e.shiftKey) redo(); else undo();
    };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, []);

  const looks = useLooks(card, set);
  const say = (m: string) => { setToast(m); window.setTimeout(() => setToast(null), 2400); };

  if (err) return <div className="center-msg"><p>{err}</p><Link className="btn btn--ink" to="/app">Back to my cards</Link></div>;
  if (!card) return <div className="center-msg"><Loader2 className="spin" /> Loading your card</div>;

  const goStep = (id: string) => { setStep(id as (typeof STEPS)[number]['id']); document.getElementById('panel')?.scrollTo({ top: 0 }); };
  const props: PanelProps = { card, set, mode, setMode, selected, setSelected, looks, goStep };
  const Current = STEPS.find((s) => s.id === step)!.Panel;
  const shuffleAll = ShuffleAll(props);
  const onPick = (el: ElementId) => { setSelected(el); setStep('colors'); setPreviewOpen(false); };

  const toolbar = (
    <div className="pv-bar" role="toolbar" aria-label="Preview controls">
      <div className="seg seg--icons" role="radiogroup" aria-label="Preview mode">
        <button type="button" role="radio" aria-checked={mode === 'light'} className={mode === 'light' ? 'on' : ''} onClick={() => setMode('light')} aria-label="Light mode"><Sun size={17} /></button>
        <button type="button" role="radio" aria-checked={mode === 'dark'} className={mode === 'dark' ? 'on' : ''} onClick={() => setMode('dark')} aria-label="Dark mode"><Moon size={17} /></button>
      </div>
      <button type="button" className={`pv-btn ${picking ? 'on' : ''}`} aria-pressed={picking} onClick={() => setPicking(!picking)} title="Tap any part of the card to recolor it"><MousePointerClick size={17} /><span>Tap to recolor</span></button>
      <button type="button" className="pv-btn pv-btn--dice" onClick={shuffleAll} title="Shuffle colors, buttons and fonts"><Dices size={18} /><span>Shuffle all</span></button>
      <SaveLookButton api={looks} card={card} onSaved={say} />
      <div className="pv-bar__end">
        <button type="button" className="icon-btn" onClick={undo} disabled={!past.current.length} aria-label="Undo"><Undo2 size={17} /></button>
        <button type="button" className="icon-btn" onClick={redo} disabled={!future.current.length} aria-label="Redo"><Redo2 size={17} /></button>
        <button type="button" className="icon-btn" onClick={() => { setSound(!sound); setSnd(!sound); }} aria-label={sound ? 'Mute sounds' : 'Turn sounds on'}>{sound ? <Volume2 size={17} /> : <VolumeX size={17} />}</button>
      </div>
    </div>
  );

  const preview = (
    <div className="phone">
      <div className="phone__screen">
        <CardRenderer card={card} mode={mode} picking={picking} selected={selected} onPick={onPick} sound={sound} />
      </div>
    </div>
  );

  return (
    <div className="ed">
      <header className="ed__top">
        <Link to="/app" className="icon-btn" aria-label="Back to my cards"><ArrowLeft size={19} /></Link>
        <div className="ed__title"><b>{card.data.fullName || 'Untitled card'}</b><small>{card.data.business || 'Add your business on the Profile step'}</small></div>
        {nicheOf(card) && <span className="ed__niche"><NicheBadge id={nicheOf(card)!.id} size="sm" onClick={() => goStep('layout')} /></span>}
        <span className={`ed__save ${save}`} role="status" title={saveErr ?? ''}>
          {save === 'saving' && <><Loader2 size={14} className="spin" /> Saving</>}
          {save === 'saved' && <><Check size={14} /> Saved</>}
          {save === 'error' && <>{saveErr ?? 'Not saved'}</>}
        </span>
        {store.demo && <span className="demo-tag">Demo. Changes stay on this device.</span>}
      </header>

      <nav className="ed__steps" aria-label="Card sections">
        {STEPS.map((s, i) => (
          <button key={s.id} type="button" className={step === s.id ? 'on' : ''} aria-current={step === s.id ? 'step' : undefined} onClick={() => setStep(s.id)}>
            <s.icon size={18} /><span>{s.label}</span><i>{i + 1}</i>
          </button>
        ))}
      </nav>

      <main className="ed__panel" id="panel">
        <EditingBar api={looks} goFavorites={() => goStep('favorites')} />
        <ProBanner card={card} set={set} compact />
        <h2 className="ed__h">{STEPS.find((s) => s.id === step)!.label}</h2>
        <Current {...props} />
        <div className="ed__next">
          {STEPS.findIndex((s) => s.id === step) < STEPS.length - 1 && (
            <button type="button" className="btn btn--ink" onClick={() => { const i = STEPS.findIndex((s) => s.id === step); setStep(STEPS[i + 1].id); document.getElementById('panel')?.scrollTo({ top: 0 }); }}>
              Next: {STEPS[STEPS.findIndex((s) => s.id === step) + 1].label}
            </button>
          )}
        </div>
      </main>

      <aside className="ed__preview" aria-label="Live preview">
        {toolbar}
        {preview}
        {picking && <p className="pv-hint">Tap any part of the card to recolor it.</p>}
      </aside>

      {toast && <p className="pv-toast" role="status">{toast}</p>}
      <button type="button" className="fab" onClick={() => setPreviewOpen(true)}><Eye size={18} /> Preview</button>
      {previewOpen && (
        <div className="pv-sheet" role="dialog" aria-modal="true" aria-label="Preview">
          <div className="pv-sheet__top">{toolbar}<button type="button" className="icon-btn" onClick={() => setPreviewOpen(false)} aria-label="Close preview"><X size={20} /></button></div>
          <div className="pv-sheet__card"><CardRenderer card={card} mode={mode} picking={picking} selected={selected} onPick={onPick} sound={sound} /></div>
        </div>
      )}
    </div>
  );
}
