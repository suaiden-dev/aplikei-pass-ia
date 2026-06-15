-- Agnostic subscription core
-- Adds versioning, immutable history, and richer order snapshots while keeping the current office subscription contract stable.

alter table public.subscription_plans
  add column if not exists version integer not null default 1,
  add column if not exists billing_model text not null default 'prepaid',
  add column if not exists rules jsonb not null default '{}'::jsonb,
  add column if not exists effective_from timestamptz,
  add column if not exists effective_to timestamptz;

alter table public.office_subscriptions
  add column if not exists plan_version integer not null default 1,
  add column if not exists billing_model text not null default 'prepaid',
  add column if not exists rules_snapshot jsonb not null default '{}'::jsonb,
  add column if not exists effective_from timestamptz not null default now(),
  add column if not exists effective_to timestamptz,
  add column if not exists canceled_at timestamptz;

alter table public.billing_cycles
  add column if not exists plan_version integer not null default 1,
  add column if not exists billing_model text not null default 'prepaid',
  add column if not exists rules_snapshot jsonb not null default '{}'::jsonb;

alter table public.orders
  add column if not exists subscription_id uuid references public.office_subscriptions(id),
  add column if not exists subscription_plan_version integer not null default 1,
  add column if not exists subscription_pricing_model text not null default 'FIXED',
  add column if not exists subscription_rules_snapshot jsonb not null default '{}'::jsonb,
  add column if not exists subscription_effective_from timestamptz,
  add column if not exists subscription_effective_to timestamptz,
  add column if not exists subscription_fee_mode text not null default 'prepaid',
  add column if not exists subscription_fixed_fee numeric(12,2) not null default 0,
  add column if not exists subscription_max_fee_per_transaction_usd numeric(12,2),
  add column if not exists subscription_snapshot_created_at timestamptz;

