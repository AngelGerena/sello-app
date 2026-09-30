-- =====================================================================
-- Sello: complete database setup for a NEW, dedicated Supabase project.
-- Run once in the SQL Editor. Safe to run again (it skips what exists).
-- Replaces running migrations 0001-0010 one by one.
-- =====================================================================
create extension if not exists "pgcrypto";

create or replace function public.fc_touch_updated_at()
returns trigger language plpgsql security definer set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

-- ---------------------------------------------------------------- admins
create table if not exists public.fc_admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);
alter table public.fc_admins enable row level security;
drop policy if exists fc_admins_self on public.fc_admins;
create policy fc_admins_self on public.fc_admins for select using (user_id = auth.uid());

create or replace function public.fc_is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.fc_admins where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------- profiles (plan lives here; only Stripe changes it)
create table if not exists public.fc_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text, full_name text,
  plan text not null default 'free' check (plan in ('free','pro','team')),
  plan_status text, stripe_customer_id text unique, stripe_subscription_id text,
  current_period_end timestamptz,
  founding boolean not null default false,
  plan_interval text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.fc_profiles add column if not exists founding boolean not null default false;
alter table public.fc_profiles add column if not exists plan_interval text;
drop trigger if exists fc_profiles_touch on public.fc_profiles;
create trigger fc_profiles_touch before update on public.fc_profiles
  for each row execute function public.fc_touch_updated_at();

create or replace function public.fc_handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.fc_profiles (id, email) values (new.id, new.email) on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists fc_on_auth_user_created on auth.users;
create trigger fc_on_auth_user_created after insert on auth.users
  for each row execute function public.fc_handle_new_user();
insert into public.fc_profiles (id, email) select id, email from auth.users on conflict (id) do nothing;

alter table public.fc_profiles enable row level security;
drop policy if exists fc_profiles_read on public.fc_profiles;
create policy fc_profiles_read on public.fc_profiles for select using (id = auth.uid() or public.fc_is_admin());
drop policy if exists fc_profiles_update_name on public.fc_profiles;
create policy fc_profiles_update_name on public.fc_profiles for update using (id = auth.uid()) with check (id = auth.uid());
revoke update on public.fc_profiles from authenticated;
grant update (full_name) on public.fc_profiles to authenticated;

-- Lite 1 card, Pro 3, Business 5
create or replace function public.fc_card_limit(p_user uuid) returns int
language sql stable security definer set search_path = public as $$
  select case coalesce((select plan from public.fc_profiles where id = p_user), 'free')
    when 'team' then 5 when 'pro' then 3 else 1 end;
$$;

-- ---------------------------------------------------------------- cards
create table if not exists public.fc_cards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  slug text not null,
  template text not null default 'arch',
  data jsonb not null default '{}'::jsonb,
  theme jsonb not null default '{}'::jsonb,
  published boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint fc_cards_slug_key unique (slug),
  constraint fc_cards_slug_format check (slug ~ '^[a-z0-9]([a-z0-9-]{0,38}[a-z0-9])?$')
);
alter table public.fc_cards drop constraint if exists fc_cards_slug_reserved;
alter table public.fc_cards add constraint fc_cards_slug_reserved check (slug not in (
  'app','signup','join','login','logout','reset','api','admin','pricing','layouts','terms','privacy','help','support','assets','images','www'));
alter table public.fc_cards drop constraint if exists fc_cards_template;
alter table public.fc_cards add constraint fc_cards_template check (template in (
  'cover','arch','header','bizcard','app','rail','radial','swiss','bento','journey','realestate','photo','foodtruck','apparel','mechanic','handyman','esthetics','creator','retail','tech','barber','church','fitness','advisor','bistro','stage','quantum','terminal','cyber','aurora','radar','circuit','blueprint','velvet','fade','oldschool','blush','vanity','silk','gloss','marquee','passport','estate','garden','scoreboard','signature','hologram','mission','poster','liquid','starfield','cmdk','synthwave','pole','goldleaf','lash','rosegold','swatch','nowserving','perfume','vinyl','boarding','recipe','toolbelt','stained','trading','turntable','waveform','confetti','invitation','monogram','inbox','planner','razor','chalkboard','neonsign','clipper','polish','shimmer','tips','blowout','stations','magazine','stones','lotus','bamboo','casefile','contactsheet','flash','orderticket','hangtag','bag','postcard','floorplan','ledger','hymnboard','cluster','stopwatch','diner','yardsign','santuario','celestial','vitral','frecuencia','constelacion','escenario','salmo'));
