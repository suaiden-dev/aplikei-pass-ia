drop view if exists public.v_office_current_subscription;

create view public.v_office_current_subscription as
select
  os.id as subscription_id,
  os.office_id,
  os.status,
  os.current_period_start,
  os.current_period_end,
  p.name as plan_name,
  p.type as plan_type,
  p.fixed_fee,
  p.percentage_fee,
  p.available_after_minutes
from public.office_subscriptions os
join public.subscription_plans p on os.plan_id = p.id
where os.status = 'active';

grant select on public.v_office_current_subscription to authenticated;
