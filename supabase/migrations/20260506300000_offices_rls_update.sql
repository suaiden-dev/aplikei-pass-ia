-- Allow admins/masters to update any office
-- Allow admin_lawyers to update their own office (owner_id = auth.uid())

drop policy if exists "offices_update_policy" on public.offices;
create policy "offices_update_policy" on public.offices
  for update to authenticated
  using (
    public.is_admin()
    or owner_id = auth.uid()
  )
  with check (
    public.is_admin()
    or owner_id = auth.uid()
  );

drop policy if exists "offices_insert_policy" on public.offices;
create policy "offices_insert_policy" on public.offices
  for insert to authenticated
  with check (
    public.is_admin()
    or owner_id = auth.uid()
  );
