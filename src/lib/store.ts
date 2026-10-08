import type { Card, Look } from './types';
import { IS_DEMO, supabase } from './supabase';
import { blankData, sampleCard, uid, withDefaults } from './seed';
import { themeFromSeeds, PRESETS } from './theme';
import { FREE_FALLBACK, isLocked, type PlanId } from './plans';

/* One API, two backends. Pages never touch Supabase directly, so the demo
   build and the real app run the same screens against the same shapes. */

const LS_KEY = 'fc.demo.cards.v4'; // v4: niche layouts + gallery

/* Everything this app owns in Supabase is prefixed fc_ so it can live inside
   an existing project (the finessemedia.pro database) without touching its tables. */
export const T = {
  looks: 'fc_looks',
  cards: 'fc_cards',
  profiles: 'fc_profiles',
  publicCard: 'fc_public_card',
  logEvent: 'fc_log_card_event',
  slugAvailable: 'fc_slug_available',
  bucket: 'fc-card-media',
} as const;

function demoRead(): Card[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return (JSON.parse(raw) as Card[]).map(withDefaults);
  } catch { /* storage blocked: fall through to seed */ }
  const seed = [sampleCard()];
  demoWrite(seed);
  return seed;
}
function demoWrite(cards: Card[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(cards)); } catch { /* quota or blocked: keep in memory */ }
  memory = cards;
}
let memory: Card[] | null = null;
const demoCards = () => memory ?? demoRead();

const LOOKS_KEY = 'fc.demo.looks.v1';
const demoLooks = (): Look[] => { try { return JSON.parse(localStorage.getItem(LOOKS_KEY) ?? '[]') as Look[]; } catch { return []; } };
const demoLooksWrite = (l: Look[]) => { try { localStorage.setItem(LOOKS_KEY, JSON.stringify(l)); } catch { /* blocked */ } };
type LookRow = { id: string; name: string; template: Look['template']; theme: Look['theme']; created_at: string; updated_at: string };
const lookFromRow = (r: LookRow): Look => ({ id: r.id, name: r.name, template: r.template, theme: r.theme, createdAt: r.created_at, updatedAt: r.updated_at });

type Row = { id: string; slug: string; template: Card['template']; data: Card['data']; theme: Card['theme']; published: boolean; updated_at: string };
const fromRow = (r: Row): Card => withDefaults({ id: r.id, template: r.template, data: { ...r.data, slug: r.slug }, theme: r.theme, published: r.published, updatedAt: r.updated_at });

/** Demo only: lets you try the app as Lite, Pro or Business without paying. */
export const DEMO_PLAN_KEY = 'fc.demo.plan';
export const DEMO_SEATS_KEY = 'fc.demo.seats';

