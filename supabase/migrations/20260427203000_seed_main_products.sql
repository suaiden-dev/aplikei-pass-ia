begin;

-- ─── Produtos principais ──────────────────────────────────────────────────────

insert into aplikei.products (
  slug, name, description, type, status,
  process_type, success_rate, hero_image, hero_icon_name,
  for_whom, not_for_whom, included, requirements
) values

-- 1. Visto B1/B2
(
  'visto-b1-b2',
  'Visto de Turismo e Negócios B1/B2',
  'O guia Aplikei para o visto B1/B2 foi desenvolvido para brasileiros que desejam visitar os EUA a turismo ou negócios. Cobrimos desde o preenchimento do DS-160 até a preparação para a entrevista consular, com checklists detalhados e modelos de documentos.',
  'product', 'active',
  'Processo Consular', '97.2%',
  'https://images.unsplash.com/photo-1507237615867-0d4d2ad6b2d1?q=80&w=1170&auto=format&fit=crop',
  'MdLanguage',
  array[
    'Turistas que desejam visitar os EUA pela primeira vez',
    'Profissionais que viajam a negócios sem vínculo empregatício nos EUA',
    'Pessoas que precisam renovar o visto B1/B2 vencido',
    'Quem busca organizar a documentação de forma independente'
  ],
  array[
    'Quem deseja trabalhar formalmente nos EUA',
    'Casos com negativas consulares anteriores (recomendamos advogado)',
    'Quem precisa de assessoria jurídica personalizada'
  ],
  array[
    'Guia DS-160: Instruções detalhadas para preencher o formulário sem erros',
    'Checklist de Documentos: Lista completa de tudo que você precisa reunir',
    'Preparação para Entrevista: Perguntas frequentes e como respondê-las',
    'Pacote PDF Final: Documento organizado e pronto para imprimir'
  ],
  array[
    'Passaporte válido',
    'Formulário DS-160',
    'Comprovante de renda',
    'Extrato bancário',
    'Comprovante de vínculos',
    'Fotos 5x5cm',
    'Comprovante de pagamento'
  ]
),

-- 2. Visto F-1
(
  'visto-f1',
  'Visto de Estudante F-1',
  'O guia F-1 da Aplikei conduz o estudante por todas as etapas do processo: desde a aceitação na instituição americana até a aprovação do visto, incluindo orientações sobre o SEVIS e preparação para a entrevista consular.',
  'product', 'active',
  'Processo Estudantil', '96.8%',
  'https://plus.unsplash.com/premium_photo-1713296255442-e9338f42aad8?w=500&auto=format&fit=crop&q=60',
  'MdSchool',
  array[
    'Estudantes aceitos em universidades ou escolas de idiomas nos EUA',
    'Quem deseja entender o processo do I-20 e SEVIS',
    'Estudantes que precisam renovar o visto F-1'
  ],
  array[
    'Quem ainda não tem carta de aceitação de uma instituição americana',
    'Casos com histórico de violação de status (recomendamos advogado)'
  ],
  array[
    'Guia I-20: Como solicitar e interpretar o documento corretamente',
    'Checklist SEVIS: Passo a passo do pagamento e registro',
    'Preparação para Entrevista: Perguntas específicas para estudantes',
    'Pacote PDF Final: Organização completa para o dia da entrevista'
  ],
  array[
    'Passaporte válido',
    'Formulário DS-160',
    'Carta de aceitação (I-20)',
    'Comprovante SEVIS',
    'Comprovante financeiro',
    'Histórico escolar',
    'Fotos 5x5cm'
  ]
),

