import { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { ArrowDown, ArrowUp, Check, Copy, Plus, Search, Trash2, X, ExternalLink, ImagePlus, Loader2 } from 'lucide-react';
import type { CardData, Highlight } from '../../lib/types';
import { NETWORKS, NETWORK_BY_ID, NETWORK_GROUPS } from '../../lib/socials';
import { store, slugify } from '../../lib/store';
import { uid } from '../../lib/seed';
import { cardUrl } from '../../lib/links';
import { BrandGlyph, HIcon, HIGHLIGHT_ICONS } from '../../templates/blocks';
import { NICHE_BY_ID, type Niche } from '../../lib/niches';
import NichePicker, { NicheBadge } from './NichePicker';
import ProBanner from './ProLock';
import PublishDialog from './PublishDialog';
import { sfx } from '../../lib/sfx';
import { Field, ImageUpload, Section, Toggle, type PanelProps } from './Fields';
import { rich, useT } from '../../lib/i18n';

export const useData = ({ card, set }: PanelProps) => {
  const d = card.data;
  const put = (patch: Partial<CardData>) => set((c) => ({ ...c, data: { ...c.data, ...patch } }));
  return { d, put };
};

/* ------------------------------------------------------------ profile */
export function ProfilePanel(p: PanelProps) {
  const { t } = useT();
  const { d, put } = useData(p);
  return (
    <>
      <NicheSection {...p} />
      {WORSHIP.has(p.card.template) && <WorshipExtras {...p} />}
      <Section title={t("Photo and logo")} hint={t("A clear, well-lit headshot gets saved to people's phones with your contact.")}>
        <div className="upl-row">
          <ImageUpload label={t("Profile photo")} value={d.photoUrl} hint={t("Square or portrait, at least 800px.")} onFile={async (f) => put({ photoUrl: await store.uploadImage(f, 'photo') })} onClear={() => put({ photoUrl: '' })} />
          <ImageUpload label={t("Logo")} shape="square" value={d.logoUrl} hint={t("PNG with a transparent background looks best.")} onFile={async (f) => put({ logoUrl: await store.uploadImage(f, 'logo') })} onClear={() => put({ logoUrl: '' })} />
        </div>
      </Section>
      <Section title={t("Who you are")}>
        <Field label={t("Full name")} value={d.fullName} onChange={(v) => put({ fullName: v })} autoComplete="name" placeholder={t("Jordan Rivera")} />
        <div className="grid2">
          <Field label={t("Credentials")} value={d.credentials} onChange={(v) => put({ credentials: v })} placeholder={t("MBA, RN, PMHNP-BC")} hint={t("Optional")} />
          <Field label={t("Job title")} value={d.jobTitle} onChange={(v) => put({ jobTitle: v })} placeholder={t("Owner")} />
        </div>
        <Field label={t("Business name")} value={d.business} onChange={(v) => put({ business: v })} autoComplete="organization" placeholder={t("Rivera Landscaping")} />
        <Field label={t("Short line")} value={d.tagline} onChange={(v) => put({ tagline: v })} maxLength={70} placeholder={t("Serving Central Florida since 2012")} hint={t("Shows under your name on most layouts. Keep it under 70 characters.")} />
      </Section>
    </>
  );
}

/* ------------------------------------------------------------ contact */
export function ContactPanel(p: PanelProps) {
  const { t } = useT();
  const { d, put } = useData(p);
  const sameWa = d.whatsapp && d.whatsapp.replace(/\D/g, '').endsWith(d.phone.replace(/\D/g, '')) && d.phone;
  return (
    <>
      <Section title={t("Ways to reach you")} hint={t("Only what you fill in shows on the card and in the saved contact.")}>
        <Field label={t("Phone")} type="tel" inputMode="tel" autoComplete="tel" value={d.phone} onChange={(v) => put({ phone: v })} placeholder="(407) 555-0142" />
        <Field label={t("WhatsApp Business number")} type="tel" inputMode="tel" value={d.whatsapp} onChange={(v) => put({ whatsapp: v })} placeholder="1 407 555 0142" hint={t("Include the country code. US numbers start with 1.")} />
        {d.phone && !sameWa && <button type="button" className="btn btn--ghost btn--sm" onClick={() => put({ whatsapp: '1' + d.phone.replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '') })}>{t("Use my phone number for WhatsApp")}</button>}
        <Field label={t("Email")} type="email" inputMode="email" autoComplete="email" value={d.email} onChange={(v) => put({ email: v })} placeholder={t("hello@yourbusiness.com")} />
        <Field label={t("Website")} type="url" inputMode="url" value={d.website} onChange={(v) => put({ website: v })} placeholder={t("yourbusiness.com")} />
        <Field label={t("Booking link")} type="url" inputMode="url" value={d.bookingUrl} onChange={(v) => put({ bookingUrl: v })} placeholder={t("calendly.com/you or your booking page")} hint={t("Adds a Book button. Leave empty if you don't take appointments online.")} />
      </Section>
      <Section title={t("Location")}>
        <Toggle label={t("I have a storefront or office")} hint={t("Adds your address, a map link and Directions.")} checked={d.hasLocation} onChange={(v) => put({ hasLocation: v })} />
        <Field label={t("Hours")} value={d.hours} onChange={(v) => put({ hours: v })} placeholder={t("Tue-Sat 11am-8pm, Sun 12-5pm")} hint={t("Optional. Shows on the Garage, Street Menu, Storefront, Glow and Toolbox layouts.")} />
        {d.hasLocation && (
          <>
            <Field label={t("Street address")} autoComplete="street-address" value={d.address.street} onChange={(v) => put({ address: { ...d.address, street: v } })} placeholder={t("123 Main St, Suite 4")} />
            <div className="grid3">
              <Field label={t("City")} autoComplete="address-level2" value={d.address.city} onChange={(v) => put({ address: { ...d.address, city: v } })} />
              <Field label={t("State")} autoComplete="address-level1" value={d.address.region} onChange={(v) => put({ address: { ...d.address, region: v } })} />
              <Field label={t("ZIP")} autoComplete="postal-code" inputMode="numeric" value={d.address.zip} onChange={(v) => put({ address: { ...d.address, zip: v } })} />
            </div>
          </>
        )}
      </Section>
    </>
  );
}

