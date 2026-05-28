begin;

insert into public.services (
  slug,
  name,
  category,
  default_price,
  default_currency,
  is_active
)
values
  (
    'analysis-motion-cos',
    'COS Motion Analysis',
    'analysis',
    50.00,
    'USD',
    true
  ),
  (
    'analysis-motion-eos',
    'EOS Motion Analysis',
    'analysis',
    50.00,
    'USD',
    true
  )
on conflict (slug) do update
set
  name = excluded.name,
  category = excluded.category,
  default_price = excluded.default_price,
  default_currency = excluded.default_currency,
  is_active = excluded.is_active,
  updated_at = now();

insert into public.services_prices (
  service_id,
  name,
  price,
  currency,
  is_active
)
values
  (
    'analysis-motion-cos',
    'COS Motion Analysis',
    50.00,
    'USD',
    true
  ),
  (
    'analysis-motion-eos',
    'EOS Motion Analysis',
    50.00,
    'USD',
    true
  )
on conflict (service_id) do update
set
  name = excluded.name,
  price = excluded.price,
  currency = excluded.currency,
  is_active = excluded.is_active;

commit;

