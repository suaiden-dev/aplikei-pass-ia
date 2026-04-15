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
  overview: {
    stats: {
      customers: "Clientes",
      totalRevenue: "Ingresos Totales",
      revenueSubtitle: "Ingresos totales acumulados",
      pendingPayments: "Pagos Pendentes",
      pendingSubtitle: "Esperando confirmación",
      activeSellers: "Vendedores Activos",
      pendingPartners: "Socios Pendientes",
      partnersSubtitle: "Cola de aprobación"
    },
    charts: {
      monthlyRevenue: "Ingresos Mensuales",
      growth: "{{percent}}% de crecimiento",
      serviceDistribution: "Distribución de Servicios",
      byVisaType: "Por tipo de visa",
      total: "Total"
    },
    recentActivity: {
      title: "Actividad Reciente",
      paymentReceived: "Pago Recibido",
      newCustomer: "Nuevo Cliente",
      processUpdated: "Proceso Actualizado",
      paymentPending: "Pago Pendiente",
      hoursAgo: "hace {{count}} horas",
      yesterday: "Ayer"
    }
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
  customers: {
    title: "Clientes",
    subtitle: "Administre los clientes y usuarios de su sistema",
    searchInput: "Buscar por nombre, correo o teléfono...",
    emptyState: "No se encontraron clientes en este momento.",
    stats: {
      totalUsers: "Total de Usuarios",
      customers: "Clientes",
      admins: "Administradores",
      newUsers: "Nuevos (7 días)"
    },
    table: {
      customerContact: "Cliente / Contacto",
      role: "Rol",
      purchasesSpent: "Compras / Gastos",
      admissionDate: "Fecha de Admisión",
      actions: "Acciones",
      noName: "Sin Nombre",
      productCount: "{{count}} producto",
      productsCount: "{{count}} productos"
    }
  },
  payments: {
    title: "Gestión de Pagos",
    subtitle: "Cola para verificación manual de transferencias Zelle y activación de servicios.",
    tabs: {
      pending: "Pendientes",
      approved: "Aprobados",
      rejected: "Rechazados"
    },
    searchPlaceholder: "Buscar por servicio...",
    table: {
      customer: "Cliente",
      serviceName: "Nombre del Servicio",
      payment: "Pago",
      actions: "Acciones",
      noClientName: "Cliente sin nombre",
      method: "Método: {{method}}",
      viewProof: "Ver comprobante",
      statusSuffix: "Estado: {{status}}",
      expected: "Esperado: {{amount}}",
      code: "Código: {{code}}",
      autoProcessing: "Procesamiento Automático"
    },
    modals: {
      rejectTitle: "Rechazar pago",
      reasonLabel: "Motivo (opcional)",
      reasonPlaceholder: "Ej: Comprobante ilegible, valor incorrecto...",
      proofTitle: "Comprobante — {{name}}",
      openOriginal: "Abrir"
    },
    messages: {
      approveSuccess: "¡{{name}} aprobado!",
      rejectSuccess: "Pago rechazado.",
      approveError: "Error al aprobar.",
      rejectError: "Error al rechazar.",
      rejectedByAdmin: "Rechazado por el administrador."
    }
  },
  products: {
    title: "Productos y Precios",
    subtitle: "Active o desactive productos y edite precios. Los cambios afectan las compras de inmediato.",
    stats: {
      totalProducts: "Total de Productos",
      activeCount: "Activos",
      inactiveCount: "Inactivos",
      avgTicket: "Ticket Promedio"
    },
    table: {
      serviceId: "ID del Servicio",
      name: "Nombre",
      currency: "Moneda",
      price: "Precio",
      status: "Estado",
      actions: "Acción",
      active: "Activo",
      inactive: "Inactivo",
      edit: "Editar",
      activate: "Activar",
      deactivate: "Desactivar",
      itemCount: "{{count}} artículo",
      itemsCount: "{{count}} artículos"
    },
    categories: {
      main: "Servicios Principales",
      dependents: "Dependientes",
      mentorships: "Mentorías",
      additionalSupport: "Soporte Adicional",
      others: "Otros"
    },
    messages: {
      invalidValue: "Ingrese un valor válido.",
      updateSuccess: "Precio de \"{{name}}\" actualizado.",
      updateError: "Error al guardar el precio: {{error}}",
      statusActivated: "\"{{name}}\" activado. Los clientes pueden comprar.",
      statusDeactivated: "\"{{name}}\" desactivado. Compras bloqueadas.",
      statusError: "Error al cambiar el estado: {{error}}",
      noPermission: "Sin permiso para cambiar este producto. Verifique las políticas de RLS."
    },
    footerHint: "Pase el mouse sobre el precio y haga clic en \"Editar\" para cambiar. Use el botón Activar/Desactivar para controlar la disponibilidad."
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
  },
  coupons: {
    title: "Cupones de Descuento",
    subtitle: "Crea y gestiona cupones promocionales. Los cambios se aplican al checkout inmediatamente.",
    createNew: "Crear Nuevo Cupón",
    stats: {
      total: "Total de Cupones",
      active: "Activos",
      expired: "Expirados",
      totalUses: "Total de Usos"
    },
    form: {
      code: "Código del Cupón",
      codePlaceholder: "Ej: SAVE20",
      generateRandom: "Generar",
      discountType: "Tipo de Desconto",
      percentage: "Porcentaje (%)",
      fixed: "Valor Fixo ($)",
      value: "Valor",
      valuePlaceholder: "Ej: 20",
      maxUses: "Límite de Usos",
      maxUsesPlaceholder: "Vacío = ilimitado",
      expiration: "Expiración",
      expirationOptions: {
        "1h": "1 hora",
        "6h": "6 horas",
        "12h": "12 horas",
        "24h": "24 horas",
        "48h": "48 horas",
        "7d": "7 días",
        "30d": "30 días",
        "custom": "Personalizado"
      },
      customDate: "Fecha de expiración",
      applicableSlugs: "Servicios aplicables",
      allServices: "Todos los servicios",
      minPurchase: "Compra mínima (USD)",
      minPurchasePlaceholder: "0.00",
      submit: "Crear Cupón"
    },
    table: {
      code: "Código",
      type: "Tipo",
      value: "Valor",
      uses: "Usos",
      expiresAt: "Expira en",
      status: "Estado",
      actions: "Acciones",
      copy: "Copiar",
      activate: "Ativar",
      deactivate: "Desactivar",
      unlimited: "Ilimitado",
      noResults: "Ningún cupón creado aún."
    },
    status: {
      active: "Activo",
      expired: "Expirado",
      depleted: "Agotado",
      inactive: "Inativo"
    },
    messages: {
      createSuccess: "¡Cupón \"{{code}}\" creado con éxito!",
      createError: "Error al crear cupón: {{error}}",
      toggleSuccess: "Cupón \"{{code}}\" {{status}}.",
      toggleError: "Error al cambiar estado: {{error}}",
      copied: "¡Código copiado!",
      invalidValue: "Ingrese un valor válido.",
      invalidCode: "Ingrese un código válido."
    }
  }
};

export default admin;
