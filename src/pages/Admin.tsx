import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRightLeft, BarChart3, ChevronDown, ChevronUp, ExternalLink, Eye, EyeOff, LayoutGrid, Loader2,
  LogOut, Pencil, Search, ShieldCheck, Users, X,
} from 'lucide-react';
import { BUSINESS_CARDS, cardLimit } from '../lib/plans';
import { adminApi, type AdminCard, type AdminLog, type AdminStats, type AdminUser, type PlanHow, type PlanId } from '../lib/adminApi';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { TEMPLATES } from '../templates';
import { cardUrl } from '../lib/links';
import type { CardData } from '../lib/types';
import Brand from '../components/Brand';

/* ------------------------------------------------------------------ small helpers */
const PLAN_NAME: Record<PlanId, string> = { free: 'Lite', pro: 'Pro', plus: 'Pro Plus', team: 'Business' };
const designName = (id: string) => TEMPLATES.find((t) => t.id === id)?.name ?? id;
const liveUrl = (slug: string) => cardUrl({ slug } as CardData);
const money = (cents: number) => `$${Math.round(cents / 100).toLocaleString()}`;
const fmtDate = (s?: string | null) => (s ? new Date(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'never');
const errText = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong. Try again.');

function ago(s?: string | null): string {
  if (!s) return 'never';
  const m = Math.round((Date.now() - +new Date(s)) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return d < 30 ? `${d}d ago` : fmtDate(s);
}

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}

function billing(u: Pick<AdminUser, 'plan' | 'plan_status'>): { label: string; tone: 'ok' | 'muted' | 'bad' | 'warn' } | null {
  if (u.plan === 'free') return null;
  switch (u.plan_status) {
    case 'active': case 'trialing': return { label: 'Paying via Stripe', tone: 'ok' };
    case 'past_due': return { label: 'Payment past due', tone: 'bad' };
    case 'comped': return { label: 'Complimentary', tone: 'muted' };
    case 'manual': return { label: 'Paid outside Stripe', tone: 'muted' };
    default: return { label: u.plan_status ?? 'Unknown status', tone: 'warn' };
  }
}

function logText(l: AdminLog): string {
  const who = l.target_email ?? 'someone';
  switch (l.action) {
    case 'plan': return `Plan for ${who}: ${l.detail ?? 'changed'}`;
    case 'unpublish': return `Unpublished /${l.card_slug ?? '?'} (${who})${l.detail ? `. Reason: ${l.detail}` : ''}`;
    case 'republish': return `Republished /${l.card_slug ?? '?'} (${who})`;
    case 'transfer': return `Moved /${l.card_slug ?? '?'} to ${who} (${l.detail ?? ''})`;
    default: return `${l.action}: ${who}`;
  }
}

/* ------------------------------------------------------------------ shared pieces */
type Dialog =
  | { kind: 'plan'; user: AdminUser }
  | { kind: 'unpublish'; card: AdminCard }
  | { kind: 'transfer'; card: AdminCard }
  | null;

interface Ctx {
  meId: string;
  flash(text: string, bad?: boolean): void;
  reload(): void;
  done(text: string): void;
  openDialog(d: Dialog): void;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', key);
    return () => { window.removeEventListener('keydown', key); prev?.focus?.(); };
  }, [onClose]);
  return (
    <div className="adm-modal" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="adm-modal__box" role="dialog" aria-modal="true" aria-label={title}>
        <header><h2>{title}</h2><button type="button" className="icon-btn" aria-label="Close" onClick={onClose}><X size={18} /></button></header>
        {children}
      </div>
    </div>
  );
}

function Kpi({ label, value, sub, tone }: { label: string; value: ReactNode; sub?: ReactNode; tone?: 'pink' | 'cyan' | 'orange' }) {
  return <div className={`adm-kpi ${tone ? `adm-kpi--${tone}` : ''}`}><span>{label}</span><b>{value}</b>{sub && <small>{sub}</small>}</div>;
}

function Loading({ text = 'Loading' }: { text?: string }) {
  return <p className="adm-empty" role="status"><Loader2 size={16} className="spin" /> {text}...</p>;
}

