begin;

-- 1) Backup de segurança para dados legados antes de limpeza
create table if not exists public._legacy_aplikei_orders_backup (
  backed_up_at timestamptz not null default now(),
  payload jsonb not null
);
insert into public._legacy_aplikei_orders_backup(payload)
select to_jsonb(t)
from aplikei.orders t;

create table if not exists public._legacy_aplikei_notifications_backup (
  backed_up_at timestamptz not null default now(),
  payload jsonb not null
);
insert into public._legacy_aplikei_notifications_backup(payload)
select to_jsonb(t)
from aplikei.notifications t;

create table if not exists public._legacy_aplikei_payment_events_backup (
  backed_up_at timestamptz not null default now(),
  payload jsonb not null
);
insert into public._legacy_aplikei_payment_events_backup(payload)
select to_jsonb(t)
from aplikei.payment_events t;

-- 2) Ativa RLS em tabelas public que já possuem policies
alter table if exists public.chat_messages enable row level security;
alter table if exists public.cos_recovery_cases enable row level security;
alter table if exists public.orders enable row level security;
alter table if exists public.payment_events enable row level security;
alter table if exists public.profiles enable row level security;
alter table if exists public.services_prices enable row level security;
alter table if exists public.user_services enable row level security;
alter table if exists public.zelle_payments enable row level security;

-- 3) Move objetos exclusivos do schema aplikei para public
alter table if exists aplikei.order_items set schema public;
alter table if exists aplikei.payments set schema public;
alter table if exists aplikei.product_prices set schema public;
alter table if exists aplikei.product_steps set schema public;
alter table if exists aplikei.products set schema public;
alter table if exists aplikei.step_reviews set schema public;
alter table if exists aplikei.user_product_instances set schema public;
alter table if exists aplikei.user_steps set schema public;
alter view if exists aplikei.active_products set schema public;

-- 4) Move enums legados para public
do $$
declare
  t text;
begin
  foreach t in array array[
    'instance_status',
    'notification_actor_role',
    'notification_category',
    'notification_kind',
    'notification_presentation_type',
    'notification_target_role',
    'order_item_type',
    'order_status',
    'payment_method',
    'payment_provider',
    'payment_status',
    'product_status',
    'product_type',
    'review_action',
    'step_status',
    'step_type',
    'user_account_role'
  ]
  loop
    if exists (
      select 1
      from pg_type ty
      join pg_namespace ns on ns.oid = ty.typnamespace
      where ns.nspname = 'aplikei'
        and ty.typname = t
        and ty.typtype = 'e'
    ) then
      execute format('alter type aplikei.%I set schema public', t);
    end if;
  end loop;
end $$;

-- 5) Recria funções legadas no public com search_path fixo
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.current_user_role()
returns public.user_account_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.users_accounts
  where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() in ('admin', 'master'), false)
$$;

