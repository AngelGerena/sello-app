import { IS_DEMO, supabase } from './supabase';

/* Everything the admin portal reads or changes goes through admin-only database functions
   (see supabase/migrations/0011_admin_portal.sql). Each one checks that the caller is an admin,
   so a regular customer who tried to call them would be refused by the database itself. */

export type PlanId = 'free' | 'pro' | 'plus' | 'team';
export type PlanHow = 'comped' | 'manual';

export interface AdminStats {
  users: number; new_7d: number; new_30d: number;
  plans: Partial<Record<PlanId, number>>;
  paying: number; offline: number; founding: number; mrr_cents: number;
  cards: number; published: number;
  top_designs: { template: string; n: number }[];
  views_7d: number; saves_7d: number; taps_7d: number;
  signups: { d: string; n: number }[];
}
export interface AdminUser {
  id: string; email: string | null; full_name: string | null;
  plan: PlanId; plan_status: string | null; plan_interval: string | null; seats: number | null;
  founding: boolean; has_stripe: boolean;
  created_at: string; last_sign_in_at: string | null;
  card_count: number; published_count: number; is_admin: boolean; total: number;
}
export interface AdminCard {
  id: string; owner_id: string; owner_email: string | null; slug: string; template: string; published: boolean;
  full_name: string | null; business: string | null; updated_at: string; created_at: string;
}
export interface AdminLog {
  id: number; created_at: string; admin_email: string | null; action: string;
  target_email: string | null; card_slug: string | null; detail: string | null;
}

export interface UsersQuery { q?: string; plan?: string; limit?: number; offset?: number }
export interface CardsQuery { user?: string; q?: string; limit?: number }

export interface AdminApi {
  stats(): Promise<AdminStats>;
  users(o: UsersQuery): Promise<AdminUser[]>;
  cards(o: CardsQuery): Promise<AdminCard[]>;
  setPlan(user: string, plan: PlanId, how: PlanHow, seats?: number): Promise<void>;
  setPublished(card: string, published: boolean, reason?: string): Promise<void>;
  transfer(card: string, email: string): Promise<string>;
  recent(): Promise<AdminLog[]>;
}

/* ------------------------------------------------------------------ real */
async function rpc<T>(fn: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.rpc(fn, args);
  if (error) throw new Error(error.message);
  return data as T;
}

const realApi: AdminApi = {
  stats: () => rpc<AdminStats>('fc_admin_stats'),
  users: (o) => rpc<AdminUser[]>('fc_admin_users', { p_q: o.q || null, p_plan: o.plan || null, p_limit: o.limit ?? 50, p_offset: o.offset ?? 0 }),
  cards: (o) => rpc<AdminCard[]>('fc_admin_cards', { p_user: o.user ?? null, p_q: o.q || null, p_limit: o.limit ?? 60 }),
  setPlan: (user, plan, how, seats) => rpc<void>('fc_admin_set_plan', { p_user: user, p_plan: plan, p_how: how, p_seats: plan === 'team' ? seats ?? null : null }),
  setPublished: (card, published, reason) => rpc<void>('fc_admin_set_published', { p_card: card, p_published: published, p_reason: reason || null }),
  transfer: (card, email) => rpc<string>('fc_admin_transfer_card', { p_card: card, p_to_email: email }),
  recent: () => rpc<AdminLog[]>('fc_admin_recent', { p_limit: 25 }),
};

/* ------------------------------------------------------------------ demo (sample data, lives in memory) */
const day = 86400000;
const iso = (ago: number) => new Date(Date.now() - ago).toISOString();

