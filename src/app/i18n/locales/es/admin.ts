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
    table: {
      empty: "Ningún archivo",
    },
    registration: "Registro",
    paid: "Pagado",
    roleLabels: {
      master: "Master",
      admin_lawyer: "Abogado Admin",
      manager: "Gerente",
      seller: "Vendedor",
      customer: "Cliente",
    },
    view: "Ver",
    select: "Seleccionar",
    remove: "Eliminar",
    locale: "es-ES",
    examplePrefix: "Ej:"
  },
  nav: {
    overview: "Resumen General",
    dashboard: "Dashboard",
    matters: "Procesos",
    revenue: "Finanzas",
    finance_analytics: "Analítica Financiera",
    lawyers: "Abogados",
    products: "Productos",
    chats: "Mensajes",
    customers: "Clientes",
    coupons: "Cupones",
    plans: "Planes",
    earnings: "Ventas",
    roles: "Equipo",
    pageBuilder: "Constructor de Páginas",
    billing: "Facturación",
    settings: "Configuración",
    paymentSettings: "Métodos de Pago",
    withdrawals: "Retiros",
    billings: "Cobros",
    offices: "Oficinas",
    subscription: "Mi Suscripción",
    companyProfile: "Perfil de la Empresa",
    discountRules: "Reglas de Descuento",
    payoutSettings: "Configuración de Retiros",
    legalTerms: "Términos Legales",
  },
  financeAnalytics: {
    title: "Analítica Financiera",
    masterOnly: "Solo Master",
    subtitle: "Seguimiento avanzado del rendimiento y ganancias de la plataforma",
    charts: {
      revenueGrowth: "Crecimiento de Ingresos",
      revenueVsProfit: "Ingresos vs Ganancia",
      salesByProduct: "Ventas por Producto",
      revenueLegend: "Ingresos",
      profitLegend: "Ganancia",
    },
    table: {
      title: "Transacciones Recientes",
      growthBadge: "+12.5% este mes",
      customer: "Cliente",
      office: "Oficina",
      product: "Producto",
      amount: "Monto",
      method: "Método",
      action: "Acción",
      details: "Detalles",
      empty: "No se encontraron transacciones para analítica.",
    },
    states: {
      loadErrorTitle: "Error al cargar datos",
      retry: "Reintentar",
    },
    modal: {
      title: "Detalles de la Transacción",
      customer: "Cliente",
      office: "Oficina",
      product: "Producto",
      total: "Total",
      statusMethod: "Estado / Método",
      close: "Cerrar",
    },
    filters: {
      allStatus: "Todos los estados",
      allMethods: "Todos los métodos",
      allTime: "Todo el período"
    }
  },
  payoutSettings: {
    title: "Configuración de Retiros",
    subtitle: "Configure sus métodos de pago y preferencias de retiro",
    methodTitle: "Método de Retiro",
    methodSubtitle: "Seleccione cómo desea recibir sus pagos",
    stripeInfo: "No se requiere configuración. Proporcionará su enlace de Stripe durante el proceso de retiro.",
    zelleInfo: "Configure sus detalles de Zelle a continuación para habilitar transferencias directas a su cuenta.",
    zelleTitle: "Detalles de Zelle",
    zelleSubtitle: "Información requerida para pagos por Zelle",
    accountName: "Nombre de la Cuenta",
    zelleId: "ID de Zelle (Correo electrónico o Teléfono)",
    sections: {
      paymentLinks: {
        title: "Enlaces de Pago",
        description: "Configure sus enlaces de pago directo para clientes",
        stripe: "Enlace de Pago Stripe",
        zelle: "Enlace de Pago Zelle",
        stripePlaceholder: "https://buy.stripe.com/...",
        zellePlaceholder: "https://zellepay.com/..."
      },
      zelleConfig: {
        title: "Configuración de Zelle",
        description: "Detalles específicos para recibir pagos vía Zelle",
        name: "Nombre de la Cuenta Zelle",
        identifier: "Identificador Zelle (Correo/Teléfono)",
        namePlaceholder: "Nombre completo en la cuenta",
        identifierPlaceholder: "correo@ejemplo.com o teléfono"
      }
    },
    messages: {
      saveSuccess: "¡Configuración de retiros actualizada con éxito!",
      saveError: "Error al guardar la configuración de retiros.",
      loadError: "Error al cargar la configuración de retiros.",
      enableAtLeastOne: "Active al menos un método de retiro antes de guardar.",
      enableHint: "Active al menos un método de retiro y haga clic en guardar.",
      requestCreated: "¡Solicitud de retiro creada con éxito!"
    },
    saveBtn: "Guardar Configuración",
    savingBtn: "Guardando..."
  },
  overview: {
    title: "Resumen General",
    description: "Métricas financieras y operativas de alto nivel",
    sections: {
      revenueTrajectory: "Trayectoria de Ingresos",
      revenueSplit: "Distribución de Ingresos",
      topLawyers: "Principales Abogados",
      productDistribution: "Distribución de Productos"
    },
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
      total: "Total",
      last6Months: "Últimos 6 meses",
      casesCount: "{{count}} casos"
    },
    recentActivity: {
      title: "Actividad Reciente",
      paymentReceived: "Pago Recibido",
      newCustomer: "Nuevo Cliente",
      processUpdated: "Proceso Actualizado",
      paymentPending: "Pago Pendiente",
      hoursAgo: "hace {{count}} horas",
      yesterday: "Ayer"
    },
    master: {
      title: "Resumen Master",
      description: "Métricas globales de la plataforma para administración Master.",
      stats: {
        totalRevenue: "Ingresos Totales",
        lawyersCount: "Número de Abogados",
        customersCount: "Número de Clientes",
        processesCount: "Procesos Totales",
        zellePayments: "Pagos por Zelle",
        requestedPayments: "Solicitudes de Pago"
      },
      recentActivity: "Actividad Reciente"
    },
    admin_lawyer: {
      title: "Resumen General",
      description: "Métricas y control financiero de tu oficina.",
      stats: {
        revenue: "Ingresos",
        fees: "Comisiones",
        activeProcesses: "Procesos activos",
        totalProcesses: "Total de procesos",
        finishedProcesses: "Procesos finalizados",
        availableBalance: "Saldo disponible para retiro",
        availableBalanceSubtitle: "Disponible después de 14 dias",
        withdrawBtn: "Solicitar Retiro"
      },
      modals: {
        withdrawal: {
          title: "Solicitar Retiro",
          description: "Solicita el retiro de tu saldo disponible. Los fondos se enviarán al método de pago configurado.",
          amountLabel: "Valor del Retiro",
          amountPlaceholder: "0.00",
          methodLabel: "Método de Pago",
          paymentLinkLabel: "Link de Pago Stripe (para este retiro)",
          paymentLinkPlaceholder: "https://buy.stripe.com/...",
          paymentLinkHint: "Crea un link de pago en tu panel de Stripe con el valor exacto de este retiro.",
          zelleConfirmation: "Confirmación Zelle",
          zelleRecipientHint: "El retiro se enviará a:",
          zelleNameNotSet: "Nombre de la cuenta no configurado",
          zelleIdNotSet: "ID Zelle no configurado",
          limitReached: "El valor excede el saldo disponible.",
          confirmBtn: "Confirmar Solicitud",
          success: "Solicitud de retiro enviada.",
          error: "Error al solicitar el retiro."
        }
      }
    },
    manager: {
      title: "Resumen del Gerente",
      description: "Métricas de ejecución del equipo y de la oficina.",
      stats: {
        revenue: "Ingresos",
        activeProcesses: "Procesos activos",
        totalProcesses: "Total de procesos",
        finishedProcesses: "Procesos finalizados",
        completionRate: "Tasa de finalización",
        availableBalance: "Saldo disponible",
        availableBalanceSubtitle: "Vista solo de lectura para gerentes"
      }
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
      flowActions: "Flujo / Ações",
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
    },
    clientPortalAccess: "Acceso al Portal del Cliente",
    clientPortalAccessDesc: "Comparta este enlace con los clientes para que puedan iniciar sesión y realizar el seguimiento de todos sus procesos.",
    showLink: "Mostrar Enlace",
    copyLink: "Copiar"
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
        finalPackageLoading: "Subiendo pacote final de RFE...",
        finalPackageTitle: "Envío del Paquete Final (RFE)",
        finalPackageReady: "Paquete final de RFE listo",
        selectFinalPdf: "Seleccionar PDF Final",
        provideToClient: "Disponibilizar al Cliente",
     },
     credentials: {
        title: "Credenciales CEAC / Application ID",
        appId: "Application ID",
        motherName: "Nombre de la Madre (Respuesta de Seguridad)",
        birthYear: "Año de Nacimiento",
        sendBtn: "Enviar Credenciales al Cliente",
     },
     notifications: {
        completed: "Proceso Completado",
        approved: "Etapa Aprovada",
        corrections: "Correcciones Necesarias",
     },
     officialForms: {
        title: "Formularios Oficiales",
        i539Form: "Formulario I-539",
        digitalDocDesc: "Documento cumplimentado digitalmente.",
        viewPdf: "Visualizar PDF",
        reject: "Rechazar",
     },
     coverLetter: {
        title: "Análisis: Cover Letter",
        finalLetter: "Carta Final Generada",
        generateBtn: "Generar Cover Letter",
     },
     finalForms: {
        g1145: "G-1145",
        g1450: "G-1450",
     },
     i20Sevis: {
        title: "Revisión I-20 y SEVIS",
        rejectBtn: "Rechazar",
        approveBtn: "Aprobar I-20 / SEVIS",
        requestCorrection: "Pedir Corrección",
     },
     f1Documents: {
        title: "Análisis Aplicakei: Documento I-20",
        approveBtn: "Aprovar Documentos",
     },
     f1FinalDocs: {
        title: "Comprobantes Estudiantiles (DS-160 / SEVIS)",
        ds160Signed: "DS-160 Firmada",
        finalProof: "Comprobante Final",
        approveBtn: "Aprobar Revisión Final",
     },
     b1b2FinalDocs: {
        title: "Comprobantes Finales DS-160",
        ds160Signed: "DS-160 Firmada",
        ceacProof: "Comprobante CEAC",
        approveBtn: "Aprobar Documentación",
     },
     casv: {
        title: "Programación CASV — Consulado",
        selectedConsulate: "Consulado Seleccionado",
        noConsulate: "Consulado no informado",
        preferredDate: "Fecha Preferencial Solicitada",
        noDate: "Aún no se ha proporcionado ninguna fecha.",
        confirmBtn: "Confirmar Programación",
        requestAdjustment: "Pedir Ajuste",
     },
     accountCreation: {
        title: "Creación de Cuenta en el Sitio del Consulado",
        instruction: "Utilice los datos anteriores para crear la cuenta oficial en el sitio del consulado. Una vez creada, confirme a continuación para que el cliente possa validar el acesso.",
        confirmBtn: "Confirmar que la Cuenta fue Creada",
     },
     finalPackage: {
        title: "Final Package",
        mergeBtn: "Merge All Documents",
        reviewPdf: "Review PDF",
        approveBtn: "Aprobar Etapa",
     },
     purchases: {
        title: "Historial de Compras",
        slotsPaid: "Slots Pagados",
        noPurchases: "Ninguna compra registrada a través de JSONB.",
        dependents: "Dependientes",
     },
     logs: {
        title: "Log de Alterações",
        noLogs: "Aún no se ha registrado ninguna alteración.",
        status: {
           active: "Activo",
           awaitingReview: "Esperando Revisión",
           completed: "Completado",
           rejected: "Rechazado",
        },
        actor: {
           admin: "Admin",
           client: "Cliente",
        },
        actions: {
           approved: "✅ Etapa Aprobada",
           returned: "🔄 Regresó al Cliente",
           inReview: "⏳ Marcado como En Revisión",
           completed: "🎉 Proceso Completado",
           formSubmitted: "📤 Envió Formulario / Avanzó Etapa",
           sentForReview: "📨 Enviado para Revisión",
           internalChange: "🔧 Alteración Interna",
        },
        labels: {
           step: "Etapa",
           status: "Estado",
        }
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
  notificationsCenter: {
    title: "Notificaciones",
    markAll: "Marcar todo",
    emptyTitle: "Sin notificaciones",
    emptySubtitle: "¡Todo al día!",
    viewFullLog: "Ver log completo",
    filters: {
      all: "Todas",
      unread: "No leídas",
      adminAction: "Admin",
      clientAction: "Cliente",
      system: "Sistema",
    },
    labels: {
      system: "Notificación",
      actionRequiredReview: "Acción requerida: revisar etapa",
      actionRequiredReviewMessage: "Un cliente finalizó una etapa e está esperando su revisión.",
      clientCompletedStepMessage: "El cliente completó la etapa \"{{step}}\" de {{service}} e está esperando su revisión.",
      clientCompletedGenericMessage: "El cliente completó una etapa de {{service}} e está esperando su revisão.",
      stepApproved: "Etapa aprobada",
      stepApprovedMessage: "Su etapa fue aprobada y ya puede continuar a la siguiente.",
      changesRequired: "Cambios necesarios",
      changesRequiredMessage: "Se solicitaron cambios. Revise los detalles y envíe nuevamente.",
      processCompleted: "Processo completado",
      processCompletedMessage: "Su proceso ha sido completado.",
      interviewScheduled: "Entrevista programada",
      interviewScheduledMessage: "Su entrevista está programada. Revise fecha y lugar en su proceso.",
      underReview: "Estamos Revisando!",
      underReviewMessage: "Tu etapa se envió correctamente para nuestro equipo de análisis. Espera la validación.",
    },
  },
  payments: {
    title: "Gestión de Pagos",
    subtitle: "Cola para verificación manual de transferencias Zelle y activación de servicios.",
    tabs: {
      pending: "Verificación Zelle",
      officeRequests: "Solicitudes de Retiro",
      approved: "Pagos Aprobados"
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
      autoProcessing: "Procesamiento Automático",
      noResults: "No se encontraron pagos en esta categoría."
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
    footerHint: "Pase el mouse sobre el precio y haga clic en \"Editar\" para cambiar. Use el botón Activar/Desactivar para controlar la disponibilidad.",
    builder: {
        title: "Constructor de Productos y Ofertas",
        subtitle: "Configure los servicios, precios y upsells que sus clientes verán durante cada flujo de solicitud.",
        stats: {
            mainVisas: "Visados Principales",
            active: "Activos",
            avgTicket: "Ticket Promedio"
        },
        noMainVisas: "No se encontraron visados principales.",
        flowsTitle: "Flujos de Solicitud",
        flowsSubtitle: "Seleccione el flujo del visado principal para configurar precios, add-ons y ofertas de finalización.",
        statusActive: "Activo",
        statusInactive: "Inactivo",
        draftMode: "Modo Borrador",
        unsavedChanges: "Cambios no guardados en esta página.",
        saveBtn: "Guardar Configuración",
        savingBtn: "Guardando...",
        phases: {
            initial: "Fase Inicial",
            initialDesc: "Precio del producto principal utilizado por este enlace de checkout.",
            addons: "Add-ons & Upsells",
            addonsEmpty: "No hay add-ons mapeados para este flujo.",
            finalization: "Finalización",
            finalizationEmpty: "No hay ofertas de finalización mapeadas para este flujo."
        },
        priceLabel: "Precio (USD)",
        checkoutLink: "Enlace de checkout",
        copyLinkTitle: "Copiar enlace de checkout",
        setSlugWarning: "Defina el slug de la oficina antes de compartir este enlace del producto.",
        inactiveWarning: "Este producto está inactivo. Actívelo antes de compartir el enlace.",
        includedBadge: "Incluido",
        includedDescription: "Servicio principal seleccionado para este flujo.",
        addonsDescription: "Oferta complementaria en esta etapa.",
        finalizationDescription: "Oportunidade de venta cruzada en la etapa final.",
        interviewSpecialist: {
            title: "Especialista de Entrevista",
            subtitle: "Las asesorías Bronze, Silver & Gold se activan todas juntas.",
            importantNote: "Importante: Cualquier cambio en este producto, incluyendo el estado de activación o el precio, se aplicará automáticamente al producto {crossFlow} también.",
            lockWarning: "Defina los precios para todos los niveles antes de activar."
        },
        priceNotConfigurable: "Precio no configurable aquí.",
        appliedTo: "Aplicado a",
        whenPurchased: "Al comprar",
        configureBtn: "Configurar",
        errorPriceGreaterThanZero: "Defina un precio mayor que cero para activar este producto."
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
  },
  chats: {
    title: "Centro de Mensajes",
    subtitle: "Clientes que compraron análisis",
    searchPlaceholder: "Buscar conversación...",
    emptyState: "Sin conversaciones",
    selectChat: "Selecciona una conversación",
    selectChatSubtitle: "Elige un cliente de la lista para iniciar el servicio o ver el historial.",
    online: "En línea",
    offline: "Desconectado",
    typeMessage: "Escribe tu mensaje...",
    today: "Hoy",
    settings: "Configuración",
    finalizeProcess: "Finalizar Proceso",
    finalizeConfirm: "¿Estás seguro de que deseas finalizar este processo? Esta acción no se puede deshacer.",
    processFinalized: "¡Proceso finalizado con éxito!"
  },
  teams: {
    title: "Gestión de Equipo",
    subtitle: "Administra accesos y permisos de los miembros de tu oficina",
    selectOffice: "Seleccionar oficina",
    generateLinkBtn: "Agregar colaborador",
    copySuccess: "¡Enlace de registro copiado!",
    roles: {
      vendedor: "Vendedor",
      gerente: "Gerente",
      seller: "Vendedor",
      manager: "Gerente",
      admin: "Admin"
    },
    pending: {
      title: "Solicitudes pendientes",
      subtitle: "Nuevos membros esperando aprobación",
      newBadge: "{{count}} NUEVOS",
      table: {
        candidate: "Candidato",
        requestedRole: "Rol solicitado",
        requestDate: "Fecha de solicitud",
        actions: "Acciones"
      },
      approveBtn: "Aprobar",
      rejectBtn: "Rechazar",
      rejectConfirm: "¿Eliminar este usuario permanentemente del sistema?"
    },
    managers: {
      title: "Gerentes",
      subtitle: "Acceso administrativo completo"
    },
    sellers: {
      title: "Vendedores",
      subtitle: "Equipo de ventas y prospección"
    },
    table: {
      member: "Miembro",
      changeRole: "Cambiar rol",
      joinDate: "Fecha de ingreso",
      actions: "Acciones",
      removeBtn: "Eliminar",
      noMembers: "No se encontraron miembros.",
      loading: "Cargando...",
      noName: "Sin nombre"
    },
    modal: {
      title: "Enlace de Registro",
      description: "Comparte este enlace con nuevos miembros. Entrarán como <b>inactivos</b> hasta que los apruebes.",
      defineRole: "Definir rol del nuevo miembro",
      generateBtn: "Agregar colaborador",
      linkTitle: "Enlace de registro — {{role}}",
      copyBtn: "Copiar al portapapeles",
      backBtn: "Volver"
    }
  },
  companyProfile: {
    title: "Perfil de la Empresa",
    subtitle: "Gestione la información básica, contacto y redes sociales de su oficina.",
    sections: {
      general: {
        title: "Información General",
        description: "Datos principales de identificación de la oficina.",
        companyName: "Nombre de la Empresa / Oficina",
        cnpj: "CNPJ / Tax ID",
        cnpjPlaceholder: "Ej: 12-3456789",
        address: "Dirección Completa",
        addressPlaceholder: "Ej: Calle, Número, Barrio, Ciudad - Estado"
      },
      contact: {
        title: "Contacto y Canales",
        description: "Cómo pueden encontrarle los clientes.",
        email: "Correo Corporativo",
        phone: "Teléfono / WhatsApp",
        phonePlaceholder: "Ej: +1 (555) 000-0000",
        website: "Sitio Web"
      },
      social: {
        title: "Redes Sociales",
        description: "Enlaces a sus perfiles sociales.",
        instagram: "Instagram",
        linkedin: "LinkedIn",
        facebook: "Facebook"
      }
    },
    saveBtn: "Guardar Perfil de la Empresa",
    savingBtn: "Guardando Cambios...",
    messages: {
      notFound: "Oficina no encontrada.",
      notFoundDescription: "No pudimos localizar el registro de su oficina.",
      loadError: "Error al cargar los datos de la empresa.",
      saveSuccess: "¡Datos actualizados con éxito!",
      saveError: "Error al guardar los cambios."
    }
  },
  subscription: {
    title: "Mi Suscripción",
    subtitle: "Gestione su plan, facturas y características de la plataforma",
    status: {
      active: "Plan Activo",
      none: "Sin Suscripción",
      inactive: "Suscripción Inactiva"
    },
    noPlan: "Sin Plan",
    nextBilling: "Próxima Renovación",
    nextCycle: "Próximo Ciclo",
    manageCard: "Gestionar Tarjeta",
    billingHistory: "Historial de Facturación",
    paidOn: "Pagado el {{date}}",
    upgrade: {
      title: "Upgrade de Plan",
      description: "¿Necesita más miembros o características corporativas? Descubra el plan Enterprise.",
      btn: "Ver Otros Planes"
    },
    security: {
      title: "Seguridad Garantizada",
      description: "Su suscripción se procesa de forma segura a través de Stripe. No almacenamos los datos de su tarjeta en nuestros servidores."
    },
    modals: {
      choosePlan: "Elija su nuevo plan",
      transitionHint: "Transición suave entre modelos de negocio",
      changeBtn: "Cambiar a este plan",
      effectHint: "* El cambio entrará en vigor en el próximo ciclo de facturación",
      cancelTitle: "¿Cancelar Suscripción?",
      cancelDescription: "Perderá el acceso a las funciones premium de la oficina. Esta acción no se puede deshacer automáticamente.",
      cancelConfirm: "Confirmar Cancelación",
      cancelKeep: "Mantener Plan",
      cancelBtn: "Cancelar Suscripción",
      expiration: "Vencimiento",
      cancelSuccess: "Suscripción cancelada con éxito.",
      cancelError: "Error al cancelar la suscripción.",
      planActivated: "¡Plan {{name}} activado con éxito!",
      activateError: "Error al activar el plan. Por favor, inténtelo de nuevo.",
      minFeeNotice: "Si la tarifa de la plataforma calculada para una transacción de main visa es inferior a {{amount}}, Aplikei cobrará la tarifa mínima fija de {{amount}}."
    },
    onboarding: {
      eyebrow: "Conviértase en una Oficina Socia",
      title: "Elija el plan ideal para su oficina",
      description: "Tenemos modelos flexibles que se adaptan a su volumen de casos e ingresos. Sin compromisos, cancele en cualquier momento.",
      btn: "Obtener este plan"
    },
    plans: {
      fixed: {
        name: "Plan Fijo",
        price: "$149",
        period: "al mes",
        description: "Ideal para oficinas con ingresos estables.",
        features: ["Recurrencia fija", "Sin sorpresas", "Soporte VIP"]
      },
      percentage: {
        name: "Plan Escalable",
        price: "5%",
        period: "de los ingresos",
        description: "Pague solo cuando gane. Con tarifas mínimas y máximas.",
        features: ["Tarifa mínima de $49", "CAP máximo de $699", "Crece con usted"]
      },
      hybrid: {
        name: "Plan Híbrido",
        price: "$79 + 2%",
        period: "mensual",
        description: "Lo mejor de ambos mundos para un alto rendimiento.",
        features: ["Tarifa fija reducida", "% competitivo", "Recursos ilimitados"]
      }
    },
    features: {
      unlimitedProcesses: "Casos Ilimitados",
      membersLimit: "Hasta 5 Miembros del Equipo",
      prioritySupport: "Soporte Prioritario 24/7",
      customSalesPage: "Página de Ventas Personalizada",
      advancedAi: "Integración de IA Avanzada",
      minFeePerTransaction: "{{amount}} de tarifa mínima de plataforma por transacción de main visa"
    }
  },
  discountRules: {
    title: "Reglas de Descuento",
    subtitle: "Defina los límites de descuento que sus vendedores pueden ofrecer.",
    saveBtn: "Guardar",
    savingBtn: "Guardando...",
    loading: "Cargando...",
    noOffice: "Aún no tiene una oficina registrada. Configure una oficina primero.",
    infoBanner: "Estas reglas se aplican solo a los vendedores de su oficina al crear cupones de descuento. Los campos en blanco significan sin restricción.",
    blankFieldNoLimit: "Campo en blanco = sin límite",
    types: {
      title: "Tipos de descuento permitidos",
      description: "Qué modos de descuento pueden ofrecer los vendedores.",
      percentageTitle: "Descuento porcentual (%)",
      percentageInfo: "Permita que los vendedores creen cupones que reduzcan el total del pedido en un porcentaje del monto de la compra.",
      percentageExample: "Ej: 10% de descuento",
      fixedTitle: "Descuento fijo (US$)",
      fixedInfo: "Permita que los vendedores creen cupones que resten un monto fijo en dólares del total del pedido.",
      fixedExample: "Ej: US$ 50 de descuento"
    },
    valueLimits: {
      title: "Límites de valor de descuento",
      description: "Umbral máximo que los vendedores pueden establecer para cada tipo.",
      maxPctLabel: "Descuento máximo (%)",
      maxPctInfo: "El descuento porcentual más alto que un vendedor puede establecer en un cupón porcentual. Déjelo en blanco para permitir cualquier porcentaje.",
      maxFixedLabel: "Descuento fijo máximo",
      maxFixedInfo: "El monto en dólares más alto que un vendedor puede establecer en un cupón de descuento fijo. Déjelo en blanco para permitir cualquier monto.",
      minPurchaseLabel: "Compra mínima para usar cupón (US$)",
      minPurchaseInfo: "El total mínimo del pedido requerido antes de que un cliente pueda aplicar un cupón de vendedor. Déjelo en blanco para permitir cupones en cualquier pedido.",
      noLimit: "Sin límite",
      noMinimum: "Sin mínimo"
    },
    usageLimits: {
      title: "Límites de uso de cupones",
      description: "Controle cuántos cupones y usos puede crear cada vendedor.",
      maxUsesLabel: "Límite de usos por cupón",
      maxUsesInfo: "El número máximo de veces que cada cupón de vendedor se puede canjear entre todos los clientes. Déjelo en blanco para canjes ilimitados.",
      maxCouponsLabel: "Límite de cupones por vendedor",
      maxCouponsInfo: "El número máximo de cupones activos que cada vendedor puede crear para esta oficina. Déjelo en blanco para cupones ilimitados.",
      unlimited: "Ilimitado"
    },
    summary: {
      title: "Resumen de reglas activas",
      types: "Tipos: ",
      percentage: "Porcentaje",
      fixed: "Fijo",
      none: "Ninguno",
      maxPct: "Descuento máx. %: ",
      maxFixed: "Desconto máx. fijo: ",
      minPurchase: "Compra mínima: ",
      usesPerCoupon: "Usos por cupón: ",
      couponsPerSeller: "Cupones por vendedor: "
    },
    messages: {
      officeNotFound: "Oficina no encontrada.",
      saveSuccess: "Reglas de descuento guardadas.",
      saveError: "Error al guardar las reglas."
    }
  },
  withdrawals: {
    subtitle: "Gestione sus pagos y solicitudes de retiro",
    availableForPayout: "Disponible para Retiro",
    requestBtn: "Solicitar Retiro",
    configureBtn: "Configurar Retiro",
    configureHint: "Configure un método de retiro antes de solicitar retiros.",
    pendingRequests: "Solicitudes Pendientes",
    activeRequests: "{{count}} solicitudes activas",
    totalWithdrawn: "Total Retirado",
    allTimePayouts: "Retiros realizados",
    historyTitle: "Historial de Retiros",
    filterPlaceholder: "Filtrar",
    filters: {
      all: "Todos",
      pending: "Pendentes",
      approved: "Aprobados",
      rejected: "Rechazados"
    },
    empty: {
      title: "Ningún retiro aún",
      subtitle: "Sus solicitudes de retiro e historial de pagos aparecerán aquí una vez que comience a recibir fondos.",
      learnMore: "Más información sobre retiros"
    },
    emptyFiltered: {
      title: "Ningún retiro coincide con este filtro",
      subtitle: "Elija otro estado para revisar más solicitudes de retiro."
    },
    status: {
      pending: "PENDIENTE",
      approved: "APROBADO",
      completed: "COMPLETADO",
      paid: "PAGADO",
      processing: "PROCESANDO",
      rejected: "RECHAZADO",
      cancelled: "CANCELADO",
      canceled: "CANCELADO"
    },
    messages: {
      loadError: "Error al cargar los retiros."
    }
  }
};

export default admin;
