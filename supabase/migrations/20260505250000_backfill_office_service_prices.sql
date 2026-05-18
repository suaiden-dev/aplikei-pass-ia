-- Backfill user_service_prices for all existing offices that have no prices yet.
-- Needed for offices created before the office_id migration.

insert into public.user_service_prices (office_id, service_id, price, currency)
select
  o.id,
  s.id,
  s.default_price,
  s.default_currency
from public.offices o
cross join public.services s
where s.is_active = true
on conflict (office_id, service_id) do nothing;
