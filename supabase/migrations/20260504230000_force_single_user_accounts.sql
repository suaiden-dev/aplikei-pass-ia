begin;

do $$
declare
  user_accounts_kind "char";
  users_accounts_kind "char";
begin
  if to_regclass('public.user_accounts') is not null then
    select c.relkind
      into user_accounts_kind
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public'
       and c.relname = 'user_accounts';
  end if;

  if to_regclass('public.users_accounts') is not null then
    select c.relkind
      into users_accounts_kind
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public'
       and c.relname = 'users_accounts';
  end if;

  -- Case 1: only users_accounts exists as table -> rename to user_accounts.
  if to_regclass('public.user_accounts') is null
     and to_regclass('public.users_accounts') is not null
     and users_accounts_kind = 'r' then
    execute 'alter table public.users_accounts rename to user_accounts';
  end if;

  -- Case 2: user_accounts is a view and users_accounts is a table.
  -- Keep legacy view, promote table as canonical user_accounts.
  if to_regclass('public.user_accounts') is not null
     and to_regclass('public.users_accounts') is not null
     and user_accounts_kind = 'v'
     and users_accounts_kind = 'r' then
    if to_regclass('public.user_accounts_legacy') is null then
      execute 'alter view public.user_accounts rename to user_accounts_legacy';
    end if;
    execute 'alter table public.users_accounts rename to user_accounts';
  end if;

  -- Refresh kinds.
  if to_regclass('public.user_accounts') is not null then
    select c.relkind
      into user_accounts_kind
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public'
       and c.relname = 'user_accounts';
  else
    user_accounts_kind := null;
  end if;

  if to_regclass('public.users_accounts') is not null then
    select c.relkind
      into users_accounts_kind
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public'
       and c.relname = 'users_accounts';
  else
    users_accounts_kind := null;
  end if;

  -- Case 3: both are tables -> merge and drop users_accounts.
  if to_regclass('public.user_accounts') is not null
     and to_regclass('public.users_accounts') is not null
     and user_accounts_kind = 'r'
     and users_accounts_kind = 'r' then
    execute '
      insert into public.user_accounts
      select *
      from public.users_accounts ua
      where not exists (
        select 1 from public.user_accounts u where u.id = ua.id
      )
    ';
    execute 'drop table public.users_accounts';
  end if;

  if to_regclass('public.users_accounts') is not null then
    raise exception 'Normalization incomplete: public.users_accounts still exists.';
  end if;

  if to_regclass('public.user_accounts') is null then
    raise exception 'Normalization failed: public.user_accounts not found.';
  end if;

  if exists (
    select 1
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public'
       and c.relname = 'user_accounts'
       and c.relkind = 'r'
  ) then
    execute 'alter table public.user_accounts enable row level security';
  end if;
end $$;

commit;