export const store = {
  demo: IS_DEMO,

  /** The signed-in user's plan. Written only by the Stripe webhook. */
  async myPlanDetail(): Promise<{ plan: PlanId; seats: number | null }> {
    if (IS_DEMO) {
      try {
        const v = localStorage.getItem(DEMO_PLAN_KEY);
        const plan = v === 'pro' || v === 'plus' || v === 'team' ? v : 'free';
        return { plan, seats: plan === 'team' ? Number(localStorage.getItem(DEMO_SEATS_KEY)) || 5 : null };
      } catch { return { plan: 'free', seats: null }; }
    }
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return { plan: 'free', seats: null };
    const { data } = await supabase.from(T.profiles).select('plan,seats').eq('id', u.user.id).maybeSingle();
    return { plan: (data?.plan as PlanId) ?? 'free', seats: (data?.seats as number | null) ?? null };
  },

  async myPlan(): Promise<PlanId> {
    return (await this.myPlanDetail()).plan;
  },

  async myCards(): Promise<Card[]> {
    if (IS_DEMO) return demoCards();
    const { data, error } = await supabase.from(T.cards).select('id,slug,template,data,theme,published,updated_at').order('updated_at', { ascending: false });
    if (error) throw error;
    return (data as Row[]).map(fromRow);
  },

  async card(id: string): Promise<Card | null> {
    if (IS_DEMO) return demoCards().find((c) => c.id === id) ?? null;
    const { data, error } = await supabase.from(T.cards).select('id,slug,template,data,theme,published,updated_at').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? fromRow(data as Row) : null;
  },

  async publicCard(slug: string): Promise<Card | null> {
    if (IS_DEMO) {
      // Mirror the server rule: a Lite card set to a Pro design shows the free fallback publicly.
      const c = demoCards().find((x) => x.data.slug === slug);
      if (!c) return null;
      const plan = await this.myPlan();
      return isLocked(plan, c.template) ? { ...c, template: FREE_FALLBACK, badge: true } : { ...c, badge: plan === 'free' };
    }
    // Exact-slug lookup through an RPC: there is no public select on the table.
    const { data, error } = await supabase.rpc(T.publicCard, { p_slug: slug });
    if (error) throw error;
    if (!data) return null;
    const r = data as Row & { badge: boolean };
    return { ...fromRow(r), badge: r.badge };
  },

  /** Fire-and-forget analytics for the owner's dashboard. */
  track(cardId: string, kind: string) {
    if (IS_DEMO) return;
    supabase.rpc(T.logEvent, { p_card: cardId, p_kind: kind }).then(() => undefined, () => undefined);
  },

  async create(): Promise<Card> {
    const card: Card = {
      id: IS_DEMO ? uid() : crypto.randomUUID(),
      template: 'arch',
      data: { ...blankData(), slug: `card-${uid()}` },
      theme: themeFromSeeds(PRESETS[1].seeds),
      published: false,
      updatedAt: new Date().toISOString(),
    };
    if (IS_DEMO) { demoWrite([card, ...demoCards()]); return card; }
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from(T.cards).insert({ id: card.id, owner_id: u.user?.id, slug: card.data.slug, template: card.template, data: card.data, theme: card.theme, published: false });
    if (error) throw error;
    return card;
  },

  /** Saves what the owner edited (address, layout, content, theme). It NEVER changes `published`:
      publishing is its own explicit action (setPublished), so autosave can not publish, unpublish or
      undo an admin takedown by writing a stale value. */
  async saveContent(card: Card): Promise<Card> {
    const next = { ...card, updatedAt: new Date().toISOString() };
    if (IS_DEMO) { demoWrite(demoCards().map((c) => (c.id === card.id ? { ...next, published: c.published } : c))); return next; }
    const { error } = await supabase.from(T.cards).update({ slug: card.data.slug, template: card.template, data: card.data, theme: card.theme }).eq('id', card.id);
    if (error) {
      if (error.code === '23505' || /fc_cards_slug/.test(error.message)) throw new Error('That card address is taken. Try another one on the Publish step.');
      throw error;
    }
    return next;
  },

  /** The only call that publishes or unpublishes a card. */
  async setPublished(id: string, published: boolean): Promise<void> {
    if (IS_DEMO) { demoWrite(demoCards().map((c) => (c.id === id ? { ...c, published, updatedAt: new Date().toISOString() } : c))); return; }
    const { error } = await supabase.from(T.cards).update({ published }).eq('id', id);
    if (error) throw error;
  },

  async save(card: Card): Promise<Card> {
    const next = { ...card, updatedAt: new Date().toISOString() };
    if (IS_DEMO) { demoWrite(demoCards().map((c) => (c.id === card.id ? next : c))); return next; }
    const { error } = await supabase.from(T.cards).update({ slug: card.data.slug, template: card.template, data: card.data, theme: card.theme, published: card.published }).eq('id', card.id);
    if (error) {
      if (error.code === '23505' || /fc_cards_slug/.test(error.message)) throw new Error('That card address is taken. Try another one.');
      throw error;
    }
    return next;
  },

  /* ---------- favorite looks (per account, usable on any card) */
  async looks(): Promise<Look[]> {
    if (IS_DEMO) return demoLooks();
    const { data, error } = await supabase.from(T.looks).select('id,name,template,theme,created_at,updated_at').order('updated_at', { ascending: false });
    if (error) throw error;
    return (data as LookRow[]).map(lookFromRow);
  },

  async saveLook(look: Look): Promise<Look> {
    const next = { ...look, updatedAt: new Date().toISOString() };
    if (IS_DEMO) {
      const all = demoLooks().filter((l) => l.id !== look.id);
      demoLooksWrite([next, ...all]);
      return next;
    }
    const { error } = await supabase.from(T.looks).upsert({ id: look.id, name: look.name, template: look.template, theme: look.theme });
    if (error) {
      if (/row-level security/i.test(error.message)) throw new Error('You have reached the favorites limit for your plan.');
      throw error;
    }
    return next;
  },

  async removeLook(id: string) {
    if (IS_DEMO) { demoLooksWrite(demoLooks().filter((l) => l.id !== id)); return; }
    const { error } = await supabase.from(T.looks).delete().eq('id', id);
    if (error) throw error;
  },

  newLookId: () => (IS_DEMO ? uid() : crypto.randomUUID()),

  async remove(id: string) {
    if (IS_DEMO) { demoWrite(demoCards().filter((c) => c.id !== id)); return; }
    const { error } = await supabase.from(T.cards).delete().eq('id', id);
    if (error) throw error;
  },

  async slugAvailable(slug: string, selfId: string): Promise<boolean> {
    if (IS_DEMO) return !demoCards().some((c) => c.data.slug === slug && c.id !== selfId);
    const { data, error } = await supabase.rpc(T.slugAvailable, { p_slug: slug, p_card: selfId });
    if (error) return true;
    return Boolean(data);
  },

  /** Resize before upload: photos land sharp but light. Demo keeps a data URL. */
  /** Video (living portrait) or audio (background music), uploaded as-is. 15 MB limit, set on the bucket. */
  async uploadMedia(file: File): Promise<string> {
    if (file.size > 15 * 1024 * 1024) throw new Error('That file is over 15 MB. Try a shorter or compressed version.');
    if (IS_DEMO) return URL.createObjectURL(file);
    const ext = (file.name.split('.').pop() || (file.type.startsWith('audio') ? 'mp3' : 'mp4')).toLowerCase();
    return uploadRaw(file, ext);
  },

  async uploadImage(file: File, kind: 'photo' | 'logo' | 'font'): Promise<string> {
    if (kind === 'font') {
      if (IS_DEMO) return URL.createObjectURL(file);
      return uploadRaw(file, file.name.split('.').pop() ?? 'woff2');
    }
    const blob = await downscale(file, kind === 'photo' ? 1000 : 800, kind === 'logo');
    if (IS_DEMO) return await blobToDataUrl(blob);
    return uploadRaw(blob, kind === 'logo' ? 'png' : 'jpg');
  },
};

async function uploadRaw(body: Blob, ext: string): Promise<string> {
  const { data: u } = await supabase.auth.getUser();
  const path = `${u.user?.id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(T.bucket).upload(path, body, { upsert: false, cacheControl: '31536000' });
  if (error) throw error;
  return supabase.storage.from(T.bucket).getPublicUrl(path).data.publicUrl;
}

async function downscale(file: File, max: number, keepAlpha: boolean): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const cv = document.createElement('canvas');
    cv.width = Math.round(img.naturalWidth * scale); cv.height = Math.round(img.naturalHeight * scale);
    cv.getContext('2d')!.drawImage(img, 0, 0, cv.width, cv.height);
    return await new Promise<Blob>((res) => cv.toBlob((b) => res(b!), keepAlpha ? 'image/png' : 'image/jpeg', 0.86));
  } finally { URL.revokeObjectURL(url); }
}

const blobToDataUrl = (b: Blob) => new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.readAsDataURL(b); });

export function slugify(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}
