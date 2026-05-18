begin;

-- ─── Enums ────────────────────────────────────────────────────────────────────

do $$
begin
  if not exists (
    select 1 from pg_type
    where typname = 'order_status' and typnamespace = 'aplikei'::regnamespace
  ) then
    create type aplikei.order_status as enum (
      'pending', 'paid', 'partially_paid', 'failed', 'refunded', 'canceled'
    );
  end if;

  if not exists (
    select 1 from pg_type
    where typname = 'order_item_type' and typnamespace = 'aplikei'::regnamespace
  ) then
    create type aplikei.order_item_type as enum ('product', 'upsell', 'subproduct');
  end if;

  if not exists (
    select 1 from pg_type
    where typname = 'payment_status' and typnamespace = 'aplikei'::regnamespace
  ) then
    create type aplikei.payment_status as enum (
      'pending', 'succeeded', 'failed', 'canceled', 'refunded'
    );
  end if;

  if not exists (
    select 1 from pg_type
    where typname = 'payment_provider' and typnamespace = 'aplikei'::regnamespace
  ) then
    create type aplikei.payment_provider as enum (
      'stripe', 'pix', 'mercadopago', 'zelle', 'manual'
    );
  end if;

  if not exists (
    select 1 from pg_type
    where typname = 'payment_method' and typnamespace = 'aplikei'::regnamespace
  ) then
    create type aplikei.payment_method as enum (
      'credit_card', 'pix', 'boleto', 'zelle', 'manual'
    );
  end if;
end
$$;

-- ─── orders ───────────────────────────────────────────────────────────────────

create table if not exists aplikei.orders (
  id           uuid                 primary key default gen_random_uuid(),
  user_id      uuid                 not null references aplikei.users_accounts (id) on delete restrict,
  status       aplikei.order_status  not null default 'pending',
  total_amount numeric              not null check (total_amount >= 0),
  currency     text                 not null default 'USD',
  metadata     jsonb                not null default '{}'::jsonb,
  created_at   timestamptz          not null default timezone('utc', now()),
  updated_at   timestamptz          not null default timezone('utc', now()),

  constraint orders_currency_check check (char_length(trim(currency)) = 3)
);

create index if not exists orders_user_id_idx    on aplikei.orders (user_id);
create index if not exists orders_status_idx     on aplikei.orders (status);
create index if not exists orders_created_at_idx on aplikei.orders (created_at desc);

drop trigger if exists set_orders_updated_at on aplikei.orders;
create trigger set_orders_updated_at
  before update on aplikei.orders
  for each row execute function aplikei.set_updated_at();

-- ─── order_items ──────────────────────────────────────────────────────────────

create table if not exists aplikei.order_items (
  id         uuid                    primary key default gen_random_uuid(),
  order_id   uuid                    not null references aplikei.orders (id) on delete cascade,
  item_type  aplikei.order_item_type  not null default 'product',
  item_id    uuid,                              -- referência ao produto (nullable para itens manuais)
  name       text                    not null,
  amount     numeric                 not null check (amount >= 0),
  quantity   int                     not null default 1 check (quantity > 0),
  metadata   jsonb                   not null default '{}'::jsonb
);

create index if not exists order_items_order_id_idx on aplikei.order_items (order_id);
create index if not exists order_items_item_id_idx  on aplikei.order_items (item_id) where item_id is not null;

-- ─── payments ─────────────────────────────────────────────────────────────────

create table if not exists aplikei.payments (
  id          uuid                    primary key default gen_random_uuid(),
  order_id    uuid                    not null references aplikei.orders (id) on delete restrict,
  provider    aplikei.payment_provider not null,
  method      aplikei.payment_method   not null,
  status      aplikei.payment_status   not null default 'pending',
  amount      numeric                 not null check (amount >= 0),
  currency    text                    not null default 'USD',
  external_id text,                             -- id do provider (Stripe charge id, etc.)
  metadata    jsonb                   not null default '{}'::jsonb,
  created_at  timestamptz             not null default timezone('utc', now()),
  updated_at  timestamptz             not null default timezone('utc', now()),

  constraint payments_currency_check check (char_length(trim(currency)) = 3)
);

create index if not exists payments_order_id_idx    on aplikei.payments (order_id);
create index if not exists payments_status_idx      on aplikei.payments (status);
create index if not exists payments_external_id_idx on aplikei.payments (external_id) where external_id is not null;
create index if not exists payments_created_at_idx  on aplikei.payments (created_at desc);

drop trigger if exists set_payments_updated_at on aplikei.payments;
create trigger set_payments_updated_at
  before update on aplikei.payments
  for each row execute function aplikei.set_updated_at();

-- ─── payment_events ───────────────────────────────────────────────────────────
-- Webhooks e histórico de transições de estado. Imutável — nunca update/delete.

