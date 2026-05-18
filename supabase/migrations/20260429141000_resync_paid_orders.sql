begin;

-- Recupera pagamentos já confirmados cujo pedido/processo não foi sincronizado.
-- Isso cobre checkouts concluídos antes de a confirmação/webhook reforçarem os RPCs.

do $$
declare
  r record;
begin
  for r in
    select distinct order_id
    from aplikei.payments
    where status in ('succeeded', 'failed', 'canceled')
  loop
    perform aplikei.sync_order_status(r.order_id);
  end loop;

  for r in
    select o.id
    from aplikei.orders o
    where o.status = 'paid'
      and not exists (
        select 1
        from aplikei.user_product_instances upi
        where upi.order_id = o.id
      )
  loop
    perform aplikei.fulfill_paid_order(r.id);
  end loop;
end $$;

commit;
