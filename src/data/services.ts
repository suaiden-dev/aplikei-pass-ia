export interface Service {
  slug: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  price: string;
  icon: string;
  description: string;
  forWhom: string[];
  notForWhom: string[];
  included: string[];
  notIncluded: string[];
  requirements: string[];
  steps: string[];
  faq: { q: string; a: string }[];
}

export const services: Service[] = [
  {
    slug: "visto-b1-b2",
    title: "Guia Visto Consular B1/B2",
    shortTitle: "Visto B1/B2",
    subtitle: "Turismo e Negócios — para brasileiros aplicando do Brasil",
    price: "A partir de R$ XX",
    icon: "plane",
    description:
      "Guia completo passo a passo para aplicar ao visto de turismo/negócios (B1/B2) no consulado americano. Inclui checklist de documentos, orientação para preenchimento do DS-160 e preparação para a entrevista.",
    forWhom: [
      "Brasileiros que moram no Brasil",
      "Primeira vez ou renovação de visto B1/B2",
      "Viagens a turismo, visita familiar ou negócios curtos",
    ],
    notForWhom: [
      "Quem já está nos EUA e quer estender permanência",
      "Quem precisa de visto de trabalho ou estudante",
      "Quem precisa de representação legal perante o consulado",
    ],
    included: [
      "Guia digital passo a passo (acesso vitalício)",
      "Checklist completo de documentos",
      "Orientação para preenchimento do DS-160",
      "Dicas de preparação para entrevista",
      "Bônus: IA durante o processo para organizar dados e documentos",
      "Bônus: Suporte humano N1 Operacional (uso da plataforma e passos básicos)",
      "Pacote final em PDF (checklist + resumo + instruções)",
    ],
    notIncluded: [
      "Aconselhamento jurídico ou análise de elegibilidade",
      "Garantia de aprovação do visto",
      "Representação perante o consulado",
      "Preenchimento do DS-160 por você",
      "Análise de chances ou estratégia",
      "Acompanhamento presencial na entrevista",
    ],
    requirements: [
      "Passaporte válido",
      "Foto digital recente (5x5cm, fundo branco)",
      "Comprovantes financeiros (últimos 3 meses)",
      "Comprovante de vínculo com o Brasil (emprego, imóvel, família)",
      "Taxa consular (MRV) paga",
    ],
    steps: [
      "Crie sua conta e aceite os termos",
      "Escolha o serviço e realize o pagamento",
      "Inicie o onboarding guiado pela IA",
      "Preencha seus dados e faça upload dos documentos",
      "Revise tudo e gere seu Pacote Final (PDF)",
      "Siga as instruções para agendar e comparecer à entrevista",
    ],
    faq: [
      {
        q: "A Aplikei preenche o DS-160 para mim?",
        a: "Não. Nós fornecemos orientação detalhada para que você mesmo preencha com confiança. O guia explica campo a campo o que preencher.",
      },
      {
        q: "A Aplikei garante que meu visto será aprovado?",
        a: "Não. Nenhuma empresa pode garantir aprovação de visto. A decisão é exclusiva do consulado americano.",
      },
      {
        q: "Posso usar se já tive visto negado?",
        a: "Sim, o guia serve para qualquer pessoa aplicando do Brasil. Porém, não oferecemos análise de chances ou estratégia para casos de negativa anterior.",
      },
    ],
  },
  {
    slug: "visto-f1",
    title: "Guia Visto Consular F-1",
    shortTitle: "Visto F-1",
    subtitle: "Estudante — para brasileiros aplicando do Brasil",
    price: "A partir de R$ XX",
    icon: "graduation-cap",
    description:
      "Guia passo a passo para aplicar ao visto de estudante F-1. Orientação sobre I-20, DS-160, SEVIS, documentação financeira e preparação para entrevista no consulado.",
    forWhom: [
      "Brasileiros aceitos em instituição de ensino nos EUA",
      "Quem já possui I-20 da escola/universidade",
      "Estudantes de graduação, pós-graduação ou cursos de idioma",
    ],
    notForWhom: [
      "Quem ainda não foi aceito em nenhuma instituição",
      "Quem precisa de assessoria para escolher escola/universidade",
      "Quem já está nos EUA e precisa trocar status",
    ],
    included: [
      "Guia digital passo a passo (acesso vitalício)",
      "Checklist completo de documentos para F-1",
      "Orientação sobre I-20, SEVIS e DS-160",
      "Dicas de preparação para entrevista consular",
      "Bônus: IA durante o processo para organizar dados e documentos",
      "Bônus: Suporte humano N1 Operacional (uso da plataforma e passos básicos)",
      "Pacote final em PDF (checklist + resumo + instruções)",
    ],
    notIncluded: [
      "Aconselhamento jurídico ou análise de elegibilidade",
      "Garantia de aprovação do visto",
      "Assessoria para escolha de escola/universidade",
      "Representação perante o consulado",
      "Análise de chances ou estratégia",
    ],
    requirements: [
      "I-20 emitido pela instituição de ensino",
      "Passaporte válido",
      "Comprovante de pagamento SEVIS (I-901)",
      "Comprovantes financeiros (sponsor ou próprios)",
      "Carta de aceitação da instituição",
    ],
    steps: [
      "Crie sua conta e aceite os termos",
      "Escolha o serviço e realize o pagamento",
      "Inicie o onboarding guiado pela IA",
      "Preencha seus dados acadêmicos e financeiros",
      "Faça upload dos documentos e do I-20",
      "Revise tudo e gere seu Pacote Final (PDF)",
      "Siga as instruções para agendar e comparecer à entrevista",
    ],
    faq: [
      {
        q: "Preciso já ter o I-20 para usar o guia?",
        a: "Sim. O guia é para quem já foi aceito pela instituição e possui o I-20 em mãos.",
      },
      {
        q: "A Aplikei ajuda a escolher a escola?",
        a: "Não. Nosso foco é no processo de visto após a aceitação pela instituição.",
      },
      {
        q: "O guia serve para cursos de idioma?",
        a: "Sim, desde que o curso exija visto F-1 e você tenha o I-20.",
      },
    ],
  },
  {
    slug: "extensao-status",
    title: "Guia Extensão de Status (I-539)",
    shortTitle: "Extensão de Status",
    subtitle: "Para quem já está nos EUA e precisa estender a permanência",
    price: "A partir de US$ XX",
    icon: "clock",
    description:
      "Guia para solicitar extensão de status junto ao USCIS usando o formulário I-539. Ideal para quem está nos EUA com visto válido e precisa de mais tempo antes de retornar.",
    forWhom: [
      "Brasileiros que já estão nos EUA com status válido",
      "Quem precisa estender permanência (turismo, visitante, etc.)",
      "Aplicações dentro do prazo de validade do I-94",
    ],
    notForWhom: [
      "Quem já está com status vencido (overstay)",
      "Quem precisa trocar de categoria de visto",
      "Quem precisa de aconselhamento jurídico sobre elegibilidade",
    ],
    included: [
      "Guia digital passo a passo para I-539",
      "Checklist de documentos para extensão",
      "Orientação sobre preenchimento do I-539",
      "Informações sobre prazos e taxas do USCIS",
      "Bônus: IA durante o processo para organizar dados e documentos",
      "Bônus: Suporte humano N1 Operacional (uso da plataforma e passos básicos)",
      "Pacote final em PDF (checklist + resumo + instruções)",
    ],
    notIncluded: [
      "Aconselhamento jurídico ou análise de elegibilidade",
      "Garantia de aprovação da extensão",
      "Representação perante o USCIS",
      "Análise de casos de overstay",
      "Análise de chances ou estratégia",
    ],
    requirements: [
      "Passaporte válido",
      "I-94 (registro de entrada nos EUA)",
      "Cópia do visto atual",
      "Comprovantes financeiros",
      "Justificativa para extensão",
    ],
    steps: [
      "Crie sua conta e aceite os termos",
      "Escolha o serviço e realize o pagamento",
      "Inicie o onboarding guiado pela IA",
      "Preencha seus dados e informações do I-94",
      "Faça upload dos documentos necessários",
      "Revise tudo e gere seu Pacote Final (PDF)",
      "Siga as instruções para enviar ao USCIS",
    ],
    faq: [
      {
        q: "Posso usar se meu I-94 já venceu?",
        a: "O guia é voltado para aplicações dentro do prazo. Situações de overstay podem envolver complexidades que exigem aconselhamento jurídico.",
      },
      {
        q: "A Aplikei envia minha aplicação ao USCIS?",
        a: "Não. Nós orientamos o processo para que você envie por conta própria com confiança.",
      },
    ],
  },
  {
    slug: "troca-status",
    title: "Guia Troca de Status (Change of Status)",
    shortTitle: "Troca de Status",
    subtitle: "Para quem está nos EUA e precisa mudar a categoria do visto",
    price: "A partir de US$ XX",
    icon: "repeat",
    description:
      "Guia passo a passo para solicitar troca de status (Change of Status) dentro dos EUA via formulário I-539 ou equivalente. Para quem precisa mudar de uma categoria de visto para outra sem sair do país.",
    forWhom: [
      "Brasileiros nos EUA com status válido que precisam mudar de categoria",
      "Exemplo: de B1/B2 para F-1 (quando aplicável via I-539)",
      "Aplicações dentro do prazo de validade do I-94",
    ],
    notForWhom: [
      "Quem está com status vencido",
      "Quem precisa de visto de trabalho (H-1B, L-1, etc.)",
      "Quem precisa de aconselhamento jurídico especializado",
    ],
    included: [
      "Guia digital passo a passo para Change of Status",
      "Checklist de documentos para troca de status",
      "Orientação sobre formulários aplicáveis",
      "Informações sobre prazos e taxas do USCIS",
      "Bônus: IA durante o processo para organizar dados e documentos",
      "Bônus: Suporte humano N1 Operacional (uso da plataforma e passos básicos)",
      "Pacote final em PDF (checklist + resumo + instruções)",
    ],
    notIncluded: [
      "Aconselhamento jurídico ou análise de elegibilidade",
      "Garantia de aprovação da troca de status",
      "Representação perante o USCIS",
      "Análise de casos complexos ou de overstay",
      "Petições de visto de trabalho",
    ],
    requirements: [
      "Passaporte válido",
      "I-94 válido (não vencido)",
      "Documentação da nova categoria pretendida",
      "Comprovantes financeiros",
      "Justificativa para a troca de status",
    ],
    steps: [
      "Crie sua conta e aceite os termos",
      "Escolha o serviço e realize o pagamento",
      "Inicie o onboarding guiado pela IA",
      "Preencha seus dados e informações do processo",
      "Faça upload dos documentos necessários",
      "Revise tudo e gere seu Pacote Final (PDF)",
      "Siga as instruções para enviar ao USCIS",
    ],
    faq: [
      {
        q: "Qualquer troca de status é possível?",
        a: "Nem toda troca é elegível. O guia cobre processos comuns via I-539. Para situações complexas, recomendamos consultar um advogado de imigração.",
      },
      {
        q: "Posso trocar de B1/B2 para F-1?",
        a: "Em muitos casos, sim, desde que você atenda aos requisitos. O guia orienta o processo, mas não analisa elegibilidade individual.",
      },
    ],
  },
];

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
