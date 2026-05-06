-- ─── 1. Table ────────────────────────────────────────────────────────────────
create table if not exists public.office_customers (
  id         uuid        primary key default gen_random_uuid(),
  office_id  uuid        not null references public.offices(id)   on delete cascade,
  user_id    uuid        not null references auth.users(id)        on delete cascade,
  created_at timestamptz not null default now(),
  constraint office_customers_unique unique (office_id, user_id)
);

-- ─── 2. RLS ──────────────────────────────────────────────────────────────────
alter table public.office_customers enable row level security;

-- Office owner sees their own customers
create policy "office_customers_owner_select" on public.office_customers
  for select to authenticated
  using (
    exists (
      select 1 from public.offices
      where offices.id = office_id
        and offices.owner_id = auth.uid()
    )
    or public.is_admin()
  );

-- Only the system (security definer trigger) inserts; admins can also insert
create policy "office_customers_admin_insert" on public.office_customers
  for insert to authenticated
  with check (public.is_admin());

-- ─── 3. Trigger function ─────────────────────────────────────────────────────
create or replace function public.sync_office_customer()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.office_id is not null and new.user_id is not null then
    insert into public.office_customers (office_id, user_id)
    values (new.office_id, new.user_id)
    on conflict (office_id, user_id) do nothing;
  end if;
  return new;
end;
$$;

-- Fires on insert or when office_id is set/updated in user_services
drop trigger if exists trg_sync_office_customer on public.user_services;
create trigger trg_sync_office_customer
  after insert or update of office_id
  on public.user_services
  for each row
  execute function public.sync_office_customer();

-- Also fires when office_id is set on orders (guest checkouts)
drop trigger if exists trg_sync_office_customer_orders on public.orders;
create trigger trg_sync_office_customer_orders
  after insert or update of office_id
  on public.orders
  for each row
  execute function public.sync_office_customer();

-- ─── 4. Backfill from existing user_services ─────────────────────────────────
insert into public.office_customers (office_id, user_id)
select distinct office_id, user_id
from public.user_services
where office_id is not null
  and user_id is not null
on conflict (office_id, user_id) do nothing;

-- ─── 5. Backfill from existing orders (registered users only) ────────────────
insert into public.office_customers (office_id, user_id)
select distinct office_id, user_id
from public.orders
where office_id is not null
  and user_id is not null
on conflict (office_id, user_id) do nothing;
