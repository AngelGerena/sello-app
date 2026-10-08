import { useEffect, useRef, useState } from 'react';
import { Loader2, Send, X } from 'lucide-react';
import type { Card } from '../../lib/types';
import { cardUrl } from '../../lib/links';
import { usePlan } from '../../lib/usePlan';
import { FREE_FALLBACK, isLocked } from '../../lib/plans';
import { TEMPLATES } from '../../templates';
import { rich, useT } from '../../lib/i18n';

/** Publishing makes a card public, so it is always a deliberate step with the consequences spelled out.
    Previewing never opens this dialog and never publishes. */
export default function PublishDialog({ card, onConfirm, onClose, onChangeAddress }: {
  card: Card; onConfirm: () => Promise<void>; onClose: () => void; onChangeAddress?: () => void;
}) {
  const { t } = useT();
  const { plan } = usePlan();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const first = useRef<HTMLButtonElement>(null);
  const url = cardUrl(card.data);
  const autoAddress = /^card-/.test(card.data.slug);
  const locked = isLocked(plan, card.template);
  const nameOf = (id: string) => TEMPLATES.find((t) => t.id === id)?.name ?? id;

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    first.current?.focus();
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape' && !busy) onClose(); };
    window.addEventListener('keydown', key);
    return () => { window.removeEventListener('keydown', key); prev?.focus?.(); };
  }, [onClose, busy]);

  const go = async () => {
    setBusy(true); setErr('');
    try { await onConfirm(); } catch (e) { setErr(e instanceof Error ? e.message : t('Could not publish. Try again.')); setBusy(false); }
  };

  return (
    <div className="pdlg" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <div className="pdlg__box" role="dialog" aria-modal="true" aria-labelledby="pdlg-h">
        <header><h2 id="pdlg-h">{t("Publish this card?")}</h2><button type="button" className="icon-btn" aria-label={t("Close")} onClick={onClose} disabled={busy}><X size={18} /></button></header>
        <p>{t("Anyone with this link will be able to see your card:")}</p>
        <p className="pdlg__url">{url}</p>
        <ul className="pdlg__notes">
          <li>{t("Your latest edits are saved first.")}</li>
          <li>{t("You can unpublish at any time. The link then stops working until you publish again.")}</li>
          {autoAddress && <li className="warn">This is an automatic address. Once you print a QR code or program an NFC tag with it, changing it will break them.{onChangeAddress && <>{rich(t("<x1>Choose a better address first</x1>"), { x1: (c) => <button type="button" className="linklike" onClick={onChangeAddress}>{c}</button> })}</>}</li>}
          {locked && <li className="warn">{t("Your Lite plan publishes only the free {v} design. Visitors will see that design instead of {v2} until you upgrade.", { v: nameOf(FREE_FALLBACK), v2: nameOf(card.template) })}</li>}
        </ul>
        {err && <p className="err" role="alert">{err}</p>}
        <footer>
          <button ref={first} type="button" className="btn btn--ghost" onClick={onClose} disabled={busy}>{t("Not yet")}</button>
          <button type="button" className="btn btn--gold" onClick={go} disabled={busy}>{busy ? <Loader2 size={16} className="spin" /> : <Send size={16} />} Publish card</button>
        </footer>
      </div>
    </div>
  );
}
