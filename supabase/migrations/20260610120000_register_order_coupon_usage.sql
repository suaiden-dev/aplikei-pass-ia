create or replace function public.register_order_coupon_usage(p_order_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order record;
  v_meta jsonb;
  v_coupon_id uuid;
  v_coupon_id_text text;
  v_coupon_code text;
  v_rowcount integer := 0;
begin
  select id, coupon_code, payment_metadata
  into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    return false;
  end if;

  v_meta := coalesce(v_order.payment_metadata, '{}'::jsonb);

  if v_meta ? 'coupon_usage_registered_at' then
    return false;
  end if;

  v_coupon_id_text := nullif(v_meta->>'applied_coupon_id', '');
  if v_coupon_id_text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    v_coupon_id := v_coupon_id_text::uuid;
  end if;

  v_coupon_code := upper(trim(coalesce(nullif(v_order.coupon_code, ''), nullif(v_meta->>'coupon_code', ''))));
  if v_coupon_id is null and v_coupon_code is not null and v_coupon_code <> '' then
    select id
    into v_coupon_id
    from public.discount_coupons
    where code = v_coupon_code
    limit 1;
  end if;

  if v_coupon_id is null then
    return false;
  end if;

  update public.discount_coupons
  set uses_count = coalesce(uses_count, 0) + 1
  where id = v_coupon_id;

  get diagnostics v_rowcount = row_count;
  if v_rowcount = 0 then
    return false;
  end if;

  update public.orders
  set payment_metadata = v_meta || jsonb_build_object(
    'coupon_usage_registered_at', now(),
    'coupon_usage_coupon_id', v_coupon_id::text
  )
  where id = p_order_id;

  return true;
end;
$$;

grant execute on function public.register_order_coupon_usage(uuid) to service_role;
