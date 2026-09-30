alter table public.fc_cards drop constraint if exists fc_cards_template;
alter table public.fc_cards add constraint fc_cards_template check (template in (
  'cover','arch','header','bizcard','app','rail','radial','swiss','bento','journey',
  'tech','realestate','photo','foodtruck','apparel','mechanic','handyman','esthetics','creator','retail',
  'barber','church','fitness','advisor','bistro','stage'));

alter table public.fc_looks drop constraint if exists fc_looks_template;
alter table public.fc_looks add constraint fc_looks_template check (template in (
  'cover','arch','header','bizcard','app','rail','radial','swiss','bento','journey',
  'tech','realestate','photo','foodtruck','apparel','mechanic','handyman','esthetics','creator','retail',
  'barber','church','fitness','advisor','bistro','stage'));

notify pgrst, 'reload schema';
