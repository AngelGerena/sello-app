import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Dices, Lock, LockOpen, MousePointerClick, RotateCcw, Upload, Download, Wand2, Check, Heart, Crown } from 'lucide-react';
import type { ButtonSpec, Card, ElementId, Mode, Theme } from '../../lib/types';
import {
  BUTTON_SHAPES, BUTTON_SIZES, BUTTON_STYLES, BUTTON_TEXTURES, ELEMENTS, FONT_PAIRS, HARMONIES, PRESETS,
  deriveTokens, elementContrast, googleFontsHref, themeFromSeeds, randomButton, randomSeeds, resolveColor, seedsOf, themeVars, type Harmony,
} from '../../lib/theme';
import { extractPalette, hexToHsl, luminance, normalizeHex, wcagLabel } from '../../lib/color';
import { store } from '../../lib/store';
import { sfx } from '../../lib/sfx';
import { TEMPLATES } from '../../templates';
import { usePlan } from '../../lib/usePlan';
import { isLocked } from '../../lib/plans';
import { NICHES, applyDesign, liteDesigns, nicheOf, sampleFor, type Design, type Niche, type NicheGroup } from '../../lib/niches';
import { DESIGN_COUNT, UNIQUE_DESIGNS, designsLabel, nicheCountLabel } from '../../lib/counts';
import { decorative } from '../../lib/a11y';
import NichePicker, { NicheBadge } from './NichePicker';
import CardRenderer from '../CardRenderer';
import ColorDial from '../ColorDial';
import { Section, Segmented, Toggle, type PanelProps } from './Fields';
import { rich, useT } from '../../lib/i18n';

const setTheme = (p: PanelProps, fn: (t: Theme) => Theme) => p.set((c) => ({ ...c, theme: fn(c.theme) }));

/* ------------------------------------------------------------ templates */
/** One design tile: live preview, name, blurb, Use / Layout only. Shared by the editor and the new-card picker. */
export function DesignTile({ card, niche, design, on, onUse, onLayoutOnly, confirm = true, sample = false, locked = false, free = false }: {
  card: Card; niche: Niche; design: Design; on?: boolean; onUse: () => void; onLayoutOnly?: () => void; confirm?: boolean; sample?: boolean;
  /** Pro design on a Lite account: can be tried in the editor, publishes as a Lite design until upgraded. */
  locked?: boolean;
  /** One of the free Lite designs. */
  free?: boolean;
}) {
  const { t } = useT();
  const [asking, setAsking] = useState(false);
  // Previews for another niche use that niche's sample business so they read true to the trade.
  const preview = applyDesign(sample ? sampleFor(card, niche) : card, niche, design);
  const tech = niche.group === 'Tech' || design.sound === 'tech';
  return (
    <div className={`tpl-card niche-card ${on ? 'on' : ''} ${tech ? 'is-tech' : ''}`}>
      <span className="tpl-card__thumb" {...decorative}>
        <span className="tpl-card__scale"><CardRenderer card={preview} mode={design.mode} sound={false} /></span>
      </span>
      {design.isNew && !locked && <span className="tpl-card__new">{t("New")}</span>}
      {locked && <span className="tpl-card__pro"><Crown size={12} /> {t("Pro")}</span>}
      {free && <span className="tpl-card__free">{t("Free")}</span>}
      <span className="tpl-card__meta"><b>{design.name}</b><small>{design.blurb}</small></span>
      {asking ? (
        <span className="niche-card__acts">{rich(t("<x1>Replaces your colors, fonts and buttons.</x1><x2>Apply</x2><x3>Cancel</x3>"), { x1: (c) => <small className="niche-card__warn">{c}</small>, x2: (c) => <button type="button" className="btn btn--gold btn--sm" onClick={() => { onUse(); setAsking(false); }}>{c}</button>, x3: (c) => <button type="button" className="btn btn--ghost btn--sm" onClick={() => setAsking(false)}>{c}</button> })}</span>
      ) : (
        <span className="niche-card__acts">
          <button type="button" className="btn btn--ink btn--sm" onClick={() => (confirm ? setAsking(true) : onUse())}>{locked ? 'Try it' : 'Use design'}</button>
          {onLayoutOnly && <button type="button" className="btn btn--ghost btn--sm" onClick={onLayoutOnly}>{t("Layout only")}</button>}
        </span>
      )}
      {on && <span className="tpl-card__on"><Check size={14} /></span>}
    </div>
  );
}


