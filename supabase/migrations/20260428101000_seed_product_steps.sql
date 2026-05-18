begin;

-- ─── Visto B1/B2 ─────────────────────────────────────────────────────────────
insert into aplikei.product_steps (product_id, "order", title, description, type, is_required, config)
select p.id, s."order", s.title, s.description, s.type::aplikei.step_type, s.is_required, s.config
from aplikei.products p
cross join (values
  (1,  'Preenchimento DS-160',         'Inicie o preenchimento do formulário DS-160 para sua aplicação.',                          'form',         true,  '{"form_id":"ds160"}'::jsonb),
  (2,  'Análise Aplikei',              'Nossa equipe revisará todas as informações da sua DS-160.',                                'admin_action', true,  '{}'::jsonb),
  (3,  'Emissão de Credenciais',       'Nossa equipe irá gerar seu Application ID oficial.',                                      'admin_action', true,  '{}'::jsonb),
  (4,  'Revisão e Assinatura',         'Revise sua DS-160 no site oficial e envie os comprovantes.',                              'upload',       true,  '{"accept":["pdf","image"]}'::jsonb),
  (5,  'Revisão Final Aplikei',        'Nossa equipe confirmará a documentação final e o comprovante.',                           'review',       true,  '{}'::jsonb),
  (6,  'Agendamento CASV',             'Escolha a data preferencial para sua entrevista no consulado.',                           'form',         true,  '{"form_id":"casv_scheduling"}'::jsonb),
  (7,  'Criação de Conta Consular',    'Nossa equipe criará sua conta oficial no site do consulado.',                             'admin_action', true,  '{}'::jsonb),
  (8,  'Confirmação de E-mail',        'Acesse seu e-mail e confirme a criação da conta no consulado.',                           'form',         true,  '{"form_id":"email_confirm"}'::jsonb),
  (9,  'Geração da Taxa MRV',          'Nossa equipe está gerando o boleto da taxa consular.',                                    'admin_action', true,  '{}'::jsonb),
  (10, 'Pagamento da Taxa MRV',        'Realize o pagamento da taxa consular para concluir seu agendamento.',                     'upload',       true,  '{"accept":["pdf","image"]}'::jsonb),
  (11, 'Preparação para Entrevista',   'Confira os detalhes da sua convocação e prepare-se para a entrevista.',                   'info',         true,  '{}'::jsonb)
) as s("order", title, description, type, is_required, config)
where p.slug = 'visto-b1-b2'
on conflict (product_id, "order") do update set
  title       = excluded.title,
  description = excluded.description,
  type        = excluded.type,
  is_required = excluded.is_required,
  config      = excluded.config;

-- ─── Visto F-1 ───────────────────────────────────────────────────────────────
insert into aplikei.product_steps (product_id, "order", title, description, type, is_required, config)
select p.id, s."order", s.title, s.description, s.type::aplikei.step_type, s.is_required, s.config
from aplikei.products p
cross join (values
  (1,  'Preenchimento DS-160',         'Inicie o preenchimento do formulário DS-160 para sua aplicação de estudante.',            'form',         true,  '{"form_id":"ds160"}'::jsonb),
  (2,  'Upload do I-20',               'Envie o formulário I-20 recebido da sua instituição de ensino americana.',                'upload',       true,  '{"accept":["pdf"],"label":"Formulário I-20"}'::jsonb),
  (3,  'Análise Aplikei',              'Nossa equipe revisará seu DS-160 e sua documentação de suporte.',                         'admin_action', true,  '{}'::jsonb),
  (4,  'Emissão de Credenciais',       'Nossa equipe irá gerar suas credenciais oficiais do Application ID.',                    'admin_action', true,  '{}'::jsonb),
  (5,  'Revisão e Assinatura',         'Revise sua DS-160 no site oficial e envie os comprovantes finais.',                      'upload',       true,  '{"accept":["pdf","image"]}'::jsonb),
  (6,  'Revisão Final Aplikei',        'Nossa equipe confirmará a documentação final e o comprovante.',                           'review',       true,  '{}'::jsonb),
  (7,  'Agendamento CASV',             'Escolha a data preferencial para sua entrevista no consulado.',                           'form',         true,  '{"form_id":"casv_scheduling"}'::jsonb),
  (8,  'Criação de Conta Consular',    'Nossa equipe criará sua conta oficial no site do consulado.',                             'admin_action', true,  '{}'::jsonb),
  (9,  'Confirmação de E-mail',        'Acesse seu e-mail e confirme a criação da conta no consulado.',                           'form',         true,  '{"form_id":"email_confirm"}'::jsonb),
  (10, 'Geração da Taxa MRV',          'Nossa equipe está gerando o boleto da taxa consular.',                                    'admin_action', true,  '{}'::jsonb),
  (11, 'Pagamento da Taxa MRV',        'Realize o pagamento da taxa consular para concluir seu agendamento.',                     'upload',       true,  '{"accept":["pdf","image"]}'::jsonb),
  (12, 'Preparação para Entrevista',   'Confira os detalhes da sua convocação e prepare-se para a entrevista.',                   'info',         true,  '{}'::jsonb)
) as s("order", title, description, type, is_required, config)
where p.slug = 'visto-f1'
on conflict (product_id, "order") do update set
  title       = excluded.title,
  description = excluded.description,
  type        = excluded.type,
  is_required = excluded.is_required,
  config      = excluded.config;

