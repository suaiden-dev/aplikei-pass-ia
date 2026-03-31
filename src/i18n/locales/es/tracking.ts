const tracking = {
  title: "Seguimiento del Paquete",
  trackingLabel: "Código de Seguimiento",
  trackingPlaceholder: "Ej: USPS-123456789",
  description: "Los tiempos de procesamiento de USCIS varían. Usa tu código de seguimiento para seguir la entrega física.",
  letterInfo: "La Notificación de Recibo (Form I-797) llegará a tu dirección en 2 a 4 semanas después del recibo.",
  supportInfo: "Para actualizaciones de estado oficiales, visita la herramienta USCIS Case Status Online.",
  outcomes: {
    title: "Resultado de la Decisión USCIS",
    btnApproved: "Aprobado",
    btnRejected: "Rechazado / Denegado",
    btnRfe: "Solicitud de Evidencia (RFE)"
  },
  confirmation: {
    title: "¿Confirmar Cambio de Estado?",
    description: "¿Estás seguro de que deseas actualizar el estado de tu proceso? Esto desbloqueará los siguientes pasos correspondientes.",
    cancel: "Cancelar",
    action: "Actualizar Estado"
  },
  status: {
    ds160InProgress: "Completando DS-160",
    ds160Processing: "Procesando DS-160",
    cosInProgress: "Onboarding: Info y Foto",
    cosProcessing: "Revisando Aplicación",
    ds160uploadDocuments: "3. Subir Documentos",
    ds160AwaitingReviewAndSignature: "4. Revisión y Firma",
    uploadsUnderReview: "4. Revisión de Documentos",
    casvSchedulingPending: "5. Cita Pendiente",
    casvFeeProcessing: "6. Tasa en Procesamiento",
    casvPaymentPending: "7. Pago CASV Pendiente",
    awaitingInterview: "8. Esperando Entrevista",
    approved: "9. Aprobado",
    rejectedText: "Proceso Denegado",
    rejectedLabel: "Rechazado",
    stepOf: "Paso [step] de [total]"
  }
};

export default tracking;
