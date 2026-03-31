const admin = {
  analysisPanel: {
    title: "Análisis Técnico del Especialista",
    subtitle: "Analice el caso del cliente y defina los siguientes pasos.",
    clientExplanation: "Explicación del Cliente",
    clientDocuments: "Documentos Enviados",
    noDocuments: "Ningún documento enviado.",
    internalNotes: "Notas Internas (Opcional)",
    internalNotesPlaceholder: "Anote detalles técnicos sobre este caso...",
    finalMessage: "Mensaje para el Cliente",
    finalMessagePlaceholder: "Explique el resultado del análisis o envíe más datos...",
    actions: {
      completeReview: "Concluir Análisis",
      sendProposal: "Enviar Propuesta",
      requestMoreInfo: "Solicitar Información",
      uploadFinalDocs: "Carga de Documentos Finales"
    },
    status: {
      pending: "Pendiente de Análisis",
      reviewing: "En Revisión",
      proposalSent: "Propuesta Enviada",
      completed: "Completado",
      rfeRequested: "RFE Solicitado",
      motionStarted: "Motion Iniciado"
    },
    labels: {
      caseComplexity: "Complejidad del Caso",
      low: "Baja",
      medium: "Media",
      high: "Alta",
      estimatedHours: "Horas Estimadas",
      expertAssigned: "Especialista Asignado"
    },
    messages: {
      successSave: "¡Análisis guardado con éxito!",
      errorSave: "Error al guardar análisis.",
      missingFields: "Complete el mensaje final o envíe al menos un documento.",
      proposalSent: "¡Propuesta enviada al cliente!"
    }
  }
};

export default admin;
