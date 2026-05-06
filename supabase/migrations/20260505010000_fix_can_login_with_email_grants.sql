create or replace function public.can_login_with_email(p_email text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists (
    select 1
    from public.user_accounts ua
    where lower(ua.email) = lower(trim(p_email))
      and coalesce(ua.is_active, true) = true
  );
end;
$$;

revoke all on function public.can_login_with_email(text) from public;
grant execute on function public.can_login_with_email(text) to anon, authenticated;
