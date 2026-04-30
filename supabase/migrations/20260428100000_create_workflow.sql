begin;

-- ─── Enums ────────────────────────────────────────────────────────────────────

do $$
begin
  -- Tipo de step (template)
  if not exists (select 1 from pg_type where typname = 'step_type' and typnamespace = 'aplikei'::regnamespace) then
    create type aplikei.step_type as enum (
      'form',            -- usuário preenche formulário
      'upload',          -- usuário faz upload de documentos
      'admin_action',    -- equipe executa ação interna
      'review',          -- equipe revisa dados/docs do usuário
      'info'             -- etapa informativa (sem ação do usuário)
    );
  end if;

  -- Status de uma instância de produto (processo do usuário)
  if not exists (select 1 from pg_type where typname = 'instance_status' and typnamespace = 'aplikei'::regnamespace) then
    create type aplikei.instance_status as enum (
      'draft',              -- criado mas não iniciado
      'in_progress',        -- usuário em andamento
      'in_review',          -- aguardando análise da equipe
      'revision_requested', -- equipe pediu correção
      'approved',           -- aprovado / concluído
      'rejected',           -- rejeitado
      'canceled'            -- cancelado
    );
  end if;

  -- Status de um step individual
  if not exists (select 1 from pg_type where typname = 'step_status' and typnamespace = 'aplikei'::regnamespace) then
    create type aplikei.step_status as enum (
      'pending',            -- aguardando início
      'in_progress',        -- usuário está preenchendo
      'completed',          -- usuário submeteu
      'in_review',          -- aguardando análise
      'approved',           -- aprovado pela equipe
      'revision_requested', -- equipe pediu correção
      'skipped'             -- step opcional pulado
    );
  end if;

  -- Ação de revisão do admin
  if not exists (select 1 from pg_type where typname = 'review_action' and typnamespace = 'aplikei'::regnamespace) then
    create type aplikei.review_action as enum (
      'approved',
      'revision_requested',
      'rejected',
      'commented'
    );
  end if;
end
$$;

-- ─── product_steps ────────────────────────────────────────────────────────────
-- Template de etapas de cada produto. Define a estrutura do fluxo.

create table if not exists aplikei.product_steps (
  id          uuid             primary key default gen_random_uuid(),
  product_id  uuid             not null references aplikei.products (id) on delete cascade,
  title       text             not null,
  description text,
  "order"     smallint         not null,                 -- posição na sequência (1-based)
  type        aplikei.step_type not null default 'form',
  is_required boolean          not null default true,
  config      jsonb            not null default '{}'::jsonb, -- configuração livre por tipo de step
  created_at  timestamptz      not null default timezone('utc', now()),
  updated_at  timestamptz      not null default timezone('utc', now()),

  constraint product_steps_order_positive check ("order" > 0),
  unique (product_id, "order")
);

create index if not exists product_steps_product_id_idx on aplikei.product_steps (product_id);
create index if not exists product_steps_order_idx      on aplikei.product_steps (product_id, "order");

drop trigger if exists set_product_steps_updated_at on aplikei.product_steps;
create trigger set_product_steps_updated_at
  before update on aplikei.product_steps
  for each row execute function aplikei.set_updated_at();

-- ─── user_product_instances ───────────────────────────────────────────────────
-- Cada vez que um usuário inicia um produto/processo.

create table if not exists aplikei.user_product_instances (
  id          uuid                    primary key default gen_random_uuid(),
  user_id     uuid                    not null references aplikei.users_accounts (id) on delete restrict,
  product_id  uuid                    not null references aplikei.products (id) on delete restrict,
  order_id    uuid                    references aplikei.orders (id) on delete set null,
  status      aplikei.instance_status  not null default 'draft',
  metadata    jsonb                   not null default '{}'::jsonb,
  started_at  timestamptz,
  completed_at timestamptz,
  created_at  timestamptz             not null default timezone('utc', now()),
  updated_at  timestamptz             not null default timezone('utc', now())
);

create index if not exists upi_user_id_idx    on aplikei.user_product_instances (user_id);
create index if not exists upi_product_id_idx on aplikei.user_product_instances (product_id);
create index if not exists upi_status_idx     on aplikei.user_product_instances (status);
create index if not exists upi_order_id_idx   on aplikei.user_product_instances (order_id) where order_id is not null;

