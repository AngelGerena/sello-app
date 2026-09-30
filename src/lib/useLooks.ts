import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Card, Look, TemplateId, Theme } from './types';
import { store } from './store';
import { hexToHsl } from './color';

/* Everything the editor needs to save, recall and edit favorite looks.
   "Recent rolls" is session-only: every dice roll lands there, so a look
   the user rolled past is one tap away from being saved. */

export interface Roll { key: string; theme: Theme; template: TemplateId; at: number; }

export interface LooksApi {
  looks: Look[];
  loading: boolean;
  error: string | null;
  recent: Roll[];
  activeId: string | null;             // favorite being edited
  active: Look | null;
  activeDirty: boolean;                // card differs from the saved favorite
  currentSavedAs: Look | null;         // the card exactly matches this favorite
  markRoll: () => void;                // call right before a dice roll changes the theme
  saveCurrent: (name: string) => Promise<Look | null>;
  saveRoll: (roll: Roll, name: string) => Promise<Look | null>;
  updateActive: () => Promise<void>;
  apply: (look: Look | Roll, opts?: { edit?: boolean; keepLayout?: boolean }) => void;
  stopEditing: () => void;
  rename: (id: string, name: string) => Promise<void>;
  duplicate: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  suggestName: (theme: Theme) => string;
}

/** Compare only what a look contains (ignores key order). */
const sig = (theme: Theme, template?: TemplateId) =>
  JSON.stringify([theme.tokens, theme.overrides, theme.fonts, theme.button, theme.cornerScale, template ?? null]);

const HUE_NAMES: [number, string][] = [
  [15, 'Crimson'], [40, 'Clay'], [60, 'Amber'], [80, 'Olive'], [150, 'Sage'], [185, 'Teal'],
  [215, 'Harbor'], [250, 'Indigo'], [285, 'Plum'], [330, 'Orchid'], [361, 'Crimson'],
];
const hueName = (hex: string) => {
  const { h, s } = hexToHsl(hex);
  if (s < 12) return 'Graphite';
  return HUE_NAMES.find(([max]) => h < max)?.[1] ?? 'Crimson';
};

export function useLooks(card: Card | null, set: (fn: (c: Card) => Card) => void): LooksApi {
  const [looks, setLooks] = useState<Look[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<Roll[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const rolling = useRef(false);

  useEffect(() => {
    store.looks().then(setLooks).catch((e) => setError(e.message ?? 'Could not load favorites.')).finally(() => setLoading(false));
  }, []);

  // Capture each dice result after it lands on the card.
  useEffect(() => {
    if (!card || !rolling.current) return;
    rolling.current = false;
    const roll: Roll = { key: `${Date.now()}`, theme: card.theme, template: card.template, at: Date.now() };
    setRecent((r) => [roll, ...r.filter((x) => sig(x.theme, x.template) !== sig(roll.theme, roll.template))].slice(0, 12));
  }, [card]);

  const active = looks.find((l) => l.id === activeId) ?? null;
  const cardSig = card ? sig(card.theme, card.template) : '';
  const currentSavedAs = useMemo(() => looks.find((l) => sig(l.theme, l.template) === cardSig) ?? null, [looks, cardSig]);
  const activeDirty = Boolean(active && card && sig(active.theme, active.template) !== cardSig);

  const suggestName = useCallback((theme: Theme) => {
    const a = hueName(theme.tokens.light.brand), b = hueName(theme.tokens.light.accent);
    const base = a === b ? a : `${a} and ${b}`;
    const n = looks.filter((l) => l.name.startsWith(base)).length;
    return n ? `${base} ${n + 1}` : base;
  }, [looks]);

  const persist = async (look: Look) => {
    setError(null);
    try {
      const saved = await store.saveLook(look);
      setLooks((ls) => [saved, ...ls.filter((l) => l.id !== saved.id)]);
      return saved;
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save.'); return null; }
  };

  const now = () => new Date().toISOString();

  return {
    looks, loading, error, recent, activeId, active, activeDirty, currentSavedAs,
    markRoll: () => { rolling.current = true; },
    saveCurrent: async (name) => {
      if (!card) return null;
      const look: Look = { id: store.newLookId(), name: name.trim() || suggestName(card.theme), theme: card.theme, template: card.template, createdAt: now(), updatedAt: now() };
      return persist(look);
    },
    saveRoll: async (roll, name) => persist({ id: store.newLookId(), name: name.trim() || suggestName(roll.theme), theme: roll.theme, template: roll.template, createdAt: now(), updatedAt: now() }),
    updateActive: async () => {
      if (!active || !card) return;
      await persist({ ...active, theme: card.theme, template: card.template });
    },
    apply: (look, opts = {}) => {
      // The card's own brand kit is kept; everything visual comes from the look.
      set((c) => ({ ...c, theme: { ...look.theme, kit: c.theme.kit.length ? c.theme.kit : look.theme.kit }, template: opts.keepLayout ? c.template : look.template }));
      setActiveId(opts.edit && 'id' in look ? look.id : null);
    },
    stopEditing: () => setActiveId(null),
    rename: async (id, name) => {
      const l = looks.find((x) => x.id === id);
      if (l && name.trim() && name.trim() !== l.name) await persist({ ...l, name: name.trim() });
    },
    duplicate: async (id) => {
      const l = looks.find((x) => x.id === id);
      if (l) await persist({ ...l, id: store.newLookId(), name: `${l.name} copy`, createdAt: now() });
    },
    remove: async (id) => {
      const before = looks;
      setLooks((ls) => ls.filter((l) => l.id !== id));
      if (activeId === id) setActiveId(null);
      try { await store.removeLook(id); } catch (e) { setLooks(before); setError(e instanceof Error ? e.message : 'Could not delete.'); }
    },
    suggestName,
  };
}
