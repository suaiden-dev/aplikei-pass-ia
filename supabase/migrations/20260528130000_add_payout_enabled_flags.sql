alter table public.office_payment_settings
  add column if not exists stripe_enabled boolean not null default false,
  add column if not exists zelle_enabled boolean not null default false;
