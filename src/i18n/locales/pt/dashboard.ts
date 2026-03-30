const dashboard = {
  dashboard: {
    title: "Painel",
    welcome: "Bem-vindo de volta! Continue seu processo.",
    overallProgress: "Progresso geral",
    onboarding: "Onboarding",
    complete: "completo",
    cards: {
      currentService: "Meu serviço atual",
      currentServiceDesc: "Visto B1/B2 — Turismo e Negócios",
      inProgress: "Em andamento",
      checklist: "Checklist de documentos",
      checklistDesc: "3 de 8 documentos enviados",
      chatAI: "Conversar com a IA",
      chatAIDesc: "Tire dúvidas e organize seu processo",
      uploads: "Uploads",
      uploadsDesc: "Envie e gerencie seus documentos",
      generatePDF: "Gerar pacote final (PDF)",
      generatePDFDesc: "Disponível quando o onboarding estiver completo",
      help: "Suporte",
      helpDesc: "Dúvidas sobre uso da plataforma",
    },
    access: "Acessar",
    selfieModal: {
      title: "Configuração Inicial: Fotos Necessárias",
      desc: "Para prosseguir, precisamos de duas fotos: uma segurando seu passaporte para verificação de identidade, e uma foto digital (5x5) para a aplicação.",
      step1Title: "Passo 1: Verificação de Identidade",
      step1Desc:
        "Tire uma selfie segurando seu passaporte ao lado do rosto. Certifique-se de que os dados do passaporte estejam legíveis.",
      step2Title: "Passo 2: Foto Digital para o Visto",
      step2Desc:
        "Envie uma foto digital 5x5cm recente com fundo branco, olhando para a frente, sem óculos ou chapéus.",
      uploadBtn: "Selecionar Foto",
      selectVisaPhoto: "Selecionar Foto 5x5",
      nextStep: "Próximo Passo",
      finish: "Concluir Configuração",
      submitting: "Enviando...",
      success: "Fotos enviadas com sucesso!",
    },
    activeProcesses: "Seus Processos Ativos",
    selectProcess: "Selecionar Processo",
    getProcesses: "Obter Processos",
    comingSoon: "Em Breve",
    getStarted: "Contratar Agora",
    available: "Disponível",
    paymentSuccess: "Pagamento confirmado! Seu novo guia já está disponível abaixo.",
    errorUploadingSelfie: "Erro ao enviar selfie",
    remove: "Remover",
    selectSelfie: "Selecione sua selfie",
    or: "ou",
    status: {
      ds160InProgress: "Preenchendo DS-160",
      ds160Processing: "Processando DS-160",
      cosInProgress: "Onboarding: Informações e Foto",
      cosProcessing: "Revisando Solicitação",
      cosOfficialForms: "3. Formulários Oficiais",
      ds160uploadDocuments: "3. Anexar Documentos",
      ds160AwaitingReviewAndSignature: "4. Revisão e Assinatura",
      uploadsUnderReview: "4. Revisão de Documentos",
      casvSchedulingPending: "5. Agendamento Pendente",
      casvFeeProcessing: "6. Taxa em Processamento",
      casvPaymentPending: "7. Pagamento CASV Pendente",
      awaitingInterview: "8. Aguardando Entrevista",
      approved: "9. Aprovado",
      rejectedText: "Processo Negado",
      rejectedLabel: "Rejeitado",
      stepOf: "Etapa [step] de [total]",
    },
    myProcesses: "Meus Processos",
    trackStatus: "Acompanhe o status de todos os seus guias e aplicações.",
    noActiveProcesses: "Você ainda não possui processos ativos.",
    progress: "Progresso",
    accessDetails: "ACESSAR DETALHES",
  },
  sidebar: {
    dashboard: "Painel",
    onboarding: "Onboarding",
    chatAI: "Chat IA",
    documents: "Documentos",
    finalPackage: "Pacote Final",
    help: "Suporte",
    logout: "Sair",
  },
  chat: {
    title: "Chat IA",
    subtitle:
      "A IA ajuda a organizar dados e documentos. Não oferece aconselhamento jurídico.",
    initialMessage:
      "Olá! Sou a IA da Aplikei. Posso te ajudar a organizar seus dados e documentos para o processo. O que gostaria de saber?\n\n**Lembre-se:** Eu não ofereço aconselhamento jurídico, não analiso elegibilidade e não garanto aprovação.",
    placeholder: "Digite sua pergunta...",
    previewResponse:
      "Obrigado pela sua pergunta! Para uma resposta completa, o sistema de IA será conectado na versão final. Por enquanto, este é um preview do chat.",
    aiProblem: "Desculpe, tive um problema.",
    aiError: "Erro ao falar com a IA.",
  },
  uploads: {
    title: "Documentos",
    subtitle: "Envie seus documentos por categoria. Aceitos: JPG, PNG (máx. 10MB).",
    tip: "Documentos devem estar legíveis, sem cortes e em boa resolução. Escaneamentos são preferíveis a fotos.",
    received: "Recebido",
    pending: "Pendente",
    resubmit: "Reenviar",
    upload: "Upload",
    docs: [
      "Passaporte (página principal)",
      "Foto 5x5cm",
      "Comprovante financeiro",
      "Comprovante de vínculo",
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
    generateDesc: "Complete o onboarding para gerar seu PDF personalizado.",
    generateBtn: "Gerar PDF (complete o onboarding)",
    pdfContains: "O que o PDF contém:",
    pdfItems: [
      "Checklist final de documentos",
      "Resumo do caso (dados fornecidos)",
      "Instruções dos próximos passos",
      "Modelos de cartas (quando aplicável)",
    ],
    history: "Histórico de PDFs",
    draft: "Rascunho",
    download: "Baixar",
    finalPackage: "Pacote Final",
  },
  helpCenter: {
    title: "Suporte Amigável da Plataforma",
    subtitle:
      "Nossa equipe de suporte humano ajuda você a navegar pela plataforma para que você possa focar na sua aplicação.",
    warning:
      "Não respondemos dúvidas de estratégia, elegibilidade, chances ou aconselhamento jurídico. Apenas questões operacionais sobre uso da plataforma.",
    importantText: "Importante:",
    weHelpWith: "✅ Com o que nosso suporte ajuda:",
    weHelpItems: [
      "Como usar o sistema e navegar pela plataforma",
      "Onde e como fazer upload dos seus documentos",
      "Como pagar taxas consulares/USCIS",
      "Como agendar compromissos",
      "Como acompanhar o status do seu processo",
      "Como baixar seu pacote final em PDF",
    ],
    weDoNotLabel: "❌ O que nosso suporte NÃO faz:",
    weDoNotItems: [
      "Dar aconselhamento jurídico ou estratégia imigratória",
      "Analisar elegibilidade ou chances de aprovação",
      "Preencher formulários oficiais do governo por você",
      "Representá-lo perante consulados ou USCIS",
      "Garantir aprovação de visto ou petição",
    ],
    faqTitle: "Perguntas frequentes",
    faqItems: [
      {
        q: "Como faço upload de documentos?",
        a: "Vá em Documentos no menu lateral, clique no botão Upload ao lado de cada documento e selecione o arquivo (PDF, JPG ou PNG, máx. 10MB).",
      },
      {
        q: "Como pago as taxas consulares/USCIS?",
        a: "O guia inclui instruções detalhadas sobre como pagar as taxas. Geralmente é feito no site oficial do consulado ou USCIS. A Aplikei não processa essas taxas.",
      },
      {
        q: "Como agendar a entrevista no consulado?",
        a: "Após pagar a taxa MRV, acesse o site do CASV para agendar. O guia explica o passo a passo.",
      },
      {
        q: "Como acompanho o status do meu processo?",
        a: "Se aplicável, você pode verificar o status no site do USCIS com seu receipt number. O guia explica como.",
      },
      {
        q: "Como usar o chat da IA?",
        a: "Clique em 'Chat IA' no menu lateral. A IA responde perguntas sobre organização de dados e documentos. Ela não oferece aconselhamento jurídico.",
      },
    ],
    ticketTitle: "Abrir ticket de ajuda",
    ticketSubtitle: "Selecione a categoria e descreva sua dúvida operacional.",
    category: "Categoria (obrigatória)",
    selectCategory: "Selecione...",
    categories: [
      "Como usar o sistema",
      "Onde subir documentos",
      "Como pagar taxas",
      "Como agendar",
      "Como acompanhar status",
    ],
    yourQuestion: "Sua dúvida",
    questionPlaceholder: "Descreva sua dúvida operacional...",
    submit: "Enviar ticket",
  },
  legal: {
    lastUpdated: "Última atualização: Fevereiro de 2026",
    terms: {
      title: "Termos de Uso",
      sections: [
        {
          title: "1. Sobre a Aplikei",
          content:
            "A Aplikei é uma plataforma digital que oferece guias passo a passo com auxílio de inteligência artificial para processos imigratórios simples. A Aplikei não é escritório de advocacia, não oferece aconselhamento jurídico e não garante aprovação de vistos ou petições.",
        },
        {
          title: "2. Serviços oferecidos",
          content:
            "Ao adquirir um guia, o usuário recebe: guia digital passo a passo, acesso à IA durante o processo (bônus), suporte humano N1 operacional (bônus) e geração de pacote final em PDF. O suporte humano é estritamente operacional e limitado a: uso do sistema, upload de documentos, pagamento de taxas, agendamentos e acompanhamento de status.",
        },
        {
          title: "3. Limitações",
          content:
            "A Aplikei não: analisa elegibilidade, oferece estratégia, avalia chances de aprovação, preenche formulários oficiais, representa o cliente perante consulado ou USCIS, ou fornece qualquer tipo de aconselhamento jurídico.",
        },
        {
          title: "4. Responsabilidade do usuário",
          content:
            "O usuário é responsável pela veracidade das informações fornecidas, pelo preenchimento dos formulários oficiais, pela submissão da aplicação e pelo comparecimento a entrevistas. A Aplikei não se responsabiliza por decisões tomadas com base no conteúdo educacional fornecido.",
        },
        {
          title: "5. Privacidade e dados",
          content:
            "Os dados fornecidos são protegidos conforme nossa Política de Privacidade. A Aplikei utiliza criptografia e boas práticas de segurança para proteger informações pessoais.",
        },
        {
          title: "6. Reembolso",
          content:
            "Consulte nossa Política de Reembolso para informações detalhadas sobre cancelamentos e devoluções.",
        },
      ],
      acceptNotice:
        "Ao utilizar a Aplikei, você declara ter lido e concordado com estes Termos de Uso, a Política de Privacidade e os Disclaimers.",
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
            "Seus dados são utilizados para: fornecer o serviço contratado, personalizar o guia e o pacote final, processar pagamentos, fornecer suporte operacional e melhorar a plataforma.",
        },
        {
          title: "3. Compartilhamento",
          content:
            "Não vendemos dados pessoais. Compartilhamos apenas com: processadores de pagamento, serviços de infraestrutura (hospedagem, banco de dados) e quando exigido por lei.",
        },
        {
          title: "4. Segurança",
          content:
            "Utilizamos criptografia em trânsito e em repouso, controles de acesso e boas práticas de segurança da informação para proteger seus dados.",
        },
        {
          title: "5. Seus direitos",
          content:
            "Você pode solicitar acesso, correção ou exclusão dos seus dados pessoais a qualquer momento através do canal de contato da plataforma.",
        },
        {
          title: "6. Cookies",
          content:
            "Utilizamos cookies essenciais para o funcionamento da plataforma e cookies de análise para melhorar a experiência do usuário.",
        },
      ],
    },
    refund: {
      title: "Política de Reembolso",
      sections: [
        {
          title: "1. Prazo de reembolso",
          content:
            "Você pode solicitar reembolso em até 7 dias após a compra, desde que não tenha gerado o Pacote Final (PDF).",
        },
        {
          title: "2. Condições",
          content:
            "O reembolso está disponível quando: o Pacote Final não foi gerado, o prazo de 7 dias não foi excedido e o serviço não foi utilizado de forma abusiva.",
        },
        {
          title: "3. Como solicitar",
          content:
            "Para solicitar reembolso, abra um ticket na Central de Ajuda (N1) selecionando a categoria \"Como usar o sistema\" e mencionando sua solicitação de reembolso.",
        },
        {
          title: "4. Processamento",
          content:
            "O reembolso será processado na mesma forma de pagamento utilizada na compra, em até 10 dias úteis após a aprovação da solicitação.",
        },
        {
          title: "5. Exceções",
          content:
            "Não oferecemos reembolso após a geração do Pacote Final, após o prazo de 7 dias, ou em casos de uso abusivo da plataforma.",
        },
      ],
    },
    disclaimersPage: {
      title: "Disclaimers",
      readCarefully: "Leia atentamente antes de utilizar a plataforma.",
      natureTitle: "Natureza do serviço",
      natureItems: [
        "Aplikei não é escritório de advocacia e não possui advogados em seu quadro prestando serviços jurídicos aos usuários.",
        "Não oferecemos aconselhamento jurídico, análise de elegibilidade, avaliação de chances ou estratégia imigratória.",
        "Não garantimos aprovação de vistos, extensões, trocas de status ou qualquer petição imigratória.",
        "Não representamos o cliente perante consulados americanos, USCIS ou qualquer órgão governamental.",
      ],
      offersTitle: "O que a Aplikei oferece",
      offersItems: [
        "Guias digitais educacionais passo a passo para processos imigratórios simples.",
        "IA para organização de dados e documentos (não para análise jurídica).",
        "Suporte humano exclusivamente operacional (N1): uso do sistema, upload, taxas, agendamento e status.",
        "Geração de pacote final (PDF) com checklist, resumo e instruções.",
      ],
    },
  },
} as const;

export default dashboard;
