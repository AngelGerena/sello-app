import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, ExternalLink, Trash2, LogOut, Loader2, Crown, X, Search, ArrowLeft, ShieldCheck } from 'lucide-react';
import { NICHES, NICHE_GROUPS, applyDesign, liteDesigns, nicheOf, untriedDesigns, type Design, type Niche } from '../lib/niches';
import { NicheBadge } from '../components/editor/NichePicker';
import { TEMPLATES } from '../templates';
import { DesignTile } from '../components/editor/StylePanels';
import { sampleCard } from '../lib/seed';
import { HIcon } from '../templates/blocks';
import { takeWelcome } from '../lib/authLanding';
import { CARDS_KEY, INTERVAL_KEY, openBillingPortal, startCheckout, type Interval } from '../lib/billing';
import { prefersQuick } from '../lib/editorView';
import { decorative } from '../lib/a11y';
import { dollars, useOffer } from '../lib/offers';
import { DESIGN_COUNT, nicheCountLabel } from '../lib/counts';
import TeamDialog from '../components/TeamDialog';
import { refreshPlan } from '../lib/usePlan';
import { INTENT_KEY } from './Login';
import { PLANS, TEAM, isLocked, FREE_FALLBACK, BUSINESS_CONTACT, MORE_CARDS_CONTACT, cardLimit, clampCards, teamTotal, type PlanId } from '../lib/plans';
import { usePlan, setDemoPlan } from '../lib/usePlan';
import type { Card } from '../lib/types';
import { store } from '../lib/store';
import { useIsAdmin } from '../lib/useAdmin';
import { supabase } from '../lib/supabase';
import { cardUrl } from '../lib/links';
import Brand from '../components/Brand';
import CardRenderer from '../components/CardRenderer';
import { rich, useT } from '../lib/i18n';
import LangToggle from '../components/LangToggle';

