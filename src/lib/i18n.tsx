/* English / Spanish for the SeYo app and website.

   How it works
   - English text IS the key: t('Full name'). If a Spanish phrase exists in src/i18n/es.ts it is used, otherwise
     the English text shows, so a missing translation never breaks a screen.
   - `npm run check:i18n` fails if any t('...') phrase in the source has no Spanish entry, so coverage is enforced.
   - The choice is remembered in this browser (localStorage "fc.lang"), can be forced with ?lang=es, and
     otherwise follows the browser language.
   - Variables: t('{n} cards', { n: 5 }). Bold or links inside a sentence: rich(t('Open <b>Preview</b>'), { b: (c) => <b>{c}</b> }). */
import { createContext, createElement, Fragment, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ES } from '../i18n/es';

export type Lang = 'en' | 'es';
const KEY = 'fc.lang';

function detect(): Lang {
  try {
    const q = new URLSearchParams(window.location.search).get('lang');
    if (q === 'es' || q === 'en') { try { localStorage.setItem(KEY, q); } catch { /* storage blocked */ } return q; }   // a shared ?lang= link is remembered
    const s = localStorage.getItem(KEY);
    if (s === 'es' || s === 'en') return s;
  } catch { /* storage blocked */ }
  return (typeof navigator !== 'undefined' && (navigator.language || '').toLowerCase().startsWith('es')) ? 'es' : 'en';
}

let current: Lang = typeof window === 'undefined' ? 'en' : detect();

type Vars = Record<string, string | number | undefined | null>;
const fill = (text: string, vars?: Vars) =>
  vars ? text.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k] ?? '') : m)) : text;

/** Translate outside React (error messages, toasts). Inside components prefer useT(). */
export const tr = (en: string, vars?: Vars, lang: Lang = current): string =>
  fill(lang === 'es' ? (ES[en] ?? en) : en, vars);

/** Turns "Open <b>Preview</b>" into React nodes using the given tag renderers. */
export function rich(text: string, tags: Record<string, (children: ReactNode) => ReactNode>): ReactNode {
  const parts: ReactNode[] = [];
  const re = /<(\w+)>(.*?)<\/\1>/g;
  let last = 0, m: RegExpExecArray | null, i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const render = tags[m[1]];
    parts.push(createElement(Fragment, { key: i++ }, render ? render(m[2]) : m[2]));
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return createElement(Fragment, null, ...parts);
}

interface Ctx { lang: Lang; setLang: (l: Lang) => void; t: (en: string, vars?: Vars) => string }
const I18nContext = createContext<Ctx>({ lang: 'en', setLang: () => undefined, t: (en, vars) => fill(en, vars) });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(current);
  useEffect(() => { current = lang; document.documentElement.lang = lang; }, [lang]);
  const setLang = useCallback((l: Lang) => {
    current = l; setLangState(l);
    try { localStorage.setItem(KEY, l); } catch { /* storage blocked */ }
  }, []);
  const value = useMemo<Ctx>(() => ({ lang, setLang, t: (en, vars) => tr(en, vars, lang) }), [lang, setLang]);
  return createElement(I18nContext.Provider, { value }, children);
}

export const useT = () => useContext(I18nContext);