export function TemplatePanel(p: PanelProps) {
  const { t, lang } = useT();
  const { plan } = usePlan();
  const lite = plan === 'free';
  const mine = nicheOf(p.card);
  const [tab, setTab] = useState<'niche' | 'all' | 'classic'>(mine ? 'niche' : (p.startTab ?? 'all'));
  const [nicheId, setNicheId] = useState(() => mine?.id ?? 'tech');
  const [choosing, setChoosing] = useState(!mine);
  const [filter, setFilter] = useState<'all' | 'new' | NicheGroup>('all');
  const niche = NICHES.find((n) => n.id === nicheId) ?? NICHES[0];
  const classic = TEMPLATES.filter((t) => !t.niche);
  const use = (n: Niche, d: Design) => { p.looks?.markRoll(); p.set((c) => applyDesign(c, n, d)); p.setMode(d.mode); sfx('success', d.sound); };
  const isOn = (d: Design) => p.card.template === d.template && p.card.theme.tokens.light.accent === themeFromSeeds(d.seeds).tokens.light.accent;

  // "All designs" renders the shared UNIQUE_DESIGNS list (a design several niches share appears once), so its count can never drift.
  const all = UNIQUE_DESIGNS.filter(({ niche: n, design }) => filter === 'all' || (filter === 'new' ? design.isNew : n.group === filter));

  return (
    <>
      <Section title={t("Pick a design")} hint={t("Each design sets the layout, colors, fonts, buttons and sounds. Everything stays editable.")}>
        <Segmented label={t("Design groups")} value={tab} onChange={setTab} options={[{ v: 'niche', l: 'By niche' }, { v: 'all', l: `All designs` }, { v: 'classic', l: 'Classic' }]} />
      </Section>

      {tab === 'niche' && (
        <Section title="" hint="">
          {choosing ? (
            <>
              <p className="lay-q">{t("Which niche do you want to see designs for?")}</p>
              <NichePicker value={nicheId} onPick={(n) => { setNicheId(n.id); setChoosing(false); sfx('tap'); if (!p.card.data.niche) p.set((c) => ({ ...c, data: { ...c.data, niche: n.id } })); }} autoFocus />
            </>
          ) : (
            <>
              <div className="lay-bar">
                <NicheBadge id={niche.id} />
                <span className="lay-bar__txt">{rich(t("<b>{v}</b> for {v2}", { v: nicheCountLabel(niche, plan, lang), v2: niche.name.toLowerCase() }), { b: (c) => <b>{c}</b> })}</span>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => setChoosing(true)}>{t("Change")}</button>
              </div>
              {mine && niche.id !== mine.id && (
                <div className="lay-browse" role="status">
                  <span>{rich(t("You're browsing <b>{name}</b>. Your card is set to {name2}.", { name: niche.name, name2: mine.name }), { b: (c) => <b>{c}</b> })}</span>
                  <span className="row-ed">{rich(t("<x1>Back to {name}</x1><x2>Make this my niche</x2>", { name: mine.name }), { x1: (c) => <button type="button" className="btn btn--ghost btn--sm" onClick={() => setNicheId(mine.id)}>{c}</button>, x2: (c) => <button type="button" className="btn btn--ink btn--sm" onClick={() => { p.set((c) => ({ ...c, data: { ...c.data, niche: niche.id } })); sfx('success'); }}>{c}</button> })}</span>
                </div>
              )}
              {lite && (
                <>
                  <p className="lay-sub">{t("Free Lite designs")}</p>
                  <div className="tpl-grid">
                    {liteDesigns(niche).map((d) => (
                      <DesignTile key={'lite-' + d.template} card={p.card} niche={niche} design={d} free on={isOn(d)} sample={niche.id !== mine?.id} onUse={() => use(niche, d)} />
                    ))}
                  </div>
                  <p className="lay-sub">{rich(t("Pro designs <x1>Try any of them on your card. Upgrade to publish.</x1>"), { x1: (c) => <span>{c}</span> })}</p>
                </>
              )}
              <p className="lay-hint">{niche.id !== mine?.id ? <>{t("Previews show a sample {v} so you can see the vibe.", { v: niche.name.toLowerCase().replace(/s$/, '') })}</> : null}Tap <b>{t("Use design")}</b> to try one. Your words, photos and links stay. Undo anytime.</p>
              <div className="tpl-grid">
                {niche.designs.map((d) => (
                  <DesignTile key={d.template + d.name} card={p.card} niche={niche} design={d} on={isOn(d)} locked={isLocked(plan, d.template)} sample={niche.id !== mine?.id} onUse={() => use(niche, d)}
                    onLayoutOnly={() => { sfx('tap'); p.set((c) => applyDesign(c, niche, d, { layoutOnly: true })); }} />
                ))}
              </div>
              <button type="button" className="btn btn--ghost lay-all" onClick={() => setTab('all')}>{t("See all {v} across every niche", { v: designsLabel(DESIGN_COUNT, lang) })}</button>
            </>
          )}
        </Section>
      )}

      {tab === 'all' && (
        <Section title={`All designs (${all.length}${filter === 'all' ? '' : ` of ${DESIGN_COUNT}`})`} hint={t("Browse every design across niches.")}>
          <div className="chips" role="radiogroup" aria-label={t("Filter designs")}>
            {(['all', 'new', 'Tech', 'Beauty and grooming', 'Professional', 'Creative'] as const).map((f) => (
              <button key={f} type="button" role="radio" aria-checked={filter === f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>{f === 'all' ? 'Everything' : f === 'new' ? 'New' : f}</button>
            ))}
          </div>
          {lite && (
            <>
              <p className="lay-sub">{t("Free Lite designs")}</p>
              <div className="tpl-grid">
                {liteDesigns(mine ?? NICHES[0]).map((d) => (
                  <DesignTile key={'lite-all-' + d.template} card={p.card} niche={mine ?? NICHES[0]} design={d} free on={isOn(d)} sample={!mine} onUse={() => use(mine ?? NICHES[0], d)} />
                ))}
              </div>
              <p className="lay-sub">{rich(t("Pro designs <x1>Try any of them on your card. Upgrade to publish.</x1>"), { x1: (c) => <span>{c}</span> })}</p>
            </>
          )}
          <div className="tpl-grid">
            {all.map(({ niche: n, design: d }) => (
              <DesignTile key={n.id + d.template + d.name} card={p.card} niche={n} design={d} on={isOn(d)} locked={isLocked(plan, d.template)} sample={n.id !== mine?.id} onUse={() => use(n, d)}
                onLayoutOnly={() => { sfx('tap'); p.set((c) => applyDesign(c, n, d, { layoutOnly: true })); }} />
            ))}
          </div>
        </Section>
      )}

      {tab === 'classic' && (
        <Section title={t("Classic layouts")} hint={t("Your content, colors and buttons carry over. Switch freely.")}>
          <div className="tpl-grid">
            {classic.map((tpl) => (
              <button key={tpl.id} type="button" className={`tpl-card ${p.card.template === tpl.id ? 'on' : ''}`} onClick={() => { sfx('tap'); p.set((c) => ({ ...c, template: tpl.id })); }} aria-pressed={p.card.template === tpl.id}>
                <span className="tpl-card__thumb" {...decorative}>
                  <span className="tpl-card__scale"><CardRenderer card={{ ...p.card, template: tpl.id }} mode={p.mode} sound={false} /></span>
                </span>
                <span className="tpl-card__meta"><b>{tpl.name}</b><small>{tpl.bestFor}</small></span>
                {isLocked(plan, tpl.id) ? <span className="tpl-card__pro"><Crown size={12} /> {t("Pro")}</span> : lite && <span className="tpl-card__free">{t("Free")}</span>}
                {p.card.template === tpl.id && <span className="tpl-card__on"><Check size={14} /></span>}
              </button>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}

/* ------------------------------------------------------------ colors */
export function ColorsPanel(p: PanelProps) {
  const { t } = useT();
  const { card, mode, selected, setSelected } = p;
  const theme = card.theme;
  const seeds = seedsOf(theme);
  const [lock, setLock] = useState<{ brand: boolean; accent: boolean }>({ brand: false, accent: false });
  const [harmony, setHarmony] = useState<Harmony | 'any'>('any');
  const [bothModes, setBothModes] = useState(false);
  const [seedEdit, setSeedEdit] = useState<'brand' | 'accent' | 'ground' | null>(null);
  const [rolling, setRolling] = useState(false);
  const dialRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (selected) dialRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, [selected]);

  const shuffle = () => {
    setRolling(true); sfx('dice'); setTimeout(() => setRolling(false), 500);
    p.looks?.markRoll();
    const s = randomSeeds({ brand: lock.brand ? seeds.brand : undefined, accent: lock.accent ? seeds.accent : undefined }, harmony === 'any' ? undefined : harmony);
    setTheme(p, (t) => ({ ...t, tokens: deriveTokens(s), overrides: { light: {}, dark: {} } }));
  };
  const setSeed = (k: 'brand' | 'accent' | 'ground', hex: string) =>
    setTheme(p, (t) => ({ ...t, tokens: deriveTokens({ ...seedsOf(t), [k]: hex }) }));

  const setEl = (id: ElementId, hex: string | null) => setTheme(p, (t) => {
    const apply = (m: Mode) => { const o = { ...t.overrides[m] }; if (hex) o[id] = hex; else delete o[id]; return o; };
    return { ...t, overrides: bothModes ? { light: apply('light'), dark: apply('dark') } : { ...t.overrides, [mode]: apply(mode) } };
  });

  const kitSwatches = [
    { label: 'Brand kit', colors: theme.kit },
    { label: 'This card', colors: [...new Set(Object.values(theme.tokens[mode]))].slice(0, 10) },
  ];
  const overrideCount = Object.keys(theme.overrides[mode]).length;

  return (
    <>
      <Section title={t("Shuffle")} hint={t("Every roll is harmony-based and contrast-checked in light and dark.")}>
        <div className="dice">
          <div className="dice__row">
            <button type="button" className={`dice__main ${rolling ? 'rolling' : ''}`} onClick={shuffle}><Dices size={22} /> {t("Shuffle colors")}</button>
            <DiceSave p={p} />
          </div>
          <div className="dice__locks">
            <button type="button" className={`lockchip ${lock.brand ? 'on' : ''}`} onClick={() => setLock((l) => ({ ...l, brand: !l.brand }))} aria-pressed={lock.brand}>
              {lock.brand ? <Lock size={14} /> : <LockOpen size={14} />}<i style={{ background: seeds.brand }} /> Brand
            </button>
            <button type="button" className={`lockchip ${lock.accent ? 'on' : ''}`} onClick={() => setLock((l) => ({ ...l, accent: !l.accent }))} aria-pressed={lock.accent}>
              {lock.accent ? <Lock size={14} /> : <LockOpen size={14} />}<i style={{ background: seeds.accent }} /> Accent
            </button>
          </div>
        </div>
        <div className="chips" role="radiogroup" aria-label={t("Color harmony")}>
          {(['any', ...HARMONIES] as const).map((h) => (
            <button key={h} type="button" role="radio" aria-checked={harmony === h} className={harmony === h ? 'on' : ''} onClick={() => setHarmony(h)}>{h === 'any' ? 'Surprise me' : h[0].toUpperCase() + h.slice(1)}</button>
          ))}
        </div>
      </Section>

      <Section title={t("Palettes")}>
        <div className="presets">
          {PRESETS.map((pr) => (
            <button key={pr.id} type="button" onClick={() => { sfx('tap'); setTheme(p, (t) => ({ ...t, tokens: deriveTokens(pr.seeds), overrides: { light: {}, dark: {} } })); }}>
              <span className="presets__sw"><i style={{ background: pr.seeds.ground }} /><i style={{ background: pr.seeds.brand }} /><i style={{ background: pr.seeds.accent }} /></span>
              {pr.name}
            </button>
          ))}
        </div>
      </Section>

      <Section title={t("Core colors")} hint={t("Change these and the whole card re-derives in both modes.")}>
        <div className="seeds">
          {(['brand', 'accent', 'ground'] as const).map((k) => (
            <button key={k} type="button" className={seedEdit === k ? 'on' : ''} onClick={() => setSeedEdit(seedEdit === k ? null : k)}>
              <i style={{ background: seeds[k] }} /><span><b>{k === 'ground' ? 'Background' : k[0].toUpperCase() + k.slice(1)}</b><small>{seeds[k]}</small></span>
            </button>
          ))}
        </div>
        {seedEdit && <ColorDial label={seedEdit} value={seeds[seedEdit] ?? '#FFFFFF'} onChange={(h) => setSeed(seedEdit, h)} swatches={kitSwatches} />}
      </Section>

      <Section
        title={t("Fine-tune any part")}
        hint={<>{t("Editing")} <b>{mode}</b> {t("mode. Tap any part of the preview with")} <MousePointerClick size={13} style={{ verticalAlign: '-2px' }} /> {t("on, or pick from the list.")}</>}
        action={overrideCount > 0 ? <button type="button" className="btn btn--ghost btn--sm" onClick={() => setTheme(p, (t) => ({ ...t, overrides: { ...t.overrides, [mode]: {} } }))}><RotateCcw size={14} /> Reset {overrideCount}</button> : undefined}
      >
        <Toggle label={t("Apply to light and dark")} hint={t("Off: each mode keeps its own custom colors.")} checked={bothModes} onChange={setBothModes} />
        {(['Surfaces', 'Text', 'Buttons', 'Details'] as const).map((g) => (
          <div key={g} className="els">
            <h4>{g}</h4>
            {ELEMENTS.filter((e) => e.group === g).map((e) => {
              const col = resolveColor(theme, mode, e.id);
              const r = elementContrast(theme, mode, e.id);
              const grade = r ? wcagLabel(r) : null;
              const custom = Boolean(theme.overrides[mode][e.id]);
              return (
                <div key={e.id} className={`els__row ${selected === e.id ? 'on' : ''}`}>
                  <button type="button" className="els__btn" onClick={() => setSelected(selected === e.id ? null : e.id)} aria-expanded={selected === e.id}>
                    <i style={{ background: col }} />
                    <span className="els__l">{e.label}{custom && <em>{t("custom")}</em>}</span>
                    {grade && <span className={`els__g ${grade.ok ? '' : 'bad'}`} title={`${r!.toFixed(1)}:1`}>{grade.label}</span>}
                  </button>
                  {selected === e.id && (
                    <div className="els__dial" ref={dialRef}>
                      <ColorDial label={e.label} value={col} onChange={(h) => setEl(e.id, h)} against={e.on ? resolveColor(theme, mode, e.on) : undefined} swatches={kitSwatches} />
                      {custom && <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEl(e.id, null)}><RotateCcw size={14} /> {t("Back to theme color")}</button>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </Section>

      <Section title={t("What visitors see first")}>
        <Segmented label={t("Default mode")} value={theme.modeDefault} onChange={(v) => setTheme(p, (t) => ({ ...t, modeDefault: v }))} options={[{ v: 'light', l: 'Light' }, { v: 'dark', l: 'Dark' }, { v: 'auto', l: 'Match their phone' }]} />
        <label className="range">
          <span>{t("Corner roundness")}</span>
          <input type="range" min={0} max={1.5} step={0.05} value={theme.cornerScale} onChange={(e) => setTheme(p, (t) => ({ ...t, cornerScale: Number(e.target.value) }))} />
        </label>
      </Section>
    </>
  );
}

/* ------------------------------------------------------------ buttons */
const LABEL: Record<string, string> = {
  pill: 'Pill', rounded: 'Rounded', soft: 'Soft', square: 'Square', leaf: 'Leaf', chamfer: 'Cut corner', tab: 'Tab', arch: 'Arch',
  compact: 'Compact', regular: 'Regular', large: 'Large',
  solid: 'Solid', outline: 'Outline', glass: 'Glass', gradient: 'Gradient', raised: '3D raised', neumorphic: 'Soft emboss', ghost: 'Text link', duotone: 'Duotone', inset: 'Pressed in', neon: 'Neon glow', hud: 'HUD frame',
  none: 'Clean', grain: 'Film grain', linen: 'Linen', brushed: 'Brushed metal', paper: 'Paper fiber', satin: 'Satin sheen', carbon: 'Carbon', dots: 'Halftone', scanline: 'Scanlines', circuit: 'Circuit',
};

function Swatch({ theme, mode, spec, label, onClick, on }: { theme: Theme; mode: Mode; spec: ButtonSpec; label: string; onClick: () => void; on: boolean }) {
  const { t } = useT();
  const style = themeVars(theme, mode) as CSSProperties;
  const cls = (v: string) => `fb fb--${v} shape-${spec.shape} size-compact style-${spec.style} tex-${spec.texture}`;
  return (
    <button type="button" className={`bsw ${on ? 'on' : ''}`} onClick={onClick} aria-pressed={on}>
      <span className={`bsw__stage mode-${mode}`} style={style}>
        <span className={cls('primary')}>{rich(t("<x1>Save</x1>"), { x1: (c) => <span className="fb__tx">{c}</span> })}</span>
        <span className={cls('secondary')}>{rich(t("<x1>Share</x1>"), { x1: (c) => <span className="fb__tx">{c}</span> })}</span>
      </span>
      <span className="bsw__l">{label}</span>
    </button>
  );
}

export function ButtonsPanel(p: PanelProps) {
  const { t: tl } = useT();
  const t = p.card.theme, b = t.button;
  const put = (patch: Partial<ButtonSpec>) => setTheme(p, (th) => ({ ...th, button: { ...th.button, ...patch } }));
  const [locks, setLocks] = useState<Partial<Record<keyof ButtonSpec, boolean>>>({});
  const shuffle = () => {
    sfx('dice');
    p.looks?.markRoll();
    const keep: Partial<ButtonSpec> = {};
    (Object.keys(locks) as (keyof ButtonSpec)[]).forEach((k) => { if (locks[k]) (keep as Record<string, string>)[k] = b[k]; });
    put(randomButton(keep));
  };
  const LockBtn = ({ k }: { k: keyof ButtonSpec }) => (
    <button type="button" className={`lockchip sm ${locks[k] ? 'on' : ''}`} onClick={() => setLocks((l) => ({ ...l, [k]: !l[k] }))} aria-pressed={!!locks[k]} aria-label={`Lock ${k}`}>
      {locks[k] ? <Lock size={13} /> : <LockOpen size={13} />}
    </button>
  );
  return (
    <>
      <Section title={tl("Shuffle buttons")} hint={tl("Lock any part you love, then roll the rest.")}>
        <div className="dice"><div className="dice__row"><button type="button" className="dice__main" onClick={shuffle}><Dices size={22} /> {tl("Shuffle buttons")}</button><DiceSave p={p} /></div></div>
        <div className="bprev">
          {(['light', 'dark'] as Mode[]).map((m) => (
            <span key={m} className={`bprev__stage mode-${m}`} style={themeVars(t, m) as CSSProperties}>
              <span className={`fb fb--primary shape-${b.shape} size-${b.size} style-${b.style} tex-${b.texture} fb--block`}>{rich(tl("<x1>Save contact</x1>"), { x1: (c) => <span className="fb__tx">{c}</span> })}</span>
              <span className={`fb fb--secondary shape-${b.shape} size-${b.size} style-${b.style} tex-${b.texture}`}>{rich(tl("<x1>Share</x1>"), { x1: (c) => <span className="fb__tx">{c}</span> })}</span>
              <small>{m === 'light' ? 'Light' : 'Dark'}</small>
            </span>
          ))}
        </div>
      </Section>
      <Section title={tl("Style")} action={<LockBtn k="style" />}>
        <div className="bgrid">{BUTTON_STYLES.map((s) => <Swatch key={s} theme={t} mode={p.mode} spec={{ ...b, style: s }} label={LABEL[s]} on={b.style === s} onClick={() => put({ style: s })} />)}</div>
      </Section>
      <Section title={tl("Shape")} action={<LockBtn k="shape" />}>
        <div className="bgrid">{BUTTON_SHAPES.map((s) => <Swatch key={s} theme={t} mode={p.mode} spec={{ ...b, shape: s }} label={LABEL[s]} on={b.shape === s} onClick={() => put({ shape: s })} />)}</div>
      </Section>
      <Section title={tl("Texture")} hint={tl("Subtle finishes that show best on solid, gradient and raised styles.")} action={<LockBtn k="texture" />}>
        <div className="bgrid">{BUTTON_TEXTURES.map((s) => <Swatch key={s} theme={t} mode={p.mode} spec={{ ...b, texture: s, style: b.style === 'ghost' || b.style === 'outline' ? 'solid' : b.style }} label={LABEL[s]} on={b.texture === s} onClick={() => put({ texture: s })} />)}</div>
      </Section>
      <Section title={tl("Size")} action={<LockBtn k="size" />}>
        <Segmented label={tl("Button size")} value={b.size} onChange={(v) => put({ size: v })} options={BUTTON_SIZES.map((s) => ({ v: s, l: LABEL[s] }))} />
        <p className="note">{tl("Every size keeps a 44px touch target, the minimum Apple and Google recommend.")}</p>
      </Section>
      <Section title={tl("Tap sounds")} hint={tl("Soft audio feedback when visitors tap. Always silent for people who turn off motion on their phone.")}>
        <Segmented label={tl("Sound")} value={t.sound ?? 'calm'} onChange={(v) => { setTheme(p, (th) => ({ ...th, sound: v })); sfx('primary', v); }} options={[{ v: 'calm', l: 'Calm' }, { v: 'tech', l: 'Tech' }, { v: 'bright', l: 'Bright' }, { v: 'off', l: 'Off' }]} />
      </Section>
    </>
  );
}

/* ------------------------------------------------------------ fonts and brand kit */
export function BrandPanel(p: PanelProps) {
  const { t: tl } = useT();
  const t = p.card.theme;
  const [hexText, setHexText] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const href = googleFontsHref(FONT_PAIRS.flatMap((f) => [f.display, f.body]));
    if (!document.querySelector(`link[data-fc-pairs]`)) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; l.dataset.fcPairs = '1'; document.head.appendChild(l); }
  }, []);

  const parsed = useMemo(() => (hexText.match(/#?[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g) ?? []).map((h) => normalizeHex(h)).filter(Boolean) as string[], [hexText]);
  const addKit = (cols: string[]) => setTheme(p, (th) => ({ ...th, kit: [...new Set([...th.kit, ...cols])].slice(0, 16) }));

  const fromLogo = async () => {
    if (!p.card.data.logoUrl) { setMsg('Upload your logo on the Profile step first.'); return; }
    setBusy(true); setMsg(null);
    try {
      const cols = await extractPalette(p.card.data.logoUrl, 6);
      if (!cols.length) setMsg('No strong colors found in that logo. Paste your hex codes instead.');
      else { addKit(cols); setMsg(`Found ${cols.length} colors in your logo.`); }
    } catch { setMsg('Could not read that logo. Paste your hex codes instead.'); } finally { setBusy(false); }
  };

  const applyKit = () => {
    if (!t.kit.length) return;
    // Brand: the deepest color with some character. Accent: the most vivid of the rest.
    const byDepth = [...t.kit].sort((a, b) => luminance(a) - luminance(b));
    const brand = byDepth.find((c) => hexToHsl(c).s > 12 && luminance(c) < 0.25) ?? byDepth[0];
    const accent = [...t.kit].filter((c) => c !== brand).sort((a, b) => hexToHsl(b).s * (1 - Math.abs(hexToHsl(b).l - 50) / 60) - hexToHsl(a).s * (1 - Math.abs(hexToHsl(a).l - 50) / 60))[0] ?? brand;
    sfx('success');
    setTheme(p, (th) => ({ ...th, tokens: deriveTokens({ brand, accent: accent ?? brand, ground: seedsOf(th).ground }), overrides: { light: {}, dark: {} } }));
  };

  const uploadFont = async (role: 'display' | 'body', f?: File) => {
    if (!f) return;
    if (!/\.(woff2?|ttf|otf)$/i.test(f.name)) { setMsg('Fonts must be WOFF2, WOFF, TTF or OTF.'); return; }
    const url = await store.uploadImage(f, 'font');
    const fam = f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
    setTheme(p, (th) => ({ ...th, fonts: { ...th.fonts, [role]: fam, [role === 'display' ? 'customDisplayUrl' : 'customBodyUrl']: url } }));
    setMsg(`${fam} is now your ${role === 'display' ? 'heading' : 'body'} font.`);
  };

  const exportKit = () => {
    const kit = { app: 'finesse-cards', v: 1, colors: t.kit, seeds: seedsOf(t), fonts: { display: t.fonts.display, body: t.fonts.body }, button: t.button };
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(kit, null, 2)], { type: 'application/json' }));
    a.download = 'brand-kit.json'; a.click();
  };
  const importKit = async (f?: File) => {
    if (!f) return;
    try {
      const k = JSON.parse(await f.text());
      setTheme(p, (th) => ({
        ...th,
        kit: Array.isArray(k.colors) ? k.colors.map(normalizeHex).filter(Boolean) : th.kit,
        tokens: k.seeds?.brand ? deriveTokens(k.seeds) : th.tokens,
        fonts: k.fonts?.display ? { ...th.fonts, display: k.fonts.display, body: k.fonts.body ?? th.fonts.body } : th.fonts,
        button: k.button?.shape ? k.button : th.button,
      }));
      setMsg('Brand kit imported.');
    } catch { setMsg('That file is not a brand kit. Export one from this app, or paste hex codes.'); }
  };

  return (
    <>
      <Section title={tl("Brand kit")} hint={tl("Bring your colors from Canva, a style guide or your logo.")}>
        <div className="kit">
          {t.kit.length ? t.kit.map((c) => (
            <button key={c} type="button" className="kit__sw" style={{ background: c }} title={`${c}. Click to remove`} aria-label={`Remove ${c}`} onClick={() => setTheme(p, (th) => ({ ...th, kit: th.kit.filter((x) => x !== c) }))} />
          )) : <p className="note">{tl("No kit colors yet.")}</p>}
        </div>
        <div className="row-ed">
          <button type="button" className="btn btn--ghost" onClick={fromLogo} disabled={busy}><Wand2 size={16} /> {busy ? 'Reading logo...' : 'Pull colors from my logo'}</button>
          {t.kit.length > 0 && <button type="button" className="btn btn--gold" onClick={applyKit}>{tl("Apply kit to card")}</button>}
        </div>
        <div className="fld">
          <label htmlFor="hexes">{tl("Paste hex codes")}</label>
          <textarea id="hexes" rows={2} value={hexText} onChange={(e) => setHexText(e.target.value)} placeholder={tl("#1C2640, #C5A44B, #F2ECE4")} />
          <small>{tl("In Canva: Brand Kit, click a color, copy its hex code. Paste as many as you like.")}</small>
        </div>
        {parsed.length > 0 && <button type="button" className="btn btn--ink btn--sm" onClick={() => { addKit(parsed); setHexText(''); }}>{tl("Add {length} color{v} to kit", { length: parsed.length, v: parsed.length > 1 ? 's' : '' })}</button>}
        <div className="row-ed">
          <button type="button" className="btn btn--ghost btn--sm" onClick={exportKit}><Download size={15} /> {tl("Export kit")}</button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => fileRef.current?.click()}><Upload size={15} /> {tl("Import kit")}</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => { importKit(e.target.files?.[0]); e.target.value = ''; }} />
        </div>
        {msg && <p className="note" role="status">{msg}</p>}
      </Section>

      <Section title={tl("Fonts")} hint={tl("A heading face with character over a clean reading face.")}>
        <div className="fonts">
          {FONT_PAIRS.map((f) => {
            const on = t.fonts.display === f.display && t.fonts.body === f.body;
            return (
              <button key={f.id} type="button" className={on ? 'on' : ''} onClick={() => setTheme(p, (th) => ({ ...th, fonts: { display: f.display, body: f.body } }))} aria-pressed={on}>{rich(tl("<x1>{v}</x1><x2>{display} with {body}</x2><small>{mood}</small>", { v: p.card.data.fullName.split(' ')[0] || 'Jordan', display: f.display, body: f.body, mood: f.mood }), { x1: (c) => <span className="fonts__d" style={{ fontFamily: `'${f.display}', serif` }}>{c}</span>, x2: (c) => <span className="fonts__b" style={{ fontFamily: `'${f.body}', sans-serif` }}>{c}</span>, small: (c) => <small>{c}</small> })}</button>
            );
          })}
        </div>
        <div className="row-ed">
          <label className="btn btn--ghost btn--sm">{tl("Upload heading font")}<input type="file" accept=".woff2,.woff,.ttf,.otf" hidden onChange={(e) => uploadFont('display', e.target.files?.[0])} /></label>
          <label className="btn btn--ghost btn--sm">{tl("Upload body font")}<input type="file" accept=".woff2,.woff,.ttf,.otf" hidden onChange={(e) => uploadFont('body', e.target.files?.[0])} /></label>
        </div>
        <p className="note">{tl("Only upload fonts you're licensed to use on the web.")}</p>
      </Section>
    </>
  );
}

export function ShuffleAll(p: PanelProps) {
  // Used by the preview toolbar: one tap re-rolls colors, buttons and layout-agnostic style.
  return () => {
    sfx('dice');
    p.looks?.markRoll();
    const s = randomSeeds();
    const pair = FONT_PAIRS[Math.floor(Math.random() * FONT_PAIRS.length)];
    setTheme(p, (t) => ({ ...t, tokens: deriveTokens(s), overrides: { light: {}, dark: {} }, button: randomButton(), fonts: { display: pair.display, body: pair.body }, cornerScale: [0.4, 0.8, 1, 1, 1.2][Math.floor(Math.random() * 5)] }));
  };
}

/** Heart next to every dice: one tap keeps the roll you are looking at. */
function DiceSave({ p }: { p: PanelProps }) {
  const api = p.looks;
  const [flash, setFlash] = useState<string | null>(null);
  if (!api) return null;
  const saved = api.currentSavedAs;
  return (
    <button
      type="button"
      className={`dice__save ${saved ? 'on' : ''}`}
      aria-label={saved ? `Saved as ${saved.name}` : 'Save this look to Favorites'}
      title={flash ?? (saved ? `Saved as ${saved.name}` : 'Save this look to Favorites')}
      onClick={async () => {
        if (saved) { setFlash(`Saved as ${saved.name}`); return; }
        const l = await api.saveCurrent('');
        if (l) { sfx('success'); setFlash(`Saved as ${l.name}`); setTimeout(() => setFlash(null), 2000); }
      }}
    >
      <Heart size={20} fill={saved ? 'currentColor' : 'none'} />
    </button>
  );
}
