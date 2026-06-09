alter table public.subscription_plans
  add column if not exists min_fee_per_transaction_usd numeric(10,2) default null;

alter table public.orders
  add column if not exists subscription_min_fee_per_transaction_usd numeric(10,2) default null;

alter table public.office_amounts_ledger
  add column if not exists min_fee_per_transaction_usd numeric(10,2) default null;

create or replace function public.is_main_visa_slug(p_slug text)
returns boolean
language sql
immutable
as $$
  select lower(trim(coalesce(p_slug, ''))) = any (array[
    'visto-b1-b2',
    'visa-b1b2',
    'visto-f1',
    'visa-f1',
    'visa-f1f2',
    'extensao-status',
    'visa-eos',
    'troca-status',
    'visa-cos'
  ]);
$$;

update public.subscription_plans
set min_fee_per_transaction_usd = 30.00
where name in ('Crescimento (Variável)', 'Crescimento (Variavel)', 'Scalable', 'Scalable Plan')
  or lower(name) like '%scalable%';

create or replace view public.v_office_current_subscription as
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
  p.min_monthly_fee,
  p.max_monthly_fee,
  p.available_after_minutes,
  p.min_fee_per_transaction_usd
from public.office_subscriptions os
join public.subscription_plans p on p.id = os.plan_id;

grant select on public.v_office_current_subscription to authenticated;

create or replace function public.set_order_subscription_snapshot()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_plan_id uuid;
  v_percentage numeric(6,2);
  v_available_minutes integer;
  v_min_fee_per_tx numeric(10,2);
  v_gross numeric(10,2);
  v_fee numeric(10,2);
begin
  if new.office_id is null then
    new.subscription_plan_id := null;
    new.subscription_percentage_fee := 0;
    new.subscription_available_after_minutes := 20160;
    new.subscription_min_fee_per_transaction_usd := null;
    new.office_fee_amount_usd := 0;
    new.office_net_amount_usd := coalesce(new.total_price_usd, 0);
    return new;
  end if;

  select
    os.plan_id,
    p.percentage_fee,
    coalesce(p.available_after_minutes, 20160),
    p.min_fee_per_transaction_usd
  into v_plan_id, v_percentage, v_available_minutes, v_min_fee_per_tx
  from public.office_subscriptions os
  join public.subscription_plans p on p.id = os.plan_id
  where os.office_id = new.office_id
    and os.status = 'active'
  order by os.created_at desc
  limit 1;

  v_gross := coalesce(new.total_price_usd, 0);
  v_percentage := coalesce(v_percentage, 0);
  v_available_minutes := coalesce(v_available_minutes, 20160);
  v_fee := round((v_gross * v_percentage) / 100.0, 2);

  if v_min_fee_per_tx is not null
     and public.is_main_visa_slug(coalesce(new.product_slug, ''))
     and v_fee < v_min_fee_per_tx
  then
    v_fee := v_min_fee_per_tx;
  end if;

  new.subscription_plan_id := v_plan_id;
  new.subscription_percentage_fee := v_percentage;
  new.subscription_available_after_minutes := greatest(1, v_available_minutes);
  new.subscription_min_fee_per_transaction_usd := v_min_fee_per_tx;
  new.office_fee_amount_usd := greatest(0, v_fee);
  new.office_net_amount_usd := greatest(0, round(v_gross - v_fee, 2));

  return new;
end;
$$;

drop trigger if exists trg_orders_set_subscription_snapshot on public.orders;
create trigger trg_orders_set_subscription_snapshot
before insert or update of office_id, total_price_usd, product_slug
on public.orders
for each row
execute function public.set_order_subscription_snapshot();

create or replace function public.sync_office_amounts_ledger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_available_at timestamptz;
begin
  if new.office_id is null then
    delete from public.office_amounts_ledger where order_id = new.id;
    return new;
  end if;

  v_available_at := coalesce(new.created_at, now()) + make_interval(mins => greatest(1, coalesce(new.subscription_available_after_minutes, 20160)));

  insert into public.office_amounts_ledger (
    order_id,
    office_id,
    subscription_plan_id,
    gross_amount_usd,
    fee_percentage,
    min_fee_per_transaction_usd,
    fee_amount_usd,
    net_amount_usd,
    available_after_minutes,
    available_at,
    payment_status
  )
  values (
    new.id,
    new.office_id,
    new.subscription_plan_id,
    coalesce(new.total_price_usd, 0),
    coalesce(new.subscription_percentage_fee, 0),
    new.subscription_min_fee_per_transaction_usd,
    coalesce(new.office_fee_amount_usd, 0),
    coalesce(new.office_net_amount_usd, 0),
    greatest(1, coalesce(new.subscription_available_after_minutes, 20160)),
    v_available_at,
    coalesce(new.payment_status, 'pending')
  )
  on conflict (order_id) do update
  set
    office_id = excluded.office_id,
    subscription_plan_id = excluded.subscription_plan_id,
    gross_amount_usd = excluded.gross_amount_usd,
    fee_percentage = excluded.fee_percentage,
    min_fee_per_transaction_usd = excluded.min_fee_per_transaction_usd,
    fee_amount_usd = excluded.fee_amount_usd,
    net_amount_usd = excluded.net_amount_usd,
    available_after_minutes = excluded.available_after_minutes,
    available_at = excluded.available_at,
    payment_status = excluded.payment_status,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists trg_orders_sync_office_amounts_ledger on public.orders;
create trigger trg_orders_sync_office_amounts_ledger
after insert or update of office_id, total_price_usd, product_slug, payment_status, created_at, subscription_min_fee_per_transaction_usd
on public.orders
for each row
execute function public.sync_office_amounts_ledger();
