-- ── orders ───────────────────────────────────────────────────────────────────

alter table public.orders enable row level security;

-- Customer vê seus próprios pedidos
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own" on public.orders
  for select to authenticated
  using (user_id = auth.uid());

-- Admin/master vê todos
drop policy if exists "orders_select_admin" on public.orders;
create policy "orders_select_admin" on public.orders
  for select to authenticated
  using (public.is_admin());

-- Office owner (admin_lawyer) vê pedidos da sua office
drop policy if exists "orders_select_office_owner" on public.orders;
create policy "orders_select_office_owner" on public.orders
  for select to authenticated
  using (
    exists (
      select 1 from public.offices
      where offices.id = orders.office_id
        and offices.owner_id = auth.uid()
    )
  );

-- Staff da office (manager, seller) vê pedidos da office à qual está vinculado
drop policy if exists "orders_select_office_staff" on public.orders;
create policy "orders_select_office_staff" on public.orders
  for select to authenticated
  using (
    exists (
      select 1 from public.user_accounts ua
      where ua.id = auth.uid()
        and ua.office_id = orders.office_id
    )
  );

-- Insert: autenticado pode criar pedido
drop policy if exists "orders_insert_authenticated" on public.orders;
create policy "orders_insert_authenticated" on public.orders
  for insert to authenticated
  with check (true);

-- Insert: anon pode criar pedido (checkout sem conta)
drop policy if exists "orders_insert_anon" on public.orders;
create policy "orders_insert_anon" on public.orders
  for insert to anon
  with check (true);

-- Update: apenas admin
drop policy if exists "orders_update_admin" on public.orders;
create policy "orders_update_admin" on public.orders
  for update to authenticated
  using (public.is_admin());

-- ── services ─────────────────────────────────────────────────────────────────
-- Já existe services_public_read_policy (using true), mas garantimos aqui

alter table public.services enable row level security;

drop policy if exists "services_public_read_policy" on public.services;
create policy "services_public_read_policy" on public.services
  for select
  using (true);