create or replace function public.start_product_instance(p_user_id uuid, p_product_id uuid, p_order_id uuid default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_instance_id uuid;
  v_step record;
begin
  insert into public.user_product_instances (user_id, product_id, order_id, status, started_at)
  values (p_user_id, p_product_id, p_order_id, 'in_progress', timezone('utc', now()))
  returning id into v_instance_id;

  for v_step in
    select id from public.product_steps
    where product_id = p_product_id
    order by "order"
  loop
    insert into public.user_steps (user_product_id, product_step_id, status)
    values (v_instance_id, v_step.id, 'pending');
  end loop;

  return v_instance_id;
end;
$$;

create or replace function public.add_dependent_slot(p_instance_id uuid, p_order_id uuid default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current int;
begin
  select coalesce((metadata->>'paid_dependents')::int, 0)
  into v_current
  from public.user_product_instances
  where id = p_instance_id;

  update public.user_product_instances
  set metadata = jsonb_set(
    coalesce(metadata, '{}'::jsonb),
    '{paid_dependents}',
    to_jsonb(v_current + 1)
  )
  where id = p_instance_id;

  if p_order_id is not null then
    update public.user_product_instances
    set metadata = jsonb_set(
      metadata,
      '{dependent_order_ids}',
      coalesce(metadata->'dependent_order_ids', '[]'::jsonb) || to_jsonb(p_order_id::text)
    )
    where id = p_instance_id;
  end if;
end;
$$;

create or replace function public.fulfill_paid_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order record;
  v_product_id uuid;
  v_product_type public.product_type;
  v_existing uuid;
  v_parent_instance_id uuid;
begin
  select id, user_id, status, metadata
  into v_order
  from public.orders
  where id = p_order_id;

  if v_order.id is null then return; end if;
  if v_order.status != 'paid' then return; end if;

  select id, type
  into v_product_id, v_product_type
  from public.products
  where slug = (v_order.metadata->>'product_slug');

  if v_product_id is null then
    raise notice 'fulfill_paid_order: produto não encontrado para order %', p_order_id;
    return;
  end if;

  if v_product_type = 'subproduct' then
    v_parent_instance_id := nullif(v_order.metadata->>'parent_instance_id', '')::uuid;
    if v_parent_instance_id is null then
      raise notice 'fulfill_paid_order: subproduct sem parent_instance_id (order %)', p_order_id;
      return;
    end if;
    perform public.add_dependent_slot(v_parent_instance_id, v_order.id);
    return;
  end if;

  select id into v_existing
  from public.user_product_instances
  where order_id = p_order_id
  limit 1;

  if v_existing is not null then return; end if;

  perform public.start_product_instance(v_order.user_id, v_product_id, v_order.id);
end;
$$;

create or replace function public.sync_order_status(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_has_succeeded boolean;
  v_all_failed boolean;
  v_new_status public.order_status;
begin
  select
    bool_or(status = 'succeeded'),
    bool_and(status in ('failed', 'canceled'))
  into v_has_succeeded, v_all_failed
  from public.payments
  where order_id = p_order_id;

  v_new_status := case
    when v_has_succeeded then 'paid'
    when v_all_failed then 'failed'
    else 'pending'
  end;

  update public.orders
  set status = v_new_status
  where id = p_order_id
    and status != v_new_status;
end;
$$;

create or replace function public.sync_instance_status(p_instance_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total int;
  v_approved int;
  v_revision int;
  v_new_status public.instance_status;
begin
  select
    count(*),
    count(*) filter (where status = 'approved'),
    count(*) filter (where status = 'revision_requested')
  into v_total, v_approved, v_revision
  from public.user_steps
  where user_product_id = p_instance_id;

  v_new_status := case
    when v_total > 0 and v_approved = v_total then 'approved'
    when v_revision > 0 then 'revision_requested'
    else 'in_progress'
  end;

  update public.user_product_instances
  set
    status = v_new_status,
    completed_at = case when v_new_status = 'approved' then timezone('utc', now()) else null end
  where id = p_instance_id
    and status != v_new_status;
end;
$$;

create or replace function public.trigger_sync_order_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.sync_order_status(new.order_id);
  return new;
end;
$$;

create or replace function public.trigger_sync_instance_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.sync_instance_status(new.user_product_id);
  return new;
end;
$$;

create or replace function public.trigger_fulfill_paid_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'paid' and (old.status is distinct from 'paid') then
    perform public.fulfill_paid_order(new.id);
  end if;
  return new;
end;
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  inferred_name text;
begin
  inferred_name := coalesce(
    nullif(new.raw_user_meta_data ->> 'name', ''),
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    split_part(coalesce(new.email, 'user'), '@', 1)
  );

  insert into public.users_accounts (
    id,
    email,
    name,
    profile_url,
    phone,
    last_sign_in_at
  )
  values (
    new.id,
    new.email,
    inferred_name,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'profile_url', ''),
      nullif(new.raw_user_meta_data ->> 'avatar_url', '')
    ),
    coalesce(
      nullif(new.raw_user_meta_data ->> 'phone', ''),
      nullif(new.raw_user_meta_data ->> 'phone_number', '')
    ),
    new.last_sign_in_at
  )
  on conflict (id) do update
  set
    email = excluded.email,
    name = excluded.name,
    profile_url = coalesce(excluded.profile_url, public.users_accounts.profile_url),
    phone = coalesce(excluded.phone, public.users_accounts.phone),
    last_sign_in_at = excluded.last_sign_in_at;

  return new;
end;
$$;

create or replace function public.sync_auth_user_to_users_accounts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.users_accounts
  set
    email = new.email,
    name = coalesce(
      nullif(new.raw_user_meta_data ->> 'name', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      public.users_accounts.name
    ),
    profile_url = coalesce(
      nullif(new.raw_user_meta_data ->> 'profile_url', ''),
      nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
      public.users_accounts.profile_url
    ),
    phone = coalesce(
      nullif(new.raw_user_meta_data ->> 'phone', ''),
      nullif(new.raw_user_meta_data ->> 'phone_number', ''),
      public.users_accounts.phone
    ),
    last_sign_in_at = new.last_sign_in_at,
    is_active = (new.deleted_at is null)
  where id = new.id;

  return new;
end;
$$;

create or replace function public.update_user_accounts_view()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.users_accounts
  set
    name = new.full_name,
    phone = new.phone_number,
    profile_url = new.avatar_url,
    passport_photo_url = new.passport_photo_url,
    updated_at = now()
  where id = old.id;

  return new;
end;
$$;

-- 6) Recria triggers para funções no public
drop trigger if exists set_notifications_updated_at on public.notifications;
create trigger set_notifications_updated_at
before update on public.notifications
for each row
execute function public.set_updated_at();

drop trigger if exists on_order_paid on public.orders;
create trigger on_order_paid
after update on public.orders
for each row
execute function public.trigger_fulfill_paid_order();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

drop trigger if exists on_payment_status_change on public.payments;
create trigger on_payment_status_change
after update on public.payments
for each row
execute function public.trigger_sync_order_status();

drop trigger if exists set_payments_updated_at on public.payments;
create trigger set_payments_updated_at
before update on public.payments
for each row
execute function public.set_updated_at();

drop trigger if exists set_product_steps_updated_at on public.product_steps;
create trigger set_product_steps_updated_at
before update on public.product_steps
for each row
execute function public.set_updated_at();

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

drop trigger if exists set_upi_updated_at on public.user_product_instances;
create trigger set_upi_updated_at
before update on public.user_product_instances
for each row
execute function public.set_updated_at();

drop trigger if exists on_user_step_status_change on public.user_steps;
create trigger on_user_step_status_change
after update on public.user_steps
for each row
execute function public.trigger_sync_instance_status();

drop trigger if exists set_user_steps_updated_at on public.user_steps;
create trigger set_user_steps_updated_at
before update on public.user_steps
for each row
execute function public.set_updated_at();

-- 7) Remove funções legadas em aplikei
drop function if exists aplikei.add_dependent_slot(uuid, uuid);
drop function if exists aplikei.current_user_role();
drop function if exists aplikei.fulfill_paid_order(uuid);
drop function if exists aplikei.handle_new_auth_user();
drop function if exists aplikei.is_admin();
drop function if exists aplikei.start_product_instance(uuid, uuid, uuid);
drop function if exists aplikei.sync_auth_user_to_users_accounts();
drop function if exists aplikei.sync_instance_status(uuid);
drop function if exists aplikei.sync_order_status(uuid);
drop function if exists aplikei.trigger_fulfill_paid_order();
drop function if exists aplikei.trigger_sync_instance_status();
drop function if exists aplikei.trigger_sync_order_status();
drop function if exists aplikei.set_updated_at();

-- 8) Remove tabelas duplicadas legadas de aplikei
drop table if exists aplikei.notifications;
drop table if exists aplikei.orders;
drop table if exists aplikei.payment_events;

-- 9) Remove schema legado
drop schema if exists aplikei;

commit;
