-- Check whether an email belongs to an active account before attempting auth.
-- This prevents Supabase from creating a session for disabled users and then
-- immediately logging them out in the client.

create or replace function public.can_login_with_email(p_email text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if to_regclass('public.users_accounts') is not null then
    return exists (
      select 1
      from public.users_accounts ua
      where lower(ua.email) = lower(trim(p_email))
        and ua.is_active = true
    );
  end if;

  if to_regclass('public.user_accounts') is not null then
    return exists (
      select 1
      from public.user_accounts ua
      where lower(ua.email) = lower(trim(p_email))
        and coalesce(ua.is_active, true) = true
    );
  end if;

  return false;
end;
$$;

revoke all on function public.can_login_with_email(text) from public;
grant execute on function public.can_login_with_email(text) to anon, authenticated;