create index if not exists fc_cards_owner_idx on public.fc_cards(owner_id);
drop trigger if exists fc_cards_touch on public.fc_cards;
create trigger fc_cards_touch before update on public.fc_cards
  for each row execute function public.fc_touch_updated_at();

create or replace function public.fc_card_count(p_user uuid) returns int
language sql stable security definer set search_path = public as $$
  select count(*)::int from public.fc_cards where owner_id = p_user;
$$;

alter table public.fc_cards enable row level security;
drop policy if exists fc_cards_read on public.fc_cards;
create policy fc_cards_read on public.fc_cards for select using (owner_id = auth.uid() or public.fc_is_admin());
drop policy if exists fc_cards_insert on public.fc_cards;
create policy fc_cards_insert on public.fc_cards for insert with check (
  owner_id = auth.uid() and public.fc_card_count(auth.uid()) < public.fc_card_limit(auth.uid()));
drop policy if exists fc_cards_update on public.fc_cards;
create policy fc_cards_update on public.fc_cards for update
  using (owner_id = auth.uid() or public.fc_is_admin()) with check (owner_id = auth.uid() or public.fc_is_admin());
drop policy if exists fc_cards_delete on public.fc_cards;
create policy fc_cards_delete on public.fc_cards for delete using (owner_id = auth.uid() or public.fc_is_admin());

create or replace function public.fc_slug_available(p_slug text, p_card uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select p_slug ~ '^[a-z0-9]([a-z0-9-]{0,38}[a-z0-9])?$'
     and p_slug not in ('app','signup','join','login','logout','reset','api','admin','pricing','layouts','terms','privacy','help','support','assets','images','www')
     and not exists (select 1 from public.fc_cards where slug = p_slug and id <> p_card);
$$;

-- Public card by exact address. A Lite card set to a Pro design shows the free Arch design.
create or replace function public.fc_public_card(p_slug text) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'id', c.id, 'slug', c.slug,
    'template', case when coalesce(p.plan, 'free') = 'free' and c.template not in ('arch','header','swiss') then 'arch' else c.template end,
    'data', c.data, 'theme', c.theme, 'published', c.published, 'updated_at', c.updated_at,
    'badge', coalesce(p.plan, 'free') = 'free')
  from public.fc_cards c left join public.fc_profiles p on p.id = c.owner_id
  where c.slug = p_slug and c.published limit 1;
$$;

-- ---------------------------------------------------------------- saved looks (favorites)
create table if not exists public.fc_looks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  template text not null default 'arch',
  theme jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.fc_looks drop constraint if exists fc_looks_template;
alter table public.fc_looks add constraint fc_looks_template check (template in (
  'cover','arch','header','bizcard','app','rail','radial','swiss','bento','journey','realestate','photo','foodtruck','apparel','mechanic','handyman','esthetics','creator','retail','tech','barber','church','fitness','advisor','bistro','stage','quantum','terminal','cyber','aurora','radar','circuit','blueprint','velvet','fade','oldschool','blush','vanity','silk','gloss','marquee','passport','estate','garden','scoreboard','signature','hologram','mission','poster','liquid','starfield','cmdk','synthwave','pole','goldleaf','lash','rosegold','swatch','nowserving','perfume','vinyl','boarding','recipe','toolbelt','stained','trading','turntable','waveform','confetti','invitation','monogram','inbox','planner','razor','chalkboard','neonsign','clipper','polish','shimmer','tips','blowout','stations','magazine','stones','lotus','bamboo','casefile','contactsheet','flash','orderticket','hangtag','bag','postcard','floorplan','ledger','hymnboard','cluster','stopwatch','diner','yardsign','santuario','celestial','vitral','frecuencia','constelacion','escenario','salmo'));
