begin;

-- ─── Sub-produto: slot de dependente para COS/EOS ────────────────────────────

insert into aplikei.products (
  slug, name, description, type, status,
  process_type, success_rate, hero_image, hero_icon_name,
  for_whom, not_for_whom, included, requirements,
  metadata
)
values (
  'slot-dependente-cos',
  'Dependente Adicional (COS/EOS)',
  'Habilita a inclusão de mais um dependente (cônjuge ou filho menor de 21 anos) no seu processo de Troca de Status (COS) ou Extensão de Status (EOS).',
  'subproduct',
  'active',
  'Upgrade de Processo',
  '100%',
  'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=2070&auto=format&fit=crop',
  'MdGroupAdd',
  array['Quem possui processo COS ou EOS ativo e precisa incluir dependentes'],
  array['Quem ainda não iniciou o processo principal'],
  array['Habilitação de slot de dependente no formulário I-539', 'Revisão dos documentos do familiar'],
  array['Processo principal ativo (COS ou EOS)'],
  '{"parent_product_slugs": ["troca-status", "extensao-status"], "slot_type": "dependent"}'::jsonb
)
on conflict (slug) do update set
  name        = excluded.name,
  description = excluded.description,
  type        = excluded.type,
  metadata    = excluded.metadata,
  updated_at  = timezone('utc', now());

-- ─── Preço: US$ 100,00 ───────────────────────────────────────────────────────

insert into aplikei.product_prices (product_id, currency, amount, original_amount, is_default, label)
select p.id, 'USD', 100.00, 200.00, true, 'por dependente'
from aplikei.products p
where p.slug = 'slot-dependente-cos'
  and not exists (
    select 1 from aplikei.product_prices pp
    where pp.product_id = p.id and pp.currency = 'USD' and pp.is_default = true
  );

-- ─── RPC: adicionar slot de dependente a uma instância ───────────────────────
-- Chamada pela página de sucesso do checkout ao confirmar o pagamento.

create or replace function aplikei.add_dependent_slot(
  p_instance_id uuid,
  p_order_id    uuid default null
)
returns void
language plpgsql
security definer
set search_path = aplikei, public
as $$
declare
  v_current int;
begin
  -- Lê o contador atual (default 0 se ainda não existe a chave)
  select coalesce((metadata->>'paid_dependents')::int, 0)
  into v_current
  from aplikei.user_product_instances
  where id = p_instance_id;

  -- Incrementa em 1
  update aplikei.user_product_instances
  set metadata = jsonb_set(
    coalesce(metadata, '{}'::jsonb),
    '{paid_dependents}',
    to_jsonb(v_current + 1)
  )
  where id = p_instance_id;

  -- Registra a compra nos metadados para auditoria
  if p_order_id is not null then
    update aplikei.user_product_instances
    set metadata = jsonb_set(
      metadata,
      '{dependent_order_ids}',
      coalesce(metadata->'dependent_order_ids', '[]'::jsonb) || to_jsonb(p_order_id::text)
    )
    where id = p_instance_id;
  end if;
end;
$$;

grant execute on function aplikei.add_dependent_slot(uuid, uuid) to authenticated;

commit;
