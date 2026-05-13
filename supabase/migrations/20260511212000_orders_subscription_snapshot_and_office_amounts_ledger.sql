alter table public.orders
  add column if not exists subscription_plan_id uuid references public.subscription_plans(id),
  add column if not exists subscription_percentage_fee numeric(6,2) not null default 0,
  add column if not exists subscription_available_after_minutes integer not null default 20160,
  add column if not exists office_fee_amount_usd numeric(10,2) not null default 0,
  add column if not exists office_net_amount_usd numeric(10,2) not null default 0;

create table if not exists public.office_amounts_ledger (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  office_id uuid not null references public.offices(id) on delete cascade,
  subscription_plan_id uuid null references public.subscription_plans(id),
  gross_amount_usd numeric(10,2) not null default 0,
  fee_percentage numeric(6,2) not null default 0,
  fee_amount_usd numeric(10,2) not null default 0,
  net_amount_usd numeric(10,2) not null default 0,
  available_after_minutes integer not null default 20160,
  available_at timestamptz not null,
  payment_status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_office_amounts_ledger_office_id on public.office_amounts_ledger(office_id);
create index if not exists idx_office_amounts_ledger_available_at on public.office_amounts_ledger(available_at);
create index if not exists idx_office_amounts_ledger_payment_status on public.office_amounts_ledger(payment_status);

create or replace function public.set_order_subscription_snapshot()
returns trigger
language plpgsql
as $$
declare
  v_plan_id uuid;
  v_percentage numeric(6,2);
  v_available_minutes integer;
  v_gross numeric(10,2);
  v_fee numeric(10,2);
begin
  if new.office_id is null then
    new.subscription_plan_id := null;
    new.subscription_percentage_fee := 0;
    new.subscription_available_after_minutes := 20160;
    new.office_fee_amount_usd := 0;
    new.office_net_amount_usd := coalesce(new.total_price_usd, 0);
    return new;
  end if;

  select os.plan_id, p.percentage_fee, coalesce(p.available_after_minutes, 20160)
    into v_plan_id, v_percentage, v_available_minutes
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

  new.subscription_plan_id := v_plan_id;
  new.subscription_percentage_fee := v_percentage;
  new.subscription_available_after_minutes := greatest(1, v_available_minutes);
  new.office_fee_amount_usd := greatest(0, v_fee);
  new.office_net_amount_usd := greatest(0, round(v_gross - v_fee, 2));

  return new;
end;
$$;

drop trigger if exists trg_orders_set_subscription_snapshot on public.orders;
create trigger trg_orders_set_subscription_snapshot
before insert or update of office_id, total_price_usd
on public.orders
for each row
execute function public.set_order_subscription_snapshot();

create or replace function public.sync_office_amounts_ledger()
returns trigger
language plpgsql
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
after insert or update of office_id, total_price_usd, payment_status, created_at
on public.orders
for each row
execute function public.sync_office_amounts_ledger();

-- Backfill existing orders
update public.orders
set total_price_usd = total_price_usd
where office_id is not null;
