-- =====================================================================
-- Migration 0014: Pro Plus plan and flat Business pricing.
--   Lite = 1 card, Pro = 3, Pro Plus = 1 (change the number below if that changes),
--   Business = 5 cards included (profiles.seats, default 5). Extra cards are not offered.
-- Business was per card; it is now a flat price, so the revenue figure in the admin overview changes too.
-- NOT applied to the live database yet. Safe to run more than once.
-- =====================================================================
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

-- ---------------------------------------------------------------- admin: overview numbers (flat Business, Pro Plus)
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
                    when plan = 'team' then (case when plan_interval = 'year' then 3325 else 4100 end)
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
