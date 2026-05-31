const dashboard = {
  dashboard: {
    title: "Painel",
    welcome: "Bem-vindo de volta! Continue seu processo.",
    overallProgress: "Progresso geral",
    onboarding: "Onboarding",
    complete: "concluído",
    cards: {
      currentService: "Meu serviço atual",
      currentServiceDesc: "Visto B1/B2 — Turismo e Negócios",
      inProgress: "Em andamento",
      checklist: "Checklist de documentos",
      checklistDesc: "3 de 8 documentos enviados",
      chatAI: "Chat com IA",
      chatAIDesc: "Tire dúvidas e organize seu processo",
      uploads: "Uploads",
      uploadsDesc: "Envie e gerencie seus documentos",
      generatePDF: "Gerar pacote final (PDF)",
      generatePDFDesc: "Disponível quando o onboarding estiver concluído",
      help: "Suporte",
      helpDesc: "Dúvidas sobre o uso da plataforma",
    },
    access: "Acessar",
    selfieModal: {
      title: "Configuração Inicial: Fotos Necessárias",
      desc: "Para prosseguir, precisamos de duas fotos: uma segurando seu passaporte para verificação de identidade, e uma foto digital (5x5) para a aplicação.",
      step1Title: "Passo 1: Verificação de Identidade",
      step1Desc:
        "Tire uma selfie segurando seu passaporte ao lado do rosto. Garanta que os dados do passaporte estejam legíveis.",
      step2Title: "Passo 2: Foto Digital do Visto",
      step2Desc:
        "Envie uma foto digital recente de 5x5cm com fundo branco liso, olhando para frente, sem óculos ou chapéu.",
      uploadBtn: "Selecionar Foto",
      selectVisaPhoto: "Selecionar Foto 5x5",
      nextStep: "Próximo Passo",
      finish: "Concluir Configuração",
      submitting: "Enviando...",
      success: "Fotos enviadas com sucesso!",
    },
    passportUploadModal: {
      title: "Identificação com Passaporte",
      description: "Segure o passaporte aberto ao lado do seu rosto",
      closeTitle: "Fechar e voltar",
      reqHoldingPassport: "Segurando Passaporte",
      reqLegibleData: "Dados Legíveis",
      reqWhiteBackground: "Fundo Branco",
      reqNoGlasses: "Sem Óculos",
      reqVisibleFaceId: "Rosto e ID Visíveis",
      reqGoodLighting: "Boa Iluminação",
      uploadPhoto: "Carregar Foto",
      changePhoto: "Alterar Foto",
      supportedFormats: "Formatos suportados: JPG, PNG. Máximo 5MB.",
      confirmAndProceed: "Confirmar e Prosseguir",
      sending: "Enviando...",
      errorMaxSize: "A foto deve ter no máximo 5MB.",
      successUpload: "Foto enviada com sucesso!",
      errorUpload: "Erro ao enviar foto: {error}"
    },
    activeProcesses: "Seus Casos Ativos",
    selectProcess: "Selecionar Caso",
    getProcesses: "Obter Casos",
    comingSoon: "Em Breve",
    getStarted: "Começar",
    available: "Disponível",
    paymentSuccess: "Pagamento confirmado! Seu novo guia está disponível abaixo.",
    errorUploadingSelfie: "Erro ao enviar selfie",
    remove: "Remover",
    selectSelfie: "Selecione sua selfie",
    or: "ou",
    status: {
      ds160Processing: "Processando DS-160",
      cosInProgress: "Onboarding: Info e Foto",
      cosProcessing: "Revisando Aplicação",
      cosOfficialForms: "3. Formulários Oficiais",
      ds160uploadDocuments: "3. Enviar Documentos",
      ds160AwaitingReviewAndSignature: "4. Revisão e Assinatura",
      uploadsUnderReview: "4. Revisão de Documentos",
      casvSchedulingPending: "5. Agendamento Pendente",
      casvFeeProcessing: "6. Taxa em Processamento",
      casvPaymentPending: "7. Pagamento CASV Pendente",
      awaitingInterview: "8. Aguardando Entrevista",
      approved: "9. Aprovado",
      rejectedText: "Processo Negado",
      rejectedLabel: "Rejeitado",
      stepOf: "Passo [step] de [total]",
      uscisApproved: "Aprovado pelo USCIS",
      deniedEncerrado: "Negado / Encerrado",
      awaitingRfe: "Aguardando RFE",
      inProgress: "Em Andamento",
    },
    badges: {
      approved: "Aprovado",
      denied: "Negado",
      finished: "Finalizado",
      active: "Ativo",
      awaitingRfe: "RFE Pendente",
      soldOut: "Esgotado",
      available: "Disponível",
    },
    sections: {
      activeCases: "Seus Casos Ativos",
      activeCasesDesc: "Acompanhe o progresso e os próximos passos dos seus guias.",
      getCases: "Obter Casos",
      getCasesDesc: "Melhore sua jornada com guias especializados.",
      noActiveCases: "Nenhum caso ativo ainda.",
      noActiveCasesDesc: "Comece com um de nossos guias abaixo.",
    },
    serviceCard: {
      includedFeatures: "Recursos Incluídos",
      accessProcess: "Acessar Processo",
      unavailable: "Indisponível",
      startNow: "Começar Agora",
      finishCurrentFirst: "Conclua seu processo atual primeiro",
    },
    myProcesses: "Meus Casos",
    trackStatus: "Acompanhe o status de todos os seus guias e aplicações.",
    noActiveProcesses: "Você ainda não tem casos ativos.",
    progress: "Progresso",
    accessDetails: "DETALHES DE ACESSO",
    myCases: {
      title: "Meus Casos",
      subtitle: "Acompanhe o status e o progresso de todos os seus casos e aplicações.",
      active: "Ativos",
      history: "Histórico",
      noCases: "Nenhum caso ainda.",
      noCasesDesc: "Inicie um novo caso em seu painel principal.",
      goDashboard: "Ir para o Painel",
      accessCase: "Acessar Caso",
      progress: "Progresso",
      status: {
        active: "Em andamento",
        pending: "Pendente",
        completed: "Concluído",
        cancelled: "Cancelado",
        approved: "Aprovado",
        denied: "Negado",
      }
    },
    products: {
      "visto-b1-b2": {
        label: "Visto B1/B2",
        category: "Turismo/Negócios",
        subtitle: "Guia completo passo a passo",
        included: ["Guia DS-160", "Checklist de Documentos", "Simulador de Entrevista"],
      },
      "visto-b1-b2-reaplicacao": {
        label: "Reaplicação B1/B2",
        category: "Turismo/Negócios",
        subtitle: "Foco total na reversão da negativa",
        included: ["Análise de Negativa", "Estratégia de Reaplicação", "Treino de Entrevista"],
      },
      "visto-f1": {
        label: "Visto F-1",
        category: "Estudante/Acadêmico",
        subtitle: "Do I-20 à aprovação final",
        included: ["Guia I-20", "Checklist SEVIS", "Treino Estudantil"],
      },
      "visto-f1-reaplicacao": {
        label: "Reaplicação F-1",
        category: "Estudante/Acadêmico",
        subtitle: "Reverta sua negativa de estudante",
        included: ["Análise de Negativa", "Estratégia Acadêmica", "Treino de Entrevista"],
      },
      "extensao-status": {
        label: "Extensão de Status",
        category: "Estender Estadia",
        subtitle: "Permaneça legal por mais tempo",
        included: ["Guia I-539", "Carta de Suporte", "Checklist USCIS"],
      },
      "troca-status": {
        label: "Troca de Status",
        category: "Mudar Visto",
        subtitle: "Mude de visto sem sair dos EUA",
        included: ["Guia I-539", "Carta de Suporte", "Checklist USCIS"],
      },
      "mentoria-individual": {
        label: "Pacote Bronze",
        category: "Mentoria",
        subtitle: "1 Simulação de Entrevista",
        included: ["1 Aula de Treinamento", "Simulado de perguntas"],
      },
      "mentoria-bronze": {
        label: "Pacote Prata",
        category: "Mentoria",
        subtitle: "2 Simulações de Entrevista",
        included: ["2 Aulas de Treinamento", "Análise de perfil", "Feedback"],
      },
      "mentoria-silver": {
        label: "Pacote Prata (F1)",
        category: "Mentoria",
        subtitle: "2 Simulações de Entrevista",
        included: ["2 Aulas de Treinamento", "Análise de perfil", "Feedback"],
      },
      "mentoria-gold": {
        label: "Pacote Gold",
        category: "Mentoria VIP",
        subtitle: "3 Simulações + Revisão",
        included: ["3 Aulas de Treinamento", "Estratégia", "Suporte VIP"],
      },
      "mentoria-negativa-consular": {
        label: "Análise de Recusa",
        category: "Consultoria",
        subtitle: "Análise técnica pós-negativa",
        included: ["Análise detalhada", "45 min com especialista", "Plano de ação"],
      },
      "consultoria-f1-negativa": {
        label: "Mentoria Pós-Negativa F-1",
        category: "Consultoria",
        subtitle: "Estratégia de reversão",
        included: ["Análise de vínculos", "45 min com especialista", "Nova estratégia"],
      },
      "consultoria-especialista": {
        label: "Consultoria Especialista",
        category: "Consultoria",
        subtitle: "Atendimento personalizado",
        included: ["45 min com especialista", "Análise documental"],
      },
    },
  },
  sidebar: {
    dashboard: "Painel",
    cases: "Meus Casos",
    chat: "Chat com IA",
    support: "Especialista",
    myAccount: "Minha Conta",
    logout: "Sair",
    onboarding: "Onboarding",
    documents: "Documentos",
    finalPackage: "Pacote Final",
    status: "Status",
  },
  chat: {
    title: "Chat com Especialista",
    subtitle: "Fale com um especialista sobre seu processo e próximos passos.",
    emptyTitle: "Nenhum chat disponível",
    emptySubtitle: "Quando o suporte for ativado, a conversa aparecerá aqui.",
    emptyHint: "Sem chats ativos ou encerrados no momento.",
    initialMessage:
      "Olá! Você está conversando com um especialista da Aplikei. Como posso ajudar no seu processo?",
    placeholder: "Digite sua dúvida...",
    previewResponse:
      "Seu chat com especialista está pronto para uso.",
    aiProblem: "Desculpe, tivemos um problema.",
    aiError: "Erro ao falar com o especialista.",
  },
  uploads: {
    title: "Documentos",
    subtitle: "Envie seus documentos por categoria. Aceitos: JPG, PNG (máx. 10MB).",
    tip: "Documentos devem estar legíveis, sem cortes e em boa resolução. Preferimos digitalizações a fotos.",
    received: "Recebido",
    pending: "Pendente",
    resubmit: "Reenviar",
    upload: "Enviar",
    docs: [
      "Passaporte (página principal)",
      "Foto 5x5cm",
      "Comprovação financeira",
      "Vínculos com o Brasil",
    ],
    successMsg: "Documento enviado com sucesso!",
    approved: "Aprovado",
    tipLabel: "Dica:",
    uploadingMsg: "Enviando...",
  },
  packagePDF: {
    title: "Pacote Final (PDF)",
    subtitle:
      "Gere seu PDF com checklist final, resumo do caso e instruções dos próximos passos.",
    disclaimer:
      "O Pacote Final é um resumo organizacional. Não constitui aconselhamento jurídico e não garante aprovação.",
    generate: "Gerar Pacote Final",
    generateDesc: "Conclua o onboarding para gerar seu PDF personalizado.",
    generateBtn: "Gerar PDF (conclua onboarding)",
    pdfContains: "O que o PDF contém:",
    pdfItems: [
      "Checklist final de documentos",
      "Resumo do caso (dados fornecidos)",
      "Instruções para os próximos passos",
      "Modelos de cartas (quando aplicável)",
    ],
    history: "Histórico de PDFs",
    draft: "Rascunho",
    download: "Baixar",
    finalPackage: "Pacote Final",
  },
  helpCenter: {
    title: "Suporte Operacional",
    subtitle:
      "Nosso time de suporte humano ajuda você a navegar na plataforma para que você foque na sua aplicação.",
    warning:
      "Não respondemos perguntas sobre estratégia, elegibilidade, chances ou aconselhamento jurídico. Apenas questões operacionais sobre o uso da plataforma.",
    importantText: "Importante:",
    weHelpWith: "✅ No que nosso suporte ajuda:",
    weHelpItems: [
      "Como usar o sistema e navegar na plataforma",
      "Onde e como enviar seus documentos",
      "Como pagar as taxas consulares/USCIS",
      "Como realizar agendamentos",
      "Como acompanhar o status do seu processo",
      "Como baixar seu pacote PDF final",
    ],
    weDoNotLabel: "❌ O que nosso suporte NÃO faz:",
    weDoNotItems: [
      "Fornecer aconselhamento jurídico ou estratégia de imigração",
      "Analisar elegibilidade ou chances de aprovação",
      "Preencher formulários oficiais do governo por você",
      "Representar você perante consulados ou USCIS",
      "Garantir aprovação de visto ou petição",
    ],
    faqTitle: "Perguntas frequentes",
    faqItems: [
      {
        q: "Como faço o upload de documentos?",
        a: "Vá em Documentos na barra lateral, clique no botão Enviar ao lado de cada documento e selecione o arquivo (PDF, JPG ou PNG, máx. 10MB).",
      },
      {
        q: "Como pago as taxas consulares/USCIS?",
        a: "O guia inclui instruções detalhadas sobre como pagar as taxas. Geralmente é feito no site oficial do consulado ou USCIS. A Aplikei não processa essas taxas.",
      },
      {
        q: "Como agendo a entrevista no consulado?",
        a: "Após pagar a taxa MRV, acesse o site do CASV para agendar. O guia explica o passo a passo.",
      },
      {
        q: "Como acompanho o status do meu processo?",
        a: "Se aplicável, você pode verificar o status no site do USCIS com seu número de recibo. O guia explica como.",
      },
      {
        q: "Como uso o chat com IA?",
        a: "Clique em 'Chat com IA' na barra lateral. A IA responde dúvidas sobre organização de dados e documentos. Não oferece aconselhamento jurídico.",
      },
    ],
    ticketTitle: "Abrir um chamado de ajuda",
    ticketSubtitle: "Selecione uma categoria e descreva sua dúvida operacional.",
    category: "Categoria (obrigatório)",
    selectCategory: "Selecionar...",
    categories: [
      "Como usar o sistema",
      "Onde enviar documentos",
      "Como pagar taxas",
      "Como agendar",
      "Como acompanhar status",
    ],
    yourQuestion: "Sua pergunta",
    questionPlaceholder: "Descreva sua dúvida operacional...",
    submit: "Enviar chamado",
  },
  legal: {
    lastUpdated: "Última atualização: Fevereiro de 2026",
    terms: {
      title: "Termos de Uso",
      sections: [
        {
          title: "1. Sobre a Aplikei",
          content:
            "A Aplikei é uma plataforma digital que oferece guias passo a passo com assistência de inteligência artificial para processos imigratórios simples. A Aplikei não é um escritório de advocacia, não oferece aconselhamento jurídico e não garante aprovações de vistos ou petições.",
        },
        {
          title: "2. Serviços oferecidos",
          content:
            "Ao adquirir um guia, o usuário recebe: um guia digital passo a passo, acesso à IA durante o processo (bônus), suporte humano operacional N1 (bônus) e geração de PDF de pacote final. O suporte humano é estritamente operacional e limitado a: uso do sistema, upload de documentos, pagamento de taxas, agendamentos e acompanhamento de status.",
        },
        {
          title: "3. Limitações",
          content:
            "A Aplikei não: analisa elegibilidade, oferece estratégia, avalia chances de aprovação, preenche formulários oficiais, representa clientes perante consulados ou USCIS, ou fornece qualquer tipo de aconselhamento jurídico.",
        },
        {
          title: "4. Responsabilidade do usuário",
          content:
            "O usuário é responsável pela precisão das informações fornecidas, preenchimento de formulários oficiais, submissão de aplicações e comparecimento a entrevistas. A Aplikei não se responsabiliza por decisões tomadas com base no conteúdo educacional fornecido.",
        },
        {
          title: "5. Privacidade e dados",
          content:
            "Os dados fornecidos são protegidos sob nossa Política de Privacidade. A Aplikei utiliza criptografia e as melhores práticas de segurança para proteger informações pessoais.",
        },
        {
          title: "6. Reembolso",
          content:
            "Consulte nossa Política de Reembolso para informações detalhadas sobre cancelamentos e devoluções.",
        },
      ],
      acceptNotice:
        "Ao usar a Aplikei, você declara que leu e concorda com estes Termos de Uso, a Política de Privacidade e os Avisos Legais.",
    },
    privacy: {
      title: "Política de Privacidade",
      sections: [
        {
          title: "1. Dados coletados",
          content:
            "Coletamos: dados de cadastro (nome, e-mail), dados do processo imigratório (informações pessoais, documentos), dados de uso da plataforma e dados de pagamento (processados por terceiros seguros).",
        },
        {
          title: "2. Uso dos dados",
          content:
            "Seus dados são usados para: prover o serviço contratado, personalizar o guia e o pacote final, processar pagamentos, fornecer suporte operacional e melhorar a plataforma.",
        },
        {
          title: "3. Compartilhamento",
          content:
            "Não vendemos dados pessoais. Compartilhamos apenas com: processadores de pagamento, serviços de infraestrutura (hospedagem, banco de dados) e quando exigido por lei.",
        },
        {
          title: "4. Segurança",
          content:
            "Utilizamos criptografia em trânsito e em repouso, controles de acesso e práticas de segurança da informação para proteger seus dados.",
        },
        {
          title: "5. Seus direitos",
          content:
            "Você pode solicitar acesso, correção ou exclusão de seus dados pessoais a qualquer momento através do canal de contato da plataforma.",
        },
        {
          title: "6. Cookies",
          content:
            "Utilizamos cookies essenciais para a operação da plataforma e cookies de análise para melhorar a experiência do usuário.",
        },
      ],
    },
    refund: {
      title: "Política de Reembolso",
      sections: [
        {
          title: "1. Prazo de reembolso",
          content:
            "Você pode solicitar o reembolso em até 7 dias após a compra, desde que não tenha gerado o Pacote Final (PDF).",
        },
        {
          title: "2. Condições",
          content:
            "O reembolso é disponível quando: o Pacote Final não foi gerado, o prazo de 7 dias não foi excedido e o serviço não foi usado de forma abusiva.",
        },
        {
          title: "3. Como solicitar",
          content:
            "Para solicitar o reembolso, abra um chamado no Centro de Ajuda (N1) selecionando a categoria 'Como usar o sistema' e mencionando seu pedido de estorno.",
        },
        {
          title: "4. Processamento",
          content:
            "O estorno será feito pelo mesmo método de pagamento utilizado na compra, em até 10 dias úteis após a aprovação.",
        },
        {
          title: "5. Exceções",
          content:
            "Não oferecemos reembolso após a geração do Pacote Final, após o prazo de 7 dias ou em casos de abuso da plataforma.",
        },
      ],
    },
    disclaimersPage: {
      title: "Avisos Legais",
      readCarefully: "Leia atentamente antes de usar a plataforma.",
      natureTitle: "Natureza do serviço",
      natureItems: [
        "A Aplikei não é um escritório de advocacia e não possui advogados prestando serviços jurídicos aos usuários.",
        "Não oferecemos aconselhamento jurídico, análise de elegibilidade, avaliação de chances ou estratégia imigratória.",
        "Não garantimos aprovação de vistos, extensões, trocas de status ou qualquer petição imigratória.",
        "Não representamos clientes perante consulados americanos, USCIS ou qualquer agência governamental.",
      ],
      offersTitle: "O que a Aplikei oferece",
      offersItems: [
        "Guias digitais educacionais passo a passo para processos imigratórios simples.",
        "IA para organização de dados e documentos (não para análise jurídica).",
        "Suporte humano exclusivamente operacional (N1): uso do sistema, uploads, taxas, agendamento e status.",
        "Geração de pacote final (PDF) com checklist, resumo e instruções.",
      ],
    },
  },
} as const;

export default dashboard;
