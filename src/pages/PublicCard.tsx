import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Card, Mode } from '../lib/types';
import { store } from '../lib/store';
import { APP_NAME } from '../lib/plans';
import { effectiveMode } from '../lib/theme';
import CardRenderer from '../components/CardRenderer';

export default function PublicCard() {
  const { slug } = useParams();
  const [card, setCard] = useState<Card | null | undefined>(undefined);
  const [sysDark, setSysDark] = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false);

  useEffect(() => {
    store.publicCard(slug ?? '').then((c) => { setCard(c); if (c) store.track(c.id, 'view'); }).catch(() => setCard(null));
  }, [slug]);
  const track = useCallback((kind: string) => { if (card) store.track(card.id, kind); }, [card]);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const f = (e: MediaQueryListEvent) => setSysDark(e.matches);
    mq.addEventListener('change', f); return () => mq.removeEventListener('change', f);
  }, []);

  const wanted: Mode = !card ? 'light' : card.theme.modeDefault === 'auto' ? (sysDark ? 'dark' : 'light') : card.theme.modeDefault;
  const mode: Mode = card ? effectiveMode(card.template, wanted) : wanted;

  useEffect(() => {
    if (!card) return;
    document.title = [card.data.fullName, card.data.business].filter(Boolean).join(' | ');
    const bg = card.theme.overrides[mode].pageBg ?? card.theme.tokens[mode].bg;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg);
    document.body.style.background = bg;
    return () => { document.body.style.background = ''; };
  }, [card, mode]);

  if (card === undefined) return <div className="pub-loading" aria-busy="true" />;
  if (card === null) return (
    <div className="center-msg">
      <h1>This card isn't available</h1>
      <p>The link may be mistyped, or the owner has taken it offline.</p>
      <Link className="btn btn--ink" to="/">Make your own card</Link>
    </div>);

  return (
    <div className="pub-wrap">
      <div className="pub-card"><CardRenderer card={card} mode={mode} track={track} /></div>
      {card.badge !== false && <a className="made-with" href="/">Made with {APP_NAME}</a>}
    </div>
  );
}
