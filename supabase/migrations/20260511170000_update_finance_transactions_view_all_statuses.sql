-- Finance analytics: include all order statuses in recent transactions view

drop view if exists public.v_finance_transactions_master;

create view public.v_finance_transactions_master as
select
  o.id,
  o.created_at,
  o.client_name,
  o.client_email,
  o.product_slug,
  o.payment_method,
  o.payment_status,
  o.total_price_usd,
  o.office_id,
  ofc.name as office_name
from public.orders o
left join public.offices ofc on ofc.id = o.office_id;

grant select on public.v_finance_transactions_master to authenticated;
