const admin = {
  shared: {
    back: "Volver",
    save: "Guardar",
    loading: "Cargando...",
    success: "¡Éxito!",
    error: "Error",
    cancel: "Cancelar",
    confirm: "Confirmar",
    administrativeAction: "Acción Administrativa",
  },
  cases: {
    title: "Casos",
    subtitle: "Gestión completa de las solicitudes de los clientes",
    refresh: "Actualizar",
    stats: {
      total: "Total de Casos",
      awaiting: "Esperando Revisión",
      active: "En Curso",
      completed: "Completados",
    },
    filters: {
      searchPlaceholder: "Buscar por nombre o correo...",
      allProducts: "Filtro: Todos los Productos",
      pendingActions: "Acciones Pendientes",
      viewAll: "Ver Todos",
    },
    table: {
      client: "Cliente",
      service: "Servicio",
      payment: "Pago",
      flowActions: "Flujo / Acciones",
      noResults: "No se encontraron procesos en este momento.",
      noName: "Sin Nombre",
      noEmail: "Correo no actualizado",
    },
    statusLabel: {
      uscisApproved: "Aprobado por USCIS",
      uscisDenied: "Denegado por USCIS",
      completed: "Completado",
      awaitingReview: "Revisión y Firma",
    },
    actions: {
      approve: "Aprobar",
      approveUscis: "Aprobar (Resultado USCIS)",
      reject: "Rechazar Paso",
      rejectUscis: "Negar (Resultado USCIS)",
    },
    messages: {
      loadError: "Error al cargar los procesos.",
      approveSuccess: "¡Paso aprobado para {name}!",
      approveFinalSuccess: "¡Proceso Completado (Aprobado)!",
      rejectSuccess: "Paso rechazado. El cliente tendrá que rehacerlo.",
      rejectFinalSuccess: "Proceso Completado (Denegado).",
      errorAction: "Error al ejecutar la acción: ",
    }
  },
  processDetail: {
    steps: {
      completed: "Etapa Completada",
      awaitingAction: "Esperando su acción",
    },
    mrv: {
      loginLabel: "Login Consulado (E-mail)",
      loginPlaceholder: "Correo de la cuenta consular",
      passwordLabel: "Contraseña Consulado",
      passwordPlaceholder: "Contraseña de la cuenta consular",
      voucherLabel: "Comprobante de Tasa MRV",
      voucherSent: "Comprobante Enviado",
      selectVoucher: "Seleccionar Comprobante PDF",
      finishGeneration: "Finalizar Generación de Tasa",
      messages: {
        fillFields: "Complete el login, contraseña y envíe el comprobante.",
        uploadSuccess: "¡Comprobante enviado con éxito!",
      }
    },
    scheduling: {
      upsellTitle: "Plan Upsell Adquirido",
      upsellAction: "Intervenir Según el Plan",
      sameLocation: "Mismo Lugar",
      differentLocations: "Lugares Diferentes",
      casvData: "Datos CASV",
      consulateData: "Datos Consulado",
      casvLocationPlaceholder: "Lugar del CASV",
      consulateLocationPlaceholder: "Lugar del Consulado",
      informClient: "Informar al Cliente",
      updateScheduling: "Actualizar Programación",
      messages: {
        fillCasv: "Complete los datos del CASV.",
        fillConsulate: "Complete los datos del Consulado.",
        updateSuccess: "¡Programación actualizada!",
        notifiedSuccess: "¡Cliente notificado de la programación!",
      }
    },
    motion: {
       panelTitle: "Formular Propuesta de Motion",
       clientInstructions: "Instrucciones del Cliente",
       clientReason: "Motivo Informado:",
       noReason: "No se proporcionó ninguna descripción.",
       denialLetter: "Carta de Negativa / Docs",
       strategyLabel: "Estrategia / Propuesta",
       strategyPlaceholder: "Describa la estrategia técnica para el Motion...",
       amountLabel: "Valor del Servicio ($)",
       sendProposal: "Enviar Propuesta al Cliente",
       finalPackageTitle: "Envío del Paquete Final (Motion)",
       packageReady: "Documento de Motion Listo",
       noPackage: "Aún no se ha enviado ningún paquete",
       selectPackage: "Seleccionar PDF Final",
    },
    rfe: {
       panelTitle: "Formular Propuesta de Respuesta RFE",
       infoTitle: "Información de la RFE",
       clientDescription: "Descripción del Cliente:",
       officialLetter: "Carta de RFE Oficial",
       strategyLabel: "Estrategia de Respuesta",
       strategyPlaceholder: "Describa cómo se responderá a la RFE...",
       amountLabel: "Valor de la Asesoría RFE ($)",
       sendProposal: "Enviar Propuesta de RFE",
       historyTitle: "Historial de RFE",
       cycle: "Ciclo",
       resultApproved: "Aprobado",
       resultNewRfe: "Nueva RFE",
       resultRejected: "Rechazado",
       amount: "Valor:",
    }
  },
  analysisPanel: {
    title: "Análisis Técnico del Especialista",
    subtitle: "Analice el caso del cliente y defina los próximos pasos.",
    clientExplanation: "Explicación del Cliente",
    clientDocuments: "Documentos Enviados",
    noDocuments: "Ningún documento enviado.",
    internalNotes: "Notas Internas (Opcional)",
    internalNotesPlaceholder: "Anote detalles técnicos sobre este caso...",
    finalMessage: "Mensaje para el Cliente",
    finalMessagePlaceholder: "Explique el resultado del análisis o pida más datos...",
    actions: {
      completeReview: "Completar Análisis",
      sendProposal: "Enviar Propuesta",
      requestMoreInfo: "Solicitar Información",
      uploadFinalDocs: "Subir Documentos Finales"
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
      errorSave: "Error al guardar el análisis.",
      missingFields: "Complete el mensaje final o envíe al menos un documento.",
      proposalSent: "¡Propuesta enviada al cliente!"
    }
  }
};

export default admin;
