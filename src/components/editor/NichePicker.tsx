import { useMemo, useState } from 'react';
import { Check, Search } from 'lucide-react';
import { NICHES, NICHE_GROUPS, NICHE_BY_ID, type Niche } from '../../lib/niches';
import { HIcon } from '../../templates/blocks';
import { nicheCountLabel } from '../../lib/counts';
import { usePlan } from '../../lib/usePlan';
import { useT } from '../../lib/i18n';

/** A small colored pill that names a niche, with its icon. */
export function NicheBadge({ id, onClick, size = 'md' }: { id: string; onClick?: () => void; size?: 'sm' | 'md' }) {
  const { t } = useT();
  const n = NICHE_BY_ID[id];
  if (!n) return null;
  const d = n.designs[0];
  const style = { background: `linear-gradient(135deg, ${d.seeds.brand}, ${d.seeds.accent})` };
  const inner = <><span className="nb__ic" style={style}><HIcon name={n.icon} size={size === 'sm' ? 12 : 14} /></span><span>{n.name}</span></>;
  return onClick
    ? <button type="button" className={`nb nb--${size} nb--btn`} onClick={onClick} title={t("Change niche")}>{inner}</button>
    : <span className={`nb nb--${size}`}>{inner}</span>;
}

/** Grouped, searchable niche chooser. Each chip shows how many designs it unlocks. */
export default function NichePicker({ value, onPick, autoFocus }: { value: string; onPick: (n: Niche) => void; autoFocus?: boolean }) {
  const { t, lang } = useT();
  const { plan } = usePlan();
  const [q, setQ] = useState('');
  const match = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (n: Niche) => !t || `${n.name} ${n.blurb} ${n.group} ${n.highlights.map((h) => h.title).join(' ')}`.toLowerCase().includes(t);
  }, [q]);
  const any = NICHES.some(match);
  return (
    <div className="np">
      <label className="niche-search np__search"><Search size={16} /><span className="sr">{t("Search niches")}</span>
        <input autoFocus={autoFocus} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search: barber, wedding, DJ, assistant...")} />
      </label>
      {NICHE_GROUPS.map((g) => {
        const items = NICHES.filter((n) => n.group === g && match(n));
        if (!items.length) return null;
        return (
          <div key={g} className="np__group">
            <h4>{g}</h4>
            <div className="np__chips">
              {items.map((n) => {
                const on = n.id === value;
                const d = n.designs[0];
                return (
                  <button key={n.id} type="button" className={`np__chip ${on ? 'on' : ''}`} onClick={() => onPick(n)} aria-pressed={on}>
                    <span className="np__sw" style={{ background: `linear-gradient(135deg, ${d.seeds.brand}, ${d.seeds.accent})` }}><HIcon name={n.icon} size={15} /></span>
                    <span className="np__t"><b>{t(n.name)}</b><small>{nicheCountLabel(n, plan, lang)}</small></span>
                    {on && <Check size={16} className="np__check" />}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      {!any && <p className="note">{t("No niche matches \"{q}\". Pick the closest one; you can still use any design.", { q })}</p>}
    </div>
  );
}
