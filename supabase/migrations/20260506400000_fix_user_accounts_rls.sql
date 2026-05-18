-- Ensure RLS is enabled on user_accounts
alter table public.user_accounts enable row level security;

-- ── SELECT ───────────────────────────────────────────────────────────────────

-- User can read their own row (needed for office_id lookup, role check, etc.)
drop policy if exists "user_accounts_select_own" on public.user_accounts;
create policy "user_accounts_select_own" on public.user_accounts
  for select to authenticated
  using (id = auth.uid());

-- Admins and masters can read all rows
drop policy if exists "user_accounts_admin_select_all" on public.user_accounts;
create policy "user_accounts_admin_select_all" on public.user_accounts
  for select to authenticated
  using (public.is_admin());

-- ── INSERT ───────────────────────────────────────────────────────────────────

drop policy if exists "user_accounts_insert_own" on public.user_accounts;
create policy "user_accounts_insert_own" on public.user_accounts
  for insert to authenticated
  with check (id = auth.uid());

-- ── UPDATE ───────────────────────────────────────────────────────────────────

drop policy if exists "user_accounts_update_own" on public.user_accounts;
create policy "user_accounts_update_own" on public.user_accounts
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "user_accounts_admin_update_all" on public.user_accounts;
create policy "user_accounts_admin_update_all" on public.user_accounts
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());
