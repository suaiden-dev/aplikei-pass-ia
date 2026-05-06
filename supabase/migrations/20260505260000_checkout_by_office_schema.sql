-- offices: add slug column
alter table public.offices
  add column if not exists slug text unique;

-- Generate slug from name
update public.offices
  set slug = lower(regexp_replace(trim(name), '\s+', '-', 'g'))
  where slug is null;

-- Make slug not null
alter table public.offices
  alter column slug set not null;

-- orders: add office_id
alter table public.orders
  add column if not exists office_id uuid references public.offices(id);

-- user_services: add office_id
alter table public.user_services
  add column if not exists office_id uuid references public.offices(id);

-- zelle_payments: add office_id
alter table public.zelle_payments
  add column if not exists office_id uuid references public.offices(id);
