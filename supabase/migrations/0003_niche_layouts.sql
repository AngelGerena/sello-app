alter table public.fc_cards drop constraint if exists fc_cards_template;
alter table public.fc_cards add constraint fc_cards_template check (template in (
  'cover','arch','header','bizcard','app','rail','radial','swiss','bento','journey',
  'tech','realestate','photo','foodtruck','apparel','mechanic','handyman','esthetics','creator','retail'));

do $$
declare c record;
begin
  for c in select conname from pg_constraint
           where conrelid = 'public.fc_looks'::regclass and contype = 'c'
             and pg_get_constraintdef(oid) ilike '%template%'
  loop execute format('alter table public.fc_looks drop constraint %I', c.conname); end loop;
end $$;
alter table public.fc_looks add constraint fc_looks_template check (template in (
  'cover','arch','header','bizcard','app','rail','radial','swiss','bento','journey',
  'tech','realestate','photo','foodtruck','apparel','mechanic','handyman','esthetics','creator','retail'));

notify pgrst, 'reload schema';