drop trigger if exists set_upi_updated_at on aplikei.user_product_instances;
create trigger set_upi_updated_at
  before update on aplikei.user_product_instances
  for each row execute function aplikei.set_updated_at();

-- ─── user_steps ───────────────────────────────────────────────────────────────
-- Execução real de cada etapa pelo usuário.

create table if not exists aplikei.user_steps (
  id                  uuid                 primary key default gen_random_uuid(),
  user_product_id     uuid                 not null references aplikei.user_product_instances (id) on delete cascade,
  product_step_id     uuid                 not null references aplikei.product_steps (id) on delete restrict,
  status              aplikei.step_status   not null default 'pending',
  data                jsonb                not null default '{}'::jsonb,  -- dados do formulário
  files               jsonb                not null default '[]'::jsonb,  -- lista de {name, path, url}
  submitted_at        timestamptz,
  reviewed_at         timestamptz,
  created_at          timestamptz          not null default timezone('utc', now()),
  updated_at          timestamptz          not null default timezone('utc', now()),

  unique (user_product_id, product_step_id)
);

create index if not exists user_steps_upi_idx    on aplikei.user_steps (user_product_id);
create index if not exists user_steps_step_idx   on aplikei.user_steps (product_step_id);
create index if not exists user_steps_status_idx on aplikei.user_steps (status);

drop trigger if exists set_user_steps_updated_at on aplikei.user_steps;
create trigger set_user_steps_updated_at
  before update on aplikei.user_steps
  for each row execute function aplikei.set_updated_at();

-- ─── step_reviews ─────────────────────────────────────────────────────────────
-- Histórico imutável de revisões do admin. Nunca sofre update/delete.

create table if not exists aplikei.step_reviews (
  id           uuid                  primary key default gen_random_uuid(),
  user_step_id uuid                  not null references aplikei.user_steps (id) on delete cascade,
  admin_id     uuid                  not null references aplikei.users_accounts (id) on delete restrict,
  action       aplikei.review_action  not null,
  comment      text,
  created_at   timestamptz           not null default timezone('utc', now())
);

create index if not exists step_reviews_step_idx  on aplikei.step_reviews (user_step_id);
create index if not exists step_reviews_admin_idx on aplikei.step_reviews (admin_id);
create index if not exists step_reviews_time_idx  on aplikei.step_reviews (created_at desc);

-- ─── RPC: iniciar instância ───────────────────────────────────────────────────
-- Cria user_product_instance + todos os user_steps de uma vez, atomicamente.

