import { useNavigate } from 'react-router-dom';
import { Crown } from 'lucide-react';
import type { Card } from '../../lib/types';
import { usePlan } from '../../lib/usePlan';
import { FREE_FALLBACK, isLocked } from '../../lib/plans';
import { TEMPLATES } from '../../templates';
import { INTENT_KEY } from '../../pages/Login';
import { sfx } from '../../lib/sfx';

/** Shown while a Lite account is trying a Pro design. Nothing is blocked in the editor;
    the public card simply shows the free fallback design until they upgrade. */
export default function ProBanner({ card, set, compact = false }: { card: Card; set: (fn: (c: Card) => Card) => void; compact?: boolean }) {
  const { plan } = usePlan();
  const nav = useNavigate();
  if (!isLocked(plan, card.template)) return null;
  const name = TEMPLATES.find((t) => t.id === card.template)?.name ?? 'This design';
  const fallback = TEMPLATES.find((t) => t.id === FREE_FALLBACK)?.name ?? 'a free design';
  const upgrade = () => { try { localStorage.setItem(INTENT_KEY, 'pro'); } catch { /* storage blocked */ } nav('/app'); };
  return (
    <div className={`pro-banner ${compact ? 'is-compact' : ''}`} role="status">
      <span className="pro-banner__ic"><Crown size={18} /></span>
      <span className="pro-banner__txt">
        <b>You're trying {name}, a Pro design.</b>
        <small>Try it all you like. Your live card shows {fallback} until you upgrade.</small>
      </span>
      <span className="pro-banner__acts">
        <button type="button" className="btn btn--gold btn--sm" onClick={upgrade}><Crown size={14} /> Upgrade to Pro</button>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => { sfx('tap'); set((c) => ({ ...c, template: FREE_FALLBACK })); }}>Use a free design</button>
      </span>
    </div>
  );
}
