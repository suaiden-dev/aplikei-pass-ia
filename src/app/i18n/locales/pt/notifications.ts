const notifications = {
  bell: {
    tooltip: "Notificações",
    markAllRead: "Marcar todas como lidas",
    viewAll: "Ver todas as notificações",
  },
  filters: {
    all: "Todas",
    unread: "Não lidas",
    payment: "Pagamento",
    process: "Processo",
    uscis: "USCIS",
    rfe: "RFE",
    scheduling: "Agendamento",
    motion: "Motion",
    admin: "Admin",
    billing: "Financeiro",
    cos: "COS",
    b1b2: "B1/B2",
    f1: "F1",
    system: "Sistema",
  },
  empty: {
    title: "Sem notificações",
    subtitle: "Tudo em dia!",
  },
  toast: {
    newNotification: "Nova notificação",
    viewDetails: "Ver detalhes",
    dismiss: "Dispensar",
  },
  log: {
    title: "Log de Notificações",
    subtitle: "Histórico completo de eventos do sistema",
    noResults: "Nenhuma notificação encontrada.",
    sentAt: "Enviada em {{date}}",
    emailSent: "E-mail enviado",
    emailPending: "E-mail não enviado",
  },
  status: {
    pending: "Pendente",
    sent: "Enviada",
    failed: "Falhou",
    read: "Lida",
    unread: "Não lida",
  },
  category: {
    payment: "Pagamento",
    process: "Processo",
    uscis: "USCIS",
    rfe: "RFE",
    scheduling: "Agendamento",
    motion: "Motion",
    admin: "Administrativo",
    billing: "Financeiro",
    cos: "COS",
    b1b2: "B1/B2",
    f1: "F1",
    system: "Sistema",
  },
  action: {
    confirmed: "Confirmado",
    zelle_approved: "Zelle Aprovado",
    zelle_rejected: "Zelle Rejeitado",
    zelle_bot_failed: "Verificação Zelle Falhou",
    zelle_bot_offline: "Bot Zelle Offline",
    step_approved: "Etapa Aprovada",
    step_approved_final: "Etapa Aprovada (Final)",
    step_rejected: "Ajustes Solicitados",
    completed_approved: "Concluído (Aprovado)",
    completed_denied: "Concluído (Negado)",
    result_approved: "Resultado Aprovado",
    result_denied: "Resultado Negado",
    received: "Recebido",
    interview_scheduled: "Entrevista Agendada",
    submitted: "Enviado",
    message: "Mensagem",
    review_required: "Revisão Necessária",
    step_submitted: "Etapa Enviada",
    under_review: "Em Revisão",
    update: "Atualização",
    step_approved_confirmed: "Etapa Aprovada pelo Admin",
    step_rejected_confirmed: "Etapa Rejeitada pelo Admin",
    process_approved: "Processo Aprovado",
    process_denied: "Processo Negado",
    withdrawal_requested: "Saque Solicitado",
    withdrawal_approved: "Saque Aprovado",
    withdrawal_rejected: "Saque Rejeitado",
    subscription_canceled: "Assinatura Cancelada",
    subscription_updated: "Assinatura Atualizada",
    i20_uploaded: "I-20 Enviado",
    sevis_receipt_uploaded: "Comprovante SEVIS Enviado",
    cover_letter_completed: "Cover Letter Concluída",
    i539_generated: "Formulário I-539 Gerado",
    rfe_letter_uploaded: "Carta RFE Enviada",
    rfe_description_submitted: "Descrição RFE Enviada",
    motion_reason_submitted: "Motivo do Motion Enviado",
    motion_denial_letter_uploaded: "Carta de Negativa Enviada",
    motion_supporting_docs_uploaded: "Docs de Apoio Enviados",
    uscis_result_reported: "Resultado USCIS Informado",
    motion_started: "Motion Iniciado",
    rfe_started: "RFE Iniciada",
    motion_result_reported: "Resultado do Motion Informado",
    rfe_result_reported: "Resultado da RFE Informado",
    ds160_completed: "DS-160 Concluído",
    ds160_signed: "DS-160 Assinado",
    casv_scheduled: "Agendamento CASV Enviado",
    mrv_payment_confirmed: "Pagamento MRV Confirmado",
  },

  content: {
    // payment — client-facing ----------------------------------------
    "payment__confirmed": {
      title: "Pagamento Confirmado!",
      message: "Seu pagamento pelo serviço {{service_name}} foi processado com sucesso.",
    },
    "payment__zelle_approved": {
      title: "Pagamento Zelle Aprovado!",
      message: "Sua transferência Zelle de {{amount}} para {{service_name}} foi verificada e aprovada.",
    },
    "payment__zelle_rejected": {
      title: "Problema com seu Pagamento Zelle",
      message: "Identificamos um problema com seu pagamento Zelle para {{service_name}}. Motivo: {{reason}} Entre em contato com o suporte.",
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
      title: "Etapa Aprovada",
      message: "A etapa \"{{step_name}}\" foi aprovada. Próxima etapa: {{next_step_name}}.",
    },
    "process__step_approved_final": {
      title: "Etapa Aprovada",
      message: "A etapa \"{{step_name}}\" foi aprovada.",
    },
    "process__step_rejected": {
      title: "Ajustes Necessários",
      message: "A etapa \"{{step_name}}\" precisa de ajustes. Feedback: {{feedback}}",
    },
    "process__step_rejected_no_feedback": {
      title: "Ajustes Necessários",
      message: "A etapa \"{{step_name}}\" precisa de ajustes. Verifique seu painel.",
    },
    "process__completed_approved": {
      title: "Processo Concluído com Sucesso",
      message: "Seu processo {{service_name}} foi concluído e aprovado.",
    },
    "process__completed_denied": {
      title: "Processo Finalizado",
      message: "Seu processo {{service_name}} foi finalizado com resultado negado. Entre em contato com seu advogado.",
    },
    "process__under_review": {
      title: "Estamos Revisando!",
      message: "Sua etapa foi enviada com sucesso para nossa equipe de análise. Aguarde a validação.",
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
      title: "USCIS Aprovou seu Caso",
      message: "Ótima notícia! O USCIS aprovou o seu caso.",
    },
    "uscis__result_denied": {
      title: "Resultado do USCIS Recebido",
      message: "O USCIS emitiu uma decisão sobre seu caso. Verifique seu painel para os próximos passos.",
    },

    // rfe — client-facing ---------------------------------------------
    "rfe__received": {
      title: "RFE Recebida",
      message: "O USCIS emitiu uma RFE para o seu caso. Verifique seu painel com urgência.",
    },

    // scheduling — client-facing --------------------------------------
    "scheduling__interview_scheduled": {
      title: "Entrevista Agendada",
      message: "Sua entrevista foi agendada. Confira a data e o local no seu processo.",
    },

    // motion — client-facing ------------------------------------------
    "motion__submitted": {
      title: "Motion Enviado",
      message: "Seu pagamento foi confirmado e iniciamos os próximos passos do seu motion.",
    },

    // admin — generic + confirmations (English for staff) -------------
    "admin__message": {
      title: "Nova Mensagem da Equipe",
      message: "Você recebeu uma nova mensagem da equipe administrativa.",
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
    "system__message": {
      title: "Aviso do Sistema",
      message: "Você recebeu uma nova mensagem do sistema.",
    },
    "system__update": {
      title: "Atualização da Plataforma",
      message: "Há novas atualizações disponíveis na plataforma.",
    },
  },
};

export default notifications;
