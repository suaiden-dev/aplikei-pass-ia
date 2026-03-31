const admin = {
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
