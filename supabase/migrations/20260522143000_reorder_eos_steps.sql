begin;

do $$
declare
  v_products regclass := coalesce(to_regclass('public.products'), to_regclass('aplikei.products'));
  v_product_steps regclass := coalesce(to_regclass('public.product_steps'), to_regclass('aplikei.product_steps'));
  v_step_type regtype := coalesce(to_regtype('public.step_type'), to_regtype('aplikei.step_type'));
  v_sql text;
begin
  if v_products is null or v_product_steps is null or v_step_type is null then
    raise notice 'reorder_eos_steps skipped: products=%, product_steps=%, step_type=%',
      v_products, v_product_steps, v_step_type;
    return;
  end if;

  v_sql := format($fmt$
    with eos_product as (
      select id
      from %1$s
      where slug = 'extensao-status'
    ),
    new_steps as (
      select *
      from (values
        (1,  'Formulário Inicial',      'Preencha suas informações pessoais, visto atual e desejado.',                       'form',         true,  '{"form_id":"initial_info"}'::jsonb),
        (2,  'Envio de Documentos',     'Faça o upload dos documentos pessoais e comprobatórios necessários.',               'upload',       true,  '{"accept":["pdf","image"],"multiple":true}'::jsonb),
        (3,  'Análise Inicial',         'Nossa equipe está revisando seus dados e documentos enviados.',                      'admin_action', true,  '{}'::jsonb),
        (4,  'Upload do I-20',          'Envie o formulário I-20 emitido pela sua instituição de ensino.',                    'upload',       false, '{"accept":["pdf"],"label":"Formulário I-20"}'::jsonb),
        (5,  'Taxa SEVIS',              'Envie o comprovante de pagamento da taxa SEVIS.',                                    'upload',       false, '{"accept":["pdf","image"],"label":"Comprovante SEVIS"}'::jsonb),
        (6,  'Cover Letter',            'Responda às perguntas para elaboração da sua carta de apresentação.',                'form',         true,  '{"form_id":"cover_letter"}'::jsonb),
        (7,  'Revisão da Cover Letter', 'Nossa equipe está revisando e refinando sua carta de apresentação.',                'review',       true,  '{}'::jsonb),
        (8,  'Formulário I-539',        'Preencha o formulário oficial I-539 exigido pelo USCIS.',                            'form',         true,  '{"form_id":"i539"}'::jsonb),
        (9,  'Revisão do I-539',        'Nossa equipe está revisando o formulário I-539 preenchido.',                         'review',       true,  '{}'::jsonb),
        (10, 'Taxa do USCIS',           'Pagamento da taxa oficial de extensão.',                                              'form',         true,  '{"form_id":"uscis_fee"}'::jsonb),
        (11, 'Revisão I-20 e SEVIS',    'Validação final do I-20 e comprovante da taxa SEVIS.',                               'admin_action', false, '{}'::jsonb),
        (12, 'Revisão Final',           'Revisão final de todos os formulários antes do envio.',                              'review',       true,  '{}'::jsonb),
        (13, 'Pacote Final',            'Seu pacote completo está pronto. Revise e confirme o envio ao USCIS.',              'info',         true,  '{}'::jsonb)
      ) as s("order", title, description, type, is_required, config)
    )
    update %2$s ps
    set
      title = s.title,
      description = s.description,
      type = s.type::text::%3$s,
      is_required = s.is_required,
      config = s.config
    from eos_product ep
    join new_steps s on true
    where ps.product_id = ep.id
      and ps."order" = s."order"
  $fmt$, v_products, v_product_steps, v_step_type);

  execute v_sql;
end $$;

commit;
