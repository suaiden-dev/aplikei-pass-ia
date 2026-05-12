alter table public.orders
  add column if not exists seller_id uuid references auth.users(id) on delete set null;

create index if not exists idx_orders_seller_id on public.orders(seller_id);

-- Seller pode ver os próprios pedidos referenciados
drop policy if exists "orders_select_seller_ref" on public.orders;
create policy "orders_select_seller_ref" on public.orders
  for select to authenticated
  using (seller_id = auth.uid());
