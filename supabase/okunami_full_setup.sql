-- =====================================================================
-- OKUNAMI: complete database setup for a NEW, dedicated Supabase project.
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

-- =====================================================================
-- PART 2: admin portal (migration 0011)
-- =====================================================================
-- =====================================================================
-- OKUNAMI admin portal: audit log + admin-only functions.
-- Every function starts by checking fc_is_admin(), so anyone else who
-- calls one gets "Admins only." Safe to run more than once.
-- =====================================================================

-- ---------------------------------------------------------------- audit log
create table if not exists public.fc_admin_log (
  id           bigint generated always as identity primary key,
  created_at   timestamptz not null default now(),
  admin_id     uuid, admin_email text,
  action       text not null,
  target_user  uuid, target_email text,
  card_id      uuid, card_slug text,
  detail       text
);
alter table public.fc_admin_log enable row level security;
drop policy if exists fc_admin_log_read on public.fc_admin_log;
create policy fc_admin_log_read on public.fc_admin_log for select using (public.fc_is_admin());
revoke all on public.fc_admin_log from anon, authenticated;
grant select on public.fc_admin_log to authenticated;

-- ---------------------------------------------------------------- helpers (internal only)
create or replace function public.fc_require_admin() returns void
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.fc_is_admin() then raise exception 'Admins only.' using errcode = '42501'; end if;
end $$;

create or replace function public.fc_admin_note(p_action text, p_user uuid, p_card uuid, p_detail text) returns void
language plpgsql security definer set search_path = public as $$
declare v_admin text; v_target text; v_slug text;
begin
  select email into v_admin from public.fc_profiles where id = auth.uid();
  if p_user is not null then select email into v_target from public.fc_profiles where id = p_user; end if;
  if p_card is not null then select slug into v_slug from public.fc_cards where id = p_card; end if;
  insert into public.fc_admin_log (admin_id, admin_email, action, target_user, target_email, card_id, card_slug, detail)
  values (auth.uid(), v_admin, p_action, p_user, v_target, p_card, v_slug, p_detail);
end $$;

-- ---------------------------------------------------------------- customers
create or replace function public.fc_admin_users(p_q text default null, p_plan text default null, p_limit int default 50, p_offset int default 0)
returns table (id uuid, email text, full_name text, plan text, plan_status text, plan_interval text, founding boolean,
               has_stripe boolean, created_at timestamptz, last_sign_in_at timestamptz,
               card_count int, published_count int, is_admin boolean, total bigint)
language plpgsql stable security definer set search_path = public as $$
#variable_conflict use_column
declare q text := lower(trim(coalesce(p_q, '')));
begin
  perform public.fc_require_admin();
  return query
    select p.id, p.email, p.full_name, p.plan, p.plan_status, p.plan_interval, p.founding,
           (p.stripe_subscription_id is not null and coalesce(p.plan_status, '') in ('active', 'trialing', 'past_due')),
           p.created_at, u.last_sign_in_at,
           (select count(*)::int from public.fc_cards c where c.owner_id = p.id),
           (select count(*)::int from public.fc_cards c where c.owner_id = p.id and c.published),
           exists (select 1 from public.fc_admins a where a.user_id = p.id),
           count(*) over ()
    from public.fc_profiles p left join auth.users u on u.id = p.id
    where (q = '' or position(q in lower(coalesce(p.email, ''))) > 0 or position(q in lower(coalesce(p.full_name, ''))) > 0)
      and (coalesce(p_plan, '') = '' or p.plan = p_plan)
    order by p.created_at desc
    limit least(greatest(p_limit, 1), 200) offset greatest(p_offset, 0);
end $$;

