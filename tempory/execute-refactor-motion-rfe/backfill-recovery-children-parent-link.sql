-- Backfill recovery child rows with missing parent_process_id/parent_service_slug
-- Run dry-run block first. Execute update block only after validation.

-- 1) DRY RUN: rows that look like recovery children but have no parent link
with recovery_children as (
  select
    us.id,
    us.user_id,
    us.service_slug,
    us.created_at,
    us.step_data,
    nullif(coalesce(us.step_data->>'parent_process_id', ''), '') as current_parent_process_id,
    nullif(coalesce(us.step_data->>'parent_service_slug', ''), '') as current_parent_service_slug
  from public.user_services us
  where (
    lower(us.service_slug) like '%motion%'
    or lower(us.service_slug) like '%rfe%'
    or lower(us.service_slug) like 'recovery-%'
    or lower(us.service_slug) like 'analise-%'
    or lower(us.service_slug) like 'analysis-%'
    or lower(us.service_slug) like 'apoio-%'
  )
),
missing_parent as (
  select *
  from recovery_children
  where current_parent_process_id is null
),
resolved as (
  select distinct on (mp.id)
    mp.id as user_service_id,
    coalesce(
      nullif(o.payment_metadata->>'parent_process_id', ''),
      nullif(o.payment_metadata->>'proc_id', ''),
      nullif(o.payment_metadata->>'processId', '')
    ) as resolved_parent_process_id,
    nullif(o.payment_metadata->>'parent_service_slug', '') as resolved_parent_service_slug,
    o.id as source_order_id,
    o.created_at as source_order_created_at
  from missing_parent mp
  join public.orders o
    on o.user_id = mp.user_id
  where
    o.payment_status in ('paid', 'complete', 'completed', 'succeeded')
    and (
      o.product_slug = mp.service_slug
      or (
        o.payment_metadata->>'service_slug' = mp.service_slug
      )
    )
  order by mp.id, o.created_at desc
)
select
  mp.id as user_service_id,
  mp.user_id,
  mp.service_slug,
  r.resolved_parent_process_id,
  r.resolved_parent_service_slug,
  r.source_order_id,
  r.source_order_created_at
from missing_parent mp
left join resolved r
  on r.user_service_id = mp.id
order by mp.created_at desc;

-- 2) UPDATE (run only after reviewing dry-run output)
-- with recovery_children as (
--   select
--     us.id,
--     us.user_id,
--     us.service_slug,
--     us.step_data
--   from public.user_services us
--   where (
--     lower(us.service_slug) like '%motion%'
--     or lower(us.service_slug) like '%rfe%'
--     or lower(us.service_slug) like 'recovery-%'
--     or lower(us.service_slug) like 'analise-%'
--     or lower(us.service_slug) like 'analysis-%'
--     or lower(us.service_slug) like 'apoio-%'
--   )
-- ),
-- missing_parent as (
--   select *
--   from recovery_children
--   where nullif(coalesce(step_data->>'parent_process_id', ''), '') is null
-- ),
-- resolved as (
--   select distinct on (mp.id)
--     mp.id as user_service_id,
--     coalesce(
--       nullif(o.payment_metadata->>'parent_process_id', ''),
--       nullif(o.payment_metadata->>'proc_id', ''),
--       nullif(o.payment_metadata->>'processId', '')
--     ) as resolved_parent_process_id,
--     nullif(o.payment_metadata->>'parent_service_slug', '') as resolved_parent_service_slug
--   from missing_parent mp
--   join public.orders o
--     on o.user_id = mp.user_id
--   where
--     o.payment_status in ('paid', 'complete', 'completed', 'succeeded')
--     and (
--       o.product_slug = mp.service_slug
--       or o.payment_metadata->>'service_slug' = mp.service_slug
--     )
--   order by mp.id, o.created_at desc
-- )
-- update public.user_services us
-- set
--   step_data = coalesce(us.step_data, '{}'::jsonb) ||
--     jsonb_build_object(
--       'parent_process_id', r.resolved_parent_process_id,
--       'parent_service_slug', r.resolved_parent_service_slug
--     )
-- from resolved r
-- where
--   us.id = r.user_service_id
--   and r.resolved_parent_process_id is not null;