/* ------------------------------------------------------------------ one card row (used in Customers and Cards) */
function CardRow({ card, ctx, showOwner }: { card: AdminCard; ctx: Ctx; showOwner: boolean }) {
  const [busy, setBusy] = useState(false);
  const mine = card.owner_id === ctx.meId;
  const editTo = `/app/cards/${card.id}${mine ? '' : `?owner=${encodeURIComponent(card.owner_email ?? 'a customer')}`}`;
  const republish = async () => {
    setBusy(true);
    try { await adminApi.setPublished(card.id, true); ctx.done(`Republished /${card.slug}.`); } catch (e) { ctx.flash(errText(e), true); } finally { setBusy(false); }
  };
  return (
    <li className="adm-row adm-row--card">
      <div className="adm-row__main">
        <b>{card.full_name || card.business || 'Untitled card'}</b>
        <small>{[card.full_name && card.business ? card.business : null, `/${card.slug}`].filter(Boolean).join(' · ')}</small>
        {showOwner && <small>Owner: {card.owner_email ?? 'unknown'}</small>}
      </div>
      <div className="adm-row__meta">
        <span className={`adm-pill ${card.published ? 'adm-pill--ok' : 'adm-pill--muted'}`}>{card.published ? 'Live' : 'Draft'}</span>
        <small>{designName(card.template)}, updated {ago(card.updated_at)}</small>
      </div>
      <div className="adm-row__acts">
        <Link to={editTo} className="btn btn--ghost btn--sm"><Pencil size={14} /> Edit</Link>
        {card.published && <a href={liveUrl(card.slug)} target="_blank" rel="noopener" className="btn btn--ghost btn--sm"><ExternalLink size={14} /> View</a>}
        {card.published
          ? <button type="button" className="btn btn--ghost btn--sm" onClick={() => ctx.openDialog({ kind: 'unpublish', card })}><EyeOff size={14} /> Unpublish</button>
          : <button type="button" className="btn btn--ghost btn--sm" onClick={republish} disabled={busy}>{busy ? <Loader2 size={14} className="spin" /> : <Eye size={14} />} Republish</button>}
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => ctx.openDialog({ kind: 'transfer', card })}><ArrowRightLeft size={14} /> Transfer</button>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ overview */
function Overview({ rev }: { rev: number }) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [log, setLog] = useState<AdminLog[] | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    let alive = true;
    Promise.all([adminApi.stats(), adminApi.recent()])
      .then(([s, l]) => { if (alive) { setStats(s); setLog(l); setErr(''); } })
      .catch((e) => { if (alive) setErr(errText(e)); });
    return () => { alive = false; };
  }, [rev]);

  if (err) return <p className="err" role="alert">{err}</p>;
  if (!stats || !log) return <Loading />;
  const max = Math.max(1, ...stats.signups.map((s) => s.n));
  const week = stats.signups.reduce((a, s) => a + s.n, 0);
  const planTotal = Math.max(1, stats.users);
  const topMax = Math.max(1, ...stats.top_designs.map((d) => d.n));

  return (
    <>
      <div className="adm-kpis">
        <Kpi tone="pink" label="Customers" value={stats.users} sub={`+${stats.new_7d} this week, +${stats.new_30d} this month`} />
        <Kpi tone="cyan" label="Paying via Stripe" value={stats.paying} sub={`About ${money(stats.mrr_cents)} a month`} />
        <Kpi label="Complimentary or paid outside Stripe" value={stats.offline} sub="Not counted in the monthly estimate" />
        <Kpi tone="orange" label="Cards" value={stats.cards} sub={`${stats.published} live`} />
        <Kpi label="Card views (7 days)" value={stats.views_7d.toLocaleString()} sub={`${stats.saves_7d.toLocaleString()} saved to phones`} />
        <Kpi label="Taps (7 days)" value={stats.taps_7d.toLocaleString()} sub="Calls, texts, bookings, shares" />
      </div>

      <div className="adm-grid">
        <section className="adm-panel" aria-labelledby="h-signups">
          <h3 id="h-signups">New customers, last 14 days <span>{week} total</span></h3>
          <svg className="adm-bars" viewBox="0 0 280 90" role="img" aria-label={`${week} sign-ups in the last 14 days`}>
            {stats.signups.map((s, i) => {
              const h = s.n === 0 ? 2 : Math.max(6, (s.n / max) * 66);
              return <g key={s.d}><rect x={i * 20 + 3} y={72 - h} width="14" height={h} rx="3" className={s.n ? 'on' : ''}><title>{`${fmtDate(s.d)}: ${s.n}`}</title></rect></g>;
            })}
            <text x="3" y="88">{fmtDate(stats.signups[0]?.d)}</text>
            <text x="277" y="88" textAnchor="end">Today</text>
          </svg>
        </section>

        <section className="adm-panel" aria-labelledby="h-plans">
          <h3 id="h-plans">Plan mix</h3>
          {(['free', 'pro', 'plus', 'team'] as PlanId[]).map((p) => {
            const n = stats.plans[p] ?? 0;
            return (
              <div key={p} className="adm-meter"><span>{PLAN_NAME[p]}</span><i><em style={{ width: `${(n / planTotal) * 100}%` }} /></i><b>{n}</b></div>
            );
          })}
          <p className="adm-note">Founding members: {stats.founding} of 100</p>
        </section>

        <section className="adm-panel" aria-labelledby="h-designs">
          <h3 id="h-designs">Most-used designs</h3>
          {stats.top_designs.length === 0 && <p className="adm-empty">No cards yet.</p>}
          {stats.top_designs.map((d) => (
            <div key={d.template} className="adm-meter"><span>{designName(d.template)}</span><i><em style={{ width: `${(d.n / topMax) * 100}%` }} /></i><b>{d.n}</b></div>
          ))}
        </section>

        <section className="adm-panel" aria-labelledby="h-log">
          <h3 id="h-log">Recent admin activity</h3>
          {log.length === 0 && <p className="adm-empty">Nothing yet. Plan changes, unpublishes and transfers show up here.</p>}
          <ul className="adm-log">
            {log.map((l) => <li key={l.id}><span>{logText(l)}</span><small>{ago(l.created_at)}</small></li>)}
          </ul>
        </section>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ customers */
function UserCards({ user, ctx, rev }: { user: AdminUser; ctx: Ctx; rev: number }) {
  const [cards, setCards] = useState<AdminCard[] | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    let alive = true;
    adminApi.cards({ user: user.id }).then((c) => { if (alive) setCards(c); }).catch((e) => { if (alive) setErr(errText(e)); });
    return () => { alive = false; };
  }, [user.id, rev]);
  if (err) return <p className="err" role="alert">{err}</p>;
  if (!cards) return <Loading />;
  if (cards.length === 0) return <p className="adm-empty">No cards yet.</p>;
  return <ul className="adm-list adm-list--inner">{cards.map((c) => <CardRow key={c.id} card={c} ctx={ctx} showOwner={false} />)}</ul>;
}

