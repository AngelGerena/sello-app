import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { NicheBadge } from '../components/editor/NichePicker';
import { nicheOf } from '../lib/niches';
import {
  ArrowLeft, ChevronDown, Contact, Dices, Eye, LayoutTemplate, Link2, MousePointerClick, Moon, Palette, Redo2, Send, Sparkles,
  Sun, Type, Undo2, User, Volume2, VolumeX, X, SquareStack, Check, Loader2, Heart, ShieldCheck, Zap, RotateCw,
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
import QuickStart, { type QuickStep } from '../components/editor/QuickStart';
import type { PanelProps } from '../components/editor/Fields';
import { VIEW_KEY } from '../lib/editorView';
import { tr } from '../lib/i18n';
import { rich, useT } from '../lib/i18n';
import LangToggle from '../components/LangToggle';

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
type StepId = (typeof STEPS)[number]['id'];

/** Everyday sections stay in view. The four advanced styling sections fold away until they are needed. */
const GROUPS: { id: string; label: string; ids: StepId[]; advanced?: boolean }[] = [
  { id: 'essentials', label: 'Essentials', ids: ['profile', 'contact', 'links', 'highlights'] },
  { id: 'design', label: 'Design', ids: ['layout'] },
  { id: 'advanced', label: 'Advanced styling', ids: ['colors', 'buttons', 'brand', 'favorites'], advanced: true },
  { id: 'publish', label: 'Publish', ids: ['publish'] },
];

/** What counts as "the saved content": everything the editor autosaves. `published` is deliberately not part of it. */
const contentKey = (c: Card) => JSON.stringify([c.data.slug, c.template, c.data, c.theme]);

type SaveState = 'saved' | 'unsaved' | 'saving' | 'error';

/** A readable reason for a failed save. Server errors are plain objects, not Error instances, so read .message either way. */
function saveReason(e: unknown): string {
  const raw = e instanceof Error ? e.message : (e && typeof e === 'object' && 'message' in e ? String((e as { message: unknown }).message) : '');
  if (!raw) return tr('Could not save.');
  if (/failed to fetch|networkerror|network request|load failed|offline/i.test(raw) || (typeof navigator !== 'undefined' && !navigator.onLine))
    return tr('No connection. Your changes stay on this page. Tap Retry when you are back online.');
  return raw;
}

export default function Editor() {
  const { t } = useT();
  const { id } = useParams();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const adminOwner = params.get('owner');   // set by the admin portal when opening a customer's card
  const [card, setCard] = useState<Card | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [step, setStep] = useState<StepId>(() => (STEPS.some((x) => x.id === params.get('step')) ? params.get('step') : 'profile') as StepId);
  const [view, setView] = useState<'quick' | 'full'>(() => (params.get('quick') === '1' && !adminOwner ? 'quick' : 'full'));
  const [qStep, setQStep] = useState<QuickStep>('details');
  const [advOpen, setAdvOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('light');
  const [picking, setPicking] = useState(false);
  const [selected, setSelected] = useState<ElementId | null>(null);
  const [save, setSave] = useState<SaveState>('saved');
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sound, setSnd] = useState(soundOn());
  const past = useRef<Card[]>([]), future = useRef<Card[]>([]);
  const [, force] = useState(0);
  const lastPush = useRef(0);
  const [toast, setToast] = useState<string | null>(null);

  /* ---------------------------------------------------------------- loading */
  const cardRef = useRef<Card | null>(null);
  const savedKey = useRef('');                       // the content last confirmed saved
  const inflight = useRef<Promise<void> | null>(null);
  const again = useRef(false);

  useEffect(() => {
    let alive = true;
    store.card(id ?? '').then((c) => {
      if (!alive) return;
      if (c) { savedKey.current = contentKey(c); cardRef.current = c; setCard(c); setMode(c.theme.modeDefault === 'dark' ? 'dark' : 'light'); }
      else setErr('This card does not exist or you do not have access to it.');
    }).catch((e) => setErr(e.message ?? 'Could not load the card.'));
    return () => { alive = false; };
  }, [id]);

  /* ---------------------------------------------------------------- saving
     One save at a time, always the newest content. Opening a card never writes. A failed save keeps the
     work on screen, says so, and can be retried. Autosave never touches the published state. */
  const flush = useCallback((): Promise<void> => {
    if (inflight.current) { again.current = true; return inflight.current; }
    const run = (async () => {
      await null;   // let the caller store this promise before anything can finish
      try {
        do {
          again.current = false;
          const c = cardRef.current;
          if (!c) break;
          const key = contentKey(c);
          if (key === savedKey.current) break;
          setSave('saving');
          try { await store.saveContent(c); savedKey.current = key; setSaveErr(null); }
          catch (e) { setSave('error'); setSaveErr(saveReason(e)); return; }
        } while (again.current || (cardRef.current && contentKey(cardRef.current) !== savedKey.current));
        setSave('saved');
      } finally { inflight.current = null; }
    })();
    inflight.current = run;
    return run;
  }, []);

  useEffect(() => {
    cardRef.current = card;
    if (!card) return;
    if (contentKey(card) === savedKey.current) { if (!inflight.current) { setSave('saved'); setSaveErr(null); } return; }
    setSave((s) => (s === 'saving' ? s : 'unsaved'));
    const t = setTimeout(() => { void flush(); }, 700);
    return () => clearTimeout(t);
  }, [card, flush]);

  const ensureSaved = useCallback(async () => {
    await flush();
    return !!cardRef.current && contentKey(cardRef.current) === savedKey.current;
  }, [flush]);

  const setPublished = useCallback(async (v: boolean) => {
    const c = cardRef.current;
    if (!c) return;
    if (v && !(await ensureSaved())) throw new Error('Your latest changes could not be saved, so the card was not published. Use Retry in the top bar, then publish again.');
    await store.setPublished(c.id, v);
    setCard((cur) => (cur ? { ...cur, published: v } : cur));   // not part of the undo history
  }, [ensureSaved]);

  // Leaving with unsaved work: the browser asks first, and a best-effort save runs when the editor closes.
  useEffect(() => {
    if (save === 'saved') return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [save]);
  useEffect(() => () => { const c = cardRef.current; if (c && contentKey(c) !== savedKey.current) void store.saveContent(c).catch(() => undefined); }, []);

  /* ---------------------------------------------------------------- editing + history */
  const set = useCallback((fn: (c: Card) => Card) => {
    setCard((c) => {
      if (!c) return c;
      const now = Date.now();
      if (now - lastPush.current > 600) { past.current = [...past.current.slice(-40), c]; future.current = []; lastPush.current = now; }
      return fn(c);
    });
    force((n) => n + 1);
  }, []);
  // Undo and redo restore content only. The published state is a separate, explicit action, so it is never rewound.
  const undo = () => setCard((c) => { const p = past.current.pop(); if (!p || !c) return c; future.current.push(c); force((n) => n + 1); return { ...p, published: c.published }; });
  const redo = () => setCard((c) => { const f = future.current.pop(); if (!f || !c) return c; past.current.push(c); force((n) => n + 1); return { ...f, published: c.published }; });

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

  if (err) return <div className="center-msg">{rich(t("<x1>{err}</x1><x2>Back to my cards</x2>", { err }), { x1: (c) => <p>{c}</p>, x2: (c) => <Link className="btn btn--ink" to="/app">{c}</Link> })}</div>;
  if (!card) return <div className="center-msg"><Loader2 className="spin" /> {t("Loading your card")}</div>;

  const goStep = (sid: string) => { setStep(sid as StepId); document.getElementById('panel')?.scrollTo({ top: 0 }); };
  const switchView = (v: 'quick' | 'full') => { setView(v); try { localStorage.setItem(VIEW_KEY, v); } catch { /* storage blocked */ } document.getElementById('panel')?.scrollTo({ top: 0 }); };
  const openFull = (sid?: string) => { if (sid) setStep(sid as StepId); switchView('full'); };
  const leave = (e: MouseEvent) => {
    if (save === 'error' && !window.confirm('Your latest changes have not been saved. Leave anyway?')) e.preventDefault();
  };
  const exitToCards = async () => {
    await flush();
    if (cardRef.current && contentKey(cardRef.current) !== savedKey.current && !window.confirm('Your latest changes have not been saved. Leave anyway?')) return;
    nav('/app');
  };

  const props: PanelProps = { card, set, mode, setMode, selected, setSelected, looks, goStep, ensureSaved, setPublished };
  const Current = STEPS.find((s) => s.id === step)!.Panel;
  const shuffleAll = ShuffleAll(props);
  const onPick = (el: ElementId) => { setSelected(el); setView('full'); setStep('colors'); setPreviewOpen(false); };
  const privateNote = card.published ? t('Preview of your published card.') : t('Private preview. This card is a draft, so nobody else can see it.');

  const toolbar = (
    <div className="pv-bar" role="toolbar" aria-label={t("Preview controls")}>
      <div className="seg seg--icons" role="radiogroup" aria-label={t("Preview mode")}>
        <button type="button" role="radio" aria-checked={mode === 'light'} className={mode === 'light' ? 'on' : ''} onClick={() => setMode('light')} aria-label={t("Light mode")}><Sun size={17} /></button>
        <button type="button" role="radio" aria-checked={mode === 'dark'} className={mode === 'dark' ? 'on' : ''} onClick={() => setMode('dark')} aria-label={t("Dark mode")}><Moon size={17} /></button>
      </div>
      <button type="button" className={`pv-btn ${picking ? 'on' : ''}`} aria-pressed={picking} onClick={() => setPicking(!picking)} title={t("Tap any part of the card to recolor it")}><MousePointerClick size={17} /><span>{t("Tap to recolor")}</span></button>
      <button type="button" className="pv-btn pv-btn--dice" onClick={shuffleAll} title={t("Shuffle colors, buttons and fonts")}><Dices size={18} /><span>{t("Shuffle all")}</span></button>
      <SaveLookButton api={looks} card={card} onSaved={say} />
      <div className="pv-bar__end">
        <button type="button" className="icon-btn" onClick={undo} disabled={!past.current.length} aria-label={t("Undo")}><Undo2 size={17} /></button>
        <button type="button" className="icon-btn" onClick={redo} disabled={!future.current.length} aria-label={t("Redo")}><Redo2 size={17} /></button>
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
    <div className={`ed ${view === 'quick' ? 'ed--quick' : ''}`}>
      <header className="ed__top">
        <Link to={adminOwner ? '/app/admin?tab=cards' : '/app'} onClick={leave} className="icon-btn" aria-label={adminOwner ? t('Back to admin') : t('Back to my cards')}><ArrowLeft size={19} /></Link>
        <div className="ed__title"><b>{card.data.fullName || 'Untitled card'}</b><small>{card.data.business || 'Add your business on the Profile step'}</small></div>
        {adminOwner && <span className="ed__admin" role="status"><ShieldCheck size={14} /> {t('Admin edit: {name}', { name: adminOwner })}</span>}
        {nicheOf(card) && <span className="ed__niche"><NicheBadge id={nicheOf(card)!.id} size="sm" onClick={() => goStep('layout')} /></span>}
        <div className="ed__status">
          <span className={`ed__pub ${card.published ? 'live' : 'draft'}`}>{card.published ? t('Published') : t('Draft')}</span>
          <span className={`ed__save ${save}`} role={save === 'error' ? 'alert' : 'status'} aria-live="polite" title={saveErr ?? ''}>
            {(save === 'saving' || save === 'unsaved') && <><Loader2 size={14} className="spin" aria-hidden /> {t("Saving")}</>}
            {save === 'saved' && <><Check size={14} aria-hidden /> {card.published ? t('Changes saved') : t('Draft saved')}</>}
            {save === 'error' && <>{t("Not saved. {v}", { v: saveErr ?? t('Could not save.') })}</>}
          </span>
          {save === 'error' && <button type="button" className="ed__retry" onClick={() => { void flush(); }}><RotateCw size={13} aria-hidden /> {t("Retry")}</button>}
        </div>
        {store.demo && <span className="demo-tag">{t("Demo. Changes stay on this device.")}</span>}
      </header>

      {view === 'full' && (
        <nav className="ed__steps" aria-label={t("Card sections")}>
          {GROUPS.map((g) => {
            const inside = g.ids.includes(step);
            const open = !g.advanced || advOpen || inside;
            return (
              <div key={g.id} className={`ed__grp ${g.advanced ? 'is-adv' : ''}`} role="group" aria-label={t(g.label)}>
                {g.advanced
                  ? <button type="button" className="ed__grp-h" aria-expanded={open} aria-controls="adv-steps" onClick={() => setAdvOpen(!advOpen)}><Palette size={15} aria-hidden /><span>{t("Advanced")}</span><ChevronDown size={14} aria-hidden className={open ? 'up' : ''} /></button>
                  : <span className="ed__grp-l" aria-hidden>{t(g.label)}</span>}
                {open && (
                  <div id={g.advanced ? 'adv-steps' : undefined} className="ed__grp-b">
                    {g.ids.map((sid) => {
                      const s = STEPS.find((x) => x.id === sid)!;
                      const n = STEPS.findIndex((x) => x.id === sid) + 1;
                      return (
                        <button key={s.id} type="button" className={step === s.id ? 'on' : ''} aria-current={step === s.id ? 'step' : undefined} onClick={() => setStep(s.id)}>
                          <s.icon size={18} aria-hidden /><span>{t(s.label)}</span><i aria-hidden>{n}</i>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      )}

      <main className="ed__panel" id="panel">
        <EditingBar api={looks} goFavorites={() => goStep('favorites')} />
        <ProBanner card={card} set={set} compact />
        {view === 'quick' ? (
          <>
            <div className="ed__viewbar"><LangToggle /></div>
            <h2 className="ed__h">{t("Quick setup")}</h2>
            <QuickStart p={props} step={qStep} setStep={(s) => { setQStep(s); document.getElementById('panel')?.scrollTo({ top: 0 }); }} preview={<div className="phone phone--inline"><div className="phone__screen"><CardRenderer card={card} mode={mode} sound={false} /></div></div>} onFull={openFull} onExit={() => { void exitToCards(); }} />
          </>
        ) : (
          <>
            <div className="ed__viewbar ed__viewbar--row"><LangToggle />
              <button type="button" className="linklike" onClick={() => switchView('quick')}><Zap size={14} aria-hidden /> {t("Switch to quick setup (3 steps)")}</button>
            </div>
            <h2 className="ed__h">{t(STEPS.find((s) => s.id === step)!.label)}</h2>
            <Current {...props} />
            <div className="ed__next">
              {STEPS.findIndex((s) => s.id === step) < STEPS.length - 1 && (
                <button type="button" className="btn btn--ink" onClick={() => { const i = STEPS.findIndex((s) => s.id === step); setStep(STEPS[i + 1].id); document.getElementById('panel')?.scrollTo({ top: 0 }); }}>{t("Next: {label}", { label: t(STEPS[STEPS.findIndex((s) => s.id === step) + 1].label) })}</button>
              )}
            </div>
          </>
        )}
      </main>

      <aside className="ed__preview" aria-label={t("Live preview")}>
        {toolbar}
        {preview}
        <p className="pv-hint pv-hint--state">{privateNote}</p>
        {picking && <p className="pv-hint">{t("Tap any part of the card to recolor it.")}</p>}
      </aside>

      {toast && <p className="pv-toast" role="status">{toast}</p>}
      <button type="button" className="fab" onClick={() => setPreviewOpen(true)}><Eye size={18} aria-hidden /> {t("Preview")}</button>
      {previewOpen && (
        <div className="pv-sheet" role="dialog" aria-modal="true" aria-label={t("Preview")}>
          <div className="pv-sheet__top">{toolbar}<button type="button" className="icon-btn" onClick={() => setPreviewOpen(false)} aria-label={t("Close preview")}><X size={20} /></button></div>
          <p className="pv-note">{privateNote}</p>
          <div className="pv-sheet__card"><CardRenderer card={card} mode={mode} picking={picking} selected={selected} onPick={onPick} sound={sound} /></div>
        </div>
      )}
    </div>
  );
}
