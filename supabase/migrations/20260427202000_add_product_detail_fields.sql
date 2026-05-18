begin;

-- Campos de conteúdo (usados na página de detalhe do serviço)
alter table aplikei.products
  add column if not exists for_whom       text[]  not null default '{}',
  add column if not exists not_for_whom   text[]  not null default '{}',
  add column if not exists included       text[]  not null default '{}',
  add column if not exists requirements   text[]  not null default '{}',
  add column if not exists process_type   text,
  add column if not exists success_rate   text,
  add column if not exists hero_image     text,
  add column if not exists hero_icon_name text;

-- Parcelow como provider de pagamento
alter type aplikei.payment_provider add value if not exists 'parcelow';
alter type aplikei.payment_method   add value if not exists 'parcelow';

-- product_prices: campos de exibição para o frontend
alter table aplikei.product_prices
  add column if not exists dependent_amount numeric check (dependent_amount >= 0);

commit;
