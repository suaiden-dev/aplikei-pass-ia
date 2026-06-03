const notifications = {
  bell: {
    tooltip: "Notificaciones",
    markAllRead: "Marcar todas como leídas",
    viewAll: "Ver todas las notificaciones",
  },
  filters: {
    all: "Todas",
    unread: "No leídas",
    payment: "Pago",
    process: "Proceso",
    uscis: "USCIS",
    rfe: "RFE",
    scheduling: "Programación",
    motion: "Motion",
    admin: "Admin",
    billing: "Facturación",
    cos: "COS",
    b1b2: "B1/B2",
    f1: "F1",
    system: "Sistema",
  },
  empty: {
    title: "Sin notificaciones",
    subtitle: "¡Todo al día!",
  },
  toast: {
    newNotification: "Nueva notificación",
    viewDetails: "Ver detalles",
    dismiss: "Descartar",
  },
  log: {
    title: "Registro de Notificaciones",
    subtitle: "Historial completo de eventos del sistema",
    noResults: "No se encontraron notificaciones.",
    sentAt: "Enviada el {{date}}",
    emailSent: "Correo enviado",
    emailPending: "Correo no enviado",
  },
  status: {
    pending: "Pendiente",
    sent: "Enviada",
    failed: "Fallida",
    read: "Leída",
    unread: "No leída",
  },
  category: {
    payment: "Pago",
    process: "Proceso",
    uscis: "USCIS",
    rfe: "RFE",
    scheduling: "Programación",
    motion: "Motion",
    admin: "Administrativo",
    billing: "Facturación",
    cos: "COS",
    b1b2: "B1/B2",
    f1: "F1",
    system: "Sistema",
  },
  action: {
    confirmed: "Confirmado",
    zelle_approved: "Zelle Aprobado",
    zelle_rejected: "Zelle Rechazado",
    zelle_bot_failed: "Verificación Zelle Fallida",
    zelle_bot_offline: "Bot Zelle Desconectado",
    step_approved: "Etapa Aprobada",
    step_approved_final: "Etapa Aprobada (Final)",
    step_rejected: "Cambios Solicitados",
    completed_approved: "Completado (Aprobado)",
    completed_denied: "Completado (Denegado)",
    result_approved: "Resultado Aprobado",
    result_denied: "Resultado Denegado",
    received: "Recibido",
    interview_scheduled: "Entrevista Programada",
    submitted: "Enviado",
    message: "Mensaje",
    review_required: "Revisión Requerida",
    step_submitted: "Etapa Enviada",
    under_review: "En Revisión",
    update: "Actualización",
    step_approved_confirmed: "Etapa Aprobada por Admin",
    step_rejected_confirmed: "Etapa Rechazada por Admin",
    process_approved: "Proceso Aprobado",
    process_denied: "Proceso Denegado",
    withdrawal_requested: "Retiro Solicitado",
    withdrawal_approved: "Retiro Aprobado",
    withdrawal_rejected: "Retiro Rechazado",
    subscription_canceled: "Suscripción Cancelada",
    subscription_updated: "Suscripción Actualizada",
    i20_uploaded: "I-20 Enviado",
    sevis_receipt_uploaded: "Comprobante SEVIS Enviado",
    cover_letter_completed: "Cover Letter Completada",
    i539_generated: "Formulario I-539 Generado",
    rfe_letter_uploaded: "Carta RFE Enviada",
    rfe_description_submitted: "Descripción RFE Enviada",
    motion_reason_submitted: "Motivo del Motion Enviado",
    motion_denial_letter_uploaded: "Carta de Denegación Enviada",
    motion_supporting_docs_uploaded: "Docs de Apoyo Enviados",
    uscis_result_reported: "Resultado USCIS Informado",
    motion_started: "Motion Iniciado",
    rfe_started: "RFE Iniciada",
    motion_result_reported: "Resultado del Motion Informado",
    rfe_result_reported: "Resultado de la RFE Informado",
    ds160_completed: "DS-160 Completado",
    ds160_signed: "DS-160 Firmado",
    casv_scheduled: "Programación CASV Enviada",
    mrv_payment_confirmed: "Pago MRV Confirmado",
  },

  content: {
    // payment — client-facing ----------------------------------------
    "payment__confirmed": {
      title: "¡Pago Confirmado!",
      message: "Su pago por {{service_name}} fue procesado con éxito.",
    },
    "payment__zelle_approved": {
      title: "¡Pago Zelle Aprobado!",
      message: "Su transferencia Zelle de {{amount}} para {{service_name}} fue verificada y aprobada.",
    },
    "payment__zelle_rejected": {
      title: "Problema con su Pago Zelle",
      message: "Encontramos un problema con su pago Zelle para {{service_name}}. Razón: {{reason}} Por favor, contacte al soporte.",
    },
    // payment — admin alerts (English for staff) ----------------------
    "payment__zelle_bot_failed": {
      title: "Zelle: Auto-Verification Failed",
      message: "Payment {{payment_id}} (${{amount}}) did not pass automatic verification. Reason: {{bot_response}}. Manual review required.",
    },
    "payment__zelle_bot_offline": {
      title: "Zelle: Verification Bot Offline",
      message: "Could not contact the verification bot for payment {{payment_id}}. Proceeding with manual review.",
    },

    // process — client-facing -----------------------------------------
    "process__step_approved": {
      title: "Etapa Aprobada",
      message: "La etapa \"{{step_name}}\" fue aprobada. Siguiente etapa: {{next_step_name}}.",
    },
    "process__step_approved_final": {
      title: "Etapa Aprobada",
      message: "La etapa \"{{step_name}}\" fue aprobada.",
    },
    "process__step_rejected": {
      title: "Cambios Necesarios",
      message: "La etapa \"{{step_name}}\" necesita cambios. Comentario: {{feedback}}",
    },
    "process__step_rejected_no_feedback": {
      title: "Cambios Necesarios",
      message: "La etapa \"{{step_name}}\" necesita cambios. Revise su panel.",
    },
    "process__completed_approved": {
      title: "Proceso Completado con Éxito",
      message: "Su proceso {{service_name}} fue completado y aprobado.",
    },
    "process__completed_denied": {
      title: "Proceso Finalizado",
      message: "Su proceso {{service_name}} fue finalizado con resultado denegado. Contacte a su abogado para los próximos pasos.",
    },
    "process__under_review": {
      title: "¡Estamos Revisando!",
      message: "Su etapa fue enviada correctamente para nuestro equipo de análisis. Espere la validación.",
    },
    // process — admin-facing (English for staff) ----------------------
    "process__review_required": {
      title: "Action Required: Review Step",
      message: "{{client_name}} completed step \"{{step_name}}\" in {{service_name}} and is waiting for your review.",
    },
    "process__step_submitted": {
      title: "Action Required: Review Step",
      message: "{{client_name}} completed a step in {{service_name}} and is waiting for your review.",
    },

    // uscis — client-facing -------------------------------------------
    "uscis__result_approved": {
      title: "USCIS Aprobó su Caso",
      message: "¡Buenas noticias! USCIS ha aprobado su caso.",
    },
    "uscis__result_denied": {
      title: "Decisión de USCIS Recibida",
      message: "USCIS emitió una decisión sobre su caso. Revise su panel para los próximos pasos.",
    },

    // rfe — client-facing ---------------------------------------------
    "rfe__received": {
      title: "RFE Recibida",
      message: "USCIS emitió una RFE para su caso. Por favor, revise su panel con urgencia.",
    },

    // scheduling — client-facing --------------------------------------
    "scheduling__interview_scheduled": {
      title: "Entrevista Programada",
      message: "Su entrevista fue programada. Revise la fecha y el lugar en su proceso.",
    },

    // motion — client-facing ------------------------------------------
    "motion__submitted": {
      title: "Motion Enviado",
      message: "Su pago fue confirmado y ya iniciamos los siguientes pasos de su motion.",
    },

    // admin — generic + confirmations (English for staff) -------------
    "admin__message": {
      title: "Nuevo Mensaje del Equipo",
      message: "Ha recibido un nuevo mensaje del equipo administrativo.",
    },
    "admin__step_approved_confirmed": {
      title: "Step Approved by Admin",
      message: "Admin approved step \"{{step_name}}\" in {{service_name}}.",
    },
    "admin__process_approved": {
      title: "Process Completed (Approved)",
      message: "Admin approved the final step for {{service_name}}.",
    },
    "admin__step_rejected_confirmed": {
      title: "Step Rejected by Admin",
      message: "Admin rejected step \"{{step_name}}\" in {{service_name}} and sent feedback.",
    },
    "admin__process_denied": {
      title: "Process Completed (Denied)",
      message: "Admin denied the final step for {{service_name}}.",
    },

    // billing — admin/master-facing (English for staff) ---------------
    "billing__withdrawal_requested": {
      title: "New Withdrawal Request",
      message: "Office {{office_id}} requested a withdrawal of ${{amount}}.",
    },
    "billing__withdrawal_approved": {
      title: "Withdrawal Approved",
      message: "Your withdrawal request of ${{amount}} was approved.",
    },
    "billing__withdrawal_rejected": {
      title: "Withdrawal Rejected",
      message: "Your withdrawal request of ${{amount}} was rejected.",
    },
    "billing__subscription_canceled": {
      title: "Subscription Canceled",
      message: "Office {{office_id}} canceled the active subscription.",
    },
    "billing__subscription_updated": {
      title: "Subscription Updated",
      message: "Office {{office_id}} activated/changed to plan {{plan_name}}.",
    },

    // cos — admin-facing (English for staff) --------------------------
    "cos__i20_uploaded": {
      title: "COS: I-20 Received",
      message: "{{client_name}} uploaded the I-20 document for review.",
    },
    "cos__sevis_receipt_uploaded": {
      title: "COS: SEVIS Receipt Received",
      message: "{{client_name}} uploaded the SEVIS fee receipt for verification.",
    },
    "cos__cover_letter_completed": {
      title: "COS: Cover Letter Completed",
      message: "{{client_name}} completed the cover letter questionnaire.",
    },
    "cos__i539_generated": {
      title: "COS: I-539 Form Generated",
      message: "{{client_name}} completed and generated the I-539 PDF.",
    },
    "cos__rfe_letter_uploaded": {
      title: "COS: RFE Letter Received",
      message: "{{client_name}} submitted the RFE letter.",
    },
    "cos__rfe_description_submitted": {
      title: "COS: RFE Description Submitted",
      message: "{{client_name}} submitted the RFE requirements description.",
    },
    "cos__motion_reason_submitted": {
      title: "COS: Motion Reason Submitted",
      message: "{{client_name}} submitted the motion reason.",
    },
    "cos__motion_denial_letter_uploaded": {
      title: "COS: Denial Letter Received",
      message: "{{client_name}} submitted the denial letter to start the motion.",
    },
    "cos__motion_supporting_docs_uploaded": {
      title: "COS: Supporting Docs Uploaded",
      message: "{{client_name}} uploaded supporting motion documents.",
    },
    "cos__uscis_result_reported": {
      title: "COS: USCIS Result Reported",
      message: "{{client_name}} reported a new USCIS result.",
    },
    "cos__motion_started": {
      title: "COS: Motion Workflow Started",
      message: "Motion workflow started for {{client_name}}.",
    },
    "cos__rfe_started": {
      title: "COS: RFE Workflow Started",
      message: "RFE workflow started for {{client_name}}.",
    },
    "cos__motion_result_reported": {
      title: "COS: Motion Result Reported",
      message: "{{client_name}} reported the Motion result.",
    },
    "cos__rfe_result_reported": {
      title: "COS: RFE Result Reported",
      message: "{{client_name}} reported the RFE result.",
    },

    // b1b2 — admin-facing (English for staff) -------------------------
    "b1b2__ds160_completed": {
      title: "B1/B2: DS-160 Completed",
      message: "{{client_name}} completed the DS-160 form.",
    },
    "b1b2__ds160_signed": {
      title: "B1/B2: DS-160 Signed",
      message: "{{client_name}} completed review and uploaded DS-160 signature confirmation documents.",
    },
    "b1b2__casv_scheduled": {
      title: "B1/B2: CASV Scheduling Submitted",
      message: "{{client_name}} submitted preferred date for CASV scheduling.",
    },
    "b1b2__mrv_payment_confirmed": {
      title: "B1/B2: MRV Payment Confirmed",
      message: "{{client_name}} confirmed MRV fee payment.",
    },

    // f1 — admin-facing (English for staff) ---------------------------
    "f1__i20_uploaded": {
      title: "F1: I-20 Uploaded",
      message: "{{client_name}} uploaded the I-20 document for review.",
    },

    // system ----------------------------------------------------------
    "system__update": {
      title: "Actualización de Plataforma",
      message: "Hay nuevas actualizaciones disponibles en la plataforma.",
    },
  },
};

export default notifications;
