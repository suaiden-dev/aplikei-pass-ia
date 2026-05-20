begin;

do $$
declare
  v_products regclass := coalesce(to_regclass('public.products'), to_regclass('aplikei.products'));
  v_product_steps regclass := coalesce(to_regclass('public.product_steps'), to_regclass('aplikei.product_steps'));
  v_step_type regtype := coalesce(to_regtype('public.step_type'), to_regtype('aplikei.step_type'));
  v_sql text;
begin
  if v_products is null or v_product_steps is null or v_step_type is null then
    raise notice 'reorder_cos_steps skipped: products=%, product_steps=%, step_type=%',
      v_products, v_product_steps, v_step_type;
    return;
  end if;

  v_sql := format($fmt$
    with cos_product as (
      select id
      from %1$s
      where slug = 'troca-status'
    ),
    new_steps as (
      select *
      from (values
        (1,  'Formulário Inicial',       'Preencha suas informações pessoais, visto atual e o novo status desejado.',              'form',         true,  '{"form_id":"initial_info"}'::jsonb),
        (2,  'Envios de Documentos',     'Faça o upload dos documentos pessoais e comprobatórios necessários.',                    'upload',       true,  '{"accept":["pdf","image"],"multiple":true}'::jsonb),
        (3,  'Revisão de Envio',         'Nossa equipe está revisando seus dados e documentos enviados.',                           'admin_action', true,  '{}'::jsonb),
        (4,  'Upload do I-20',           'Envie o formulário I-20 emitido pela sua instituição de ensino.',                         'upload',       false, '{"accept":["pdf"],"label":"Formulário I-20"}'::jsonb),
        (5,  'Confirmação de Pagamento', 'Envie o comprovante de pagamento da taxa SEVIS.',                                          'upload',       false, '{"accept":["pdf","image"],"label":"Comprovante SEVIS"}'::jsonb),
        (6,  'Carta de Suporte',         'Responda às perguntas para elaborar sua carta de suporte.',                                'form',         true,  '{"form_id":"cover_letter"}'::jsonb),
        (7,  'Análise da Carta',         'Nossa equipe está revisando e refinando sua carta de suporte.',                            'admin_action', true,  '{}'::jsonb),
        (8,  'Formulário I-539',         'Preencha o formulário oficial I-539 exigido pelo USCIS.',                                 'form',         true,  '{"form_id":"i539"}'::jsonb),
        (9,  'Análise do I-539',         'Nossa equipe está revisando o formulário I-539 preenchido.',                              'admin_action', true,  '{}'::jsonb),
        (10, 'Formulário Final',         'Últimos ajustes e assinaturas nos formulários do processo.',                              'form',         true,  '{"form_id":"final_forms"}'::jsonb),
        (11, 'Análise Final',            'Revisão final de todos os formulários antes do envio.',                                   'admin_action', true,  '{}'::jsonb),
        (12, 'Pacote Final',             'Seu pacote completo está pronto para o envio ao USCIS.',                                  'form',         true,  '{}'::jsonb)
      ) as s("order", title, description, type, is_required, config)
    )
    update %2$s ps
    set
      title = s.title,
      description = s.description,
      type = s.type::text::%3$s,
      is_required = s.is_required,
      config = s.config
    from cos_product cp
    join new_steps s on true
    where ps.product_id = cp.id
      and ps."order" = s."order"
  $fmt$, v_products, v_product_steps, v_step_type);

  execute v_sql;
end $$;

update public.user_services
set current_step = least(current_step, 11)
where service_slug in ('troca-status', 'visa-cos');

commit;
