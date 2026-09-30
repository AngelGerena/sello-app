create table if not exists public.fc_looks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  template text not null default 'arch'
    check (template in ('cover','arch','header','bizcard','app','rail','radial','swiss','bento','journey')),
  theme jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
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

notify pgrst, 'reload schema';
