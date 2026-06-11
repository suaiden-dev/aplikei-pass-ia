create or replace function public.bulk_update_order_office_ids(p_updates jsonb)
returns void
language sql
security invoker
set search_path = public
as $$
  update public.orders as o
  set office_id = u.office_id
  from jsonb_to_recordset(coalesce(p_updates, '[]'::jsonb)) as u(id uuid, office_id uuid)
  where o.id = u.id
    and u.office_id is not null;
$$;

grant execute on function public.bulk_update_order_office_ids(jsonb) to authenticated;
grant execute on function public.bulk_update_order_office_ids(jsonb) to service_role;

create or replace function public.bulk_update_user_service_prices(p_updates jsonb)
returns void
language sql
security invoker
set search_path = public
as $$
  update public.user_service_prices as usp
  set
    is_active = u.is_active,
    price = u.price
  from jsonb_to_recordset(coalesce(p_updates, '[]'::jsonb)) as u(
    id uuid,
    is_active boolean,
    price numeric
  )
  where usp.id = u.id;
$$;

grant execute on function public.bulk_update_user_service_prices(jsonb) to authenticated;
grant execute on function public.bulk_update_user_service_prices(jsonb) to service_role;

create or replace function public.bulk_update_user_service_steps(p_updates jsonb)
returns void
language sql
security invoker
set search_path = public
as $$
  update public.user_services as us
  set
    current_step = u.current_step,
    status = u.status
  from jsonb_to_recordset(coalesce(p_updates, '[]'::jsonb)) as u(
    id uuid,
    current_step integer,
    status text
  )
  where us.id = u.id;
$$;

grant execute on function public.bulk_update_user_service_steps(jsonb) to authenticated;
grant execute on function public.bulk_update_user_service_steps(jsonb) to service_role;
