-- Resolve the account role by email before authentication.
-- This is used only to block users from entering the wrong login tab.

create or replace function public.get_login_role_by_email(p_email text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
begin
  if to_regclass('public.user_accounts') is not null then
    select ua.role::text
      into v_role
    from public.user_accounts ua
    where lower(ua.email) = lower(trim(p_email))
      and coalesce(ua.is_active, true) = true
    limit 1;

    return v_role;
  end if;

  return null;
end;
$$;

revoke all on function public.get_login_role_by_email(text) from public;
grant execute on function public.get_login_role_by_email(text) to anon, authenticated;
