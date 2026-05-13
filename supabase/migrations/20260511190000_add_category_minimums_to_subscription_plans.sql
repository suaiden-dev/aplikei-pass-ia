-- Add per-category minimum charged values for plans
alter table public.subscription_plans
  add column if not exists category_minimums jsonb not null default '{}'::jsonb;

comment on column public.subscription_plans.category_minimums
  is 'Minimum charged amount per product category. Example: {student: 299.00, tourism: 199.00}';
