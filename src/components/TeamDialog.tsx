import { useEffect, useState } from 'react';
import { Crown, Loader2, Minus, Plus, X } from 'lucide-react';
import { TEAM, clampCards, teamTotal } from '../lib/plans';
import type { Interval } from '../lib/billing';

/** "How many cards does your team need?" Shown before Business checkout, because Business is priced per card. */
export default function TeamDialog({ initialCards = TEAM.initial, initialInterval = 'month', busy, onClose, onContinue }: {
  initialCards?: number; initialInterval?: Interval; busy: boolean; onClose: () => void; onContinue: (cards: number, interval: Interval) => void;
}) {
  const [raw, setRaw] = useState(String(clampCards(initialCards)));
  const [interval, setInterval_] = useState<Interval>(initialInterval);
  const cards = clampCards(parseInt(raw, 10));
  const yearly = interval === 'year';
  const total = teamTotal(cards, yearly);

  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [onClose]);

  return (
    <div className="td" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="td__box" role="dialog" aria-modal="true" aria-label="Sello Business">
        <header><h2>Sello Business</h2><button type="button" className="icon-btn" aria-label="Close" onClick={onClose}><X size={18} /></button></header>
        <p className="td__lead">Business is priced per card, so you only pay for the people who need one. Minimum {TEAM.min} cards.</p>

        <div className="td__field"><span id="td-cards">How many cards?</span>
          <div className="td__ctl" role="group" aria-labelledby="td-cards">
            <button type="button" aria-label="Fewer cards" disabled={cards <= TEAM.min} onClick={() => setRaw(String(clampCards(cards - 1)))}><Minus size={18} /></button>
            <input type="number" inputMode="numeric" min={TEAM.min} max={TEAM.max} value={raw} aria-label="Number of cards" autoFocus
              onChange={(e) => setRaw(e.target.value)} onBlur={() => setRaw(String(cards))} />
            <button type="button" aria-label="More cards" disabled={cards >= TEAM.max} onClick={() => setRaw(String(clampCards(cards + 1)))}><Plus size={18} /></button>
          </div>
        </div>

        <div className="td__field"><span>Billing</span>
          <div className="seg" role="radiogroup" aria-label="Billing">
            <button type="button" role="radio" aria-checked={!yearly} className={!yearly ? 'on' : ''} onClick={() => setInterval_('month')}>Monthly</button>
            <button type="button" role="radio" aria-checked={yearly} className={yearly ? 'on' : ''} onClick={() => setInterval_('year')}>Yearly, save 17%</button>
          </div>
        </div>

        <p className="td__total" aria-live="polite">
          <b>${total.toLocaleString()}</b>
          <span>{yearly ? `a year for ${cards} cards (about $${Math.round(total / 12).toLocaleString()} a month)` : `a month for ${cards} cards`}</span>
        </p>
        <footer>
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn--gold" onClick={() => onContinue(cards, interval)} disabled={busy}>{busy ? <Loader2 className="spin" size={16} /> : <Crown size={16} />} Continue to payment</button>
        </footer>
      </div>
    </div>
  );
}
