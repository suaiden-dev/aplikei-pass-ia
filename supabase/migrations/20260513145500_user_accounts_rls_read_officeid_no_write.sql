-- Allow authenticated users to read their own office_id via RLS,
-- but prevent them from changing office_id themselves.

-- Helper: returns current user's office_id from table (bypass RLS safely)
create or replace function public.current_user_office_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select office_id
  from public.user_accounts
  where id = auth.uid()
  limit 1;
$$;

revoke all on function public.current_user_office_id() from public;
grant execute on function public.current_user_office_id() to authenticated;

alter table public.user_accounts enable row level security;

-- Read own row (includes office_id)
drop policy if exists "user_accounts_select_own" on public.user_accounts;
create policy "user_accounts_select_own"
  on public.user_accounts
  for select
  to authenticated
  using (id = auth.uid());

-- Update own profile, but keep office_id immutable for non-admin users
drop policy if exists "user_accounts_update_own" on public.user_accounts;
create policy "user_accounts_update_own"
  on public.user_accounts
  for update
  to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and office_id is not distinct from public.current_user_office_id()
  );

-- Keep admin policy (full update) intact
-- If your project already has this policy, this is harmless idempotent setup.
drop policy if exists "user_accounts_admin_update_all" on public.user_accounts;
create policy "user_accounts_admin_update_all"
  on public.user_accounts
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
