-- Stores discount policy rules per office
alter table public.offices
  add column if not exists discount_rules jsonb not null default '{}'::jsonb;

comment on column public.offices.discount_rules is
  'Discount policy for sellers. Keys: seller_max_pct (0-100), seller_max_fixed (USD),
   seller_allowed_types (array: percentage|fixed), seller_max_coupons (null=unlimited),
   seller_max_uses (null=unlimited), seller_min_purchase_usd.';
