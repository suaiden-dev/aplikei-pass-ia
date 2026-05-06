-- When an office is created, populate user_service_prices for the owner
-- with all active services at their default prices.

create or replace function public.handle_office_created_populate_prices()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.user_service_prices (
    user_id,
    service_id,
    price,
    currency
  )
  select
    new.owner_id,
    s.id,
    s.default_price,
    s.default_currency
  from public.services s
  where s.is_active = true
  on conflict (user_id, service_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_office_created_populate_prices on public.offices;
create trigger on_office_created_populate_prices
  after insert on public.offices
  for each row
  execute function public.handle_office_created_populate_prices();

-- Fix RLS: only the price owner can update their own prices.
-- Admins/masters can read all, but cannot change individual lawyer pricing.

alter table public.user_service_prices disable row level security;

drop policy if exists "usp_lawyer_policy" on public.user_service_prices;

-- SELECT: owner sees own rows; admins/masters see all
create policy "usp_select_policy" on public.user_service_prices
  for select to authenticated
  using (
    auth.uid() = user_id
    or public.is_admin()
  );

-- UPDATE: only the price owner can change their prices
create policy "usp_update_policy" on public.user_service_prices
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- INSERT/DELETE: blocked for regular users (trigger handles population)
-- service_role bypasses RLS so the trigger still works

alter table public.user_service_prices enable row level security;

-- Backfill: populate prices for all existing office owners that have none yet
insert into public.user_service_prices (
  user_id,
  service_id,
  price,
  currency
)
select
  o.owner_id,
  s.id,
  s.default_price,
  s.default_currency
from public.offices o
cross join public.services s
where s.is_active = true
on conflict (user_id, service_id) do nothing;
