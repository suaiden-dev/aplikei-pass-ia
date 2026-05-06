-- Allow public read of services for checkout
drop policy if exists "services_read_policy" on public.services;
create policy "services_public_read_policy" on public.services
  for select using (true);

-- Allow public read of offices
alter table public.offices enable row level security;
drop policy if exists "offices_public_read_policy" on public.offices;
create policy "offices_public_read_policy" on public.offices
  for select using (true);

-- Allow public read of user_service_prices for checkout
drop policy if exists "usp_public_read_policy" on public.user_service_prices;
create policy "usp_public_read_policy" on public.user_service_prices
  for select using (true);

-- Allow public read of payment methods (provider and is_active)
-- We need this to show available methods on checkout
drop policy if exists "admin_lawyer_payment_methods_public_read" on public.admin_lawyer_payment_methods;
create policy "admin_lawyer_payment_methods_public_read" on public.admin_lawyer_payment_methods
  for select using (true);
