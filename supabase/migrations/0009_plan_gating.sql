-- Lite plan: 3 free designs. A Lite card set to a Pro design shows the free fallback publicly.
-- Business includes 5 cards.
create or replace function public.fc_card_limit(p_user uuid) returns int
language sql stable security definer set search_path = public as $$
  select case coalesce((select plan from public.fc_profiles where id = p_user), 'free')
    when 'team' then 5 when 'pro' then 3 else 1 end;
$$;

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

grant execute on function public.fc_public_card(text) to anon, authenticated;
notify pgrst, 'reload schema';
