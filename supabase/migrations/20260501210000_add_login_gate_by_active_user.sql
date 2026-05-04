-- Check whether an email belongs to an active account before attempting auth.
-- This prevents Supabase from creating a session for disabled users and then
-- immediately logging them out in the client.

create or replace function public.can_login_with_email(p_email text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users_accounts ua
    where lower(ua.email) = lower(trim(p_email))
      and ua.is_active = true
  );
$$;

revoke all on function public.can_login_with_email(text) from public;
grant execute on function public.can_login_with_email(text) to anon, authenticated;
