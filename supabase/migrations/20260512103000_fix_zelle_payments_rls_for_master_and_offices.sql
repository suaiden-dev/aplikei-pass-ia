-- Fix RLS for public.zelle_payments to support new role model (master/admin_lawyer/manager)
-- and office-based visibility.

alter table public.zelle_payments enable row level security;

-- Remove legacy / conflicting policies

drop policy if exists "Admins and service role full access" on public.zelle_payments;
drop policy if exists "Service role bypasses RLS on zelle payments" on public.zelle_payments;
drop policy if exists "Users can view their own payments" on public.zelle_payments;
drop policy if exists "Usuários podem ver seus próprios pagamentos Zelle" on public.zelle_payments;
drop policy if exists "Enable insert for everyone" on public.zelle_payments;

-- Also drop any newer names if they already exist

drop policy if exists "zelle_select_own_user" on public.zelle_payments;
drop policy if exists "zelle_select_admin" on public.zelle_payments;
drop policy if exists "zelle_select_office_owner" on public.zelle_payments;
drop policy if exists "zelle_select_office_staff" on public.zelle_payments;
drop policy if exists "zelle_insert_public" on public.zelle_payments;
drop policy if exists "zelle_update_admin" on public.zelle_payments;

-- SELECT: end user can see own payment records
create policy "zelle_select_own_user"
on public.zelle_payments
for select
to authenticated
using (user_id = auth.uid());

-- SELECT: admin roles (master/manager/admin_lawyer as defined in public.is_admin)
create policy "zelle_select_admin"
on public.zelle_payments
for select
to authenticated
using (public.is_admin());

-- SELECT: office owner sees payments from own office
create policy "zelle_select_office_owner"
on public.zelle_payments
for select
to authenticated
using (
  exists (
    select 1
    from public.offices o
    where o.id = zelle_payments.office_id
      and o.owner_id = auth.uid()
  )
);

-- SELECT: office staff sees payments from own office
create policy "zelle_select_office_staff"
on public.zelle_payments
for select
to authenticated
using (
  exists (
    select 1
    from public.user_accounts ua
    where ua.id = auth.uid()
      and ua.office_id = zelle_payments.office_id
  )
);

-- INSERT: checkout flow must be able to create records (anon/authenticated)
create policy "zelle_insert_public"
on public.zelle_payments
for insert
to public
with check (true);

-- UPDATE: only admin roles can approve/reject
create policy "zelle_update_admin"
on public.zelle_payments
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());