create table if not exists public.office_subscription_versions (
  id uuid primary key default gen_random_uuid(),
  office_subscription_id uuid not null references public.office_subscriptions(id) on delete cascade,
  office_id uuid not null references public.offices(id) on delete cascade,
  plan_id uuid not null references public.subscription_plans(id),
  plan_version integer not null default 1,
  status public.subscription_status not null default 'active',
  billing_model text not null default 'prepaid',
  effective_from timestamptz not null default now(),
  effective_to timestamptz,
  current_period_start timestamptz not null,
  current_period_end timestamptz not null,
  cancel_at_period_end boolean not null default false,
  rules_snapshot jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_office_subscription_versions_office_id_created_at
  on public.office_subscription_versions (office_id, created_at desc);

create index if not exists idx_office_subscription_versions_subscription_id
  on public.office_subscription_versions (office_subscription_id);

create or replace function public.get_office_subscription_at(
  p_office_id uuid,
  p_at timestamptz default now()
)
returns table (
  subscription_id uuid,
  office_id uuid,
  status public.subscription_status,
  plan_id uuid,
  plan_version integer,
  billing_model text,
  effective_from timestamptz,
  effective_to timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean,
  plan_name text,
  plan_type public.subscription_plan_type,
  fixed_fee numeric,
  percentage_fee numeric,
  min_monthly_fee numeric,
  max_monthly_fee numeric,
  min_fee_per_transaction_usd numeric,
  rules_snapshot jsonb
)
language sql
stable
set search_path = public
as $$
  select
    os.id as subscription_id,
    os.office_id,
    os.status,
    os.plan_id,
    coalesce(os.plan_version, p.version, 1) as plan_version,
    coalesce(os.billing_model, p.billing_model, 'prepaid') as billing_model,
    coalesce(os.effective_from, os.current_period_start, now()) as effective_from,
    os.effective_to,
    os.current_period_start,
    os.current_period_end,
    os.cancel_at_period_end,
    p.name as plan_name,
    p.type as plan_type,
    p.fixed_fee,
    p.percentage_fee,
    p.min_monthly_fee,
    p.max_monthly_fee,
    p.min_fee_per_transaction_usd,
    coalesce(os.rules_snapshot, p.rules, '{}'::jsonb) as rules_snapshot
  from public.office_subscriptions os
  join public.subscription_plans p on p.id = os.plan_id
  where os.office_id = p_office_id
    and os.status in ('active', 'trialing')
    and coalesce(os.effective_from, os.current_period_start, now()) <= p_at
    and (os.effective_to is null or os.effective_to > p_at)
  order by coalesce(os.effective_from, os.current_period_start, now()) desc, os.created_at desc
  limit 1;
$$;

drop view if exists public.v_office_current_subscription;

create view public.v_office_current_subscription as
select
  os.id as subscription_id,
  os.office_id,
  os.status,
  os.plan_id,
  coalesce(os.plan_version, p.version, 1) as plan_version,
  coalesce(os.billing_model, p.billing_model, 'prepaid') as billing_model,
  coalesce(os.effective_from, os.current_period_start, now()) as effective_from,
  os.effective_to,
  os.current_period_start,
  os.current_period_end,
  os.cancel_at_period_end,
  p.name as plan_name,
  p.type as plan_type,
  p.fixed_fee,
  p.percentage_fee,
  p.min_monthly_fee,
  p.max_monthly_fee,
  p.min_fee_per_transaction_usd,
  coalesce(os.rules_snapshot, p.rules, '{}'::jsonb) as rules_snapshot
from public.office_subscriptions os
join public.subscription_plans p on p.id = os.plan_id
where os.status in ('active', 'trialing')
  and coalesce(os.effective_from, os.current_period_start, now()) <= now()
  and (os.effective_to is null or os.effective_to > now());

create or replace view public.v_office_subscription_history as
select
  osv.id,
  osv.office_subscription_id,
  osv.office_id,
  osv.plan_id,
  osv.plan_version,
  osv.status,
  osv.billing_model,
  osv.effective_from,
  osv.effective_to,
  osv.current_period_start,
  osv.current_period_end,
  osv.cancel_at_period_end,
  osv.rules_snapshot,
  osv.metadata,
  osv.created_at,
  p.name as plan_name,
  p.type as plan_type,
  p.fixed_fee,
  p.percentage_fee,
  p.min_monthly_fee,
  p.max_monthly_fee,
  p.min_fee_per_transaction_usd
from public.office_subscription_versions osv
join public.subscription_plans p on p.id = osv.plan_id;

grant select on public.v_office_current_subscription to authenticated;
grant select on public.v_office_subscription_history to authenticated;

create or replace function public.capture_office_subscription_version()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.office_subscription_versions (
    office_subscription_id,
    office_id,
    plan_id,
    plan_version,
    status,
    billing_model,
    effective_from,
    effective_to,
    current_period_start,
    current_period_end,
    cancel_at_period_end,
    rules_snapshot,
    metadata
  )
  values (
    new.id,
    new.office_id,
    new.plan_id,
    coalesce(new.plan_version, 1),
    new.status,
    coalesce(new.billing_model, 'prepaid'),
    coalesce(new.effective_from, new.current_period_start, now()),
    new.effective_to,
    new.current_period_start,
    new.current_period_end,
    new.cancel_at_period_end,
    coalesce(new.rules_snapshot, '{}'::jsonb),
    coalesce(new.metadata, '{}'::jsonb)
  );

  return new;
end;
$$;

drop trigger if exists trg_capture_office_subscription_version on public.office_subscriptions;
create trigger trg_capture_office_subscription_version
after insert or update of plan_id, status, current_period_start, current_period_end, cancel_at_period_end, effective_from, effective_to, plan_version, billing_model, rules_snapshot
on public.office_subscriptions
for each row
execute function public.capture_office_subscription_version();

create or replace function public.set_order_subscription_snapshot()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_subscription record;
  v_gross numeric(12,2);
  v_fee numeric(12,2);
  v_snapshot_at timestamptz;
begin
  v_snapshot_at := coalesce(new.created_at, now());

  if new.office_id is null then
    new.subscription_id := null;
    new.subscription_plan_id := null;
    new.subscription_plan_version := 1;
    new.subscription_pricing_model := 'FIXED';
    new.subscription_rules_snapshot := '{}'::jsonb;
    new.subscription_effective_from := null;
    new.subscription_effective_to := null;
    new.subscription_fee_mode := 'prepaid';
    new.subscription_percentage_fee := 0;
    new.subscription_fixed_fee := 0;
    new.subscription_min_fee_per_transaction_usd := null;
    new.subscription_max_fee_per_transaction_usd := null;
    new.subscription_snapshot_created_at := v_snapshot_at;
    new.subscription_available_after_minutes := 20160;
    new.office_fee_amount_usd := 0;
    new.office_net_amount_usd := coalesce(new.total_price_usd, 0);
    return new;
  end if;

  select *
  into v_subscription
  from public.get_office_subscription_at(new.office_id, v_snapshot_at);

  v_gross := coalesce(new.total_price_usd, 0);
  v_fee := round(
    greatest(
      0,
      case
        when v_subscription.plan_type = 'FIXED' then coalesce(v_subscription.fixed_fee, 0)
        when v_subscription.plan_type = 'PERCENTAGE' then (v_gross * coalesce(v_subscription.percentage_fee, 0) / 100.0)
        when v_subscription.plan_type = 'HYBRID' then coalesce(v_subscription.fixed_fee, 0) + (v_gross * coalesce(v_subscription.percentage_fee, 0) / 100.0)
        else 0
      end
    ),
    2
  );

  if v_subscription.min_fee_per_transaction_usd is not null
     and lower(coalesce(new.product_slug, '')) = any (array['visto-b1-b2', 'visa-b1b2', 'visto-f1', 'visa-f1', 'visa-f1f2', 'extensao-status', 'visa-eos', 'troca-status', 'visa-cos'])
     and v_fee < v_subscription.min_fee_per_transaction_usd
  then
    v_fee := v_subscription.min_fee_per_transaction_usd;
  end if;

  new.subscription_id := v_subscription.subscription_id;
  new.subscription_plan_id := v_subscription.plan_id;
  new.subscription_plan_version := coalesce(v_subscription.plan_version, 1);
  new.subscription_pricing_model := coalesce(v_subscription.plan_type::text, 'FIXED');
  new.subscription_rules_snapshot := coalesce(v_subscription.rules_snapshot, '{}'::jsonb);
  new.subscription_effective_from := v_subscription.effective_from;
  new.subscription_effective_to := v_subscription.effective_to;
  new.subscription_fee_mode := coalesce(v_subscription.billing_model, 'prepaid');
  new.subscription_percentage_fee := coalesce(v_subscription.percentage_fee, 0);
  new.subscription_fixed_fee := coalesce(v_subscription.fixed_fee, 0);
  new.subscription_min_fee_per_transaction_usd := v_subscription.min_fee_per_transaction_usd;
  new.subscription_max_fee_per_transaction_usd := v_subscription.max_monthly_fee;
  new.subscription_snapshot_created_at := v_snapshot_at;
  new.subscription_available_after_minutes := greatest(1, coalesce(new.subscription_available_after_minutes, 20160));
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
