begin;

-- ─── Enums ────────────────────────────────────────────────────────────────────

do $$
begin
  if not exists (
    select 1 from pg_type
    where typname = 'product_type' and typnamespace = 'aplikei'::regnamespace
  ) then
    create type aplikei.product_type as enum ('product', 'upsell', 'subproduct');
  end if;

  if not exists (
    select 1 from pg_type
    where typname = 'product_status' and typnamespace = 'aplikei'::regnamespace
  ) then
    create type aplikei.product_status as enum ('active', 'paused', 'archived');
  end if;
end
$$;

-- ─── products ─────────────────────────────────────────────────────────────────

create table if not exists aplikei.products (
  id          uuid              primary key default gen_random_uuid(),
  slug        text              not null unique,
  name        text              not null,
  description text,
  type        aplikei.product_type  not null default 'product',
  status      aplikei.product_status not null default 'active',
  metadata    jsonb             not null default '{}'::jsonb,
  created_at  timestamptz       not null default timezone('utc', now()),
  updated_at  timestamptz       not null default timezone('utc', now()),

  constraint products_slug_check check (char_length(trim(slug)) >= 1),
  constraint products_name_check check (char_length(trim(name)) >= 1)
);

create index if not exists products_slug_idx   on aplikei.products (slug);
create index if not exists products_type_idx   on aplikei.products (type);
create index if not exists products_status_idx on aplikei.products (status);

drop trigger if exists set_products_updated_at on aplikei.products;
create trigger set_products_updated_at
  before update on aplikei.products
  for each row execute function aplikei.set_updated_at();

-- ─── product_prices ───────────────────────────────────────────────────────────
-- Um produto pode ter múltiplos preços (moedas, promoções, vigências).
-- O preço ativo padrão é aquele com is_default = true e valid_until is null (ou futuro).

create table if not exists aplikei.product_prices (
  id              uuid        primary key default gen_random_uuid(),
  product_id      uuid        not null references aplikei.products (id) on delete cascade,
  currency        text        not null default 'USD',
  amount          numeric     not null check (amount >= 0),      -- preço atual
  original_amount numeric              check (original_amount >= 0), -- riscado
  label           text,                                          -- ex: "por dependente"
  is_default      boolean     not null default true,
  valid_from      timestamptz not null default timezone('utc', now()),
  valid_until     timestamptz,                                   -- null = sem expiração
  created_at      timestamptz not null default timezone('utc', now()),

  constraint product_prices_currency_check check (char_length(trim(currency)) = 3),
  constraint product_prices_valid_range check (valid_until is null or valid_until > valid_from)
);

create index if not exists product_prices_product_id_idx on aplikei.product_prices (product_id);
create index if not exists product_prices_default_idx
  on aplikei.product_prices (product_id, is_default)
  where is_default = true;

-- ─── View: active products with current default price ─────────────────────────

create or replace view aplikei.active_products as
  select
    p.*,
    pp.id              as price_id,
    pp.currency,
    pp.amount,
    pp.original_amount,
    pp.label           as price_label
  from aplikei.products p
  left join aplikei.product_prices pp
    on pp.product_id = p.id
    and pp.is_default = true
    and (pp.valid_until is null or pp.valid_until > timezone('utc', now()))
  where p.status = 'active';

-- ─── RLS ──────────────────────────────────────────────────────────────────────

alter table aplikei.products        enable row level security;
alter table aplikei.product_prices  enable row level security;

-- Products: leitura pública (anon + autenticado), escrita apenas admin
drop policy if exists "products_select_public"   on aplikei.products;
create policy "products_select_public"
  on aplikei.products for select
  to anon, authenticated
  using (status != 'archived');

drop policy if exists "products_all_admin"       on aplikei.products;
create policy "products_all_admin"
  on aplikei.products for all
  to authenticated
  using (aplikei.is_admin())
  with check (aplikei.is_admin());

-- Product prices: mesma lógica
drop policy if exists "product_prices_select_public" on aplikei.product_prices;
create policy "product_prices_select_public"
  on aplikei.product_prices for select
  to anon, authenticated
  using (
    exists (
      select 1 from aplikei.products
      where id = product_id and status != 'archived'
    )
  );

drop policy if exists "product_prices_all_admin" on aplikei.product_prices;
create policy "product_prices_all_admin"
  on aplikei.product_prices for all
  to authenticated
  using (aplikei.is_admin())
  with check (aplikei.is_admin());

-- ─── Grants ───────────────────────────────────────────────────────────────────

grant select on aplikei.products       to anon, authenticated;
grant select on aplikei.product_prices to anon, authenticated;
grant select on aplikei.active_products to anon, authenticated;

commit;
