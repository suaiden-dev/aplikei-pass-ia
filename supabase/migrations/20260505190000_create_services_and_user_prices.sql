-- 1. Create services table (Fixed catalog)
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),

  slug text unique not null,
  name text not null,
  description text,
  category text not null,

  default_price numeric(10,2) not null,
  default_currency text not null default 'USD',

  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Create user_service_prices table (Custom prices per admin_lawyer)
create table if not exists public.user_service_prices (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references auth.users(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,

  price numeric(10,2) not null,
  currency text not null default 'USD',

  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(user_id, service_id)
);

-- 3. RLS Policies
alter table public.services enable row level security;
alter table public.user_service_prices enable row level security;

-- Services: Read for all authenticated users, Write only for admins/managers/masters
drop policy if exists "services_read_policy" on public.services;
create policy "services_read_policy" on public.services
  for select to authenticated using (true);

drop policy if exists "services_admin_policy" on public.services;
create policy "services_admin_policy" on public.services
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- User Service Prices:
-- Admin Lawers can see and edit their own prices.
-- Admins/Managers/Masters can see and edit all.
-- Regular users (customers) might need to see prices of a specific lawyer (if they are linked to one).

drop policy if exists "usp_lawyer_policy" on public.user_service_prices;
create policy "usp_lawyer_policy" on public.user_service_prices
  for all to authenticated
  using (
    auth.uid() = user_id or public.is_admin()
  )
  with check (
    auth.uid() = user_id or public.is_admin()
  );

-- 4. Triggers for updated_at
create trigger set_services_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

create trigger set_usp_updated_at
  before update on public.user_service_prices
  for each row execute function public.set_updated_at();

-- 5. Logic to auto-populate user_service_prices when a user becomes an admin_lawyer
create or replace function public.handle_admin_lawyer_service_prices()
returns trigger
language plpgsql
security definer
as $$
begin
  -- When a user is updated to 'admin_lawyer', populate their prices
  if (new.role = 'admin_lawyer' and (old.role is distinct from 'admin_lawyer')) then
    insert into public.user_service_prices (
      user_id,
      service_id,
      price,
      currency
    )
    select
      new.id,
      id,
      default_price,
      default_currency
    from public.services
    where is_active = true
    on conflict (user_id, service_id) do nothing;
  end if;
  return new;
end;
$$;

-- Attach trigger to user_accounts
drop trigger if exists on_user_role_change_populate_prices on public.user_accounts;
create trigger on_user_role_change_populate_prices
  after update of role on public.user_accounts
  for each row
  execute function public.handle_admin_lawyer_service_prices();

-- 5.1 Populate prices for existing admin_lawyers
insert into public.user_service_prices (
  user_id,
  service_id,
  price,
  currency
)
select
  ua.id,
  s.id,
  s.default_price,
  s.default_currency
from public.user_accounts ua
cross join public.services s
where ua.role = 'admin_lawyer'
  and s.is_active = true
on conflict (user_id, service_id) do nothing;

-- 6. Initial Seed Data (English)
insert into public.services (slug, name, description, category, default_price, default_currency)
values
  -- Main Visa Products
  ('visa-b1b2', 'B1/B2 Visa', 'Business and Tourism Visa process', 'Visa Products', 200.00, 'USD'),
  ('visa-f1', 'F-1 Student Visa', 'Academic Student Visa process', 'Visa Products', 350.00, 'USD'),
  ('visa-cos', 'Change of Status (COS)', 'Change of non-immigrant status within the US', 'Visa Products', 500.00, 'USD'),
  ('visa-eos', 'Extension of Status (EOS)', 'Extension of stay within the US', 'Visa Products', 350.00, 'USD'),

  -- Dependents
  ('dependent-b1b2', 'B1/B2 Dependent', 'Additional dependent for B1/B2 process', 'Dependents', 50.00, 'USD'),
  ('dependent-f1', 'F-1 Dependent', 'Additional dependent for F-1 process', 'Dependents', 100.00, 'USD'),
  ('dependent-cos', 'COS Dependent', 'Additional dependent for COS process', 'Dependents', 75.00, 'USD'),
  ('dependent-eos', 'EOS Dependent', 'Additional dependent for EOS process', 'Dependents', 75.00, 'USD'),

  -- Analyses
  ('analysis-rfe-cos', 'RFE Analysis (COS)', 'Professional analysis of Request for Evidence for COS', 'Analyses', 200.00, 'USD'),
  ('analysis-rfe-eos', 'RFE Analysis (EOS)', 'Professional analysis of Request for Evidence for EOS', 'Analyses', 200.00, 'USD'),

  -- Mentoring
  ('mentoring-bronze', 'Bronze Mentoring', 'Basic mentoring session', 'Mentoring', 300.00, 'USD'),
  ('mentoring-silver', 'Silver Mentoring', 'Standard mentoring program', 'Mentoring', 500.00, 'USD'),
  ('mentoring-gold', 'Gold Mentoring', 'Premium mentoring program', 'Mentoring', 800.00, 'USD'),

  -- Consultancy
  ('consultancy-motion-eos', 'Motion Consultancy (EOS)', 'Advanced consultancy for Motion to Reopen/Reconsider (EOS)', 'Consultancy', 250.00, 'USD'),
  ('consultancy-motion-cos', 'Motion Consultancy (COS)', 'Advanced consultancy for Motion to Reopen/Reconsider (COS)', 'Consultancy', 250.00, 'USD'),
  ('consultancy-negative-b1b2', 'B1/B2 Negative Case', 'Specialized consultancy for previous B1/B2 denials', 'Consultancy', 300.00, 'USD'),
  ('consultancy-negative-f1', 'F-1 Negative Case', 'Specialized consultancy for previous F-1 denials', 'Consultancy', 300.00, 'USD')
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  default_price = excluded.default_price,
  default_currency = excluded.default_currency;
