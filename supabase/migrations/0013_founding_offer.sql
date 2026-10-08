-- =====================================================================
-- Founding offer: ONE authoritative configuration, atomic claims, enforced on the server.
--   $5/month, Pro monthly only, first 100 paying customers, one per person.
--   Lasts while the subscription stays active. If it ends, the spot is NOT recycled and cannot be claimed again.
-- Only the payment functions (service role) can claim. Visitors can only read the public status.
-- Safe to run more than once.
-- =====================================================================
create table if not exists public.fc_offer_config (
  key text primary key, value jsonb not null, updated_at timestamptz not null default now());
alter table public.fc_offer_config enable row level security;
revoke all on public.fc_offer_config from anon, authenticated;
insert into public.fc_offer_config (key, value) values
  ('founding', '{"active": true, "spots": 100, "price_cents": 500, "plan": "pro", "interval": "month", "reserve_minutes": 45}')
on conflict (key) do nothing;

create table if not exists public.fc_founding_claims (
  id bigint generated always as identity primary key,
  user_id uuid not null,                      -- deliberately no foreign key: deleting an account never frees a spot
  email_key text not null,
  status text not null check (status in ('reserved', 'active', 'lapsed', 'released')),
  checkout_session text, subscription_id text,
  reserved_until timestamptz,
  created_at timestamptz not null default now(), activated_at timestamptz, lapsed_at timestamptz
);
create unique index if not exists fc_founding_one_per_email on public.fc_founding_claims (email_key) where status in ('reserved', 'active', 'lapsed');
create unique index if not exists fc_founding_one_per_user on public.fc_founding_claims (user_id) where status in ('reserved', 'active', 'lapsed');
alter table public.fc_founding_claims enable row level security;
revoke all on public.fc_founding_claims from anon, authenticated;

-- gmail dots, +tags and googlemail.com can not create a second identity
create or replace function public.fc_email_key(p text) returns text language sql immutable as $$
  select case when d in ('gmail.com', 'googlemail.com') then replace(split_part(l, '+', 1), '.', '') || '@gmail.com'
              else split_part(l, '+', 1) || '@' || d end
  from (select lower(trim(split_part(coalesce(p, ''), '@', 1))) as l, lower(trim(split_part(coalesce(p, ''), '@', 2))) as d) x;
$$;

-- what the website may show: is the offer on, and how many spots are left
create or replace function public.fc_offer_status() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare cfg jsonb; taken int;
begin
  select value into cfg from public.fc_offer_config where key = 'founding';
  if cfg is null then return jsonb_build_object('configured', false, 'active', false); end if;
  select count(*) into taken from public.fc_founding_claims where status in ('active', 'lapsed') or (status = 'reserved' and reserved_until > now());
  return jsonb_build_object('configured', true, 'plan', cfg ->> 'plan', 'interval', cfg ->> 'interval',
    'active', (cfg ->> 'active')::boolean and taken < (cfg ->> 'spots')::int,
    'spots', (cfg ->> 'spots')::int, 'price_cents', (cfg ->> 'price_cents')::int, 'left', greatest((cfg ->> 'spots')::int - taken, 0),
    'reserve_minutes', coalesce((cfg ->> 'reserve_minutes')::int, 45));
end $$;

-- take a spot (payment functions only). One lock makes "the 100th spot" safe when two people pay at once.
create or replace function public.fc_claim_founding(p_user uuid, p_email text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare cfg jsonb; k text := public.fc_email_key(p_email); taken int; ex public.fc_founding_claims%rowtype; mins int;
begin
  perform pg_advisory_xact_lock(884422);
  select value into cfg from public.fc_offer_config where key = 'founding';
  if cfg is null or not (cfg ->> 'active')::boolean then return jsonb_build_object('granted', false, 'reason', 'inactive'); end if;
  mins := coalesce((cfg ->> 'reserve_minutes')::int, 45);
  update public.fc_founding_claims set status = 'released' where status = 'reserved' and reserved_until <= now();
  select * into ex from public.fc_founding_claims where (email_key = k or user_id = p_user) and status in ('reserved', 'active', 'lapsed') order by id limit 1;
  if found then
    if ex.status = 'reserved' and ex.user_id = p_user and ex.email_key = k then
      update public.fc_founding_claims set reserved_until = now() + make_interval(mins => mins) where id = ex.id;
      return jsonb_build_object('granted', true, 'reason', 'reused');
    end if;
    return jsonb_build_object('granted', false, 'reason', case ex.status when 'active' then 'already_member' when 'lapsed' then 'used_before' else 'held_by_another_account' end);
  end if;
  select count(*) into taken from public.fc_founding_claims where status in ('active', 'lapsed') or (status = 'reserved' and reserved_until > now());
  if taken >= (cfg ->> 'spots')::int then return jsonb_build_object('granted', false, 'reason', 'sold_out'); end if;
  insert into public.fc_founding_claims (user_id, email_key, status, reserved_until) values (p_user, k, 'reserved', now() + make_interval(mins => mins));
  return jsonb_build_object('granted', true, 'reason', 'reserved');
end $$;

create or replace function public.fc_founding_attach(p_user uuid, p_session text) returns void
language sql security definer set search_path = public as $$
  update public.fc_founding_claims set checkout_session = p_session where user_id = p_user and status = 'reserved';
$$;
create or replace function public.fc_founding_release_user(p_user uuid) returns void
language sql security definer set search_path = public as $$
  update public.fc_founding_claims set status = 'released' where user_id = p_user and status = 'reserved';
$$;
create or replace function public.fc_founding_release_session(p_session text) returns void
language sql security definer set search_path = public as $$
  update public.fc_founding_claims set status = 'released' where checkout_session = p_session and status = 'reserved';
$$;
create or replace function public.fc_founding_activate(p_user uuid, p_subscription text) returns boolean
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  update public.fc_founding_claims set status = 'active', subscription_id = p_subscription, activated_at = coalesce(activated_at, now())
   where user_id = p_user and status in ('reserved', 'active');
  get diagnostics n = row_count; return n > 0;
end $$;
create or replace function public.fc_founding_lapse(p_subscription text) returns void
language sql security definer set search_path = public as $$
  update public.fc_founding_claims set status = 'lapsed', lapsed_at = now() where subscription_id = p_subscription and status = 'active';
$$;

revoke execute on function public.fc_claim_founding(uuid, text), public.fc_founding_attach(uuid, text), public.fc_founding_release_user(uuid),
  public.fc_founding_release_session(text), public.fc_founding_activate(uuid, text), public.fc_founding_lapse(text), public.fc_offer_status() from public, anon, authenticated;
grant execute on function public.fc_claim_founding(uuid, text), public.fc_founding_attach(uuid, text), public.fc_founding_release_user(uuid),
  public.fc_founding_release_session(text), public.fc_founding_activate(uuid, text), public.fc_founding_lapse(text) to service_role;
grant execute on function public.fc_offer_status() to anon, authenticated, service_role;
notify pgrst, 'reload schema';
