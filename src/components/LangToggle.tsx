import { useT, type Lang } from '../lib/i18n';

/** EN / ES switch. Remembered per browser. Place it on every top-level screen. */
export default function LangToggle({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const { lang, setLang, t } = useT();
  const opts: { v: Lang; label: string; full: string }[] = [{ v: 'en', label: 'EN', full: 'English' }, { v: 'es', label: 'ES', full: 'Español' }];
  return (
    <div className={`lang lang--${tone}`} role="group" aria-label={t('Language')}>
      {opts.map((o) => (
        <button key={o.v} type="button" lang={o.v} aria-pressed={lang === o.v} aria-label={o.full} className={lang === o.v ? 'on' : ''} onClick={() => setLang(o.v)}>{o.label}</button>
      ))}
    </div>
  );
}