-- ─── Extensão de Status (EOS) ─────────────────────────────────────────────────
insert into aplikei.product_steps (product_id, "order", title, description, type, is_required, config)
select p.id, s."order", s.title, s.description, s.type::aplikei.step_type, s.is_required, s.config
from aplikei.products p
cross join (values
  (1,  'Formulário Inicial',           'Preencha suas informações pessoais, visto atual e desejado.',                             'form',         true,  '{"form_id":"initial_info"}'::jsonb),
  (2,  'Envio de Documentos',          'Faça o upload dos documentos pessoais e comprobatórios necessários.',                    'upload',       true,  '{"accept":["pdf","image"],"multiple":true}'::jsonb),
  (3,  'Análise Inicial',              'Nossa equipe está revisando seus dados e documentos enviados.',                           'admin_action', true,  '{}'::jsonb),
  (4,  'Formulário I-539',             'Preencha o formulário oficial I-539 exigido pelo USCIS.',                                 'form',         true,  '{"form_id":"i539"}'::jsonb),
  (5,  'Revisão do I-539',             'Nossa equipe está revisando o formulário I-539 preenchido.',                              'review',       true,  '{}'::jsonb),
  (6,  'Cover Letter',                 'Responda às perguntas para elaboração da sua carta de apresentação.',                     'form',         true,  '{"form_id":"cover_letter"}'::jsonb),
  (7,  'Revisão da Cover Letter',      'Nossa equipe está revisando e refinando sua carta de apresentação.',                     'review',       true,  '{}'::jsonb),
  (8,  'Upload do I-20',               'Envie o formulário I-20 emitido pela sua instituição de ensino.',                        'upload',       false, '{"accept":["pdf"],"label":"Formulário I-20"}'::jsonb),
  (9,  'Taxa SEVIS',                   'Envie o comprovante de pagamento da taxa SEVIS.',                                         'upload',       false, '{"accept":["pdf","image"],"label":"Comprovante SEVIS"}'::jsonb),
  (10, 'Revisão I-20 e SEVIS',         'Validação final do I-20 e comprovante da taxa SEVIS.',                                    'admin_action', false, '{}'::jsonb),
  (11, 'Formulários Finais',           'Últimos ajustes e assinaturas nos formulários do processo.',                              'form',         true,  '{"form_id":"final_forms"}'::jsonb),
  (12, 'Revisão Final',                'Revisão final de todos os formulários antes do envio.',                                   'review',       true,  '{}'::jsonb),
  (13, 'Pacote Final',                 'Seu pacote completo está pronto. Revise e confirme o envio ao USCIS.',                    'info',         true,  '{}'::jsonb)
) as s("order", title, description, type, is_required, config)
where p.slug = 'extensao-status'
on conflict (product_id, "order") do update set
  title       = excluded.title,
  description = excluded.description,
  type        = excluded.type,
  is_required = excluded.is_required,
  config      = excluded.config;

-- ─── Troca de Status (COS) ───────────────────────────────────────────────────
-- Mesmo fluxo do EOS (I-539 USCIS)
insert into aplikei.product_steps (product_id, "order", title, description, type, is_required, config)
select p.id, s."order", s.title, s.description, s.type::aplikei.step_type, s.is_required, s.config
from aplikei.products p
cross join (values
  (1,  'Formulário Inicial',           'Preencha suas informações pessoais, visto atual e o novo status desejado.',              'form',         true,  '{"form_id":"initial_info"}'::jsonb),
  (2,  'Envio de Documentos',          'Faça o upload dos documentos pessoais e comprobatórios necessários.',                    'upload',       true,  '{"accept":["pdf","image"],"multiple":true}'::jsonb),
  (3,  'Análise Inicial',              'Nossa equipe está revisando seus dados e documentos enviados.',                           'admin_action', true,  '{}'::jsonb),
  (4,  'Formulário I-539',             'Preencha o formulário oficial I-539 exigido pelo USCIS.',                                 'form',         true,  '{"form_id":"i539"}'::jsonb),
  (5,  'Revisão do I-539',             'Nossa equipe está revisando o formulário I-539 preenchido.',                              'review',       true,  '{}'::jsonb),
  (6,  'Cover Letter',                 'Responda às perguntas para elaboração da sua carta de apresentação.',                     'form',         true,  '{"form_id":"cover_letter"}'::jsonb),
  (7,  'Revisão da Cover Letter',      'Nossa equipe está revisando e refinando sua carta de apresentação.',                     'review',       true,  '{}'::jsonb),
  (8,  'Upload do I-20',               'Envie o formulário I-20 emitido pela sua instituição de ensino (novo status).',          'upload',       true,  '{"accept":["pdf"],"label":"Formulário I-20"}'::jsonb),
  (9,  'Taxa SEVIS',                   'Envie o comprovante de pagamento da nova taxa SEVIS.',                                    'upload',       true,  '{"accept":["pdf","image"],"label":"Comprovante SEVIS"}'::jsonb),
  (10, 'Revisão I-20 e SEVIS',         'Validação final do I-20 e comprovante da taxa SEVIS.',                                    'review',       true,  '{}'::jsonb),
  (11, 'Formulários Finais',           'Últimos ajustes e assinaturas nos formulários do processo.',                              'form',         true,  '{"form_id":"final_forms"}'::jsonb),
  (12, 'Revisão Final',                'Revisão final de todos os formulários antes do envio.',                                   'review',       true,  '{}'::jsonb),
  (13, 'Pacote Final',                 'Seu pacote completo está pronto. Revise e confirme o envio ao USCIS.',                    'info',         true,  '{}'::jsonb)
) as s("order", title, description, type, is_required, config)
where p.slug = 'troca-status'
on conflict (product_id, "order") do update set
  title       = excluded.title,
  description = excluded.description,
  type        = excluded.type,
  is_required = excluded.is_required,
  config      = excluded.config;

commit;
