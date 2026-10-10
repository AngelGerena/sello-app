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
