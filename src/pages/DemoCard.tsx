import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import CardRenderer from '../components/CardRenderer';
import { sampleCard } from '../lib/seed';
import { ALL_DESIGNS, applyDesign, sampleFor } from '../lib/niches';
import { TEMPLATES } from '../templates';
import Brand from '../components/Brand';

/** A real, fully interactive sample card. It is the labelled "Open demo" target for every design preview on the
    landing page, so keyboard and screen-reader users get the actual card, not an inert picture of it.
    Sample links, phone numbers and addresses are fictional, so leaving the page through them is disabled. */
export default function DemoCard() {
  const { template = '' } = useParams();
  const base = useMemo(() => sampleCard(), []);
  const hit = ALL_DESIGNS.find((x) => x.design.template === template);
  const layout = TEMPLATES.find((t) => t.id === template);
  const [note, setNote] = useState<string | null>(null);

  const card = useMemo(() => {
    if (hit) return applyDesign(sampleFor(base, hit.niche), hit.niche, hit.design);
    return layout ? { ...base, template: layout.id } : null;
  }, [hit, layout, base]);
  const name = hit?.design.name ?? layout?.name ?? 'Design';

  useEffect(() => { document.title = `${name} demo | SeYo`; return () => { document.title = 'SeYo'; }; }, [name]);
  useEffect(() => { if (!note) return; const t = setTimeout(() => setNote(null), 3500); return () => clearTimeout(t); }, [note]);

  if (!card) {
    return (
      <div className="demo">
        <header className="demo__bar"><Brand tone="dark" /></header>
        <main className="demo__missing"><h1>That design was not found</h1><Link className="btn btn--gold" to="/#layouts">Back to all designs</Link></main>
      </div>
    );
  }

  // Sample content only: block navigation to fictional addresses, keep every in-card control working.
  const guard = (e: MouseEvent) => {
    const a = (e.target as HTMLElement).closest('a[href]') as HTMLAnchorElement | null;
    if (!a) return;
    const href = a.getAttribute('href') ?? '';
    if (/^(https?:|tel:|mailto:|sms:|geo:|maps:)/i.test(href) && !a.hasAttribute('download')) {
      e.preventDefault();
      setNote('This is a sample card, so its links, numbers and addresses are not real.');
    }
  };

  return (
    <div className="demo">
      <header className="demo__bar">
        <Link to="/#layouts" className="demo__back"><ArrowLeft size={16} aria-hidden /> All designs</Link>
        <p className="demo__label"><b>{name}</b> demo{hit ? <> for {hit.niche.name.toLowerCase()}</> : null}. Everything on the card works. The business is fictional.</p>
        <Link to="/signup" className="btn btn--gold btn--sm"><Sparkles size={15} aria-hidden /> Use this design</Link>
      </header>
      <main className="demo__stage" onClickCapture={guard}>
        <div className="demo__phone"><div className="demo__screen"><CardRenderer card={card} mode={hit?.design.mode ?? 'light'} sound={false} /></div></div>
      </main>
      {note && <p className="demo__note" role="status">{note}</p>}
    </div>
  );
}