export default function Dashboard() {
  const { t, lang } = useT();
  const [cards, setCards] = useState<Card[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const { plan, seats } = usePlan();
  const offer = useOffer();
  const { isAdmin } = useIsAdmin();
  const [intent, setIntent] = useState<string | null>(() => { try { return localStorage.getItem(INTENT_KEY); } catch { return null; } });
  const [paying, setPaying] = useState(false);

  useEffect(() => { store.myCards().then(setCards).catch((e) => setErr(e.message ?? t('Could not load your cards.'))); }, []);
  useEffect(() => { if (plan !== 'free') dropIntent(); }, [plan]); // eslint-disable-line react-hooks/exhaustive-deps

  const dropIntent = () => { try { localStorage.removeItem(INTENT_KEY); } catch { /* ignore */ } setIntent(null); };
  const [welcome, setWelcome] = useState<boolean>(() => takeWelcome());   // arrived from the confirmation email
  const [interval] = useState<Interval>(() => { try { return localStorage.getItem(INTERVAL_KEY) === 'year' ? 'year' : 'month'; } catch { return 'month'; } });
  const [teamOpen, setTeamOpen] = useState(false);
  const [intentCards] = useState(() => { try { return clampCards(parseInt(localStorage.getItem(CARDS_KEY) ?? '', 10)); } catch { return TEAM.initial; } });
  const upgrade = async (to: 'pro' | 'plus' | 'team', billed: Interval = interval, howMany?: number) => {
    if (store.demo) { setDemoPlan(to, howMany ?? TEAM.initial); setTeamOpen(false); return; } // demo: switch plans instantly so the gating can be tried
    setPaying(true);
    try { await startCheckout(to, billed, howMany); } catch (e) { setErr(e instanceof Error ? e.message : t('Checkout failed.')); setPaying(false); }
  };
  const manage = async () => {
    if (store.demo) { setErr(t('Billing opens Stripe in the live app.')); return; }
    setPaying(true);
    try { await openBillingPortal(); } catch (e) { setErr(e instanceof Error ? e.message : t('Could not open billing.')); setPaying(false); }
  };

  // Back from Stripe: the webhook can take a few seconds, so re-check the plan a few times.
  const [params, setParams] = useSearchParams();
  const upgradedTo = params.get('upgraded');
  const canceled = params.get('checkout') === 'canceled';
  useEffect(() => {
    if (!upgradedTo) return;
    try { localStorage.removeItem(INTENT_KEY); localStorage.removeItem(INTERVAL_KEY); localStorage.removeItem(CARDS_KEY); } catch { /* ignore */ }
    let n = 0;
    const t = window.setInterval(() => { refreshPlan(); if (++n >= 6) window.clearInterval(t); }, 2500);
    refreshPlan();
    return () => window.clearInterval(t);
  }, [upgradedTo]);
  const planInfo = PLANS.find((p) => p.id === plan)!;
  const intentPlan = PLANS.find((p) => p.id === intent && p.price > 0);

  const [picking, setPicking] = useState(false);
  const [q, setQ] = useState('');
  const matches = (n: Niche) => {
    const t = q.trim().toLowerCase();
    return !t || `${n.name} ${n.blurb} ${n.group} ${n.highlights.map((h) => h.title).join(' ')}`.toLowerCase().includes(t);
  };
  const [chosen, setChosen] = useState<Niche | null>(null);
  const sample = useMemo(() => sampleCard(), []);
  const closePicker = () => { setPicking(false); setChosen(null); setQ(''); };
  const create = async (niche?: Niche, design?: Design, quick = false) => {
    setBusy(true);
    try {
      let c = await store.create();
      if (niche && design) { c = applyDesign(c, niche, design); await store.save(c); }
      nav(`/app/cards/${c.id}${quick ? '?quick=1' : ''}`);
    }
    catch (e) {
      const m = e instanceof Error ? e.message : '';
      setErr(/row-level security/i.test(m) ? t('You have reached the card limit for your plan. Upgrade to add more cards.') : m || t('Could not create a card.'));
      setBusy(false);
    }
  };
  /** First card, or a saved preference: open quick setup. Everyone else keeps the niche picker they know. */
  const startCard = () => { if ((cards && cards.length === 0) || prefersQuick()) void create(undefined, undefined, true); else setPicking(true); };
  const remove = async (c: Card) => {
    if (!window.confirm(`Delete the card for ${c.data.fullName || 'this card'}? Its link and QR code will stop working.`)) return;
    const before = cards;
    setCards((cs) => cs?.filter((x) => x.id !== c.id) ?? null);
    try { await store.remove(c.id); } catch (e) { setCards(before); setErr(e instanceof Error ? e.message : t('Delete failed.')); }
  };

  return (
    <div className="dash">
      <header className="dash__top">
        <Brand />
        <span className="dash__acts">
        <LangToggle />
        {isAdmin && <Link to="/app/admin" className="btn btn--ink btn--sm"><ShieldCheck size={15} /> {t("Admin")}</Link>}
        {store.demo ? <span className="demo-tag">Demo. Changes stay on this device.
          <select className="demo-plan" value={plan} onChange={(e) => setDemoPlan(e.target.value as PlanId)} aria-label={t("Demo plan")}>{rich(t("<x1>Lite</x1><x2>Pro</x2><x3>Pro Plus</x3><x4>Business</x4>"), { x1: (c) => <option value="free">{c}</option>, x2: (c) => <option value="pro">{c}</option>, x3: (c) => <option value="plus">{c}</option>, x4: (c) => <option value="team">{c}</option> })}</select></span>
          : <button type="button" className="btn btn--ghost btn--sm" onClick={() => supabase.auth.signOut()}><LogOut size={15} /> {t("Sign out")}</button>}
        </span>
      </header>
      <main className="dash__main">
        <div className="dash__head">
          <h1>{t("My cards")}</h1>
          <button type="button" className="btn btn--gold" onClick={startCard} disabled={busy}>{busy ? <Loader2 className="spin" size={17} /> : <Plus size={17} />} New card</button>
        </div>
        {welcome && (
          <div className="pay-note is-ok" role="status">
            <b>{t("Email verified. You are signed in on this device.")}</b><span>{t("Pick your niche and build your first card. It takes about five minutes.")}</span>
            <button type="button" className="icon-btn" aria-label={t("Dismiss")} onClick={() => setWelcome(false)}><X size={16} /></button>
          </div>
        )}
        {upgradedTo && (
          <div className={`pay-note ${plan !== 'free' ? 'is-ok' : ''}`} role="status">
            {plan !== 'free'
              ? <>{rich(t("<b>You're on {name}. Thank you!</b><x2>Every design is unlocked and your badge is gone.</x2>", { name: PLANS.find((p) => p.id === plan)?.name }), { b: (c) => <b>{c}</b>, x2: (c) => <span>{c}</span> })}</>
              : <><Loader2 size={16} className="spin" /><b>{t("Payment received.")}</b><span>{t("Unlocking your plan, this takes a few seconds...")}</span></>}
            <button type="button" className="icon-btn" aria-label={t("Dismiss")} onClick={() => setParams({})}><X size={16} /></button>
          </div>
        )}
        {canceled && (
          <div className="pay-note" role="status"><b>{t("Checkout canceled.")}</b><span>{t("No charge was made. You can upgrade any time.")}</span>
            <button type="button" className="icon-btn" aria-label={t("Dismiss")} onClick={() => setParams({})}><X size={16} /></button></div>
        )}
        {intentPlan && plan === 'free' ? (
          <div className="plan-bar plan-bar--intent">
            <span>{rich(t("<b>Finish upgrading to {name}</b><small>Your account is ready on the free plan. {name2} is {v}, cancel any time.</small>", { name: intentPlan.name, name2: intentPlan.name, v: intentPlan.perCard ? (interval === 'year' ? t('${total}/year for {n} cards', { total: teamTotal(intentCards, true), n: intentCards }) : t('${total}/month for {n} cards', { total: teamTotal(intentCards, false), n: intentCards })) : interval === 'year' ? `$${intentPlan.yearly}/year` : `$${intentPlan.price}/month` }), { b: (c) => <b>{c}</b>, small: (c) => <small>{c}</small> })}{intentPlan.id === 'pro' && interval === 'month' && offer.known && offer.active && <small>{t("Founding price: {price} a month if a spot is still open when you pay. One per person; it lasts while your subscription stays active.", { price: dollars(offer.cents) })}</small>}</span>
            <span className="row-ed">
              <button type="button" className="btn btn--gold" onClick={() => upgrade(intentPlan.id as 'pro' | 'plus' | 'team', interval, intentPlan.perCard ? intentCards : undefined)} disabled={paying}>{paying ? <Loader2 className="spin" size={16} /> : <Crown size={16} />} Continue to payment</button>
              <button type="button" className="btn btn--onink btn--sm" onClick={dropIntent}>{t("Stay on free")}</button>
            </span>
          </div>
        ) : (
          <div className="plan-bar">
            <span><b>{rich(t("{name} plan<x1>{v}</x1>", { name: planInfo.name, v: plan === 'free' ? t('Free') : t('Active') }), { x1: (c) => <span className="plan-pill">{c}</span> })}</b><small>{plan === 'free' ? `One card, 3 Lite designs and a small OKUNAMI badge. Upgrade to publish all ${DESIGN_COUNT} designs, every new Drop, and lose the badge.` : `${planInfo.pitch} ${cards ? `${cards.length} of ${cardLimit(plan, seats)} cards in use.` : ''}`}</small></span>
            {plan === 'free' && <button type="button" className="btn btn--ghost btn--sm" onClick={() => setTeamOpen(true)} disabled={paying}>{t("Business, for teams")}</button>}
            {plan === 'free' && <button type="button" className="btn btn--ghost btn--sm" onClick={() => upgrade('plus')} disabled={paying}>{t("Upgrade to Pro Plus")}</button>}
            {plan === 'free' && <button type="button" className="btn btn--gold btn--sm" onClick={() => upgrade('pro')} disabled={paying}><Crown size={15} /> {t("Upgrade to Pro")}</button>}
            {plan !== 'free' && <button type="button" className="btn btn--ghost btn--sm" onClick={manage} disabled={paying}>{t("Manage billing")}</button>}
            {plan === 'team' && <a className="btn btn--ghost btn--sm" href={MORE_CARDS_CONTACT(cardLimit(plan, seats))} target="_blank" rel="noopener">{t("Change number of cards")}</a>}
            {(plan === 'pro' || plan === 'plus') && <a className="btn btn--ghost btn--sm" href={BUSINESS_CONTACT} target="_blank" rel="noopener">{t("Move to Business")}</a>}
          </div>
        )}
        {err && <p className="err" role="alert">{err}</p>}
        {!cards && !err && <p className="center-msg"><Loader2 className="spin" /> {t("Loading")}</p>}
        {cards && cards.length === 0 && (
          <div className="empty empty--big">
            <h2>{t("Make your first card")}</h2>
            <p>{t("It takes about five minutes: your photo, your numbers, your colors.")}</p>
            <button type="button" className="btn btn--gold btn--lg" onClick={startCard}><Plus size={18} /> {t("Start a card")}</button>
          </div>
        )}
        <div className="dash__grid">
          {cards?.map((c) => (
            <article key={c.id} className="dcard">
              <Link to={`/app/cards/${c.id}`} className="dcard__prev" aria-label={`Edit ${c.data.fullName || 'card'}`}>
                <span className="dcard__scale" {...decorative}><CardRenderer card={c} mode="light" sound={false} /></span>
              </Link>
              <div className="dcard__meta">
                <b>{c.data.fullName || t('Untitled card')}</b>
                <small>{c.published ? t('Published') : t('Draft')} · {TEMPLATES.find((tp) => tp.id === c.template)?.name ?? t('Custom')} · {new Date(c.updatedAt).toLocaleDateString()}</small>
                {(() => {
                  const n = nicheOf(c);
                  if (!n) return <Link className="dcard__pick" to={`/app/cards/${c.id}?step=profile`}>{t("Pick your niche to see designs made for you")}</Link>;
                  const more = untriedDesigns(c, n);
                  return (
                    <>
                    {isLocked(plan, c.template) && <small className="dcard__lock">{t("Pro design · shows as {name} until you upgrade", { name: TEMPLATES.find((t) => t.id === FREE_FALLBACK)?.name })}</small>}
                    <span className="dcard__niche">
                      <NicheBadge id={n.id} size="sm" />
                      {more.length > 0 && <Link to={`/app/cards/${c.id}?step=layout`} className="dcard__more">{t("{length} more design{v}{v2}", { length: more.length, v: more.length > 1 ? 's' : '', v2: more.some((d) => d.isNew) ? ' · new' : '' })}</Link>}
                    </span>
                    </>
                  );
                })()}
              </div>
              <div className="dcard__acts">
                <Link to={`/app/cards/${c.id}`} className="btn btn--ink btn--sm"><Pencil size={15} /> {t("Edit")}</Link>
                <a href={cardUrl(c.data)} target="_blank" rel="noopener" className="btn btn--ghost btn--sm"><ExternalLink size={15} /> {t("View")}</a>
                <button type="button" className="icon-btn" onClick={() => remove(c)} aria-label={`Delete ${c.data.fullName || 'card'}`}><Trash2 size={16} /></button>
              </div>
            </article>
          ))}
        </div>
      </main>
      {picking && (
        <div className="picker-modal" role="dialog" aria-modal="true" aria-label={t("What kind of business is this card for?")} onClick={() => !busy && closePicker()}>
          <div className="picker-modal__panel" onClick={(e) => e.stopPropagation()}>
            <div className="picker-modal__head">
              <div>
                {chosen ? (
                  <>
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => setChosen(null)} disabled={busy}><ArrowLeft size={15} /> {t("All niches")}</button>
                    <h2>{t("Choose a design for {name}", { name: chosen.name })}</h2>
                    <p>{t("Every design comes with its own colors, fonts, buttons and sounds. You can change all of it later.")}</p>
                  </>
                ) : (
                  <>{rich(t("<x1>What's the card for?</x1><x2>Pick your niche, then choose from designs made for it.</x2>"), { x1: (c) => <h2>{c}</h2>, x2: (c) => <p>{c}</p> })}</>
                )}
              </div>
              <button type="button" className="icon-btn" aria-label={t("Close")} onClick={closePicker} disabled={busy}><X size={20} /></button>
            </div>
            {chosen ? (
              <>
                {plan === 'free' && (
                  <>
                    <p className="lay-sub">{t("Free Lite designs")}</p>
                    <div className="tpl-grid tpl-grid--wide">
                      {liteDesigns(chosen).map((d) => (
                        <DesignTile key={'lite-' + d.template} card={sample} niche={chosen} design={d} confirm={false} sample free onUse={() => create(chosen, d)} />
                      ))}
                    </div>
                    <p className="lay-sub">{rich(t("Pro designs <x1>Start with any of them and try it on your card. Upgrade to Pro to publish it.</x1>"), { x1: (c) => <span>{c}</span> })}</p>
                  </>
                )}
                <div className="tpl-grid tpl-grid--wide">
                  {chosen.designs.map((d) => (
                    <DesignTile key={d.template + d.name} card={sample} niche={chosen} design={d} confirm={false} sample locked={isLocked(plan, d.template)} onUse={() => create(chosen, d)} />
                  ))}
                </div>
              </>
            ) : (
              <>
                <label className="niche-search"><Search size={17} /><span className="sr">{t("Search niches")}</span><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search: barber, salon, church, DJ, realtor...")} /></label>
                <div className="niche-pick">
                  {NICHE_GROUPS.map((g) => {
                    const items = NICHES.filter((n) => n.group === g && matches(n));
                    if (!items.length) return null;
                    return [<h3 key={g} className="niche-group">{t(g)}</h3>, ...items.map((n) => (
                      <button key={n.id} type="button" className={`niche-pick__b ${n.group === 'Tech' ? 'is-tech' : ''}`} onClick={() => setChosen(n)} disabled={busy}>
                        <span className="niche-pick__sw" style={{ background: `linear-gradient(135deg, ${n.designs[0].seeds.brand}, ${n.designs[0].seeds.accent})` }}><HIcon name={n.icon} size={22} /></span>
                        <b>{t(n.name)}</b><small>{nicheCountLabel(n, plan, lang)} · {t(n.blurb)}</small>
                      </button>
                    ))];
                  })}
                  <h3 className="niche-group">{t("Or")}</h3>
                  <button type="button" className="niche-pick__b niche-pick__blank" onClick={() => create()} disabled={busy}>
                    <span className="niche-pick__sw"><Plus size={22} /></span><b>{t("Something else")}</b><small>{t("Start with a classic layout and build your own look.")}</small>
                  </button>
                </div>
              </>
            )}
            {busy && <p className="note" role="status"><Loader2 size={14} className="spin" /> {t("Setting up your card...")}</p>}
          </div>
        </div>
      )}
      {teamOpen && <TeamDialog initialCards={intentCards} initialInterval={interval} busy={paying} onClose={() => setTeamOpen(false)} onContinue={(n, billed) => upgrade('team', billed, n)} />}
    </div>
  );
}
