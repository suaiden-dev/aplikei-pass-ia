-- Backfill: link standalone mentorship/consultancy processes to original parent process
-- so "Ver processo" in chat can route to the main visa process.

with standalone_targets as (
  select
    us.id as user_service_id,
    us.user_id,
    us.service_slug
  from public.user_services us
  where (
    us.service_slug like 'mentoring-%'
    or us.service_slug like 'mentoria-%'
    or us.service_slug in (
      'consultoria-especialista',
      'consultancy-negative-b1b2',
      'consultoria-f1-negativa',
      'mentoria-negativa-consular'
    )
  )
  and coalesce(us.step_data->>'parent_process_id', '') = ''
),
latest_paid_order_link as (
  select distinct on (st.user_service_id)
    st.user_service_id,
    nullif(
      coalesce(
        o.payment_metadata->>'proc_id',
        o.payment_metadata->>'processId',
        o.payment_metadata->>'parent_process_id'
      ),
      ''
    ) as parent_process_id,
    nullif(o.payment_metadata->>'parent_service_slug', '') as parent_service_slug
  from standalone_targets st
  join public.orders o
    on o.user_id = st.user_id
   and o.product_slug = st.service_slug
  where o.payment_status in ('paid', 'complete', 'completed', 'succeeded')
  order by st.user_service_id, o.created_at desc
),
update_parent_id as (
  update public.user_services us
  set step_data = jsonb_strip_nulls(
    coalesce(us.step_data, '{}'::jsonb) ||
    jsonb_build_object(
      'parent_process_id', l.parent_process_id,
      'parent_service_slug', l.parent_service_slug
    )
  )
  from latest_paid_order_link l
  where us.id = l.user_service_id
    and l.parent_process_id is not null
  returning us.id, l.parent_process_id
)
update public.user_services us
set step_data = jsonb_strip_nulls(
  coalesce(us.step_data, '{}'::jsonb) ||
  jsonb_build_object('parent_service_slug', parent_us.service_slug)
)
from update_parent_id u
join public.user_services parent_us
  on parent_us.id::text = u.parent_process_id
where us.id = u.id
  and coalesce(us.step_data->>'parent_service_slug', '') = '';

