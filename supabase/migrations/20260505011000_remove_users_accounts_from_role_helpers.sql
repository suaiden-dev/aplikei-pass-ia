begin;

create or replace function public.current_user_role()
returns public.user_account_role
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_role public.user_account_role;
begin
  if to_regclass('public.user_accounts') is not null then
    execute 'select role from public.user_accounts where id = auth.uid()'
      into v_role;
    return v_role;
  end if;

  return null;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role()::text in ('admin', 'master', 'manager', 'admin_lawyer'), false)
$$;

create or replace function public.chat_is_admin()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if to_regclass('public.user_accounts') is not null then
    return exists (
      select 1
      from public.user_accounts ua
      where ua.id = auth.uid()
        and ua.role::text in ('master', 'manager', 'admin_lawyer', 'admin')
    );
  end if;

  return false;
end;
$$;

create or replace function public.can_login_with_email(p_email text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
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

create or replace function aplikei.current_user_role()
returns aplikei.user_account_role
language plpgsql
stable
security definer
set search_path = public, aplikei
as $$
declare
  v_role aplikei.user_account_role;
begin
  if to_regclass('public.user_accounts') is not null then
    execute 'select role::text::aplikei.user_account_role from public.user_accounts where id = auth.uid()'
      into v_role;
    return v_role;
  end if;

  return null;
end;
$$;

create or replace function aplikei.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, aplikei
as $$
  select coalesce(aplikei.current_user_role()::text in ('admin', 'master', 'manager', 'admin_lawyer'), false)
$$;

grant execute on function public.current_user_role() to authenticated, anon, service_role;
grant execute on function public.is_admin() to authenticated, anon, service_role;
grant execute on function public.chat_is_admin() to authenticated, anon, service_role;
grant execute on function public.can_login_with_email(text) to authenticated, anon, service_role;
grant execute on function aplikei.current_user_role() to authenticated, anon, service_role;
grant execute on function aplikei.is_admin() to authenticated, anon, service_role;

commit;