function Customers({ ctx, rev }: { ctx: Ctx; rev: number }) {
  const PAGE = 25;
  const [q, setQ] = useState('');
  const dq = useDebounced(q, 300);
  const [plan, setPlan] = useState('');
  const [rows, setRows] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [more, setMore] = useState(false);
  const [err, setErr] = useState('');
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    adminApi.users({ q: dq, plan, limit: PAGE, offset: 0 })
      .then((r) => { if (alive) { setRows(r); setTotal(r[0]?.total ?? 0); setErr(''); } })
      .catch((e) => { if (alive) setErr(errText(e)); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [dq, plan, rev]);

  const loadMore = async () => {
    setMore(true);
    try { const r = await adminApi.users({ q: dq, plan, limit: PAGE, offset: rows.length }); setRows((cur) => [...cur, ...r]); }
    catch (e) { ctx.flash(errText(e), true); } finally { setMore(false); }
  };

  return (
    <>
      <div className="adm-tools">
        <label className="adm-search"><Search size={16} aria-hidden /><span className="sr">Search customers</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email" />
        </label>
        <div className="seg" role="group" aria-label="Filter by plan">
          {[['', 'All'], ['free', 'Lite'], ['pro', 'Pro'], ['plus', 'Pro Plus'], ['team', 'Business']].map(([v, l]) => (
            <button key={v} type="button" className={plan === v ? 'on' : ''} aria-pressed={plan === v} onClick={() => setPlan(v)}>{l}</button>
          ))}
        </div>
      </div>
      <p className="adm-count" role="status">{loading ? 'Loading...' : `${total} customer${total === 1 ? '' : 's'}`}</p>
      {err && <p className="err" role="alert">{err}</p>}
      {!loading && !err && rows.length === 0 && <p className="adm-empty">No customers match.</p>}
      <ul className="adm-list">
        {rows.map((u) => {
          const b = billing(u);
          const isOpen = open === u.id;
          return (
            <li key={u.id} className={`adm-cust ${isOpen ? 'is-open' : ''}`}>
              <div className="adm-row">
                <div className="adm-row__main">
                  <b>{u.full_name || u.email || 'Unnamed'}{u.is_admin && <span className="adm-tag">Admin</span>}</b>
                  <small>{u.email}</small>
                </div>
                <div className="adm-row__meta">
                  <span className={`adm-plan adm-plan--${u.plan}`}>{PLAN_NAME[u.plan]}{u.plan === 'team' && !u.is_admin ? `, ${cardLimit('team', u.seats)} cards` : ''}</span>
                  {b && <span className={`adm-pill adm-pill--${b.tone}`}>{b.label}</span>}
                  {u.founding && <span className="adm-pill adm-pill--gold">Founding</span>}
                </div>
                <div className="adm-row__meta">
                  <span><b>{u.card_count}</b> card{u.card_count === 1 ? '' : 's'}, {u.published_count} live</span>
                  <small>Joined {fmtDate(u.created_at)}. Last seen {ago(u.last_sign_in_at)}</small>
                </div>
                <div className="adm-row__acts">
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => ctx.openDialog({ kind: 'plan', user: u })}>Change plan</button>
                  <button type="button" className="btn btn--ghost btn--sm" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : u.id)}>
                    Cards {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>
              {isOpen && <UserCards user={u} ctx={ctx} rev={rev} />}
            </li>
          );
        })}
      </ul>
      {rows.length < total && (
        <button type="button" className="btn btn--ghost adm-more" onClick={loadMore} disabled={more}>{more ? <Loader2 size={16} className="spin" /> : null} Show more ({total - rows.length} left)</button>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ all cards */
function CardsTab({ ctx, rev }: { ctx: Ctx; rev: number }) {
  const [q, setQ] = useState('');
  const dq = useDebounced(q, 300);
  const [cards, setCards] = useState<AdminCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  useEffect(() => {
    let alive = true;
    setLoading(true);
    adminApi.cards({ q: dq, limit: 80 })
      .then((c) => { if (alive) { setCards(c); setErr(''); } })
      .catch((e) => { if (alive) setErr(errText(e)); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [dq, rev]);
  return (
    <>
      <div className="adm-tools">
        <label className="adm-search"><Search size={16} aria-hidden /><span className="sr">Search cards</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, business, link or owner email" />
        </label>
      </div>
      <p className="adm-count" role="status">{loading ? 'Loading...' : `${cards.length} card${cards.length === 1 ? '' : 's'}${cards.length === 80 ? ' (showing the newest 80)' : ''}`}</p>
      {err && <p className="err" role="alert">{err}</p>}
      {!loading && !err && cards.length === 0 && <p className="adm-empty">No cards match.</p>}
      <ul className="adm-list">{cards.map((c) => <CardRow key={c.id} card={c} ctx={ctx} showOwner />)}</ul>
    </>
  );
}

/* ------------------------------------------------------------------ dialogs */
function PlanDialog({ user, ctx }: { user: AdminUser; ctx: Ctx }) {
  const currentHow: PlanHow = user.plan_status === 'manual' ? 'manual' : 'comped';
  const [plan, setPlan] = useState<PlanId>(user.plan);
  const [how, setHow] = useState<PlanHow>(currentHow);
  const [seatsRaw, setSeatsRaw] = useState(String(user.seats ?? BUSINESS_CARDS));
  const seats = Math.min(500, Math.max(1, parseInt(seatsRaw, 10) || BUSINESS_CARDS));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const unchanged = plan === user.plan && (plan === 'free' || how === currentHow) && (plan !== 'team' || seats === (user.seats ?? BUSINESS_CARDS));
  const who = user.full_name || user.email || 'this customer';
  const save = async () => {
    setBusy(true); setErr('');
    try { await adminApi.setPlan(user.id, plan, how, plan === 'team' ? seats : undefined); ctx.done(`${who} is now on ${PLAN_NAME[plan]}${plan === 'team' ? ` with ${seats} cards` : ''}.`); } catch (e) { setErr(errText(e)); setBusy(false); }
  };
  return (
    <Modal title={`Change plan for ${who}`} onClose={() => ctx.openDialog(null)}>
      {user.has_stripe ? (
        <p className="adm-warn" role="alert">{who} pays through Stripe. Change their plan in Stripe so the two stay in step. Editing it here would be overwritten the next time Stripe sends an update.</p>
      ) : (
        <>
          <p className="adm-lead">Currently <b>{PLAN_NAME[user.plan]}</b>. Nobody is charged by this. It only changes what they can use.</p>
          <div className="adm-field"><span>Plan</span>
            <div className="seg" role="radiogroup" aria-label="Plan">
              {(['free', 'pro', 'plus', 'team'] as PlanId[]).map((p) => <button key={p} type="button" role="radio" aria-checked={plan === p} className={plan === p ? 'on' : ''} onClick={() => setPlan(p)}>{PLAN_NAME[p]}</button>)}
            </div>
          </div>
          {plan === 'team' && (
            <div className="adm-field"><label htmlFor="seats">How many cards?</label>
              <input id="seats" type="number" inputMode="numeric" min={1} max={500} value={seatsRaw} onChange={(e) => setSeatsRaw(e.target.value)} onBlur={() => setSeatsRaw(String(seats))} className="adm-num" />
              <small>Business customers who pay through Stripe choose this themselves (3 to 100). Here you can set any number.</small>
            </div>
          )}
          {plan !== 'free' && (
            <div className="adm-field"><span>How are they getting it?</span>
              <div className="seg" role="radiogroup" aria-label="How">
                <button type="button" role="radio" aria-checked={how === 'comped'} className={how === 'comped' ? 'on' : ''} onClick={() => setHow('comped')}>Complimentary</button>
                <button type="button" role="radio" aria-checked={how === 'manual'} className={how === 'manual' ? 'on' : ''} onClick={() => setHow('manual')}>Paid outside Stripe</button>
              </div>
              <small>Use "Paid outside Stripe" for Zelle, cash or a Studio invoice, so you can tell it apart from a gift.</small>
            </div>
          )}
          {plan === 'free' && user.plan !== 'free' && <p className="adm-note">Their published cards on Pro-only designs will show the free Arch design until they upgrade again.</p>}
        </>
      )}
      {err && <p className="err" role="alert">{err}</p>}
      <footer>
        <button type="button" className="btn btn--ghost" onClick={() => ctx.openDialog(null)}>Cancel</button>
        {!user.has_stripe && <button type="button" className="btn btn--gold" onClick={save} disabled={busy || unchanged}>{busy ? <Loader2 size={16} className="spin" /> : null} Save plan</button>}
      </footer>
    </Modal>
  );
}

function UnpublishDialog({ card, ctx }: { card: AdminCard; ctx: Ctx }) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const go = async () => {
    setBusy(true); setErr('');
    try { await adminApi.setPublished(card.id, false, reason); ctx.done(`Unpublished /${card.slug}.`); } catch (e) { setErr(errText(e)); setBusy(false); }
  };
  return (
    <Modal title={`Unpublish /${card.slug}`} onClose={() => ctx.openDialog(null)}>
      <p className="adm-lead">The link stops working right away. The owner ({card.owner_email ?? 'unknown'}) still sees the card in their dashboard and can edit it. You can republish it any time.</p>
      <div className="fld"><label htmlFor="why">Reason (only you see this, it goes in the activity log)</label>
        <input id="why" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={140} placeholder="Optional" autoFocus />
      </div>
      {err && <p className="err" role="alert">{err}</p>}
      <footer>
        <button type="button" className="btn btn--ghost" onClick={() => ctx.openDialog(null)}>Cancel</button>
        <button type="button" className="btn btn--ink" onClick={go} disabled={busy}>{busy ? <Loader2 size={16} className="spin" /> : <EyeOff size={16} />} Unpublish</button>
      </footer>
    </Modal>
  );
}

function TransferDialog({ card, ctx }: { card: AdminCard; ctx: Ctx }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const go = async () => {
    setBusy(true); setErr('');
    try { const to = await adminApi.transfer(card.id, email); ctx.done(`Moved /${card.slug} to ${to}.`); } catch (e) { setErr(errText(e)); setBusy(false); }
  };
  return (
    <Modal title={`Transfer /${card.slug}`} onClose={() => ctx.openDialog(null)}>
      <p className="adm-lead">Hand this card, with its link and design, to another account. Now owned by <b>{card.owner_email ?? 'unknown'}</b>. The new owner needs a SeYo account with a confirmed email.</p>
      <div className="fld"><label htmlFor="to">New owner's email</label>
        <input id="to" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="client@example.com" autoComplete="off" autoFocus
          onKeyDown={(e) => { if (e.key === 'Enter' && email && !busy) go(); }} />
      </div>
      <p className="adm-note">Their plan's card limit is not checked here, so they may end up with more cards than their plan lets them create on their own.</p>
      {err && <p className="err" role="alert">{err}</p>}
      <footer>
        <button type="button" className="btn btn--ghost" onClick={() => ctx.openDialog(null)}>Cancel</button>
        <button type="button" className="btn btn--gold" onClick={go} disabled={busy || !email.trim()}>{busy ? <Loader2 size={16} className="spin" /> : <ArrowRightLeft size={16} />} Transfer card</button>
      </footer>
    </Modal>
  );
}

/* ------------------------------------------------------------------ the page */
type Tab = 'overview' | 'customers' | 'cards';
const TABS: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'cards', label: 'Cards', icon: LayoutGrid },
];

export default function Admin() {
  const { session, demo } = useAuth();
  const [params, setParams] = useSearchParams();
  const raw = params.get('tab');
  const tab: Tab = raw === 'customers' || raw === 'cards' ? raw : 'overview';
  const setTab = (t: Tab) => setParams(t === 'overview' ? {} : { tab: t }, { replace: true });
  const [dialog, setDialog] = useState<Dialog>(null);
  const [notice, setNotice] = useState<{ text: string; bad: boolean } | null>(null);
  const [rev, setRev] = useState(0);

  const flash = useCallback((text: string, bad = false) => setNotice({ text, bad }), []);
  const reload = useCallback(() => setRev((n) => n + 1), []);
  const done = useCallback((text: string) => { setDialog(null); setNotice({ text, bad: false }); setRev((n) => n + 1); }, []);
  useEffect(() => { if (!notice) return; const t = setTimeout(() => setNotice(null), 7000); return () => clearTimeout(t); }, [notice]);

  const ctx: Ctx = { meId: demo ? 'u1' : session?.user.id ?? '', flash, reload, done, openDialog: setDialog };

  return (
    <div className="adm">
      <header className="dash__top">
        <Brand />
        <span className="adm-badge"><ShieldCheck size={15} /> Admin</span>
        <span className="adm-topacts">
          <Link to="/app" className="btn btn--ghost btn--sm"><ArrowLeft size={15} /> My cards</Link>
          {!demo && <button type="button" className="btn btn--ghost btn--sm" onClick={() => supabase.auth.signOut()}><LogOut size={15} /> Sign out</button>}
        </span>
      </header>

      <main className="dash__main">
        <div className="dash__head"><h1>Admin</h1></div>
        <nav className="adm-tabs" role="tablist" aria-label="Admin sections">
          {TABS.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}><t.icon size={16} /> {t.label}</button>
          ))}
        </nav>

        {notice && (
          <div className={`pay-note ${notice.bad ? '' : 'is-ok'}`} role={notice.bad ? 'alert' : 'status'}>
            <b>{notice.bad ? 'That did not work.' : 'Done.'}</b><span>{notice.text}</span>
            <button type="button" className="icon-btn" aria-label="Dismiss" onClick={() => setNotice(null)}><X size={16} /></button>
          </div>
        )}

        <div role="tabpanel">
          {tab === 'overview' && <Overview rev={rev} />}
          {tab === 'customers' && <Customers ctx={ctx} rev={rev} />}
          {tab === 'cards' && <CardsTab ctx={ctx} rev={rev} />}
        </div>
      </main>

      {dialog?.kind === 'plan' && <PlanDialog user={dialog.user} ctx={ctx} />}
      {dialog?.kind === 'unpublish' && <UnpublishDialog card={dialog.card} ctx={ctx} />}
      {dialog?.kind === 'transfer' && <TransferDialog card={dialog.card} ctx={ctx} />}
    </div>
  );
}