create table if not exists aplikei.payment_events (
  id          uuid        primary key default gen_random_uuid(),
  payment_id  uuid        not null references aplikei.payments (id) on delete cascade,
  event_type  text        not null,   -- ex: 'payment.succeeded', 'payment.failed', 'webhook.received'
  payload     jsonb       not null default '{}'::jsonb,
  created_at  timestamptz not null default timezone('utc', now())
);

create index if not exists payment_events_payment_id_idx  on aplikei.payment_events (payment_id);
create index if not exists payment_events_event_type_idx  on aplikei.payment_events (event_type);
create index if not exists payment_events_created_at_idx  on aplikei.payment_events (created_at desc);

-- ─── RPC: sync order status from payment ──────────────────────────────────────
-- Chamada após cada atualização de pagamento para manter o status do pedido sincronizado.

create or replace function aplikei.sync_order_status(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = aplikei, public
as $$
declare
  v_has_succeeded boolean;
  v_all_failed    boolean;
  v_new_status    aplikei.order_status;
begin
  select
    bool_or(status = 'succeeded'),
    bool_and(status in ('failed', 'canceled'))
  into v_has_succeeded, v_all_failed
  from aplikei.payments
  where order_id = p_order_id;

  v_new_status := case
    when v_has_succeeded then 'paid'
    when v_all_failed    then 'failed'
    else 'pending'
  end;

  update aplikei.orders
  set status = v_new_status
  where id = p_order_id
    and status != v_new_status;
end;
$$;

-- Trigger: sincroniza status do pedido automaticamente
create or replace function aplikei.trigger_sync_order_status()
returns trigger
language plpgsql
security definer
set search_path = aplikei, public
as $$
begin
  perform aplikei.sync_order_status(new.order_id);
  return new;
end;
$$;

drop trigger if exists on_payment_status_change on aplikei.payments;
create trigger on_payment_status_change
  after insert or update of status on aplikei.payments
  for each row execute function aplikei.trigger_sync_order_status();

-- ─── RLS ──────────────────────────────────────────────────────────────────────

alter table aplikei.orders         enable row level security;
alter table aplikei.order_items    enable row level security;
alter table aplikei.payments       enable row level security;
alter table aplikei.payment_events enable row level security;

-- orders
drop policy if exists "orders_select_own_or_admin" on aplikei.orders;
create policy "orders_select_own_or_admin"
  on aplikei.orders for select to authenticated
  using (auth.uid() = user_id or aplikei.is_admin());

drop policy if exists "orders_insert_own_or_admin" on aplikei.orders;
create policy "orders_insert_own_or_admin"
  on aplikei.orders for insert to authenticated
  with check (auth.uid() = user_id or aplikei.is_admin());

drop policy if exists "orders_update_admin" on aplikei.orders;
create policy "orders_update_admin"
  on aplikei.orders for update to authenticated
  using (aplikei.is_admin())
  with check (aplikei.is_admin());

-- order_items: mesma visibilidade do pedido pai
drop policy if exists "order_items_select_own_or_admin" on aplikei.order_items;
create policy "order_items_select_own_or_admin"
  on aplikei.order_items for select to authenticated
  using (
    exists (
      select 1 from aplikei.orders
      where id = order_id and (user_id = auth.uid() or aplikei.is_admin())
    )
  );

drop policy if exists "order_items_insert_own_or_admin" on aplikei.order_items;
create policy "order_items_insert_own_or_admin"
  on aplikei.order_items for insert to authenticated
  with check (
    exists (
      select 1 from aplikei.orders
      where id = order_id and (user_id = auth.uid() or aplikei.is_admin())
    )
  );

-- payments
drop policy if exists "payments_select_own_or_admin" on aplikei.payments;
create policy "payments_select_own_or_admin"
  on aplikei.payments for select to authenticated
  using (
    exists (
      select 1 from aplikei.orders
      where id = order_id and (user_id = auth.uid() or aplikei.is_admin())
    )
  );

drop policy if exists "payments_insert_admin" on aplikei.payments;
create policy "payments_insert_admin"
  on aplikei.payments for insert to authenticated
  with check (aplikei.is_admin());

drop policy if exists "payments_update_admin" on aplikei.payments;
create policy "payments_update_admin"
  on aplikei.payments for update to authenticated
  using (aplikei.is_admin())
  with check (aplikei.is_admin());

-- payment_events: somente admin lê/escreve
drop policy if exists "payment_events_admin_only" on aplikei.payment_events;
create policy "payment_events_admin_only"
  on aplikei.payment_events for all to authenticated
  using (aplikei.is_admin())
  with check (aplikei.is_admin());

-- ─── Grants ───────────────────────────────────────────────────────────────────

grant execute on function aplikei.sync_order_status(uuid) to authenticated;

commit;