function makeDemo(): AdminApi {
  const users: Omit<AdminUser, 'total' | 'card_count' | 'published_count'>[] = [
    { id: 'u1', email: 'angel@finessemedia.pro', full_name: 'Angel Gerena', plan: 'team', plan_status: 'comped', plan_interval: null, seats: null, founding: false, has_stripe: false, created_at: iso(60 * day), last_sign_in_at: iso(0.02 * day), is_admin: true },
    { id: 'u2', email: 'kay@urbancutz.com', full_name: 'Klara Thomas', plan: 'pro', plan_status: 'active', plan_interval: 'month', seats: null, founding: true, has_stripe: true, created_at: iso(12 * day), last_sign_in_at: iso(1 * day), is_admin: false },
    { id: 'u3', email: 'maya@vectorlabs.io', full_name: 'Maya Reyes', plan: 'free', plan_status: null, plan_interval: null, seats: null, founding: false, has_stripe: false, created_at: iso(9 * day), last_sign_in_at: iso(3 * day), is_admin: false },
    { id: 'u4', email: 'hello@confettiandco.com', full_name: 'Alana Price', plan: 'team', plan_status: 'active', plan_interval: 'year', seats: 8, founding: false, has_stripe: true, created_at: iso(21 * day), last_sign_in_at: iso(2 * day), is_admin: false },
    { id: 'u5', email: 'pastor@gracechurch.org', full_name: 'Joanna Allen', plan: 'pro', plan_status: 'manual', plan_interval: null, seats: null, founding: false, has_stripe: false, created_at: iso(6 * day), last_sign_in_at: iso(0.5 * day), is_admin: false },
    { id: 'u6', email: 'tasha@cleardesk.co', full_name: 'Tasha Greene', plan: 'free', plan_status: null, plan_interval: null, seats: null, founding: false, has_stripe: false, created_at: iso(4 * day), last_sign_in_at: iso(4 * day), is_admin: false },
    { id: 'u7', email: 'nora@armoniadelreino.org', full_name: 'Nora Gerena', plan: 'pro', plan_status: 'comped', plan_interval: null, seats: null, founding: false, has_stripe: false, created_at: iso(3 * day), last_sign_in_at: iso(1 * day), is_admin: false },
    { id: 'u8', email: 'rita@blackrosetattoo.com', full_name: 'Rita Santana', plan: 'pro', plan_status: 'past_due', plan_interval: 'month', seats: null, founding: true, has_stripe: true, created_at: iso(15 * day), last_sign_in_at: iso(9 * day), is_admin: false },
    { id: 'u9', email: 'new.client@example.com', full_name: null, plan: 'free', plan_status: null, plan_interval: null, seats: null, founding: false, has_stripe: false, created_at: iso(0.3 * day), last_sign_in_at: null, is_admin: false },
  ];
  const cards: AdminCard[] = [
    { id: 'sample', owner_id: 'u1', owner_email: 'angel@finessemedia.pro', slug: 'sofia-delgado', template: 'signature', published: true, full_name: 'Angel Gerena', business: 'Finesse Media', updated_at: iso(0.1 * day), created_at: iso(50 * day) },
    { id: 'c2', owner_id: 'u1', owner_email: 'angel@finessemedia.pro', slug: 'impact-beauty', template: 'velvet', published: false, full_name: 'Impact Beauty Studio', business: 'Impact Beauty Studio', updated_at: iso(0.4 * day), created_at: iso(3 * day) },
    { id: 'c3', owner_id: 'u2', owner_email: 'kay@urbancutz.com', slug: 'urban-cutz', template: 'neonsign', published: true, full_name: 'Klara "Kay" Thomas', business: 'Urban Cutz', updated_at: iso(1 * day), created_at: iso(11 * day) },
    { id: 'c4', owner_id: 'u3', owner_email: 'maya@vectorlabs.io', slug: 'maya', template: 'arch', published: true, full_name: 'Maya Reyes', business: 'Vector Labs', updated_at: iso(3 * day), created_at: iso(9 * day) },
    { id: 'c5', owner_id: 'u4', owner_email: 'hello@confettiandco.com', slug: 'confetti', template: 'confetti', published: true, full_name: 'Alana Price', business: 'Confetti & Co. Events', updated_at: iso(2 * day), created_at: iso(20 * day) },
    { id: 'c6', owner_id: 'u4', owner_email: 'hello@confettiandco.com', slug: 'confetti-team-1', template: 'confetti', published: true, full_name: 'Sam Rivera', business: 'Confetti & Co. Events', updated_at: iso(5 * day), created_at: iso(18 * day) },
    { id: 'c7', owner_id: 'u5', owner_email: 'pastor@gracechurch.org', slug: 'grace-harbor', template: 'hymnboard', published: true, full_name: 'Joanna Allen', business: 'Grace Harbor Church', updated_at: iso(0.5 * day), created_at: iso(6 * day) },
    { id: 'c8', owner_id: 'u6', owner_email: 'tasha@cleardesk.co', slug: 'tasha', template: 'inbox', published: false, full_name: 'Tasha Greene', business: 'Clear Desk Assist', updated_at: iso(4 * day), created_at: iso(4 * day) },
    { id: 'c9', owner_id: 'u7', owner_email: 'nora@armoniadelreino.org', slug: 'nora', template: 'santuario', published: true, full_name: 'Nora Ivelisse Gerena', business: 'Armonía Del Reino', updated_at: iso(1 * day), created_at: iso(3 * day) },
    { id: 'c10', owner_id: 'u8', owner_email: 'rita@blackrosetattoo.com', slug: 'black-rose', template: 'flash', published: true, full_name: 'Rita Santana', business: 'Black Rose Tattoo', updated_at: iso(9 * day), created_at: iso(14 * day) },
  ];
  const log: AdminLog[] = [
    { id: 3, created_at: iso(0.2 * day), admin_email: 'angel@finessemedia.pro', action: 'plan', target_email: 'nora@armoniadelreino.org', card_slug: null, detail: 'free to pro (complimentary)' },
    { id: 2, created_at: iso(1.5 * day), admin_email: 'angel@finessemedia.pro', action: 'transfer', target_email: 'hello@confettiandco.com', card_slug: 'confetti', detail: 'from angel@finessemedia.pro' },
    { id: 1, created_at: iso(2 * day), admin_email: 'angel@finessemedia.pro', action: 'plan', target_email: 'pastor@gracechurch.org', card_slug: null, detail: 'free to pro (paid outside Stripe)' },
  ];
  let logId = 3;
  const note = (action: string, target_email: string | null, card_slug: string | null, detail: string | null) => {
    log.unshift({ id: ++logId, created_at: new Date().toISOString(), admin_email: 'angel@finessemedia.pro', action, target_email, card_slug, detail });
  };
  const decorate = (u: (typeof users)[number]): AdminUser => ({ ...u, card_count: cards.filter((c) => c.owner_id === u.id).length, published_count: cards.filter((c) => c.owner_id === u.id && c.published).length, total: 0 });
  const wait = <T,>(v: T) => new Promise<T>((r) => setTimeout(() => r(v), 180));
  const fail = (m: string) => new Promise<never>((_, rej) => setTimeout(() => rej(new Error(m)), 180));

  return {
    async stats() {
      const paid = users.filter((u) => u.plan !== 'free' && ['active', 'trialing', 'past_due'].includes(u.plan_status ?? ''));
      const mrr = paid.reduce((s, u) => s + (u.plan === 'pro' ? (u.founding && (u.plan_interval ?? 'month') === 'month' ? 500 : u.plan_interval === 'year' ? 658 : 800) : u.plan === 'plus' ? (u.plan_interval === 'year' ? 1242 : 1600) : (u.plan_interval === 'year' ? 3325 : 4100)), 0);
      const plans: Partial<Record<PlanId, number>> = {};
      users.forEach((u) => { plans[u.plan] = (plans[u.plan] ?? 0) + 1; });
      const tally: Record<string, number> = {};
      cards.forEach((c) => { tally[c.template] = (tally[c.template] ?? 0) + 1; });
      const signups = Array.from({ length: 14 }, (_, i) => {
        const d = new Date(Date.now() - (13 - i) * day);
        return { d: d.toISOString().slice(0, 10), n: users.filter((u) => new Date(u.created_at).toDateString() === d.toDateString()).length };
      });
      return wait({
        users: users.length, new_7d: users.filter((u) => Date.now() - +new Date(u.created_at) < 7 * day).length, new_30d: users.length,
        plans, paying: paid.length, offline: users.filter((u) => u.plan !== 'free' && ['comped', 'manual'].includes(u.plan_status ?? '')).length,
        founding: users.filter((u) => u.founding).length, mrr_cents: mrr,
        cards: cards.length, published: cards.filter((c) => c.published).length,
        top_designs: Object.entries(tally).map(([template, n]) => ({ template, n })).sort((a, b) => b.n - a.n).slice(0, 8),
        views_7d: 412, saves_7d: 57, taps_7d: 203, signups,
      });
    },
    async users(o) {
      const q = (o.q ?? '').trim().toLowerCase();
      const rows = users.filter((u) => (!q || (u.email ?? '').toLowerCase().includes(q) || (u.full_name ?? '').toLowerCase().includes(q)) && (!o.plan || u.plan === o.plan))
        .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)).map(decorate);
      return wait(rows.slice(o.offset ?? 0, (o.offset ?? 0) + (o.limit ?? 50)).map((r) => ({ ...r, total: rows.length })));
    },
    async cards(o) {
      const q = (o.q ?? '').trim().toLowerCase();
      return wait(cards.filter((c) => (!o.user || c.owner_id === o.user) && (!q || [c.slug, c.full_name, c.business, c.owner_email].some((x) => (x ?? '').toLowerCase().includes(q))))
        .sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at)).slice(0, o.limit ?? 60));
    },
    async setPlan(user, plan, how, seats) {
      const u = users.find((x) => x.id === user);
      if (!u) return fail('No such customer.');
      if (u.has_stripe) return fail('This customer pays through Stripe. Change their plan in Stripe so the two stay in step.');
      const before = u.plan;
      const n = plan === 'team' ? Math.min(500, Math.max(1, seats ?? 5)) : null;
      u.plan = plan; u.plan_status = plan === 'free' ? null : how; u.plan_interval = null; u.seats = n;
      note('plan', u.email, null, `${before} to ${plan}${n ? `, ${n} cards` : ''}${plan === 'free' ? '' : how === 'manual' ? ' (paid outside Stripe)' : ' (complimentary)'}`);
      return wait(undefined);
    },
    async setPublished(card, published, reason) {
      const c = cards.find((x) => x.id === card);
      if (!c) return fail('No such card.');
      c.published = published; c.updated_at = new Date().toISOString();
      note(published ? 'republish' : 'unpublish', c.owner_email, c.slug, reason || null);
      return wait(undefined);
    },
    async transfer(card, email) {
      const c = cards.find((x) => x.id === card);
      const e = email.trim().toLowerCase();
      if (!e) return fail("Enter the new owner's email.");
      const to = users.find((u) => (u.email ?? '').toLowerCase() === e);
      if (!to) return fail(`No SeYo account uses ${e} yet. Ask them to sign up first, then transfer the card.`);
      if (!c) return fail('No such card.');
      if (c.owner_id === to.id) return fail('That account already owns this card.');
      const from = c.owner_email;
      c.owner_id = to.id; c.owner_email = to.email;
      note('transfer', to.email, c.slug, `from ${from}`);
      return wait(e);
    },
    async recent() { return wait(log.slice(0, 25)); },
  };
}

export const adminApi: AdminApi = IS_DEMO ? makeDemo() : realApi;
