alter table public.subscription_plans
  add column if not exists available_after_days integer not null default 14;

alter table public.subscription_plans
  drop constraint if exists subscription_plans_available_after_days_check;

alter table public.subscription_plans
  add constraint subscription_plans_available_after_days_check
  check (available_after_days between 1 and 14);

comment on column public.subscription_plans.available_after_days
  is 'Dias para o valor ficar disponível para saque (1 a 14).';
