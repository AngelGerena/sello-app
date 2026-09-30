-- =====================================================================
-- Sello admin portal: audit log + admin-only functions.
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
  if v_to is null then raise exception 'No Sello account uses % yet. Ask them to sign up first, then transfer the card.', v_email; end if;
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

notify pgrst, 'reload schema';