-- ---------------------------------------------------------------- cards (all, or one customer's)
create or replace function public.fc_admin_cards(p_user uuid default null, p_q text default null, p_limit int default 60)
returns table (id uuid, owner_id uuid, owner_email text, slug text, template text, published boolean,
               full_name text, business text, updated_at timestamptz, created_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
#variable_conflict use_column
declare q text := lower(trim(coalesce(p_q, '')));
begin
  perform public.fc_require_admin();
  return query
    select c.id, c.owner_id, p.email, c.slug, c.template, c.published,
           c.data ->> 'fullName', c.data ->> 'business', c.updated_at, c.created_at
    from public.fc_cards c left join public.fc_profiles p on p.id = c.owner_id
    where (p_user is null or c.owner_id = p_user)
      and (q = '' or position(q in lower(c.slug)) > 0
           or position(q in lower(coalesce(c.data ->> 'fullName', ''))) > 0
           or position(q in lower(coalesce(c.data ->> 'business', ''))) > 0
           or position(q in lower(coalesce(p.email, ''))) > 0)
    order by c.updated_at desc
    limit least(greatest(p_limit, 1), 200);
end $$;

-- ---------------------------------------------------------------- change a plan (comp, or paid outside Stripe)
create or replace function public.fc_admin_set_plan(p_user uuid, p_plan text, p_how text default 'comped') returns void
language plpgsql security definer set search_path = public as $$
declare r public.fc_profiles%rowtype;
begin
  perform public.fc_require_admin();
  if p_plan not in ('free', 'pro', 'team') then raise exception 'Unknown plan.'; end if;
  select * into r from public.fc_profiles where id = p_user;
  if not found then raise exception 'No such customer.'; end if;
  if r.stripe_subscription_id is not null and coalesce(r.plan_status, '') in ('active', 'trialing', 'past_due') then
    raise exception 'This customer pays through Stripe. Change their plan in Stripe so the two stay in step.';
  end if;
  update public.fc_profiles
     set plan = p_plan,
         plan_status = case when p_plan = 'free' then null when p_how = 'manual' then 'manual' else 'comped' end,
         plan_interval = null
   where id = p_user;
  perform public.fc_admin_note('plan', p_user, null,
    r.plan || ' to ' || p_plan || case when p_plan = 'free' then '' when p_how = 'manual' then ' (paid outside Stripe)' else ' (complimentary)' end);
end $$;

-- ---------------------------------------------------------------- unpublish / republish
create or replace function public.fc_admin_set_published(p_card uuid, p_published boolean, p_reason text default null) returns void
language plpgsql security definer set search_path = public as $$
declare v_owner uuid;
begin
  perform public.fc_require_admin();
  update public.fc_cards set published = p_published where id = p_card returning owner_id into v_owner;
  if not found then raise exception 'No such card.'; end if;
  perform public.fc_admin_note(case when p_published then 'republish' else 'unpublish' end, v_owner, p_card,
    nullif(trim(coalesce(p_reason, '')), ''));
end $$;

-- ---------------------------------------------------------------- hand a card to another account
create or replace function public.fc_admin_transfer_card(p_card uuid, p_to_email text) returns text
language plpgsql security definer set search_path = public as $$
declare v_to uuid; v_confirmed boolean; v_from uuid; v_email text := lower(trim(coalesce(p_to_email, '')));
begin
  perform public.fc_require_admin();
  if v_email = '' then raise exception 'Enter the new owner''s email.'; end if;
  select id, email_confirmed_at is not null into v_to, v_confirmed from auth.users where lower(email) = v_email limit 1;
  if v_to is null then raise exception 'No OKUNAMI account uses % yet. Ask them to sign up first, then transfer the card.', v_email; end if;
  if not v_confirmed then raise exception 'That account has not confirmed its email yet. Ask them to confirm, then transfer the card.'; end if;
  select owner_id into v_from from public.fc_cards where id = p_card;
  if v_from is null then raise exception 'No such card.'; end if;
  if v_from = v_to then raise exception 'That account already owns this card.'; end if;
  update public.fc_cards set owner_id = v_to where id = p_card;
  perform public.fc_admin_note('transfer', v_to, p_card, 'from ' || coalesce((select email from public.fc_profiles where id = v_from), 'unknown'));
  return v_email;
end $$;

-- ---------------------------------------------------------------- numbers for the overview
create or replace function public.fc_admin_stats() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare out jsonb;
begin
  perform public.fc_require_admin();
  select jsonb_build_object(
    'users',    (select count(*) from public.fc_profiles),
    'new_7d',   (select count(*) from public.fc_profiles where created_at > now() - interval '7 days'),
    'new_30d',  (select count(*) from public.fc_profiles where created_at > now() - interval '30 days'),
    'plans',    (select coalesce(jsonb_object_agg(plan, n), '{}'::jsonb) from (select plan, count(*) n from public.fc_profiles group by plan) t),
    'paying',   (select count(*) from public.fc_profiles where plan <> 'free' and coalesce(plan_status, '') in ('active', 'trialing', 'past_due')),
    'offline',  (select count(*) from public.fc_profiles where plan <> 'free' and coalesce(plan_status, '') in ('comped', 'manual')),
    'founding', (select count(*) from public.fc_profiles where founding),
    'mrr_cents',(select coalesce(sum(case
                    when plan = 'pro'  then (case when founding and coalesce(plan_interval, 'month') = 'month' then 500 when plan_interval = 'year' then 600 else 800 end)
                    when plan = 'team' then (case when plan_interval = 'year' then 3250 else 3900 end)
                    else 0 end), 0)
                 from public.fc_profiles where plan <> 'free' and coalesce(plan_status, '') in ('active', 'trialing', 'past_due')),
    'cards',     (select count(*) from public.fc_cards),
    'published', (select count(*) from public.fc_cards where published),
    'top_designs', (select coalesce(jsonb_agg(jsonb_build_object('template', template, 'n', n)), '[]'::jsonb)
                    from (select template, count(*) n from public.fc_cards group by template order by n desc, template limit 8) t),
    'views_7d', (select count(*) from public.fc_card_events where kind = 'view' and created_at > now() - interval '7 days'),
    'saves_7d', (select count(*) from public.fc_card_events where kind = 'save' and created_at > now() - interval '7 days'),
    'taps_7d',  (select count(*) from public.fc_card_events where kind <> 'view' and created_at > now() - interval '7 days'),
    'signups',  (select coalesce(jsonb_agg(jsonb_build_object('d', d, 'n', n) order by d), '[]'::jsonb)
                 from (select g::date as d, (select count(*) from public.fc_profiles p where p.created_at::date = g::date) as n
                       from generate_series((current_date - 13)::timestamp, current_date::timestamp, interval '1 day') g) s)
  ) into out;
  return out;
end $$;

-- ---------------------------------------------------------------- recent admin activity
create or replace function public.fc_admin_recent(p_limit int default 25) returns setof public.fc_admin_log
language plpgsql stable security definer set search_path = public as $$
begin
  perform public.fc_require_admin();
  return query select * from public.fc_admin_log order by id desc limit least(greatest(p_limit, 1), 100);
end $$;

-- ---------------------------------------------------------------- who can call what
revoke execute on function public.fc_require_admin(), public.fc_admin_note(text, uuid, uuid, text) from public, anon, authenticated;
revoke execute on function
  public.fc_admin_users(text, text, int, int), public.fc_admin_cards(uuid, text, int),
  public.fc_admin_set_plan(uuid, text, text), public.fc_admin_set_published(uuid, boolean, text),
  public.fc_admin_transfer_card(uuid, text), public.fc_admin_stats(), public.fc_admin_recent(int)
  from public, anon;
grant execute on function
  public.fc_admin_users(text, text, int, int), public.fc_admin_cards(uuid, text, int),
  public.fc_admin_set_plan(uuid, text, text), public.fc_admin_set_published(uuid, boolean, text),
  public.fc_admin_transfer_card(uuid, text), public.fc_admin_stats(), public.fc_admin_recent(int)
  to authenticated;

-- =====================================================================
-- PART 3: Business priced per card (migration 0012)
-- =====================================================================
-- =====================================================================
-- OKUNAMI Business is priced per card. profiles.seats = how many cards the
-- account may have. Lite = 1, Pro = 3, Business = seats (default 5),
-- platform admins = 1000. Safe to run more than once.
-- =====================================================================
alter table public.fc_profiles add column if not exists seats int;

create or replace function public.fc_card_limit(p_user uuid) returns int
language sql stable security definer set search_path = public as $$
  select case
    when exists (select 1 from public.fc_admins where user_id = p_user) then 1000
    else case (select plan from public.fc_profiles where id = p_user)
      when 'team' then greatest(coalesce((select seats from public.fc_profiles where id = p_user), 5), 1)
      when 'pro' then 3
      else 1 end
  end;
$$;

-- ---------------------------------------------------------------- admin: customers (adds seats)
drop function if exists public.fc_admin_users(text, text, int, int);
create function public.fc_admin_users(p_q text default null, p_plan text default null, p_limit int default 50, p_offset int default 0)
returns table (id uuid, email text, full_name text, plan text, plan_status text, plan_interval text, seats int, founding boolean,
               has_stripe boolean, created_at timestamptz, last_sign_in_at timestamptz,
               card_count int, published_count int, is_admin boolean, total bigint)
language plpgsql stable security definer set search_path = public as $$
#variable_conflict use_column
declare q text := lower(trim(coalesce(p_q, '')));
begin
  perform public.fc_require_admin();
  return query
    select p.id, p.email, p.full_name, p.plan, p.plan_status, p.plan_interval, p.seats, p.founding,
           (p.stripe_subscription_id is not null and coalesce(p.plan_status, '') in ('active', 'trialing', 'past_due')),
           p.created_at, u.last_sign_in_at,
           (select count(*)::int from public.fc_cards c where c.owner_id = p.id),
           (select count(*)::int from public.fc_cards c where c.owner_id = p.id and c.published),
           exists (select 1 from public.fc_admins a where a.user_id = p.id),
           count(*) over ()
    from public.fc_profiles p left join auth.users u on u.id = p.id
    where (q = '' or position(q in lower(coalesce(p.email, ''))) > 0 or position(q in lower(coalesce(p.full_name, ''))) > 0)
      and (coalesce(p_plan, '') = '' or p.plan = p_plan)
    order by p.created_at desc
    limit least(greatest(p_limit, 1), 200) offset greatest(p_offset, 0);
end $$;

-- ---------------------------------------------------------------- admin: change a plan (adds seats)
drop function if exists public.fc_admin_set_plan(uuid, text, text);
create or replace function public.fc_admin_set_plan(p_user uuid, p_plan text, p_how text default 'comped', p_seats int default null) returns void
language plpgsql security definer set search_path = public as $$
declare r public.fc_profiles%rowtype; v_seats int;
begin
  perform public.fc_require_admin();
  if p_plan not in ('free', 'pro', 'team') then raise exception 'Unknown plan.'; end if;
  select * into r from public.fc_profiles where id = p_user;
  if not found then raise exception 'No such customer.'; end if;
  if r.stripe_subscription_id is not null and coalesce(r.plan_status, '') in ('active', 'trialing', 'past_due') then
    raise exception 'This customer pays through Stripe. Change their plan in Stripe so the two stay in step.';
  end if;
  v_seats := case when p_plan = 'team' then least(greatest(coalesce(p_seats, 5), 1), 500) else null end;
  update public.fc_profiles
     set plan = p_plan,
         plan_status = case when p_plan = 'free' then null when p_how = 'manual' then 'manual' else 'comped' end,
         plan_interval = null,
         seats = v_seats
   where id = p_user;
  perform public.fc_admin_note('plan', p_user, null,
    r.plan || ' to ' || p_plan
    || case when p_plan = 'team' then ', ' || v_seats || ' cards' else '' end
    || case when p_plan = 'free' then '' when p_how = 'manual' then ' (paid outside Stripe)' else ' (complimentary)' end);
end $$;

-- ---------------------------------------------------------------- admin: overview numbers (Business revenue is per card)
create or replace function public.fc_admin_stats() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare out jsonb;
begin
  perform public.fc_require_admin();
  select jsonb_build_object(
    'users',    (select count(*) from public.fc_profiles),
    'new_7d',   (select count(*) from public.fc_profiles where created_at > now() - interval '7 days'),
    'new_30d',  (select count(*) from public.fc_profiles where created_at > now() - interval '30 days'),
    'plans',    (select coalesce(jsonb_object_agg(plan, n), '{}'::jsonb) from (select plan, count(*) n from public.fc_profiles group by plan) t),
    'paying',   (select count(*) from public.fc_profiles where plan <> 'free' and coalesce(plan_status, '') in ('active', 'trialing', 'past_due')),
    'offline',  (select count(*) from public.fc_profiles where plan <> 'free' and coalesce(plan_status, '') in ('comped', 'manual')),
    'founding', (select count(*) from public.fc_profiles where founding),
    'mrr_cents',(select coalesce(sum(case
                    when plan = 'pro'  then (case when founding and coalesce(plan_interval, 'month') = 'month' then 500 when plan_interval = 'year' then 600 else 800 end)
                    when plan = 'team' then coalesce(seats, 5) * (case when plan_interval = 'year' then 500 else 600 end)
                    else 0 end), 0)
                 from public.fc_profiles where plan <> 'free' and coalesce(plan_status, '') in ('active', 'trialing', 'past_due')),
    'cards',     (select count(*) from public.fc_cards),
    'published', (select count(*) from public.fc_cards where published),
    'top_designs', (select coalesce(jsonb_agg(jsonb_build_object('template', template, 'n', n)), '[]'::jsonb)
                    from (select template, count(*) n from public.fc_cards group by template order by n desc, template limit 8) t),
    'views_7d', (select count(*) from public.fc_card_events where kind = 'view' and created_at > now() - interval '7 days'),
    'saves_7d', (select count(*) from public.fc_card_events where kind = 'save' and created_at > now() - interval '7 days'),
    'taps_7d',  (select count(*) from public.fc_card_events where kind <> 'view' and created_at > now() - interval '7 days'),
    'signups',  (select coalesce(jsonb_agg(jsonb_build_object('d', d, 'n', n) order by d), '[]'::jsonb)
                 from (select g::date as d, (select count(*) from public.fc_profiles p where p.created_at::date = g::date) as n
                       from generate_series((current_date - 13)::timestamp, current_date::timestamp, interval '1 day') g) s)
  ) into out;
  return out;
end $$;

-- ---------------------------------------------------------------- who can call what
revoke execute on function public.fc_admin_users(text, text, int, int), public.fc_admin_set_plan(uuid, text, text, int) from public, anon;
grant execute on function public.fc_admin_users(text, text, int, int), public.fc_admin_set_plan(uuid, text, text, int) to authenticated;

notify pgrst, 'reload schema';

-- ---- 0014: Pro Plus and flat Business ----
alter table public.fc_profiles drop constraint if exists fc_profiles_plan_check;
alter table public.fc_profiles add constraint fc_profiles_plan_check check (plan in ('free', 'pro', 'plus', 'team'));

create or replace function public.fc_card_limit(p_user uuid) returns int
language sql stable security definer set search_path = public as $$
  select case
    when exists (select 1 from public.fc_admins where user_id = p_user) then 1000
    else case (select plan from public.fc_profiles where id = p_user)
      when 'team' then greatest(coalesce((select seats from public.fc_profiles where id = p_user), 5), 1)
      when 'plus' then 1
      when 'pro' then 3
      else 1 end
  end;
$$;

-- ---------------------------------------------------------------- admin: change a plan (adds Pro Plus)
drop function if exists public.fc_admin_set_plan(uuid, text, text);
create or replace function public.fc_admin_set_plan(p_user uuid, p_plan text, p_how text default 'comped', p_seats int default null) returns void
language plpgsql security definer set search_path = public as $$
declare r public.fc_profiles%rowtype; v_seats int;
begin
  perform public.fc_require_admin();
  if p_plan not in ('free', 'pro', 'plus', 'team') then raise exception 'Unknown plan.'; end if;
  select * into r from public.fc_profiles where id = p_user;
  if not found then raise exception 'No such customer.'; end if;
  if r.stripe_subscription_id is not null and coalesce(r.plan_status, '') in ('active', 'trialing', 'past_due') then
    raise exception 'This customer pays through Stripe. Change their plan in Stripe so the two stay in step.';
  end if;
  v_seats := case when p_plan = 'team' then least(greatest(coalesce(p_seats, 5), 1), 500) else null end;
  update public.fc_profiles
     set plan = p_plan,
         plan_status = case when p_plan = 'free' then null when p_how = 'manual' then 'manual' else 'comped' end,
         plan_interval = null,
         seats = v_seats
   where id = p_user;
  perform public.fc_admin_note('plan', p_user, null,
    r.plan || ' to ' || p_plan
    || case when p_plan = 'team' then ', ' || v_seats || ' cards' else '' end
    || case when p_plan = 'free' then '' when p_how = 'manual' then ' (paid outside Stripe)' else ' (complimentary)' end);
end $$;

-- ---------------------------------------------------------------- admin: overview numbers (per-card Business, Pro Plus)
create or replace function public.fc_admin_stats() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare out jsonb;
begin
  perform public.fc_require_admin();
  select jsonb_build_object(
    'users',    (select count(*) from public.fc_profiles),
    'new_7d',   (select count(*) from public.fc_profiles where created_at > now() - interval '7 days'),
    'new_30d',  (select count(*) from public.fc_profiles where created_at > now() - interval '30 days'),
    'plans',    (select coalesce(jsonb_object_agg(plan, n), '{}'::jsonb) from (select plan, count(*) n from public.fc_profiles group by plan) t),
    'paying',   (select count(*) from public.fc_profiles where plan <> 'free' and coalesce(plan_status, '') in ('active', 'trialing', 'past_due')),
    'offline',  (select count(*) from public.fc_profiles where plan <> 'free' and coalesce(plan_status, '') in ('comped', 'manual')),
    'founding', (select count(*) from public.fc_profiles where founding),
    'mrr_cents',(select coalesce(sum(case
                    when plan = 'pro'  then (case when founding and coalesce(plan_interval, 'month') = 'month' then 500 when plan_interval = 'year' then 658 else 800 end)
                    when plan = 'plus' then (case when plan_interval = 'year' then 1242 else 1600 end)
                    when plan = 'team' then coalesce(seats, 5) * (case when plan_interval = 'year' then 500 else 600 end)
                    else 0 end), 0)
                 from public.fc_profiles where plan <> 'free' and coalesce(plan_status, '') in ('active', 'trialing', 'past_due')),
    'cards',     (select count(*) from public.fc_cards),
    'published', (select count(*) from public.fc_cards where published),
    'top_designs', (select coalesce(jsonb_agg(jsonb_build_object('template', template, 'n', n)), '[]'::jsonb)
                    from (select template, count(*) n from public.fc_cards group by template order by n desc, template limit 8) t),
    'views_7d', (select count(*) from public.fc_card_events where kind = 'view' and created_at > now() - interval '7 days'),
    'saves_7d', (select count(*) from public.fc_card_events where kind = 'save' and created_at > now() - interval '7 days'),
    'taps_7d',  (select count(*) from public.fc_card_events where kind <> 'view' and created_at > now() - interval '7 days'),
    'signups',  (select coalesce(jsonb_agg(jsonb_build_object('d', d, 'n', n) order by d), '[]'::jsonb)
                 from (select g::date as d, (select count(*) from public.fc_profiles p where p.created_at::date = g::date) as n
                       from generate_series((current_date - 13)::timestamp, current_date::timestamp, interval '1 day') g) s)
  ) into out;
  return out;
end $$;

grant execute on function public.fc_admin_set_plan(uuid, text, text, int) to authenticated;

notify pgrst, 'reload schema';


-- =====================================================================
-- Migration 0015: product renamed to OKUNAMI. Only the admin "transfer a card" error message mentioned the old name.
-- Safe to run more than once. No table, column or data changes.
-- =====================================================================
create or replace function public.fc_admin_transfer_card(p_card uuid, p_to_email text) returns text
language plpgsql security definer set search_path = public as $$
declare v_to uuid; v_confirmed boolean; v_from uuid; v_email text := lower(trim(coalesce(p_to_email, '')));
begin
  perform public.fc_require_admin();
  if v_email = '' then raise exception 'Enter the new owner''s email.'; end if;
  select id, email_confirmed_at is not null into v_to, v_confirmed from auth.users where lower(email) = v_email limit 1;
  if v_to is null then raise exception 'No OKUNAMI account uses % yet. Ask them to sign up first, then transfer the card.', v_email; end if;
  if not v_confirmed then raise exception 'That account has not confirmed its email yet. Ask them to confirm, then transfer the card.'; end if;
  select owner_id into v_from from public.fc_cards where id = p_card;
  if v_from is null then raise exception 'No such card.'; end if;
  if v_from = v_to then raise exception 'That account already owns this card.'; end if;
  update public.fc_cards set owner_id = v_to where id = p_card;
  perform public.fc_admin_note('transfer', v_to, p_card, 'from ' || coalesce((select email from public.fc_profiles where id = v_from), 'unknown'));
  return v_email;
end $$;

notify pgrst, 'reload schema';
