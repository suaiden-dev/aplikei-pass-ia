const checkout = {
  paymentPending: {
    title: "PAGAMENTO DA TAXA CONSULAR",
    desc: "Selecione a forma de pagamento desejada para prosseguir com o agendamento.",
    loadingInfo: "Carregando informações...",
    feeInProcessing: "TAXA EM PROCESSAMENTO",
    excellentEmailReceived: "Excelente! Sua confirmação de e-mail foi recebida. Agora nossa equipe está gerando o seu boleto para pagamento da taxa MRV.",
    generatingSlip: "Gerando Boleto...",
    processMinutes: "Este processo geralmente leva alguns minutos. Assim que estiver pronto, as opções de pagamento aparecerão aqui.",
    refreshStatus: "ATUALIZAR STATUS",
    slipDetails: "DETALHES DO BOLETO",
    cardDetails: "DETALHES DO CARTÃO",
    bankSlip: "Boleto Bancário",
    payAnyBank: "Pague em qualquer banco ou casa lotérica.",
    creditCard: "Cartão de Crédito",
    immediatePayment: "Pagamento imediato via portal do consulado.",
    slide1Title: "Acesse o Portal",
    slide1Desc: "Clique no botão abaixo para acessar o portal oficial do consulado e faça login usando as credenciais fornecidas aqui.",
    slide2Title: "Navegue para o Pagamento",
    slide2Desc: "No portal, localize o botão 'Pagar taxa de visto' para prosseguir com sua solicitação e chegar à seção de pagamento.",
    slide3Title: "Selecione Cartão de Crédito",
    slide3Desc: "Escolha a opção 'Cartão de Crédito' como forma de pagamento para pagar a taxa MRV instantaneamente.",
    slide4Title: "Confirme o Pagamento",
    slide4Desc: "Após pagar com sucesso, retorne aqui e clique em 'Já paguei a taxa' para continuar agendando sua entrevista.",
    downloadPdfSlip: "Baixar Boleto PDF",
    officialSlipAvailable: "O boleto oficial já está disponível.",
    importantInfo: "INFORMAÇÃO IMPORTANTE",
    compensationDesc: "A compensação do boleto pode levar até 48 horas úteis. Somente após esse prazo nosso sistema liberará o seu agendamento.",
    portalPayment: "Pagamento via Portal",
    accessOfficialPortal: "Para pagar com cartão de crédito, você deve acessar o portal oficial do consulado com os dados abaixo:",
    password: "Senha",
    goToPortal: "IR PARA O PORTAL",
    advantage: "VANTAGEM",
    creditCardInstant: "Pagamentos via cartão de crédito costumam ser compensados instantaneamente, agilizando o seu processo.",
    alreadyPaid: "JÁ REALIZEI O PAGAMENTO",
    secureEnvironment: "Ambiente seguro e criptografado"
  },
  feeProcessing: {
    title: "Taxa em Processamento",
    desc: "Estamos preparando a criação da sua conta no portal oficial do consulado americano.",
    nextStep: "PRÓXIMA ETAPA",
    consularAccountTitle: "Criação de Conta Consular",
    consularAccountDesc: "Para dar continuidade ao seu visto, criaremos seu acesso oficial.",
    accountEmailTitle: "Conta com seu E-mail",
    accountEmailDesc: "Uma conta foi criada utilizando seu email. Por favor, verifique sua caixa de entrada.",
    watchEmailTitle: "Fique Atento ao E-mail",
    watchEmailDesc: "Fique atento à sua caixa de entrada e spam para confirmar o email clicando no link assim que ele chegar.",
    alreadyConfirmedEmail: "JÁ CONFIRMEI O EMAIL",
    securityPriority: "A segurança dos seus dados é nossa prioridade total.",
    creatingCredentialsTitle: "Criando suas credenciais...",
    creatingCredentialsDesc: "Nossa equipe está configurando seu acesso no sistema consular. Isso costuma ser rápido.",
    successMsg: "Ótimo! Agora vamos para o pagamento.",
    errorUpdatingStatus: "Erro ao atualizar status."
  },
  product: {
    title: "Pagamento",
    scarcityBanner: {
      lastSlots: "Últimas vagas com desconto: só hoje!",
      timeLeft: "restantes",
      cta: "Corra"
    },
    summary: {
      mainService: "Serviço principal",
      dependentsCount: "Dependentes ({{count}}×)",
      slotsCount: "Quantidade de Vagas",
      subtotal: "Subtotal",
      total: "Total",
      stripeFee: "Taxa Stripe (~3.9% + $0.30)",
      exchangeTax: "Câmbio + IOF (est.)",
      estimatedNotice: "* Valor estimado. O câmbio final é calculado no momento do pagamento.",
      offLabel: "50% OFF"
    },
    dependents: {
      label: "Dependentes",
      slotsLabel: "Quantidade de Vagas",
      perPerson: "{{price}} por pessoa",
      perSlot: "{{price}} por vaga"
    },
    userData: {
      title: "Seus dados",
      fullName: "Nome completo",
      email: "E-mail",
      phone: "Telefone",
      password: "Crie uma senha para sua conta",
      passwordDesc: "Mínimo 6 caracteres",
      passwordAutoNotice: "Sua conta será criada automaticamente ao finalizar o pedido.",
      errors: {
        nameRequired: "Informe seu nome completo",
        nameShort: "Nome muito curto",
        emailRequired: "Informe seu e-mail",
        emailInvalid: "E-mail inválido",
        phoneRequired: "Informe um telefone válido",
        passwordShort: "A senha precisa ter pelo menos 6 caracteres.",
        emailTaken: "Este e-mail já possui uma conta. Por favor, faça login antes de contratar."
      }
    },
    paymentMethods: {
      title: "Forma de pagamento",
      card: {
        label: "Cartão",
        sublabel: "USD",
        notice: "Você será redirecionado para o checkout seguro da **Stripe**. Aceitamos Visa, Mastercard e Amex em dólar."
      },
      pix: {
        label: "Pix",
        sublabel: "BRL",
        notice: "Você será redirecionado para o **Stripe checkout com Pix**. Será gerado um QR Code em reais. O valor inclui câmbio + IOF."
      },
      parcelow: {
        label: "Parcelow",
        sublabel: "BRL",
        notice: "Pague em até **12x fixas** via **Parcelow**. Valor convertido para Real com taxas de parcelamento. Câmbio garantido.",
        cpfLabel: "CPF do Titular do Cartão",
        cpfPlaceholder: "000.000.000-00",
        cpfRequired: "Informe um CPF válido para prosseguir com Parcelow.",
        cpfNotice: "Necessário para emissão da nota fiscal pela Parcelow."
      },
      zelle: {
        label: "Zelle",
        sublabel: "USD",
        notice: "Envie o Zelle para:",
        name: "Nome:",
        email: "E-mail:",
        phone: "Telefone:",
        confirmTitle: "Confirmação de Pagamento",
        uploadProof: "Anexar comprovante",
        uploadDesc: "JPG ou PNG. Máx 8MB.",
        fileTooLarge: "Arquivo muito grande. Máx 8MB.",
        proofRequired: "Anexe o comprovante de pagamento.",
        submit: "Enviar Confirmação",
        pendingReview: "Confirmação recebida! Estamos analisando o comprovante para ativar seu guia. Você receberá um e-mail em breve.",
        goDashboard: "Ir para o Dashboard"
      },
      soon: "EM BREVE"
    },
    coupon: {
      label: "Cupom de desconto",
      placeholder: "Digite o código",
      apply: "Aplicar",
      applying: "Validando...",
      remove: "Remover",
      applied: "Cupom aplicado!",
      discount: "Desconto ({{code}})",
      errors: {
        invalid: "Cupom inválido ou expirado.",
        notApplicable: "Cupom não válido para este serviço.",
        minPurchase: "Valor mínimo de compra: US$ {{value}}"
      }
    },
    placeOrder: "Finalizar Pedido",
    redirecting: "Processando...",
    errorProcessing: "Erro ao processar pagamento. Por favor, tente novamente.",
    statusUnavailable: {
      title: "Serviço indisponível",
      desc: "Este guia está temporariamente indisponível para contratação. Você será redirecionado ao seu dashboard.",
      back: "Voltar ao Dashboard"
    },
    success: {
      activating: "Ativando seu processo...",
      confirmed: "Pagamento confirmado!",
      activated: "Seu processo foi ativado com sucesso.",
      checkEmail: "Verifique seu e-mail",
      checkEmailDesc: "Enviamos uma confirmação com os detalhes do seu processo.",
      accessDashboard: "Acesse seu dashboard",
      accessDashboardDesc: "Acompanhe o progresso do seu processo e receba atualizações em tempo real.",
      goDashboard: "Ir para o Dashboard",
      backHome: "Voltar ao início",
      errorTitle: "Aviso sobre o seu serviço",
      errorDesc: "Seu pagamento foi recebido com sucesso, mas o sistema encontrou um alerta ao iniciar o serviço:",
      sessionExpired: "Sessão expirada. Por favor, faça login novamente."
    }
  }
};

export default checkout;
