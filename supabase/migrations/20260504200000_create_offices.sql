begin;

create table if not exists public.offices (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  phone text,
  owner_id uuid not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
declare
  relkind_user_accounts "char";
begin
  if to_regclass('public.user_accounts') is not null then
    select c.relkind
      into relkind_user_accounts
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public'
       and c.relname = 'user_accounts';
  end if;

  if relkind_user_accounts = 'r' then
    execute '
      alter table public.offices
      add constraint offices_owner_id_fkey
      foreign key (owner_id) references public.user_accounts(id) on delete cascade
    ';
  else
    execute '
      alter table public.offices
      add constraint offices_owner_id_fkey
      foreign key (owner_id) references auth.users(id) on delete cascade
    ';
  end if;
exception
  when duplicate_object then
    null;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists offices_updated_at on public.offices;
create trigger offices_updated_at
  before update on public.offices
  for each row execute procedure public.set_updated_at();

alter table public.offices enable row level security;

create policy "admins_read_offices" on public.offices
  for select
  using (public.is_admin());

create policy "master_manage_offices" on public.offices
  for all
  using (public.current_user_role()::text = 'master');

create policy "admin_lawyer_update_own_office" on public.offices
  for update
  using (owner_id = auth.uid());

commit;
