-- Finance analytics performance indexes for orders queries

-- 1) Filters by payment_status in analytics view/RPC
create index if not exists idx_orders_payment_status
  on public.orders (payment_status);

-- 2) Time-window scans in monthly aggregation
create index if not exists idx_orders_created_at
  on public.orders (created_at desc);

-- 3) Office/month rollups and office-level drilldowns
create index if not exists idx_orders_office_id_created_at
  on public.orders (office_id, created_at desc);

-- 4) Optional targeted index for paid-like statuses to speed analytics path
create index if not exists idx_orders_paidlike_created_at
  on public.orders (created_at desc)
  where payment_status in ('paid', 'approved', 'complete', 'completed', 'succeeded');
