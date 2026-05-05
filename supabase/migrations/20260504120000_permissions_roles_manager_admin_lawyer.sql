begin;

-- 1) Expand role enum with the new roles.
do $$
begin
  if exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'user_account_role'
  ) then
    if not exists (
      select 1
      from pg_enum e
      join pg_type t on t.oid = e.enumtypid
      join pg_namespace n on n.oid = t.typnamespace
      where n.nspname = 'public'
        and t.typname = 'user_account_role'
        and e.enumlabel = 'manager'
    ) then
      alter type public.user_account_role add value 'manager';
    end if;

    if not exists (
      select 1
      from pg_enum e
      join pg_type t on t.oid = e.enumtypid
      join pg_namespace n on n.oid = t.typnamespace
      where n.nspname = 'public'
        and t.typname = 'user_account_role'
        and e.enumlabel = 'admin_lawyer'
    ) then
      alter type public.user_account_role add value 'admin_lawyer';
    end if;
  end if;
end
$$;

-- 2) Rename legacy role values in data (admin -> manager).
do $$
begin
  if to_regclass('public.users_accounts') is not null then
    execute $sql$
      update public.users_accounts
      set role = 'manager'::public.user_account_role
      where role::text = 'admin'
    $sql$;
  elsif to_regclass('public.user_accounts') is not null then
    execute $sql$
      update public.user_accounts
      set role = 'manager'
      where role = 'admin'
    $sql$;
  end if;
end
$$;

-- 3) Ensure role helper includes the new admin-capable roles.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role()::text in ('master', 'manager', 'admin_lawyer'), false)
$$;

-- Keep compatibility for installations that still have the old schema copy.
create or replace function aplikei.is_admin()
returns boolean
language sql
stable
security definer
set search_path = aplikei, public
as $$
  select coalesce(aplikei.current_user_role()::text in ('master', 'manager', 'admin_lawyer'), false)
$$;

-- 4) Chat helpers that were hard-coded to admin now accept manager/admin_lawyer.
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
        and ua.role in ('master', 'manager', 'admin_lawyer')
    );
  end if;

  if to_regclass('public.users_accounts') is not null then
    return exists (
      select 1
      from public.users_accounts ua
      where ua.id = auth.uid()
        and ua.role::text in ('master', 'manager', 'admin_lawyer')
    );
  end if;

  return false;
end;
$$;

commit;
