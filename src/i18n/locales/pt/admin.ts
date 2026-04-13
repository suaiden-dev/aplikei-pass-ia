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
    }
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
  }
};

export default admin;
