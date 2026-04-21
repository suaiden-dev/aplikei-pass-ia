const admin = {
  shared: {
    back: "Voltar",
    save: "Salvar",
    loading: "Carregando...",
    success: "Sucesso!",
    error: "Erro",
    cancel: "Cancelar",
    confirm: "Confirmar",
    administrativeAction: "Ação Administrativa",
    rejection: {
      confirm: "Confirmar Rejeição",
    },
    table: {
      empty: "Nenhum arquivo",
    },
    registration: "Registro",
    paid: "Pago",
  },
  overview: {
    stats: {
      customers: "Clientes",
      totalRevenue: "Receita Total",
      revenueSubtitle: "Receita total acumulada",
      pendingPayments: "Pagamentos Pendentes",
      pendingSubtitle: "Aguardando confirmação",
      activeSellers: "Vendedores Ativos",
      pendingPartners: "Parceiros Pendentes",
      partnersSubtitle: "Fila de aprovação"
    },
    charts: {
      monthlyRevenue: "Receita Mensal",
      growth: "{{percent}}% de crescimento",
      serviceDistribution: "Distribuição de Serviços",
      byVisaType: "Por tipo de visto",
      total: "Total"
    },
    recentActivity: {
      title: "Atividade Recente",
      paymentReceived: "Pagamento Recebido",
      newCustomer: "Novo Cliente",
      processUpdated: "Processo Atualizado",
      paymentPending: "Pagamento Pendente",
      hoursAgo: "há {{count}} horas",
      yesterday: "Ontem"
    }
  },
  cases: {
    title: "Cases",
    subtitle: "Gerenciamento completo das solicitações dos clientes",
    refresh: "Atualizar",
    stats: {
      total: "Total de Cases",
      awaiting: "Aguardando Revisão",
      active: "Em Andamento",
      completed: "Concluídos",
    },
    filters: {
      searchPlaceholder: "Buscar por nome ou e-mail...",
      allProducts: "Filtro: Todos Produtos",
      pendingActions: "Ações Pendentes",
      viewAll: "Ver Todos",
    },
    table: {
      client: "Cliente",
      service: "Serviço",
      payment: "Pagamento",
      flowActions: "Fluxo / Ações",
      noResults: "Nenhum processo encontrado no momento.",
      noName: "Sem Nome",
      noEmail: "E-mail não atualizado",
    },
    statusLabel: {
      uscisApproved: "Aprovado pela USCIS",
      uscisDenied: "Negado pela USCIS",
      completed: "Concluído",
      awaitingReview: "Revisão e Assinatura",
    },
    actions: {
      approve: "Aprovar",
      approveUscis: "Aprovar (Resultado USCIS)",
      reject: "Rejeitar Passo",
      rejectUscis: "Negar (Resultado USCIS)",
    },
    messages: {
      loadError: "Erro ao carregar processos.",
      approveSuccess: "Passo aprovado para {name}!",
      approveFinalSuccess: "Processo Concluído (Aprovado)!",
      rejectSuccess: "Passo rejeitado. O cliente precisará refazer.",
      rejectFinalSuccess: "Processo Concluído (Negado).",
      errorAction: "Erro ao executar ação: ",
    }
  },
  processDetail: {
    steps: {
      completed: "Etapa Concluída",
      awaitingAction: "Aguardando sua ação",
    },
    mrv: {
      loginLabel: "Login Consulado (E-mail)",
      loginPlaceholder: "E-mail da conta consular",
      passwordLabel: "Senha Consulado",
      passwordPlaceholder: "Senha da conta consular",
      voucherLabel: "Boleto da Taxa MRV",
      voucherSent: "Boleto Enviado",
      selectVoucher: "Selecionar Boleto PDF",
      finishGeneration: "Finalizar Geração de Taxa",
      messages: {
        fillFields: "Preencha o login, senha e envie o boleto.",
        uploadSuccess: "Boleto enviado com sucesso!",
      }
    },
    scheduling: {
      upsellTitle: "Plano Upsell Adquirido",
      upsellAction: "Intervir Conforme Plano",
      sameLocation: "Mesmo Local",
      differentLocations: "Locais Diferentes",
      casvData: "Dados CASV",
      consulateData: "Dados Consulado",
      casvLocationPlaceholder: "Local do CASV",
      consulateLocationPlaceholder: "Local do Consulado",
      informClient: "Informar ao Cliente",
      updateScheduling: "Atualizar Agendamento",
      messages: {
        fillCasv: "Preencha os dados do CASV.",
        fillConsulate: "Preencha os dados do Consulado.",
        updateSuccess: "Agendamento atualizado!",
        notifiedSuccess: "Cliente notificado do agendamento!",
      }
    },
    motion: {
       panelTitle: "Formular Proposta de Motion",
       clientInstructions: "Instruções do Cliente",
       clientReason: "Motivo Informado:",
       noReason: "Nenhuma descrição fornecida.",
       denialLetter: "Carta de Negativa / Docs",
       strategyLabel: "Estratégia / Proposta",
       strategyPlaceholder: "Descreva a estratégia técnica para o Motion...",
       amountLabel: "Valor do Serviço ($)",
       sendProposal: "Enviar Proposta ao Cliente",
       finalPackageTitle: "Envio do Pacote Final (Motion)",
       packageReady: "Documento de Motion Pronto",
       noPackage: "Nenhum pacote enviado ainda",
       selectPackage: "Selecionar PDF Final",
    },
    rfe: {
        panelTitle: "Formular Proposta de Resposta RFE",
        infoTitle: "Informações da RFE",
        clientDescription: "Descrição do Cliente:",
        officialLetter: "Carta de RFE Oficial",
        strategyLabel: "Estratégia de Resposta",
        strategyPlaceholder: "Descreva como a RFE será respondida...",
        amountLabel: "Valor da Assessoria RFE ($)",
        sendProposal: "Enviar Proposta de RFE",
        historyTitle: "Histórico de RFEs",
        cycle: "Ciclo",
        resultApproved: "Aprovado",
        resultNewRfe: "Nova RFE",
        resultRejected: "Reprovado",
        amount: "Valor:",
     },
     credentials: {
        title: "Credenciais CEAC / Application ID",
        appId: "Application ID",
        motherName: "Nome da Mãe (Resposta de Segurança)",
        birthYear: "Ano de Nascimento",
        sendBtn: "Enviar Credenciais ao Cliente",
     },
     notifications: {
        completed: "Processo Concluído",
        approved: "Etapa Aprovada",
        corrections: "Correções Necessárias",
     },
     officialForms: {
        title: "Formulários Oficiais",
        i539Form: "Formulário I-539",
        digitalDocDesc: "Documento preenchido digitalmente.",
        viewPdf: "Visualizar PDF",
        reject: "Reprovar",
     },
     coverLetter: {
        title: "Análise: Cover Letter",
        finalLetter: "Carta Final Gerada",
        generateBtn: "Gerar Cover Letter",
     },
     finalForms: {
        g1145: "G-1145",
        g1450: "G-1450",
     },
     i20Sevis: {
        title: "Revisão I-20 e SEVIS",
        rejectBtn: "Rejeitar",
        approveBtn: "Aprovar I-20 / SEVIS",
        requestCorrection: "Pedir Correção",
     },
     f1Documents: {
        title: "Análise Aplicakei: Documento I-20",
        approveBtn: "Aprovar Documentos",
     },
     f1FinalDocs: {
        title: "Comprovantes Estudantis (DS-160 / SEVIS)",
        ds160Signed: "DS-160 Assinada",
        finalProof: "Comprovante Final",
        approveBtn: "Aprovar Revisão Final",
     },
     b1b2FinalDocs: {
        title: "Comprovantes Finais DS-160",
        ds160Signed: "DS-160 Assinada",
        ceacProof: "Comprovante CEAC",
        approveBtn: "Aprovar Documentação",
     },
     casv: {
        title: "Agendamento CASV — Consulado",
        selectedConsulate: "Consulado Selecionado",
        noConsulate: "Consulado não informado",
        preferredDate: "Data Preferencial Solicitada",
        noDate: "Nenhuma data informada ainda.",
        confirmBtn: "Confirmar Agendamento",
        requestAdjustment: "Pedir Ajuste",
     },
     accountCreation: {
        title: "Criação de Conta no Site do Consulado",
        instruction: "Utilize os dados acima para criar a conta oficial no site do consulado. Uma vez criada, confirme abaixo para que o cliente possa validar o acesso.",
        confirmBtn: "Confirmar que Conta foi Criada",
     },
     finalPackage: {
        title: "Final Package",
        mergeBtn: "Merge All Documents",
        reviewPdf: "Review PDF",
        approveBtn: "Aprovar Etapa",
     },
     purchases: {
        title: "Histórico de Compras",
        slotsPaid: "Slots Pagos",
        noPurchases: "Nenhuma compra registrada via JSONB.",
        dependents: "Dependentes",
     },
     logs: {
        title: "Log de Alterações",
        noLogs: "Nenhuma alteração registrada ainda.",
        status: {
           active: "Ativo",
           awaitingReview: "Aguardando Revisão",
           completed: "Concluído",
           rejected: "Rejeitado",
        },
        actor: {
           admin: "Admin",
           client: "Cliente",
        },
        actions: {
           approved: "✅ Etapa Aprovada",
           returned: "🔄 Retornou para Cliente",
           inReview: "⏳ Marcou como Em Revisão",
           completed: "🎉 Processo Concluído",
           formSubmitted: "📤 Enviou Formulário / Avançou Etapa",
           sentForReview: "📨 Enviou para Revisão",
           internalChange: "🔧 Alteração Interna",
        },
        labels: {
           step: "Etapa",
           status: "Status",
        }
     }
  },
  customers: {
    title: "Clientes",
    subtitle: "Gerencie os clientes e usuários do seu sistema",
    searchInput: "Buscar por nome, e-mail ou telefone...",
    emptyState: "Nenhum cliente encontrado no momento.",
    stats: {
      totalUsers: "Total de Usuários",
      customers: "Clientes",
      admins: "Admins",
      newUsers: "Novos (7 dias)"
    },
    table: {
      customerContact: "Cliente / Contato",
      role: "Função",
      purchasesSpent: "Compras / Gastos",
      admissionDate: "Data de Admissão",
      actions: "Ações",
      noName: "Sem Nome",
      productCount: "{{count}} produto",
      productsCount: "{{count}} produtos"
    }
  },
  payments: {
    title: "Gestão de Pagamentos",
    subtitle: "Fila para verificação manual de transferências Zelle e ativação de serviços.",
    tabs: {
      pending: "Pendentes",
      approved: "Aprovados",
      rejected: "Rejeitados"
    },
    searchPlaceholder: "Buscar por serviço...",
    table: {
      customer: "Cliente",
      serviceName: "Nome do Serviço",
      payment: "Pagamento",
      actions: "Ações",
      noClientName: "Cliente sem nome",
      method: "Método: {{method}}",
      viewProof: "Ver comprovante",
      statusSuffix: "Status: {{status}}",
      expected: "Esperado: {{amount}}",
      code: "Código: {{code}}",
      autoProcessing: "Processamento Automático"
    },
    modals: {
      rejectTitle: "Rejeitar pagamento",
      reasonLabel: "Motivo (opcional)",
      reasonPlaceholder: "Ex: Comprovante ilegível, valor incorreto...",
      proofTitle: "Comprovante — {{name}}",
      openOriginal: "Abrir"
    },
    messages: {
      approveSuccess: "{{name}} aprovado!",
      rejectSuccess: "Pagamento rejeitado.",
      approveError: "Erro ao aprovar.",
      rejectError: "Erro ao rejeitar.",
      rejectedByAdmin: "Rejeitado pelo administrador."
    }
  },
  products: {
    title: "Produtos & Preços",
    subtitle: "Ative ou desative produtos e edite preços. Alterações afetam compras imediatamente.",
    stats: {
      totalProducts: "Total de Produtos",
      activeCount: "Ativos",
      inactiveCount: "Inativos",
      avgTicket: "Ticket Médio"
    },
    table: {
      serviceId: "ID do Serviço",
      name: "Nome",
      currency: "Moeda",
      price: "Preço",
      status: "Status",
      actions: "Ação",
      active: "Ativo",
      inactive: "Inativo",
      edit: "Editar",
      activate: "Ativar",
      deactivate: "Desativar",
      itemCount: "{{count}} item",
      itemsCount: "{{count}} itens"
    },
    categories: {
      main: "Serviços Principais",
      dependents: "Dependentes",
      mentorships: "Mentorias",
      additionalSupport: "Suporte Adicional",
      others: "Outros"
    },
    messages: {
      invalidValue: "Informe um valor válido.",
      updateSuccess: "Preço de \"{{name}}\" atualizado.",
      updateError: "Erro ao salvar preço: {{error}}",
      statusActivated: "\"{{name}}\" ativado. Clientes podem comprar.",
      statusDeactivated: "\"{{name}}\" desativado. Compras bloqueadas.",
      statusError: "Erro ao alterar status: {{error}}",
      noPermission: "Sem permissão para alterar este produto. Verifique as políticas de RLS."
    },
    footerHint: "Passe o mouse sobre o preço e clique em \"Editar\" para alterar. Use o botão Ativar/Desativar para controlar a disponibilidade."
  },
  analysisPanel: {
    title: "Análise Técnica do Especialista",
    subtitle: "Analise o caso do cliente e defina os próximos passos.",
    clientExplanation: "Explicação do Cliente",
    clientDocuments: "Documentos Enviados",
    noDocuments: "Nenhum documento enviado.",
    internalNotes: "Notas Internas (Opcional)",
    internalNotesPlaceholder: "Anote detalhes técnicos sobre este caso...",
    finalMessage: "Mensagem para o Cliente",
    finalMessagePlaceholder: "Explique o resultado da análise ou peça mais dados...",
    actions: {
      completeReview: "Concluir Análise",
      sendProposal: "Enviar Proposta",
      requestMoreInfo: "Solicitar Informações",
      uploadFinalDocs: "Upload de Documentos Finais"
    },
    status: {
      pending: "Pendente de Análise",
      reviewing: "Em Revisão",
      proposalSent: "Proposta Enviada",
      completed: "Concluído",
      rfeRequested: "RFE Solicitado",
      motionStarted: "Motion Iniciado"
    },
    labels: {
      caseComplexity: "Complexidade do Caso",
      low: "Baixa",
      medium: "Média",
      high: "Alta",
      estimatedHours: "Horas Estimadas",
      expertAssigned: "Especialista Atribuído"
    },
    messages: {
      successSave: "Análise salva com sucesso!",
      errorSave: "Erro ao salvar análise.",
      missingFields: "Preencha a mensagem final ou envie pelo menos um documento.",
      proposalSent: "Proposta enviada ao cliente!"
    }
  },
  coupons: {
    title: "Cupons de Desconto",
    subtitle: "Crie e gerencie cupons promocionais. Alterações afetam o checkout imediatamente.",
    createNew: "Criar Novo Cupom",
    stats: {
      total: "Total de Cupons",
      active: "Ativos",
      expired: "Expirados",
      totalUses: "Total de Usos"
    },
    form: {
      code: "Código do Cupom",
      codePlaceholder: "Ex: SAVE20",
      generateRandom: "Gerar",
      discountType: "Tipo de Desconto",
      percentage: "Porcentagem (%)",
      fixed: "Valor Fixo ($)",
      value: "Valor",
      valuePlaceholder: "Ex: 20",
      maxUses: "Limite de Usos",
      maxUsesPlaceholder: "Vazio = ilimitado",
      expiration: "Expiração",
      expirationOptions: {
        "1h": "1 hora",
        "6h": "6 horas",
        "12h": "12 horas",
        "24h": "24 horas",
        "48h": "48 horas",
        "7d": "7 dias",
        "30d": "30 dias",
        "custom": "Personalizado"
      },
      customDate: "Data de expiração",
      applicableSlugs: "Serviços aplicáveis",
      allServices: "Todos os serviços",
      minPurchase: "Valor mínimo de compra (USD)",
      minPurchasePlaceholder: "0.00",
      submit: "Criar Cupom"
    },
    table: {
      code: "Código",
      type: "Tipo",
      value: "Valor",
      uses: "Usos",
      expiresAt: "Expira em",
      status: "Status",
      actions: "Ações",
      copy: "Copiar",
      activate: "Ativar",
      deactivate: "Desativar",
      unlimited: "Ilimitado",
      noResults: "Nenhum cupom criado ainda."
    },
    status: {
      active: "Ativo",
      expired: "Expirado",
      depleted: "Esgotado",
      inactive: "Inativo"
    },
    messages: {
      createSuccess: "Cupom \"{{code}}\" criado com sucesso!",
      createError: "Erro ao criar cupom: {{error}}",
      toggleSuccess: "Cupom \"{{code}}\" {{status}}.",
      toggleError: "Erro ao alterar status: {{error}}",
      copied: "Código copiado!",
      invalidValue: "Informe um valor válido.",
      invalidCode: "Informe um código válido."
    }
  },
  chats: {
    title: "Centro de Mensagens",
    subtitle: "Suporte direto e acompanhamento de cases",
    searchPlaceholder: "Buscar conversa...",
    emptyState: "Nenhuma conversa",
    selectChat: "Selecione uma conversa",
    selectChatSubtitle: "Escolha um cliente na lista ao lado para iniciar o atendimento ou visualizar o histórico.",
    online: "Online",
    offline: "Offline",
    typeMessage: "Digite sua mensagem...",
    today: "Hoje",
    settings: "Configurações",
    finalizeProcess: "Finalizar Processo",
    finalizeConfirm: "Tem certeza que deseja finalizar este processo? Esta ação não pode ser desfeita.",
    processFinalized: "Processo finalizado com sucesso!"
  }
};

export default admin;
