import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Check, Circle, Copy, Send } from 'lucide-react';
import { Field, ImageUpload, Section, type PanelProps } from './Fields';
import { useData } from './ContentPanels';
import { TemplatePanel } from './StylePanels';
import PublishDialog from './PublishDialog';
import { store } from '../../lib/store';
import { cardUrl } from '../../lib/links';
import { rich, useT } from '../../lib/i18n';

export type QuickStep = 'details' | 'design' | 'preview';
const STEPS: { id: QuickStep; label: string }[] = [
  { id: 'details', label: 'Your details' },
  { id: 'design', label: 'Choose a design' },
  { id: 'preview', label: 'Preview' },
];

/** Narrow screens have no side-by-side preview, so the last step shows the card inline. */
function useNarrow(max = 960) {
  const q = `(max-width: ${max}px)`;
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setNarrow(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, [q]);
  return narrow;
}

/** An optional, shorter path for a first card: core details, then a design, then a private preview.
    It edits the same card state as the full editor, so nothing is lost when switching views. */
export default function QuickStart({ p, step, setStep, preview, onFull, onExit }: {
  p: PanelProps; step: QuickStep; setStep: (s: QuickStep) => void; preview: ReactNode;
  onFull: (stepId?: string) => void; onExit: () => void;
}) {
  const { t } = useT();
  const { d, put } = useData(p);
  const narrow = useNarrow();
  const [asking, setAsking] = useState(false);
  const [justPublished, setJustPublished] = useState(false);
  const [copied, setCopied] = useState(false);
  const i = STEPS.findIndex((s) => s.id === step);
  const hasName = d.fullName.trim().length > 0;
  const hasContact = !!(d.phone.trim() || d.email.trim() || d.whatsapp.trim() || d.website.trim());
  const url = cardUrl(d);

  const checklist: { ok: boolean; label: string; fix: () => void; fixLabel: string }[] = [
    { ok: hasName, label: 'Your name', fix: () => setStep('details'), fixLabel: 'Add it' },
    { ok: hasContact, label: 'A way to reach you (phone, email or website)', fix: () => setStep('details'), fixLabel: 'Add one' },
    { ok: !!d.photoUrl, label: 'A profile photo (recommended)', fix: () => setStep('details'), fixLabel: 'Add one' },
    { ok: d.highlights.length > 0, label: 'Services or highlights (optional)', fix: () => onFull('highlights'), fixLabel: 'Open full editor' },
  ];

  return (
    <div className="qs">
      <ol className="qs__steps" aria-label={t("Quick setup steps")}>
        {STEPS.map((s, n) => (
          <li key={s.id} className={step === s.id ? 'on' : n < i ? 'done' : ''} aria-current={step === s.id ? 'step' : undefined}>
            <span aria-hidden>{n < i ? <Check size={14} /> : n + 1}</span>{t(s.label)}
          </li>
        ))}
      </ol>

      {step === 'details' && (
        <>
          <Section title={t("About you")} hint={t("This is what shows at the top of your card.")}>
            <Field label={t("Full name")} value={d.fullName} onChange={(v) => put({ fullName: v })} autoComplete="name" placeholder={t("Jordan Rivera")} />
            <div className="grid2">
              <Field label={t("Job title")} value={d.jobTitle} onChange={(v) => put({ jobTitle: v })} placeholder={t("Owner")} />
              <Field label={t("Business name")} value={d.business} onChange={(v) => put({ business: v })} autoComplete="organization" placeholder={t("Rivera Landscaping")} />
            </div>
          </Section>
          <Section title={t("How people reach you")} hint={t("Add at least one. Only what you fill in shows on the card.")}>
            <div className="grid2">
              <Field label={t("Phone")} type="tel" inputMode="tel" autoComplete="tel" value={d.phone} onChange={(v) => put({ phone: v })} placeholder="(407) 555-0142" />
              <Field label={t("Email")} type="email" inputMode="email" autoComplete="email" value={d.email} onChange={(v) => put({ email: v })} placeholder={t("hello@yourbusiness.com")} />
            </div>
          </Section>
          <Section title={t("Photo")} hint={t("A clear, well-lit headshot works best.")}>
            <ImageUpload label={t("Profile photo")} value={d.photoUrl} onFile={async (f) => put({ photoUrl: await store.uploadImage(f, 'photo') })} onClear={() => put({ photoUrl: '' })} />
          </Section>
        </>
      )}

      {step === 'design' && (
        <>
          <p className="qs__lead">{t("Pick a design. You can change it any time, and every color and button can be customized later.")}</p>
          <TemplatePanel {...p} startTab="niche" />
        </>
      )}

      {step === 'preview' && (
        <>
          <Section title={t("Preview your card")} hint={t("This is a private preview. Your card is saved as a draft, and nobody else can see it until you publish.")}>
            <div className={`pub-state ${p.card.published ? 'is-live' : 'is-draft'}`} role="status">
              <span className="pub-state__dot" aria-hidden />
              <div><b>{p.card.published ? t('Published') : t('Draft')}</b><small>{p.card.published ? t('Your card is live.') : t('Previewing does not publish. Publishing is a separate step.')}</small></div>
            </div>
            {narrow && <div className="qs__inline">{preview}</div>}
            <ul className="qs__check" aria-label={t("Checklist")}>
              {checklist.map((c) => (
                <li key={c.label} className={c.ok ? 'ok' : ''}>
                  {c.ok ? <Check size={16} aria-label={t("Done")} /> : <Circle size={16} aria-label={t("Not done")} />}<span>{t(c.label)}</span>
                  {!c.ok && <button type="button" className="linklike" onClick={c.fix}>{t(c.fixLabel)}</button>}
                </li>
              ))}
            </ul>
          </Section>
          <Section title={t("What next?")}>
            {justPublished && (
              <div className="qs__done" role="status">
                <b>{t("Published.")}</b> {t("Your card is live at")} <span>{url}</span>
                <button type="button" className="btn btn--ghost btn--sm" onClick={async () => { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); }}>{copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy link'}</button>
              </div>
            )}
            <div className="qs__acts">
              {!p.card.published && <button type="button" className="btn btn--gold" disabled={!hasName} onClick={() => setAsking(true)}><Send size={16} /> {t("Publish card")}</button>}
              <button type="button" className="btn btn--ink" onClick={() => onFull()}>{t("Keep editing in the full editor")}</button>
              <button type="button" className="btn btn--ghost" onClick={onExit}>{t("Save and go to my cards")}</button>
            </div>
            {!hasName && !p.card.published && <p className="note">{t("Add your name to publish.")}</p>}
          </Section>
          {asking && <PublishDialog card={p.card} onClose={() => setAsking(false)} onChangeAddress={() => { setAsking(false); onFull('publish'); }}
            onConfirm={async () => { await p.setPublished?.(true); setAsking(false); setJustPublished(true); }} />}
        </>
      )}

      <div className="qs__nav">
        <button type="button" className="btn btn--ghost" onClick={() => setStep(STEPS[i - 1].id)} disabled={i === 0}><ArrowLeft size={16} /> {t("Back")}</button>
        {i < STEPS.length - 1 && (
          <button type="button" className="btn btn--ink" onClick={() => setStep(STEPS[i + 1].id)} disabled={step === 'details' && !hasName} aria-describedby={step === 'details' && !hasName ? 'qs-need' : undefined}>
            {t("Next: {label}", { label: t(STEPS[i + 1].label) })} <ArrowRight size={16} />
          </button>
        )}
      </div>
      {step === 'details' && !hasName && <p id="qs-need" className="note qs__need">{t("Add your name to continue.")}</p>}
      <p className="qs__full">{rich(t("<x1>Skip quick setup and open the full editor</x1>"), { x1: (c) => <button type="button" className="linklike" onClick={() => onFull()}>{c}</button> })}</p>
    </div>
  );
}