/* ------------------------------------------------------------ links */
export function LinksPanel(p: PanelProps) {
  const { t } = useT();
  const { d, put } = useData(p);
  const [adding, setAdding] = useState(false);
  const [q, setQ] = useState('');
  const results = useMemo(() => NETWORKS.filter((n) => n.label.toLowerCase().includes(q.toLowerCase())), [q]);
  const move = (i: number, dir: -1 | 1) => {
    const s = [...d.socials]; const j = i + dir; if (j < 0 || j >= s.length) return;
    [s[i], s[j]] = [s[j], s[i]]; put({ socials: s });
  };
  return (
    <Section title={t("Social and review links")} hint={t("Add as many as you like. People see them in this order.")} action={<button type="button" className="btn btn--gold btn--sm" onClick={() => setAdding(true)}><Plus size={16} /> {t("Add link")}</button>}>
      <SuggestedLinks {...p} onAdded={() => undefined} />
      {d.socials.length === 0 && !adding && (
        <div className="empty">
          <p>{t("No links yet. Add your Instagram, Google reviews, TikTok, booking apps or anywhere people find you.")}</p>
          <button type="button" className="btn btn--gold" onClick={() => setAdding(true)}><Plus size={16} /> {t("Add your first link")}</button>
        </div>
      )}
      <ul className="lnk-list">
        {d.socials.map((s, i) => {
          const n = NETWORK_BY_ID[s.network];
          return (
            <li key={s.id}>
              <span className="lnk-list__ic" style={{ color: n?.hex }}><BrandGlyph network={s.network} size={20} /></span>
              <div className="fld fld--tight">
                <label htmlFor={`lnk-${s.id}`}>{n?.label ?? 'Link'}</label>
                <input id={`lnk-${s.id}`} value={s.value} placeholder={n?.placeholder} onChange={(e) => put({ socials: d.socials.map((x) => (x.id === s.id ? { ...x, value: e.target.value } : x)) })} />
              </div>
              <div className="lnk-list__acts">
                <button type="button" className="icon-btn" aria-label={t("Move up")} disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp size={16} /></button>
                <button type="button" className="icon-btn" aria-label={t("Move down")} disabled={i === d.socials.length - 1} onClick={() => move(i, 1)}><ArrowDown size={16} /></button>
                <button type="button" className="icon-btn" aria-label={`Remove ${n?.label ?? 'link'}`} onClick={() => put({ socials: d.socials.filter((x) => x.id !== s.id) })}><Trash2 size={16} /></button>
              </div>
            </li>
          );
        })}
      </ul>
      {adding && (
        <div className="picker" role="dialog" aria-label={t("Add a link")}>
          <div className="picker__top">
            <label className="picker__search"><Search size={16} /><span className="sr">{t("Search networks")}</span><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search Instagram, Yelp, Cash App...")} /></label>
            <button type="button" className="icon-btn" aria-label={t("Close")} onClick={() => { setAdding(false); setQ(''); }}><X size={18} /></button>
          </div>
          <div className="picker__body">
            {NETWORK_GROUPS.map((g) => {
              const items = results.filter((n) => n.group === g);
              if (!items.length) return null;
              return (
                <div key={g}>
                  <h4>{g}</h4>
                  <div className="picker__grid">
                    {items.map((n) => (
                      <button key={n.id} type="button" onClick={() => { put({ socials: [...d.socials, { id: uid(), network: n.id, value: '' }] }); setAdding(false); setQ(''); }}>
                        <span style={{ color: n.hex }}><BrandGlyph network={n.id} size={20} /></span>{n.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Section>
  );
}

/* ------------------------------------------------------------ highlights */
export function HighlightsPanel(p: PanelProps) {
  const { t } = useT();
  const { d, put } = useData(p);
  const [iconFor, setIconFor] = useState<string | null>(null);
  const upd = (id: string, patch: Partial<Highlight>) => put({ highlights: d.highlights.map((h) => (h.id === id ? { ...h, ...patch } : h)) });
  return (
    <>
      <NicheSamples {...p} />
      <Section title={t("Services or highlights")} hint={t("Up to six. Short titles read best on a phone.")}>
        <Field label={t("Section title")} value={d.highlightsTitle} onChange={(v) => put({ highlightsTitle: v })} placeholder={t("What we offer")} />
        <ul className="hl-edit">
          {d.highlights.map((h) => (
            <li key={h.id}>
              <button type="button" className="hl-edit__ic" aria-label={t("Change icon")} onClick={() => setIconFor(iconFor === h.id ? null : h.id)}><HIcon name={h.icon} /></button>
              <div className="hl-edit__f">
                <input aria-label={t("Title")} value={h.title} onChange={(e) => upd(h.id, { title: e.target.value })} placeholder={t("Service name")} />
                <input aria-label={t("Description")} value={h.subtitle} onChange={(e) => upd(h.id, { subtitle: e.target.value })} placeholder={t("A few words about it")} />
              </div>
              <button type="button" className="icon-btn" aria-label={`Remove ${h.title || 'item'}`} onClick={() => put({ highlights: d.highlights.filter((x) => x.id !== h.id) })}><Trash2 size={16} /></button>
              {iconFor === h.id && (
                <div className="icon-grid" role="listbox" aria-label={t("Icons")}>
                  {Object.keys(HIGHLIGHT_ICONS).map((k) => (
                    <button key={k} type="button" role="option" aria-selected={h.icon === k} className={h.icon === k ? 'on' : ''} onClick={() => { upd(h.id, { icon: k }); setIconFor(null); }} aria-label={k}><HIcon name={k} size={18} /></button>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
        {d.highlights.length < 6 && <button type="button" className="btn btn--ghost" onClick={() => put({ highlights: [...d.highlights, { id: uid(), icon: 'star', title: '', subtitle: '' }] })}><Plus size={16} /> {t("Add a highlight")}</button>}
      </Section>
      <GallerySection {...p} />
      <Section title={t("Extras")}>
        <Toggle label={t("988 crisis support card")} hint={t("For therapists, counselors, clinics and ministries. Adds Call 988, Text 988 and a 911 line.")} checked={d.showCrisis} onChange={(v) => put({ showCrisis: v })} />
      </Section>
    </>
  );
}

/* ------------------------------------------------------------ publish */
export function PublishPanel({ card, set, setPublished }: PanelProps) {
  const { t } = useT();
  const [asking, setAsking] = useState(false);
  const [pubBusy, setPubBusy] = useState(false);
  const [pubErr, setPubErr] = useState('');
  const [slug, setSlug] = useState(card.data.slug);
  const [state, setState] = useState<'idle' | 'checking' | 'ok' | 'taken'>('idle');
  const [qr, setQr] = useState('');
  const [copied, setCopied] = useState(false);
  const url = cardUrl(card.data);

  useEffect(() => { QRCode.toDataURL(url, { margin: 1, width: 420, color: { dark: card.theme.tokens.light.band, light: '#FFFFFF' } }).then(setQr); }, [url, card.theme.tokens.light.band]);

  useEffect(() => {
    const s = slugify(slug);
    if (!s || s === card.data.slug) { setState('idle'); return; }
    setState('checking');
    const t = setTimeout(async () => {
      const ok = await store.slugAvailable(s, card.id);
      setState(ok ? 'ok' : 'taken');
      if (ok) set((c) => ({ ...c, data: { ...c.data, slug: s } }));
    }, 450);
    return () => clearTimeout(t);
  }, [slug, card.id, card.data.slug, set]);

  return (
    <>
      <ProBanner card={card} set={set} />
      <Section title={t("Your card address")} hint={t("This is the link your QR code, NFC tag and Share button use.")}>
        <div className="fld">
          <label htmlFor="slug">{t("Address")}</label>
          <div className="slug">
            <span>{url.replace(card.data.slug, '')}</span>
            <input id="slug" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase())} spellCheck={false} />
          </div>
          <small className={state === 'taken' ? 'err' : ''} role="status">
            {state === 'checking' && 'Checking...'}{state === 'ok' && 'Available and saved.'}{state === 'taken' && 'Taken. Try adding your city or a number.'}{state === 'idle' && 'Letters, numbers and dashes.'}
          </small>
        </div>
        {card.published && <p className="note">{t("This card is live. Changing the address breaks links, QR codes and NFC tags that already use the old one.")}</p>}
      </Section>
      <Section title={t("Status")} hint={t("Preview never publishes a card. A card goes public only when you press Publish.")}>
        <div className={`pub-state ${card.published ? 'is-live' : 'is-draft'}`} role="status">
          <span className="pub-state__dot" aria-hidden />
          <div><b>{card.published ? 'Published' : 'Draft'}</b><small>{card.published ? 'Anyone with your link can see this card.' : 'Only you can see this card while you edit.'}</small></div>
          {card.published
            ? <button type="button" className="btn btn--ghost btn--sm" disabled={pubBusy} onClick={async () => {
                if (!window.confirm('Unpublish this card? Its link and QR code will stop working until you publish again.')) return;
                setPubBusy(true); setPubErr('');
                try { await setPublished?.(false); } catch (e) { setPubErr(e instanceof Error ? e.message : 'Could not unpublish.'); } finally { setPubBusy(false); }
              }}>{pubBusy ? 'Working...' : 'Unpublish'}</button>
            : <button type="button" className="btn btn--gold btn--sm" onClick={() => setAsking(true)}>{t("Publish card")}</button>}
        </div>
        {pubErr && <p className="err" role="alert">{pubErr}</p>}
      </Section>
      {asking && <PublishDialog card={card} onClose={() => setAsking(false)} onChangeAddress={() => { setAsking(false); document.getElementById('slug')?.focus(); }}
        onConfirm={async () => { await setPublished?.(true); setAsking(false); }} />}
      <Section title={t("Share it")}>
        <div className="pub">
          {qr && <img src={qr} alt={t("QR code for your card")} width={180} height={180} />}
          <div className="stack-ed">
            <button type="button" className="btn btn--ink" onClick={async () => { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); }}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? 'Copied' : 'Copy link'}</button>
            <a className="btn btn--ghost" href={qr} download={`${card.data.slug}-qr.png`}>{t("Download QR")}</a>
            {card.published
              ? <a className="btn btn--ghost" href={url} target="_blank" rel="noopener"><ExternalLink size={16} /> {t("Open live card")}</a>
              : <span className="note">{t("The link works after you publish. Until then only the preview shows your card.")}</span>}
          </div>
        </div>
        <p className="note">{t("Programming an NFC tag? Write this link as a URL record with any NFC writer app.")}</p>
      </Section>
    </>
  );
}

/* ------------------------------------------------------------ gallery */
function GallerySection(p: PanelProps) {
  const { t } = useT();
  const { d, put } = useData(p);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);
  const MAX = 9;
  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    setErr(null); setBusy(true);
    try {
      const room = MAX - d.gallery.length;
      const picked = Array.from(files).filter((f) => /^image\//.test(f.type)).slice(0, room);
      const urls: string[] = [];
      for (const f of picked) urls.push(await store.uploadImage(f, 'photo'));
      p.set((c) => ({ ...c, data: { ...c.data, gallery: [...c.data.gallery, ...urls].slice(0, MAX) } }));
      if (files.length > room) setErr(`Only ${MAX} photos fit. The first ${room} were added.`);
    } catch (e) { setErr(e instanceof Error ? e.message : 'Upload failed.'); } finally { setBusy(false); }
  };
  const move = (i: number, dir: -1 | 1) => { const g = [...d.gallery]; const j = i + dir; if (j < 0 || j >= g.length) return; [g[i], g[j]] = [g[j], g[i]]; put({ gallery: g }); };
  return (
    <Section title={t("Photos")} hint={t("Your work, menu, listings or products. Up to 9. The first photo leads on Keystone and Lookbook.")} action={d.gallery.length < MAX ? <button type="button" className="btn btn--gold btn--sm" onClick={() => ref.current?.click()} disabled={busy}>{busy ? <Loader2 size={15} className="spin" /> : <Plus size={16} />} Add photos</button> : undefined}>
      {d.gallery.length === 0 && !busy && (
        <button type="button" className="gal-drop" onClick={() => ref.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); add(e.dataTransfer.files); }}>
          <ImagePlus size={26} strokeWidth={1.5} /><span>{t("Drop photos here or tap to choose")}</span>
        </button>
      )}
      <ul className="gal-edit">
        {d.gallery.map((src, i) => (
          <li key={src + i}>
            <img src={src} alt={`Photo ${i + 1}`} />
            <span className="gal-edit__acts">
              <button type="button" aria-label={t("Move earlier")} disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp size={14} style={{ transform: 'rotate(-90deg)' }} /></button>
              <button type="button" aria-label={t("Move later")} disabled={i === d.gallery.length - 1} onClick={() => move(i, 1)}><ArrowDown size={14} style={{ transform: 'rotate(-90deg)' }} /></button>
              <button type="button" aria-label={`Remove photo ${i + 1}`} onClick={() => put({ gallery: d.gallery.filter((_, x) => x !== i) })}><Trash2 size={14} /></button>
            </span>
          </li>
        ))}
      </ul>
      {err && <small className="err" role="alert">{err}</small>}
      <input ref={ref} type="file" accept="image/*" multiple hidden onChange={(e) => { add(e.target.files); e.target.value = ''; }} />
    </Section>
  );
}

/* ------------------------------------------------------------ niche */
export function NicheSection(p: PanelProps) {
  const { t } = useT();
  const { d, put } = useData(p);
  const current = d.niche ? NICHE_BY_ID[d.niche] : null;
  const [open, setOpen] = useState(!current);
  const [flash, setFlash] = useState<string | null>(null);
  const pick = (n: Niche) => {
    put({ niche: n.id });
    setOpen(false);
    setFlash(n.id);
    sfx('success');
  };
  const justPicked = flash ? NICHE_BY_ID[flash] : null;
  return (
    <Section
      title={t("Your niche")}
      hint={t("Pick what you do to see designs, sample services and links made for your line of work.")}
      action={current && !open ? <button type="button" className="btn btn--ghost btn--sm" onClick={() => setOpen(true)}>{t("Change")}</button> : undefined}
    >
      {current && !open && (
        <button type="button" className="niche-now" onClick={() => setOpen(true)}>
          <NicheBadge id={current.id} />
          <span className="niche-now__txt">{t("{length} designs made for you · tap to change", { length: current.designs.length })}</span>
        </button>
      )}
      {open && (
        <>
          <NichePicker value={d.niche} onPick={pick} />
          {current && <button type="button" className="btn btn--ghost btn--sm" onClick={() => setOpen(false)}>{t("Keep {name}", { name: current.name })}</button>}
        </>
      )}
      {justPicked && !open && (
        <div className="niche-next" role="status">
          <span>{rich(t("<b>Nice. {length} designs for {name} are ready.</b> Your content stays exactly as it is.", { length: justPicked.designs.length, name: justPicked.name }), { b: (c) => <b>{c}</b> })}</span>
          <span className="row-ed">
            <button type="button" className="btn btn--gold btn--sm" onClick={() => p.goStep?.('layout')}>{t("See my designs")}</button>
            {d.highlights.length === 0 && <button type="button" className="btn btn--ghost btn--sm" onClick={() => { put({ highlightsTitle: justPicked.highlightsTitle, highlights: justPicked.highlights.map((h) => ({ ...h, id: uid() })) }); setFlash(null); }}>{t("Add sample services")}</button>}
          </span>
        </div>
      )}
    </Section>
  );
}

function NicheSamples(p: PanelProps) {
  const { t } = useT();
  const { d, put } = useData(p);
  const n = d.niche ? NICHE_BY_ID[d.niche] : null;
  const [confirm, setConfirm] = useState(false);
  if (!n) return null;
  const same = d.highlights.length > 0 && d.highlights.every((h, i) => n.highlights[i]?.title === h.title);
  if (same) return null;
  const apply = () => { put({ highlightsTitle: n.highlightsTitle, highlights: n.highlights.map((h) => ({ ...h, id: uid() })) }); setConfirm(false); sfx('success'); };
  return (
    <div className="niche-tip">
      <NicheBadge id={n.id} size="sm" />
      <p>{rich(t("Need a starting point? Here are typical services for {v}: <b>{v2}</b>.", { v: n.name.toLowerCase(), v2: n.highlights.map((h) => h.title).join(', ') }), { b: (c) => <b>{c}</b> })}</p>
      {confirm
        ? <span className="row-ed">{rich(t("<x1>Replace my services</x1><x2>Cancel</x2>"), { x1: (c) => <button type="button" className="btn btn--gold btn--sm" onClick={apply}>{c}</button>, x2: (c) => <button type="button" className="btn btn--ghost btn--sm" onClick={() => setConfirm(false)}>{c}</button> })}</span>
        : <button type="button" className="btn btn--ink btn--sm" onClick={() => (d.highlights.length ? setConfirm(true) : apply())}>{t("Use these")}</button>}
    </div>
  );
}

function SuggestedLinks(p: PanelProps & { onAdded: () => void }) {
  const { t } = useT();
  const { d, put } = useData(p);
  const n = d.niche ? NICHE_BY_ID[d.niche] : null;
  if (!n) return null;
  const missing = n.suggestedLinks.filter((id) => NETWORK_BY_ID[id] && !d.socials.some((s) => s.network === id));
  if (!missing.length) return null;
  return (
    <div className="sugg">
      <span className="sugg__h">{t("Popular with {v}. Tap to add:", { v: n.name.toLowerCase() })}</span>
      <div className="sugg__chips">
        {missing.map((id) => (
          <button key={id} type="button" className="sugg__chip" onClick={() => { const nid = uid(); put({ socials: [...d.socials, { id: nid, network: id, value: '' }] }); sfx('tap'); window.setTimeout(() => document.getElementById(`lnk-${nid}`)?.focus(), 60); }}>
            <span style={{ color: NETWORK_BY_ID[id].hex }}><BrandGlyph network={id} size={16} /></span>{NETWORK_BY_ID[id].label}<Plus size={14} />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ worship extras */
const WORSHIP = new Set(['santuario', 'celestial', 'vitral', 'frecuencia', 'constelacion', 'escenario', 'salmo']);

function MediaUpload({ label, hint, accept, value, onUrl, kind }: { label: string; hint: string; accept: string; value?: string; onUrl: (u: string) => void; kind: 'video' | 'audio' }) {
  const { t } = useT();
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const pick = async (f?: File) => {
    if (!f) return;
    setErr(''); setBusy(true);
    try { onUrl(await store.uploadMedia(f)); sfx('success'); } catch (e) { setErr(e instanceof Error ? e.message : 'Upload failed.'); } finally { setBusy(false); }
  };
  return (
    <div className="fld media-up">
      <span className="fld__l">{label}</span>
      {value
        ? (kind === 'video'
            ? <video className="media-up__vid" src={value} muted playsInline loop autoPlay aria-label={t("Living portrait preview")} />
            : <audio className="media-up__aud" src={value} controls preload="none" />)
        : <span className="media-up__empty">{kind === 'video' ? 'No video yet' : 'No music yet'}</span>}
      <span className="row-ed">
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => ref.current?.click()} disabled={busy}>{busy ? 'Uploading...' : value ? 'Replace' : 'Upload'}</button>
        {value && <button type="button" className="btn btn--ghost btn--sm" onClick={() => onUrl('')}>{t("Remove")}</button>}
      </span>
      <input ref={ref} type="file" accept={accept} hidden onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
      <small className="fld__hint">{hint}</small>
      {err && <small className="err">{err}</small>}
    </div>
  );
}

function WorshipExtras(p: PanelProps) {
  const { t } = useT();
  const { d, put } = useData(p);
  return (
    <Section title={t("Worship Collection extras")} hint={t("These show on the Worship designs. Everything here is optional.")}>
      <ImageUpload label={t("Full logo lockup")} hint={t("Your wide logo with the name. Shows under your title with a gold light sweep. PNG with a transparent background looks best.")} value={d.orgLogoUrl ?? ''} shape="square"
        onFile={async (f) => { put({ orgLogoUrl: await store.uploadImage(f, 'logo') }); }} onClear={() => put({ orgLogoUrl: '' })} />
      <Field label={t("Accent line")} value={d.kicker ?? ''} onChange={(v) => put({ kicker: v })} maxLength={60} placeholder={t("Leave blank for the design's own line")} hint={t("The small line above your name, like a verse reference or a ministry motto.")} />
      <MediaUpload kind="video" label={t("Living portrait")} accept="video/mp4,video/webm,video/quicktime" value={d.photoVideoUrl} onUrl={(u) => put({ photoVideoUrl: u })}
        hint={t("A short silent clip of you smiling or waving (3 to 6 seconds, MP4). It plays once over your photo when the card opens, and again when someone taps the photo.")} />
      <MediaUpload kind="audio" label={t("Background music")} accept="audio/mpeg,audio/mp4,audio/aac,audio/*" value={d.music?.url} onUrl={(u) => put({ music: u ? { url: u, title: d.music?.title || 'Instrumental', sub: d.music?.sub } : undefined })}
        hint={t("An instrumental that starts softly on the visitor's first tap, with a play and pause button. Use music you own or have rights to.")} />
      {d.music?.url && (
        <Field label={t("Song title")} value={d.music.title} onChange={(v) => put({ music: { ...d.music!, title: v } })} maxLength={40} placeholder={t("Open the Heavens")} />
      )}
    </Section>
  );
}