create index if not exists fc_looks_owner_idx on public.fc_looks(owner_id, updated_at desc);
drop trigger if exists fc_looks_touch on public.fc_looks;
create trigger fc_looks_touch before update on public.fc_looks
  for each row execute function public.fc_touch_updated_at();
alter table public.fc_looks enable row level security;
drop policy if exists fc_looks_read on public.fc_looks;
create policy fc_looks_read on public.fc_looks for select using (owner_id = auth.uid() or public.fc_is_admin());
drop policy if exists fc_looks_insert on public.fc_looks;
create policy fc_looks_insert on public.fc_looks for insert with check (owner_id = auth.uid());
drop policy if exists fc_looks_update on public.fc_looks;
create policy fc_looks_update on public.fc_looks for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists fc_looks_delete on public.fc_looks;
create policy fc_looks_delete on public.fc_looks for delete using (owner_id = auth.uid());

-- ---------------------------------------------------------------- analytics
create table if not exists public.fc_card_events (
  id bigint generated always as identity primary key,
  card_id uuid not null references public.fc_cards(id) on delete cascade,
  kind text not null check (kind in ('view','save','share','qr','call','whatsapp','book','directions','email','website','social')),
  created_at timestamptz not null default now()
);
create index if not exists fc_card_events_card_idx on public.fc_card_events(card_id, created_at desc);
alter table public.fc_card_events enable row level security;
drop policy if exists fc_card_events_read on public.fc_card_events;
create policy fc_card_events_read on public.fc_card_events for select using (
  exists (select 1 from public.fc_cards c where c.id = card_id and (c.owner_id = auth.uid() or public.fc_is_admin())));

create or replace function public.fc_log_card_event(p_card uuid, p_kind text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.fc_cards where id = p_card and published) then
    insert into public.fc_card_events (card_id, kind) values (p_card, p_kind);
  end if;
end $$;

-- ---------------------------------------------------------------- function access
revoke execute on function public.fc_public_card(text), public.fc_log_card_event(uuid, text),
  public.fc_slug_available(text, uuid), public.fc_card_limit(uuid), public.fc_card_count(uuid) from public;
grant execute on function public.fc_public_card(text) to anon, authenticated;
grant execute on function public.fc_log_card_event(uuid, text) to anon, authenticated;
grant execute on function public.fc_slug_available(text, uuid) to authenticated;
grant execute on function public.fc_card_limit(uuid), public.fc_card_count(uuid) to authenticated;

-- ---------------------------------------------------------------- storage (photos, logos, fonts, portrait video, music)
insert into storage.buckets (id, name, public, file_size_limit)
values ('fc-card-media', 'fc-card-media', true, 15728640)
on conflict (id) do update set public = true, file_size_limit = 15728640;

drop policy if exists fc_media_insert on storage.objects;
create policy fc_media_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'fc-card-media' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists fc_media_update on storage.objects;
create policy fc_media_update on storage.objects for update to authenticated
  using (bucket_id = 'fc-card-media' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists fc_media_delete on storage.objects;
create policy fc_media_delete on storage.objects for delete to authenticated
  using (bucket_id = 'fc-card-media' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists fc_media_list on storage.objects;
create policy fc_media_list on storage.objects for select to authenticated
  using (bucket_id = 'fc-card-media' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------------------------------------------------------------- platform admin (runs again safely after you sign up)
insert into public.fc_admins (user_id, email)
select id, email from auth.users
where lower(email) in ('angel@finessemedia.pro', 'finessemediapro@gmail.com')
on conflict (user_id) do nothing;

notify pgrst, 'reload schema';
