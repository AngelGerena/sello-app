import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check } from 'lucide-react';
import type { Card, ElementId, Mode } from '../lib/types';
import { effectiveMode, googleFontsHref, themeVars } from '../lib/theme';
import { buildVCard, downloadVCard } from '../lib/vcard';
import { cardUrl } from '../lib/links';
import { Ctx, type CardActions } from '../templates/blocks';
import { TEMPLATE_COMPONENTS } from '../templates';
import { sfx } from '../lib/sfx';
import { TEMPLATE_EXTRA_FONTS } from '../lib/niches';

/** Loads Google fonts and any uploaded brand-kit fonts once per family. */
export function useCardFonts(card: Card) {
  const { display, body, customDisplayUrl, customBodyUrl } = card.theme.fonts;
  const extra = [...(TEMPLATE_EXTRA_FONTS[card.template] ?? []), ...(card.theme.button.style === 'hud' ? ['Space Grotesk'] : [])].join('|');
  useEffect(() => {
    const google = [!customDisplayUrl && display, !customBodyUrl && body, ...extra.split('|')].filter(Boolean) as string[];
    if (google.length) {
      const href = googleFontsHref(google);
      if (!document.querySelector(`link[data-fc-font="${href}"]`)) {
        const l = document.createElement('link');
        l.rel = 'stylesheet'; l.href = href; l.dataset.fcFont = href;
        document.head.appendChild(l);
      }
    }
    ([[display, customDisplayUrl], [body, customBodyUrl]] as const).forEach(([fam, url]) => {
      if (!url) return;
      const f = new FontFace(fam, `url(${url})`);
      f.load().then((ff) => document.fonts.add(ff)).catch(() => { /* bad file: fallback stack shows */ });
    });
  }, [display, body, customDisplayUrl, customBodyUrl, extra]);
}

interface Props {
  card: Card;
  mode: Mode;
  picking?: boolean;
  selected?: ElementId | null;
  onPick?: (id: ElementId) => void;
  className?: string;
  sound?: boolean;
  track?: (kind: string) => void;   // public page analytics
}

export default function CardRenderer({ card, mode: requestedMode, picking, selected, onPick, className = '', sound = true, track }: Props) {
  useCardFonts(card);
  const mode = effectiveMode(card.template, requestedMode);
  const [qr, setQr] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const vcardRef = useRef<string>('');
  const Tpl = TEMPLATE_COMPONENTS[card.template] ?? TEMPLATE_COMPONENTS.arch;
  const prof = card.theme.sound ?? 'calm';

  // Build the vCard ahead of the tap so Save runs synchronously inside the gesture (iOS requirement).
  useEffect(() => { let alive = true; buildVCard(card.data).then((v) => { if (alive) vcardRef.current = v; }); return () => { alive = false; }; }, [card.data]);

  const flash = (m: string) => { setToast(m); window.setTimeout(() => setToast(null), 2200); };

  const actions: CardActions = useMemo(() => ({
    save: () => {
      if (sound) sfx('primary', prof);
      track?.('save');
      downloadVCard(vcardRef.current || 'BEGIN:VCARD\r\nVERSION:3.0\r\nEND:VCARD', card.data.fullName);
      flash('Contact file ready. Tap it to add to your phone.');
    },
    share: async () => {
      if (sound) sfx('open', prof);
      track?.('share');
      const url = cardUrl(card.data);
      try {
        if (navigator.share) { await navigator.share({ title: card.data.fullName, text: card.data.business, url }); return; }
        await navigator.clipboard.writeText(url); flash('Link copied');
      } catch { /* user closed the share sheet */ }
    },
    qr: async () => {
      if (sound) sfx('open', prof);
      track?.('qr');
      const png = await QRCode.toDataURL(cardUrl(card.data), { margin: 1, width: 560, color: { dark: card.theme.tokens.light.band, light: '#FFFFFF' } });
      setQr(png);
    },
  }), [card.data, card.theme.tokens.light.band, sound, track, prof]);

  const style = themeVars(card.theme, mode) as CSSProperties;

  const onClickCapture = (e: MouseEvent) => {
    if (!picking) {
      const a = (e.target as HTMLElement).closest('a') as HTMLAnchorElement | null;
      if (sound && (a || (e.target as HTMLElement).closest('button'))) sfx('tap', prof);
      if (a && track) track(linkKind(a.href));
      return;
    }
    const t = (e.target as HTMLElement).closest('[data-el]') as HTMLElement | null;
    e.preventDefault(); e.stopPropagation();
    if (t && onPick) onPick(t.dataset.el as ElementId);
  };

  return (
    <Ctx.Provider value={{ data: card.data, theme: card.theme, mode, actions, play: (n) => { if (sound) sfx(n, prof); }, still: !sound }}>
      <div
        className={`fc-card mode-${mode}${picking ? ' is-picking' : ''} ${className}`}
        style={style}
        data-selected={selected ?? undefined}
        onClickCapture={onClickCapture}
        {...{ 'data-el': 'pageBg' }}
      >
        {selected && <style>{`.fc-card [data-el="${selected}"]{outline:2px solid #C5A44B;outline-offset:2px}`}</style>}
        <Tpl />
        {toast && <div className="fc-toast" role="status">{toast}</div>}
        {qr && <QrSheet png={qr} url={cardUrl(card.data)} onClose={() => setQr(null)} />}
      </div>
    </Ctx.Provider>
  );
}

function linkKind(href: string): string {
  if (href.startsWith('tel:')) return 'call';
  if (href.includes('wa.me')) return 'whatsapp';
  if (href.startsWith('mailto:')) return 'email';
  if (href.includes('google.com/maps')) return 'directions';
  return 'social';
}

function QrSheet({ png, url, onClose }: { png: string; url: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="fc-sheet" role="dialog" aria-modal="true" aria-label="QR code" onClick={onClose}>
      <div className="fc-sheet__panel" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="fc-sheet__x" onClick={onClose} aria-label="Close"><X size={20} /></button>
        <img src={png} alt="QR code that opens this card" width={260} height={260} />
        <p>Point a phone camera here to open this card.</p>
        <button type="button" className="fc-sheet__copy" onClick={async () => { await navigator.clipboard.writeText(url); setCopied(true); }}>
          {copied ? <Check size={16} /> : <Copy size={16} />}{copied ? 'Copied' : 'Copy link'}
        </button>
      </div>
    </div>
  );
}
