begin;

-- =====================================================================
-- 1. HELPER RLS
-- Evita recursão infinita em policies que consultam public.user_accounts.
-- =====================================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_accounts ua
    where ua.id = auth.uid()
      and ua.role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated, anon, service_role;

-- =====================================================================
-- 2. USER_ACCOUNTS
-- =====================================================================

alter table public.user_accounts enable row level security;

drop policy if exists "user_accounts_select_own" on public.user_accounts;
drop policy if exists "user_accounts_insert_own" on public.user_accounts;
drop policy if exists "user_accounts_update_own" on public.user_accounts;
drop policy if exists "user_accounts_admin_select_all" on public.user_accounts;
drop policy if exists "user_accounts_admin_update_all" on public.user_accounts;
drop policy if exists "Users can view their own profile" on public.user_accounts;
drop policy if exists "Users can insert their own profile" on public.user_accounts;
drop policy if exists "Users can update their own profile" on public.user_accounts;
drop policy if exists "Admins can view all profiles" on public.user_accounts;
drop policy if exists "Admins can update all profiles" on public.user_accounts;
drop policy if exists "admin can read all accounts" on public.user_accounts;
drop policy if exists "user can read own account" on public.user_accounts;
drop policy if exists "user can update own account" on public.user_accounts;

create policy "user_accounts_select_own"
on public.user_accounts
for select
to authenticated
using (id = auth.uid());

create policy "user_accounts_insert_own"
on public.user_accounts
for insert
to authenticated
with check (id = auth.uid());

create policy "user_accounts_update_own"
on public.user_accounts
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "user_accounts_admin_select_all"
on public.user_accounts
for select
to authenticated
using (public.is_admin());

create policy "user_accounts_admin_update_all"
on public.user_accounts
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- =====================================================================
-- 3. NOTIFICATIONS
-- =====================================================================

alter table public.notifications enable row level security;

drop policy if exists "authenticated_can_insert" on public.notifications;
drop policy if exists "owner_can_update_read" on public.notifications;
drop policy if exists "clients_can_update_own_notifications" on public.notifications;
drop policy if exists "admins_can_update_admin_notifications" on public.notifications;
drop policy if exists "admins_see_admin_notifications" on public.notifications;
drop policy if exists "clients_see_own_notifications" on public.notifications;
drop policy if exists "admins_can_insert" on public.notifications;
drop policy if exists "service_role_full_access" on public.notifications;

create policy "authenticated_can_insert"
on public.notifications
for insert
to authenticated
with check (auth.uid() is not null);

create policy "admins_see_admin_notifications"
on public.notifications
for select
to authenticated
using (
  target_role = 'admin'
  and public.is_admin()
);

create policy "clients_see_own_notifications"
on public.notifications
for select
to authenticated
using (
  target_role = 'client'
  and user_id = auth.uid()
);

create policy "clients_can_update_own_notifications"
on public.notifications
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "admins_can_update_admin_notifications"
on public.notifications
for update
to authenticated
using (
  target_role = 'admin'
  and public.is_admin()
)
with check (
  target_role = 'admin'
  and public.is_admin()
);

-- =====================================================================
-- 4. STORAGE: BUCKET profiles
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('profiles', 'profiles', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "profiles_bucket_public_read" on storage.objects;
drop policy if exists "profiles_bucket_user_insert_own_folder" on storage.objects;
drop policy if exists "profiles_bucket_user_update_own_folder" on storage.objects;
drop policy if exists "profiles_bucket_user_delete_own_folder" on storage.objects;
drop policy if exists "profiles_bucket_admin_manage_all" on storage.objects;

create policy "profiles_bucket_public_read"
on storage.objects
for select
to public
using (bucket_id = 'profiles');

create policy "profiles_bucket_user_insert_own_folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'profiles'
  and split_part(name, '/', 1) = auth.uid()::text
);

create policy "profiles_bucket_user_update_own_folder"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'profiles'
  and split_part(name, '/', 1) = auth.uid()::text
)
with check (
  bucket_id = 'profiles'
  and split_part(name, '/', 1) = auth.uid()::text
);

create policy "profiles_bucket_user_delete_own_folder"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'profiles'
  and split_part(name, '/', 1) = auth.uid()::text
);

create policy "profiles_bucket_admin_manage_all"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'profiles'
  and public.is_admin()
)
with check (
  bucket_id = 'profiles'
  and public.is_admin()
);

-- =====================================================================
-- 5. PROCESS_LOGS
-- =====================================================================

drop policy if exists "admins_can_read_logs" on public.process_logs;
drop policy if exists "service_role_can_read_logs" on public.process_logs;
drop policy if exists "all_auth_can_read" on public.process_logs;

create policy "admins_can_read_logs"
on public.process_logs
for select
to authenticated
using (public.is_admin());

commit;
