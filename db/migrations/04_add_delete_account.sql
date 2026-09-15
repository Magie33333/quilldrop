-- ==========================================================
-- Migrace 04: Bezpečná funkce pro zrušení / smazání účtu (GDPR)
-- ==========================================================

create or replace function public.delete_user_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
begin
  current_user_id := auth.uid();
  if current_user_id is null then
    raise exception 'Neautorizovaný požadavek na zrušení účtu.';
  end if;

  -- 1. Smazat navázané záznamy uživatele
  delete from public.user_cards where user_id = current_user_id;
  begin
    delete from public.card_gifts where sender_id = current_user_id or recipient_id = current_user_id;
  exception when undefined_table then
    null;
  end;
  delete from public.profiles where id = current_user_id;

  -- 2. Smazat uživatele z auth.users
  delete from auth.users where id = current_user_id;
end;
$$;

-- Oprávnění: funkci smí volat pouze přihlášený uživatel (smaže výhradně svůj vlastní účet)
grant execute on function public.delete_user_account() to authenticated;
