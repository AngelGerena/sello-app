import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Brand from '../components/Brand';
import LangToggle from '../components/LangToggle';
import { LEGAL_UPDATED, PRIVACY, TERMS } from '../legal/content';
import { useT } from '../lib/i18n';

/** Terms of Service and Privacy Policy, in English and Spanish (the English text controls). */
export default function Legal({ kind }: { kind: 'terms' | 'privacy' }) {
  const { t, lang } = useT();
  const sections = kind === 'terms' ? TERMS : PRIVACY;
  const title = kind === 'terms' ? t('Terms of Service') : t('Privacy Policy');
  useEffect(() => { document.title = `${title} | OKUNAMI`; return () => { document.title = 'OKUNAMI'; }; }, [title]);

  // consecutive "• " lines become one bulleted list
  const render = (paras: string[]): ReactNode[] => {
    const out: ReactNode[] = []; let list: string[] = [];
    const flush = () => { if (list.length) { out.push(<ul key={`u${out.length}`}>{list.map((x, i) => <li key={i}>{x}</li>)}</ul>); list = []; } };
    paras.forEach((p, i) => { if (p.startsWith('• ')) list.push(p.slice(2)); else { flush(); out.push(<p key={`p${i}`}>{p}</p>); } });
    flush();
    return out;
  };

  return (
    <div className="legal">
      <header className="legal__bar">
        <Link to="/" className="legal__back"><ArrowLeft size={16} aria-hidden /> {t('Back to OKUNAMI')}</Link>
        <Brand />
        <LangToggle />
      </header>
      <main className="legal__main">
        <h1>{title}</h1>
        <p className="legal__meta">{t('Last updated')}: {LEGAL_UPDATED[lang]}</p>
        {lang === 'es' && <p className="legal__note">{t('This Spanish version is provided for convenience. If it differs from the English version, the English version controls.')}</p>}
        <nav className="legal__toc" aria-label={t('Contents')}>
          <b>{t('Contents')}</b>
          <ol>{sections.map((s) => <li key={s.id}><a href={`#${s.id}`}>{s.title[lang].replace(/^\d+\.\s*/, '')}</a></li>)}</ol>
        </nav>
        {sections.map((s) => (
          <section key={s.id} id={s.id} lang={lang} aria-labelledby={`h-${s.id}`}>
            <h2 id={`h-${s.id}`}>{s.title[lang]}</h2>
            {render(s.body[lang])}
          </section>
        ))}
        <p className="legal__other">{kind === 'terms' ? <Link to="/privacy">{t('Privacy Policy')}</Link> : <Link to="/terms">{t('Terms of Service')}</Link>}</p>
      </main>
    </div>
  );
}
