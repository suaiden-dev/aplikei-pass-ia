begin;

-- ─── fulfill_paid_order ──────────────────────────────────────────────────────
-- Cria a user_product_instance (e seus user_steps) quando uma order vai pra paid.
-- Idempotente: se já houver UPI para a order, não duplica.
-- Caso o produto seja subproduct (ex: slot de dependente), delega para
-- aplikei.add_dependent_slot(instance_id, order_id) usando metadata.parent_instance_id.

create or replace function aplikei.fulfill_paid_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = aplikei, public
as $$
declare
  v_order              record;
  v_product_id         uuid;
  v_product_type       aplikei.product_type;
  v_existing           uuid;
  v_parent_instance_id uuid;
begin
  select id, user_id, status, metadata
  into v_order
  from aplikei.orders
  where id = p_order_id;

  if v_order.id is null then return; end if;
  if v_order.status != 'paid' then return; end if;

  -- Resolve produto pelo slug em metadata
  select id, type
  into v_product_id, v_product_type
  from aplikei.products
  where slug = (v_order.metadata->>'product_slug');

  if v_product_id is null then
    raise notice 'fulfill_paid_order: produto não encontrado para order %', p_order_id;
    return;
  end if;

  -- Subproduto: incrementa slot na instance pai
  if v_product_type = 'subproduct' then
    v_parent_instance_id := nullif(v_order.metadata->>'parent_instance_id', '')::uuid;
    if v_parent_instance_id is null then
      raise notice 'fulfill_paid_order: subproduct sem parent_instance_id (order %)', p_order_id;
      return;
    end if;
    perform aplikei.add_dependent_slot(v_parent_instance_id, v_order.id);
    return;
  end if;

  -- Idempotência: já criou UPI pra essa order?
  select id into v_existing
  from aplikei.user_product_instances
  where order_id = p_order_id
  limit 1;

  if v_existing is not null then return; end if;

  -- Caso principal: cria instance + user_steps
  perform aplikei.start_product_instance(v_order.user_id, v_product_id, v_order.id);
end;
$$;

-- ─── Trigger: on_order_paid ──────────────────────────────────────────────────

create or replace function aplikei.trigger_fulfill_paid_order()
returns trigger
language plpgsql
security definer
set search_path = aplikei, public
as $$
begin
  if new.status = 'paid' and (old.status is distinct from 'paid') then
    perform aplikei.fulfill_paid_order(new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists on_order_paid on aplikei.orders;
create trigger on_order_paid
  after update of status on aplikei.orders
  for each row execute function aplikei.trigger_fulfill_paid_order();

-- ─── Backfill: orders já pagas sem UPI ───────────────────────────────────────

do $$
declare
  r record;
begin
  for r in
    select o.id
    from aplikei.orders o
    where o.status = 'paid'
      and not exists (
        select 1 from aplikei.user_product_instances upi
        where upi.order_id = o.id
      )
  loop
    perform aplikei.fulfill_paid_order(r.id);
  end loop;
end $$;

grant execute on function aplikei.fulfill_paid_order(uuid) to authenticated;

commit;
