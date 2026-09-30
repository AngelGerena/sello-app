-- =====================================================================
-- Sello Business is priced per card. profiles.seats = how many cards the
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
