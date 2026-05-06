begin;

create or replace function public.block_admin_lawyer_promoting_admin_lawyer()
returns trigger
language plpgsql
as $$
begin
  if public.current_user_role()::text = 'admin_lawyer'
     and new.role::text = 'admin_lawyer'
     and coalesce(old.role::text, '') <> 'admin_lawyer' then
    raise exception 'admin_lawyer cannot elevate a user to admin_lawyer'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

do $$
declare
  user_accounts_kind "char";
begin
  if to_regclass('public.user_accounts') is not null then
    select c.relkind
      into user_accounts_kind
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public'
       and c.relname = 'user_accounts';
  end if;

  if user_accounts_kind = 'r' then
    execute 'drop trigger if exists trg_block_admin_lawyer_promote_admin_lawyer on public.user_accounts';
    execute '
      create trigger trg_block_admin_lawyer_promote_admin_lawyer
      before update of role on public.user_accounts
      for each row
      when (old.role is distinct from new.role)
      execute function public.block_admin_lawyer_promoting_admin_lawyer()
    ';
  end if;
end $$;

commit;
