begin;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'user_account_role'
      and typnamespace = 'aplikei'::regnamespace
  ) then
    create type aplikei.user_account_role as enum ('customer', 'admin', 'seller', 'master');
  end if;
end
$$;

create or replace function aplikei.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists aplikei.users_accounts (
  id uuid primary key references auth.users (id) on delete cascade,
  role aplikei.user_account_role not null default 'customer',
  email text,
  name text not null,
  profile_url text,
  phone text,
  metadata jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  terms_accepted_at timestamptz,
  last_sign_in_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint users_accounts_name_check check (char_length(trim(name)) >= 2)
);

create unique index if not exists users_accounts_email_unique_idx
  on aplikei.users_accounts (lower(email))
  where email is not null;

create index if not exists users_accounts_role_idx
  on aplikei.users_accounts (role);

create index if not exists users_accounts_created_at_idx
  on aplikei.users_accounts (created_at desc);

drop trigger if exists set_users_accounts_updated_at on aplikei.users_accounts;
create trigger set_users_accounts_updated_at
before update on aplikei.users_accounts
for each row
execute function aplikei.set_updated_at();

create or replace function aplikei.current_user_role()
returns aplikei.user_account_role
language sql
stable
security definer
set search_path = aplikei, public
as $$
  select role
  from aplikei.users_accounts
  where id = auth.uid()
$$;

create or replace function aplikei.is_admin()
returns boolean
language sql
stable
security definer
set search_path = aplikei, public
as $$
  select coalesce(aplikei.current_user_role() in ('admin', 'master'), false)
$$;

create or replace function aplikei.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = aplikei, public
as $$
declare
  inferred_name text;
begin
  inferred_name := coalesce(
    nullif(new.raw_user_meta_data ->> 'name', ''),
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    split_part(coalesce(new.email, 'user'), '@', 1)
  );

  insert into aplikei.users_accounts (
    id,
    email,
    name,
    profile_url,
    phone,
    last_sign_in_at
  )
  values (
    new.id,
    new.email,
    inferred_name,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'profile_url', ''),
      nullif(new.raw_user_meta_data ->> 'avatar_url', '')
    ),
    coalesce(
      nullif(new.raw_user_meta_data ->> 'phone', ''),
      nullif(new.raw_user_meta_data ->> 'phone_number', '')
    ),
    new.last_sign_in_at
  )
  on conflict (id) do update
  set
    email = excluded.email,
    name = excluded.name,
    profile_url = coalesce(excluded.profile_url, aplikei.users_accounts.profile_url),
    phone = coalesce(excluded.phone, aplikei.users_accounts.phone),
    last_sign_in_at = excluded.last_sign_in_at;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_users_accounts on auth.users;
create trigger on_auth_user_created_users_accounts
after insert on auth.users
for each row
execute function aplikei.handle_new_auth_user();

create or replace function aplikei.sync_auth_user_to_users_accounts()
returns trigger
language plpgsql
security definer
set search_path = aplikei, public
as $$
begin
  update aplikei.users_accounts
  set
    email = new.email,
    name = coalesce(
      nullif(new.raw_user_meta_data ->> 'name', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      aplikei.users_accounts.name
    ),
    profile_url = coalesce(
      nullif(new.raw_user_meta_data ->> 'profile_url', ''),
      nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
      aplikei.users_accounts.profile_url
    ),
    phone = coalesce(
      nullif(new.raw_user_meta_data ->> 'phone', ''),
      nullif(new.raw_user_meta_data ->> 'phone_number', ''),
      aplikei.users_accounts.phone
    ),
    last_sign_in_at = new.last_sign_in_at,
    is_active = (new.deleted_at is null)
  where id = new.id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_updated_users_accounts on auth.users;
create trigger on_auth_user_updated_users_accounts
after update on auth.users
for each row
execute function aplikei.sync_auth_user_to_users_accounts();

alter table aplikei.users_accounts enable row level security;

grant execute on function aplikei.current_user_role() to authenticated;
grant execute on function aplikei.is_admin() to authenticated;

drop policy if exists "users_accounts_select_own_or_admin" on aplikei.users_accounts;
create policy "users_accounts_select_own_or_admin"
on aplikei.users_accounts
for select
to authenticated
using (auth.uid() = id or aplikei.is_admin());

drop policy if exists "users_accounts_insert_own_or_admin" on aplikei.users_accounts;
create policy "users_accounts_insert_own_or_admin"
on aplikei.users_accounts
for insert
to authenticated
with check (auth.uid() = id or aplikei.is_admin());

drop policy if exists "users_accounts_update_own_or_admin" on aplikei.users_accounts;
create policy "users_accounts_update_own_or_admin"
on aplikei.users_accounts
for update
to authenticated
using (auth.uid() = id or aplikei.is_admin())
with check (
  aplikei.is_admin()
  or (
    auth.uid() = id
    and role = aplikei.current_user_role()
  )
);

drop policy if exists "users_accounts_delete_admin_only" on aplikei.users_accounts;
create policy "users_accounts_delete_admin_only"
on aplikei.users_accounts
for delete
to authenticated
using (aplikei.is_admin());

commit;
