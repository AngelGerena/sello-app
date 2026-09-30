alter table public.fc_cards drop constraint if exists fc_cards_slug_reserved;
alter table public.fc_cards add constraint fc_cards_slug_reserved check (slug not in (
  'app','signup','join','login','logout','reset','api','admin','pricing','layouts','terms','privacy','help','support','assets','images','www'));
notify pgrst, 'reload schema';
