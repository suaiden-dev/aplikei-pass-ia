begin;

create or replace function public.ensure_admin_lawyer_has_office()
returns trigger
language plpgsql
as $$
begin
  if new.role::text = 'admin_lawyer' then
    if not exists (
      select 1
      from public.offices o
      where o.owner_id = new.id
    ) then
      raise exception 'Cannot set role to admin_lawyer without an office linked to owner_id=%', new.id
        using errcode = '23514';
    end if;
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
    execute 'drop trigger if exists trg_require_office_for_admin_lawyer on public.user_accounts';
    execute '
      create trigger trg_require_office_for_admin_lawyer
      before update of role on public.user_accounts
      for each row
      when (old.role is distinct from new.role)
      execute function public.ensure_admin_lawyer_has_office()
    ';
  end if;
end $$;

commit;