create or replace function aplikei.start_product_instance(
  p_user_id   uuid,
  p_product_id uuid,
  p_order_id  uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = aplikei, public
as $$
declare
  v_instance_id uuid;
  v_step        record;
begin
  -- Cria a instância
  insert into aplikei.user_product_instances (user_id, product_id, order_id, status, started_at)
  values (p_user_id, p_product_id, p_order_id, 'in_progress', timezone('utc', now()))
  returning id into v_instance_id;

  -- Cria um user_step para cada product_step do produto
  for v_step in
    select id from aplikei.product_steps
    where product_id = p_product_id
    order by "order"
  loop
    insert into aplikei.user_steps (user_product_id, product_step_id, status)
    values (v_instance_id, v_step.id, 'pending');
  end loop;

  return v_instance_id;
end;
$$;

-- ─── RPC: sync instance status ────────────────────────────────────────────────
-- Atualiza status da instância baseado nos steps. Chamado após cada mudança de step.

create or replace function aplikei.sync_instance_status(p_instance_id uuid)
returns void
language plpgsql
security definer
set search_path = aplikei, public
as $$
declare
  v_total      int;
  v_approved   int;
  v_revision   int;
  v_new_status aplikei.instance_status;
begin
  select
    count(*),
    count(*) filter (where status = 'approved'),
    count(*) filter (where status = 'revision_requested')
  into v_total, v_approved, v_revision
  from aplikei.user_steps
  where user_product_id = p_instance_id;

  v_new_status := case
    when v_total > 0 and v_approved = v_total then 'approved'
    when v_revision > 0                        then 'revision_requested'
    else 'in_progress'
  end;

  update aplikei.user_product_instances
  set
    status       = v_new_status,
    completed_at = case when v_new_status = 'approved' then timezone('utc', now()) else null end
  where id = p_instance_id
    and status != v_new_status;
end;
$$;

-- Trigger automático ao mudar status de um step
create or replace function aplikei.trigger_sync_instance_status()
returns trigger
language plpgsql
security definer
set search_path = aplikei, public
as $$
begin
  perform aplikei.sync_instance_status(new.user_product_id);
  return new;
end;
$$;

drop trigger if exists on_user_step_status_change on aplikei.user_steps;
create trigger on_user_step_status_change
  after insert or update of status on aplikei.user_steps
  for each row execute function aplikei.trigger_sync_instance_status();

-- ─── RLS ──────────────────────────────────────────────────────────────────────

alter table aplikei.product_steps             enable row level security;
alter table aplikei.user_product_instances    enable row level security;
alter table aplikei.user_steps                enable row level security;
alter table aplikei.step_reviews              enable row level security;

-- product_steps: leitura pública, escrita admin
drop policy if exists "product_steps_select_public" on aplikei.product_steps;
create policy "product_steps_select_public"
  on aplikei.product_steps for select to anon, authenticated
  using (true);

drop policy if exists "product_steps_write_admin" on aplikei.product_steps;
create policy "product_steps_write_admin"
  on aplikei.product_steps for all to authenticated
  using (aplikei.is_admin()) with check (aplikei.is_admin());

-- user_product_instances: dono ou admin
drop policy if exists "upi_select_own_or_admin" on aplikei.user_product_instances;
create policy "upi_select_own_or_admin"
  on aplikei.user_product_instances for select to authenticated
  using (auth.uid() = user_id or aplikei.is_admin());

drop policy if exists "upi_insert_own_or_admin" on aplikei.user_product_instances;
create policy "upi_insert_own_or_admin"
  on aplikei.user_product_instances for insert to authenticated
  with check (auth.uid() = user_id or aplikei.is_admin());

drop policy if exists "upi_update_own_or_admin" on aplikei.user_product_instances;
create policy "upi_update_own_or_admin"
  on aplikei.user_product_instances for update to authenticated
  using (auth.uid() = user_id or aplikei.is_admin());

-- user_steps: dono da instância ou admin
drop policy if exists "user_steps_select_own_or_admin" on aplikei.user_steps;
create policy "user_steps_select_own_or_admin"
  on aplikei.user_steps for select to authenticated
  using (
    exists (
      select 1 from aplikei.user_product_instances
      where id = user_product_id and (user_id = auth.uid() or aplikei.is_admin())
    )
  );

drop policy if exists "user_steps_modify_own_or_admin" on aplikei.user_steps;
create policy "user_steps_modify_own_or_admin"
  on aplikei.user_steps for all to authenticated
  using (
    exists (
      select 1 from aplikei.user_product_instances
      where id = user_product_id and (user_id = auth.uid() or aplikei.is_admin())
    )
  )
  with check (
    exists (
      select 1 from aplikei.user_product_instances
      where id = user_product_id and (user_id = auth.uid() or aplikei.is_admin())
    )
  );

-- step_reviews: dono lê, admin escreve
drop policy if exists "step_reviews_select_own_or_admin" on aplikei.step_reviews;
create policy "step_reviews_select_own_or_admin"
  on aplikei.step_reviews for select to authenticated
  using (
    aplikei.is_admin() or exists (
      select 1
      from aplikei.user_steps us
      join aplikei.user_product_instances upi on upi.id = us.user_product_id
      where us.id = user_step_id and upi.user_id = auth.uid()
    )
  );

drop policy if exists "step_reviews_insert_admin" on aplikei.step_reviews;
create policy "step_reviews_insert_admin"
  on aplikei.step_reviews for insert to authenticated
  with check (aplikei.is_admin());

-- ─── Grants ───────────────────────────────────────────────────────────────────

grant select on aplikei.product_steps             to anon, authenticated;
grant execute on function aplikei.start_product_instance(uuid, uuid, uuid) to authenticated;
grant execute on function aplikei.sync_instance_status(uuid)               to authenticated;

commit;
