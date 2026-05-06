begin;

do $$
begin
  if to_regclass('public.user_accounts') is null then
    create table public.user_accounts (
      id uuid not null primary key references auth.users(id) on delete cascade,
      full_name text not null,
      email text,
      phone_number text,
      avatar_url text,
      passport_photo_url text,
      role public.user_account_role not null default 'customer',
      is_active boolean not null default true,
      created_at timestamptz not null default timezone('utc', now()),
      updated_at timestamptz not null default timezone('utc', now())
    );
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_accounts'
      and column_name = 'full_name'
  ) then
    alter table public.user_accounts add column full_name text;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_accounts'
      and column_name = 'phone_number'
  ) then
    alter table public.user_accounts add column phone_number text;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_accounts'
      and column_name = 'avatar_url'
  ) then
    alter table public.user_accounts add column avatar_url text;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_accounts'
      and column_name = 'passport_photo_url'
  ) then
    alter table public.user_accounts add column passport_photo_url text;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_accounts'
      and column_name = 'role'
  ) then
    alter table public.user_accounts add column role public.user_account_role not null default 'customer';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_accounts'
      and column_name = 'is_active'
  ) then
    alter table public.user_accounts add column is_active boolean not null default true;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_accounts'
      and column_name = 'created_at'
  ) then
    alter table public.user_accounts add column created_at timestamptz not null default timezone('utc', now());
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_accounts'
      and column_name = 'updated_at'
  ) then
    alter table public.user_accounts add column updated_at timestamptz not null default timezone('utc', now());
  end if;

  execute 'alter table public.user_accounts enable row level security';
  execute 'drop policy if exists "user_accounts_select_own" on public.user_accounts';
  execute 'drop policy if exists "user_accounts_insert_own" on public.user_accounts';
  execute 'drop policy if exists "user_accounts_update_own" on public.user_accounts';
  execute 'drop policy if exists "user_accounts_admin_select_all" on public.user_accounts';
  execute 'drop policy if exists "user_accounts_admin_update_all" on public.user_accounts';

  execute 'create policy "user_accounts_select_own" on public.user_accounts for select to authenticated using (id = auth.uid())';
  execute 'create policy "user_accounts_insert_own" on public.user_accounts for insert to authenticated with check (id = auth.uid())';
  execute 'create policy "user_accounts_update_own" on public.user_accounts for update to authenticated using (id = auth.uid()) with check (id = auth.uid())';
  execute 'create policy "user_accounts_admin_select_all" on public.user_accounts for select to authenticated using (public.is_admin())';
  execute 'create policy "user_accounts_admin_update_all" on public.user_accounts for update to authenticated using (public.is_admin()) with check (public.is_admin())';

  if to_regclass('public.user_services') is null then
    create table public.user_services (
      id uuid not null primary key default gen_random_uuid(),
      user_id uuid not null references public.user_accounts(id) on delete cascade,
      service_slug text not null,
      status text default 'active',
      created_at timestamptz default now(),
      current_step integer default 0,
      application_id text,
      date_of_birth text,
      grandmother_name text,
      consular_login text,
      consular_password text,
      interview_date date,
      interview_time time without time zone,
      interview_location_casv text,
      interview_location_consulate text,
      specialist_training_data jsonb,
      consulate_interview_date text,
      consulate_interview_time text,
      same_location boolean default true,
      specialist_review_data jsonb,
      is_second_attempt boolean default false,
      admin_notes text,
      admin_review_data jsonb default '{}'::jsonb,
      service_metadata jsonb default '{}'::jsonb,
      data jsonb default '{}'::jsonb,
      step_data jsonb default '{}'::jsonb,
      chat_closed_at timestamptz
    );
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_services'
      and column_name = 'status'
  ) then
    alter table public.user_services add column status text default 'active';
  end if;

  execute 'alter table public.user_services enable row level security';
  execute 'drop policy if exists "Admins can view all user services" on public.user_services';
  execute 'drop policy if exists "Admins can update all user services" on public.user_services';
  execute 'drop policy if exists "users can read own services" on public.user_services';
  execute 'drop policy if exists "users can insert own services" on public.user_services';
  execute 'drop policy if exists "users can update own services" on public.user_services';
  execute 'drop policy if exists "user_services_chat_close_admin" on public.user_services';

  execute 'create policy "Admins can view all user services" on public.user_services for select using (public.is_admin() or auth.uid() = user_id)';
  execute 'create policy "Admins can update all user services" on public.user_services for update using (public.is_admin() or auth.uid() = user_id) with check (public.is_admin() or auth.uid() = user_id)';
  execute 'create policy "users can read own services" on public.user_services for select using (auth.uid() = user_id or public.is_admin())';
  execute 'create policy "users can insert own services" on public.user_services for insert with check (auth.uid() = user_id or public.is_admin())';
  execute 'create policy "users can update own services" on public.user_services for update using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin())';
  execute 'create policy "user_services_chat_close_admin" on public.user_services for update using (public.is_admin()) with check (public.is_admin())';

  execute 'create index if not exists user_accounts_created_at_idx on public.user_accounts using btree (created_at desc)';
  execute 'create index if not exists user_accounts_role_idx on public.user_accounts using btree (role)';
  execute 'create unique index if not exists user_accounts_email_unique_idx on public.user_accounts using btree (lower(email)) where (email is not null)';
  execute 'create index if not exists user_services_created_at_idx on public.user_services using btree (created_at desc)';
  execute 'create index if not exists user_services_user_id_idx on public.user_services using btree (user_id)';
  execute 'create index if not exists user_services_service_slug_idx on public.user_services using btree (service_slug)';
  execute 'grant select, insert, update, delete on public.user_accounts to authenticated, service_role';
  execute 'grant select, insert, update, delete on public.user_services to authenticated, service_role';
end $$;

commit;