-- 3. Extensão de Status (EOS)
(
  'extensao-status',
  'Extensão de Status (EOS)',
  'O guia de Extensão de Status orienta quem está nos EUA com visto temporário e deseja permanecer por mais tempo de forma legal, usando o formulário I-539 junto ao USCIS.',
  'product', 'active',
  'Processo USCIS', '95.1%',
  'https://images.unsplash.com/photo-1587954335893-da327939951a?q=80&w=735&auto=format&fit=crop',
  'MdHistory',
  array[
    'Quem está nos EUA com visto B1/B2 válido e deseja ficar mais tempo',
    'Dependentes de titulares de visto que precisam estender o status'
  ],
  array[
    'Quem já está com o status vencido (overstay) — recomendamos advogado',
    'Quem quer mudar de categoria de visto (use o guia COS)'
  ],
  array[
    'Guia I-539: Instruções detalhadas de preenchimento',
    'Checklist de Documentos: Tudo que o USCIS exige',
    'Carta de Suporte: Modelo de carta explicativa',
    'Pacote PDF Final: Envio organizado ao USCIS'
  ],
  array[
    'Passaporte válido',
    'I-94 atual',
    'Formulário I-539',
    'Comprovante financeiro',
    'Carta explicativa',
    'Fotos',
    'Taxa da USCIS'
  ]
),

-- 4. Troca de Status (COS)
(
  'troca-status',
  'Troca de Status (COS)',
  'O guia de Troca de Status orienta quem está nos EUA e deseja mudar de categoria de visto — por exemplo, de turista (B2) para estudante (F-1) — sem precisar sair do país.',
  'product', 'active',
  'Processo USCIS', '94.3%',
  'https://images.unsplash.com/photo-1657358845938-2e96ebd29598?q=80&w=1170&auto=format&fit=crop',
  'MdSyncAlt',
  array[
    'Turistas B1/B2 que foram aceitos em uma instituição americana',
    'Quem deseja mudar de status antes do vencimento atual'
  ],
  array[
    'Quem está com status vencido — recomendamos advogado',
    'Casos que envolvem mudança para status de trabalho (H-1B, L-1)'
  ],
  array[
    'Guia I-539: Instruções para a troca de categoria',
    'Checklist Completo: Documentos específicos da nova categoria',
    'Carta Explicativa: Modelo de justificativa para a troca',
    'Pacote PDF Final: Envio organizado ao USCIS'
  ],
  array[
    'Passaporte válido',
    'I-94 atual',
    'Formulário I-539',
    'I-20 (se for F-1)',
    'Comprovante financeiro',
    'Carta explicativa',
    'Taxa da USCIS'
  ]
)

on conflict (slug) do update set
  name           = excluded.name,
  description    = excluded.description,
  process_type   = excluded.process_type,
  success_rate   = excluded.success_rate,
  hero_image     = excluded.hero_image,
  hero_icon_name = excluded.hero_icon_name,
  for_whom       = excluded.for_whom,
  not_for_whom   = excluded.not_for_whom,
  included       = excluded.included,
  requirements   = excluded.requirements,
  updated_at     = timezone('utc', now());

-- ─── Preços principais (USD) ──────────────────────────────────────────────────

insert into aplikei.product_prices (product_id, currency, amount, original_amount, dependent_amount, is_default)
select p.id, 'USD',
  case p.slug
    when 'visto-b1-b2'      then 200.00
    when 'visto-f1'         then 350.00
    when 'extensao-status'  then 200.00
    when 'troca-status'     then 350.00
  end,
  case p.slug
    when 'visto-b1-b2'      then 400.00
    when 'visto-f1'         then 700.00
    when 'extensao-status'  then 400.00
    when 'troca-status'     then 700.00
  end,
  case p.slug
    when 'visto-b1-b2'      then 50.00
    when 'visto-f1'         then 100.00
    when 'extensao-status'  then 100.00
    when 'troca-status'     then 100.00
  end,
  true
from aplikei.products p
where p.slug in ('visto-b1-b2', 'visto-f1', 'extensao-status', 'troca-status')
  and not exists (
    select 1 from aplikei.product_prices pp
    where pp.product_id = p.id and pp.currency = 'USD' and pp.is_default = true
  );

commit;
