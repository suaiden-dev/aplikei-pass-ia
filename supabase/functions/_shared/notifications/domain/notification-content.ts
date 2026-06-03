type LangMap = Record<string, { title: string; message: string }>;
type ContentMap = Record<string, LangMap>;

function interpolate(template: string, meta: Record<string, unknown>): string {
  return template
    .replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
      const val = meta[key];
      return typeof val === "string" ? val : typeof val === "number" ? String(val) : "";
    })
    .replace(/:\s*\./g, ".")
    .replace(/\s{2,}/g, " ")
    .replace(/"\s*"\s*/g, "")
    .trim();
}

// Content keyed by {category}__{action}, then language.
// Used by the email sender which needs localized text without frontend i18n.
const CONTENT: ContentMap = {
  // payment — client-facing
  "payment__confirmed": {
    en: { title: "Payment Confirmed!", message: "Your payment for {{service_name}} was processed successfully." },
    pt: { title: "Pagamento Confirmado!", message: "Seu pagamento pelo serviço {{service_name}} foi processado com sucesso." },
    es: { title: "¡Pago Confirmado!", message: "Su pago por {{service_name}} fue procesado con éxito." },
  },
  "payment__zelle_approved": {
    en: { title: "Zelle Payment Approved!", message: "Your Zelle transfer of {{amount}} for {{service_name}} was verified and approved." },
    pt: { title: "Pagamento Zelle Aprovado!", message: "Sua transferência Zelle de {{amount}} para {{service_name}} foi verificada e aprovada." },
    es: { title: "¡Pago Zelle Aprobado!", message: "Su transferencia Zelle de {{amount}} para {{service_name}} fue verificada y aprobada." },
  },
  "payment__zelle_rejected": {
    en: { title: "Problem with Your Zelle Payment", message: "We found an issue with your Zelle payment for {{service_name}}. Reason: {{reason}}" },
    pt: { title: "Problema com seu Pagamento Zelle", message: "Identificamos um problema com seu pagamento Zelle para {{service_name}}. Motivo: {{reason}}" },
    es: { title: "Problema con su Pago Zelle", message: "Encontramos un problema con su pago Zelle para {{service_name}}. Razón: {{reason}}" },
  },
  // payment — admin alerts (always English)
  "payment__zelle_bot_failed": {
    en: { title: "Zelle: Auto-Verification Failed", message: "Payment {{payment_id}} (${{amount}}) did not pass automatic verification. Reason: {{bot_response}}. Manual review required." },
    pt: { title: "Zelle: Auto-Verification Failed", message: "Payment {{payment_id}} (${{amount}}) did not pass automatic verification. Reason: {{bot_response}}. Manual review required." },
    es: { title: "Zelle: Auto-Verification Failed", message: "Payment {{payment_id}} (${{amount}}) did not pass automatic verification. Reason: {{bot_response}}. Manual review required." },
  },
  "payment__zelle_bot_offline": {
    en: { title: "Zelle: Verification Bot Offline", message: "Could not contact the verification bot for payment {{payment_id}}. Proceeding with manual review." },
    pt: { title: "Zelle: Verification Bot Offline", message: "Could not contact the verification bot for payment {{payment_id}}. Proceeding with manual review." },
    es: { title: "Zelle: Verification Bot Offline", message: "Could not contact the verification bot for payment {{payment_id}}. Proceeding with manual review." },
  },
  // process — client-facing
  "process__step_approved": {
    en: { title: "Step Approved", message: "The step \"{{step_name}}\" was approved. Next step: {{next_step_name}}." },
    pt: { title: "Etapa Aprovada", message: "A etapa \"{{step_name}}\" foi aprovada. Próxima etapa: {{next_step_name}}." },
    es: { title: "Etapa Aprobada", message: "La etapa \"{{step_name}}\" fue aprobada. Siguiente etapa: {{next_step_name}}." },
  },
  "process__step_approved_final": {
    en: { title: "Step Approved", message: "The step \"{{step_name}}\" was approved." },
    pt: { title: "Etapa Aprovada", message: "A etapa \"{{step_name}}\" foi aprovada." },
    es: { title: "Etapa Aprobada", message: "La etapa \"{{step_name}}\" fue aprobada." },
  },
  "process__step_rejected": {
    en: { title: "Changes Required", message: "The step \"{{step_name}}\" needs updates. Feedback: {{feedback}}" },
    pt: { title: "Ajustes Necessários", message: "A etapa \"{{step_name}}\" precisa de ajustes. Feedback: {{feedback}}" },
    es: { title: "Cambios Necesarios", message: "La etapa \"{{step_name}}\" necesita cambios. Comentario: {{feedback}}" },
  },
  "process__step_rejected_no_feedback": {
    en: { title: "Changes Required", message: "The step \"{{step_name}}\" needs updates. Please review your dashboard." },
    pt: { title: "Ajustes Necessários", message: "A etapa \"{{step_name}}\" precisa de ajustes. Verifique seu painel." },
    es: { title: "Cambios Necesarios", message: "La etapa \"{{step_name}}\" necesita cambios. Revise su panel." },
  },
  "process__completed_approved": {
    en: { title: "Process Completed Successfully", message: "Your {{service_name}} has been completed and approved." },
    pt: { title: "Processo Concluído com Sucesso", message: "Seu processo {{service_name}} foi concluído e aprovado." },
    es: { title: "Proceso Completado con Éxito", message: "Su proceso {{service_name}} fue completado y aprobado." },
  },
  "process__completed_denied": {
    en: { title: "Process Completed", message: "Your {{service_name}} was completed with a denied result." },
    pt: { title: "Processo Finalizado", message: "Seu processo {{service_name}} foi finalizado com resultado negado." },
    es: { title: "Proceso Finalizado", message: "Su proceso {{service_name}} fue finalizado con resultado denegado." },
  },
  "process__under_review": {
    en: { title: "We Are Reviewing!", message: "Your step was submitted and is pending review by our team." },
    pt: { title: "Estamos Revisando!", message: "Sua etapa foi enviada para nossa equipe de análise. Aguarde." },
    es: { title: "¡Estamos Revisando!", message: "Su etapa fue enviada a nuestro equipo de análisis. Espere." },
  },
  // process — admin-facing (English for all langs)
  "process__review_required": {
    en: { title: "Action Required: Review Step", message: "{{client_name}} completed step \"{{step_name}}\" in {{service_name}} and is waiting for your review." },
    pt: { title: "Action Required: Review Step", message: "{{client_name}} completed step \"{{step_name}}\" in {{service_name}} and is waiting for your review." },
    es: { title: "Action Required: Review Step", message: "{{client_name}} completed step \"{{step_name}}\" in {{service_name}} and is waiting for your review." },
  },
  "process__step_submitted": {
    en: { title: "Action Required: Review Step", message: "{{client_name}} completed a step in {{service_name}} and is waiting for your review." },
    pt: { title: "Action Required: Review Step", message: "{{client_name}} completed a step in {{service_name}} and is waiting for your review." },
    es: { title: "Action Required: Review Step", message: "{{client_name}} completed a step in {{service_name}} and is waiting for your review." },
  },
  // uscis — client-facing
  "uscis__result_approved": {
    en: { title: "USCIS Approved Your Case", message: "Great news! USCIS has approved your case." },
    pt: { title: "USCIS Aprovou seu Caso", message: "Ótima notícia! O USCIS aprovou o seu caso." },
    es: { title: "USCIS Aprobó su Caso", message: "¡Buenas noticias! USCIS ha aprobado su caso." },
  },
  "uscis__result_denied": {
    en: { title: "USCIS Decision Received", message: "USCIS issued a decision on your case. Check your dashboard for next steps." },
    pt: { title: "Resultado do USCIS Recebido", message: "O USCIS emitiu uma decisão sobre seu caso. Verifique seu painel." },
    es: { title: "Decisión de USCIS Recibida", message: "USCIS emitió una decisión sobre su caso. Revise su panel." },
  },
  // rfe — client-facing
  "rfe__received": {
    en: { title: "RFE Received", message: "USCIS issued a Request for Evidence for your case. Check your dashboard urgently." },
    pt: { title: "RFE Recebida", message: "O USCIS emitiu uma RFE para o seu caso. Verifique seu painel com urgência." },
    es: { title: "RFE Recibida", message: "USCIS emitió una RFE para su caso. Revise su panel con urgencia." },
  },
  // scheduling — client-facing
  "scheduling__interview_scheduled": {
    en: { title: "Interview Scheduled", message: "Your interview has been scheduled. Check the date and location in your process." },
    pt: { title: "Entrevista Agendada", message: "Sua entrevista foi agendada. Confira a data e o local no seu processo." },
    es: { title: "Entrevista Programada", message: "Su entrevista fue programada. Revise la fecha y el lugar en su proceso." },
  },
  // motion — client-facing
  "motion__submitted": {
    en: { title: "Motion Submitted", message: "Your payment was confirmed and we have started the next steps for your motion." },
    pt: { title: "Motion Enviado", message: "Seu pagamento foi confirmado e iniciamos os próximos passos do seu motion." },
    es: { title: "Motion Enviado", message: "Su pago fue confirmado y ya iniciamos los siguientes pasos de su motion." },
  },
  // admin — generic + confirmations (English for all)
  "admin__message": {
    en: { title: "New Message from the Team", message: "You have received a new message from the administrative team." },
    pt: { title: "New Message from the Team", message: "You have received a new message from the administrative team." },
    es: { title: "New Message from the Team", message: "You have received a new message from the administrative team." },
  },
  "admin__step_approved_confirmed": {
    en: { title: "Step Approved by Admin", message: "Admin approved step \"{{step_name}}\" in {{service_name}}." },
    pt: { title: "Step Approved by Admin", message: "Admin approved step \"{{step_name}}\" in {{service_name}}." },
    es: { title: "Step Approved by Admin", message: "Admin approved step \"{{step_name}}\" in {{service_name}}." },
  },
  "admin__process_approved": {
    en: { title: "Process Completed (Approved)", message: "Admin approved the final step for {{service_name}}." },
    pt: { title: "Process Completed (Approved)", message: "Admin approved the final step for {{service_name}}." },
    es: { title: "Process Completed (Approved)", message: "Admin approved the final step for {{service_name}}." },
  },
  "admin__step_rejected_confirmed": {
    en: { title: "Step Rejected by Admin", message: "Admin rejected step \"{{step_name}}\" in {{service_name}} and sent feedback." },
    pt: { title: "Step Rejected by Admin", message: "Admin rejected step \"{{step_name}}\" in {{service_name}} and sent feedback." },
    es: { title: "Step Rejected by Admin", message: "Admin rejected step \"{{step_name}}\" in {{service_name}} and sent feedback." },
  },
  "admin__process_denied": {
    en: { title: "Process Completed (Denied)", message: "Admin denied the final step for {{service_name}}." },
    pt: { title: "Process Completed (Denied)", message: "Admin denied the final step for {{service_name}}." },
    es: { title: "Process Completed (Denied)", message: "Admin denied the final step for {{service_name}}." },
  },
  // billing — admin/master-facing (English for all)
  "billing__withdrawal_requested": {
    en: { title: "New Withdrawal Request", message: "Office {{office_id}} requested a withdrawal of ${{amount}}." },
    pt: { title: "New Withdrawal Request", message: "Office {{office_id}} requested a withdrawal of ${{amount}}." },
    es: { title: "New Withdrawal Request", message: "Office {{office_id}} requested a withdrawal of ${{amount}}." },
  },
  "billing__withdrawal_approved": {
    en: { title: "Withdrawal Approved", message: "Your withdrawal request of ${{amount}} was approved." },
    pt: { title: "Withdrawal Approved", message: "Your withdrawal request of ${{amount}} was approved." },
    es: { title: "Withdrawal Approved", message: "Your withdrawal request of ${{amount}} was approved." },
  },
  "billing__withdrawal_rejected": {
    en: { title: "Withdrawal Rejected", message: "Your withdrawal request of ${{amount}} was rejected." },
    pt: { title: "Withdrawal Rejected", message: "Your withdrawal request of ${{amount}} was rejected." },
    es: { title: "Withdrawal Rejected", message: "Your withdrawal request of ${{amount}} was rejected." },
  },
  "billing__subscription_canceled": {
    en: { title: "Subscription Canceled", message: "Office {{office_id}} canceled the active subscription." },
    pt: { title: "Subscription Canceled", message: "Office {{office_id}} canceled the active subscription." },
    es: { title: "Subscription Canceled", message: "Office {{office_id}} canceled the active subscription." },
  },
  "billing__subscription_updated": {
    en: { title: "Subscription Updated", message: "Office {{office_id}} activated/changed to plan {{plan_name}}." },
    pt: { title: "Subscription Updated", message: "Office {{office_id}} activated/changed to plan {{plan_name}}." },
    es: { title: "Subscription Updated", message: "Office {{office_id}} activated/changed to plan {{plan_name}}." },
  },
};

// COS events — admin-facing (English for all langs)
const COS_EVENTS: Record<string, string> = {
  i20_uploaded:                    "COS: I-20 Received",
  sevis_receipt_uploaded:          "COS: SEVIS Receipt Received",
  cover_letter_completed:          "COS: Cover Letter Completed",
  i539_generated:                  "COS: I-539 Form Generated",
  rfe_letter_uploaded:             "COS: RFE Letter Received",
  rfe_description_submitted:       "COS: RFE Description Submitted",
  motion_reason_submitted:         "COS: Motion Reason Submitted",
  motion_denial_letter_uploaded:   "COS: Denial Letter Received",
  motion_supporting_docs_uploaded: "COS: Supporting Docs Uploaded",
  uscis_result_reported:           "COS: USCIS Result Reported",
  motion_started:                  "COS: Motion Workflow Started",
  rfe_started:                     "COS: RFE Workflow Started",
  motion_result_reported:          "COS: Motion Result Reported",
  rfe_result_reported:             "COS: RFE Result Reported",
};
const COS_MESSAGES: Record<string, string> = {
  i20_uploaded:                    "{{client_name}} uploaded the I-20 document for review.",
  sevis_receipt_uploaded:          "{{client_name}} uploaded the SEVIS fee receipt for verification.",
  cover_letter_completed:          "{{client_name}} completed the cover letter questionnaire.",
  i539_generated:                  "{{client_name}} completed and generated the I-539 PDF.",
  rfe_letter_uploaded:             "{{client_name}} submitted the RFE letter.",
  rfe_description_submitted:       "{{client_name}} submitted the RFE requirements description.",
  motion_reason_submitted:         "{{client_name}} submitted the motion reason.",
  motion_denial_letter_uploaded:   "{{client_name}} submitted the denial letter to start the motion.",
  motion_supporting_docs_uploaded: "{{client_name}} uploaded supporting motion documents.",
  uscis_result_reported:           "{{client_name}} reported a new USCIS result.",
  motion_started:                  "Motion workflow started for {{client_name}}.",
  rfe_started:                     "RFE workflow started for {{client_name}}.",
  motion_result_reported:          "{{client_name}} reported the Motion result.",
  rfe_result_reported:             "{{client_name}} reported the RFE result.",
};
for (const event of Object.keys(COS_EVENTS)) {
  const entry = { title: COS_EVENTS[event], message: COS_MESSAGES[event] };
  CONTENT[`cos__${event}`] = { en: entry, pt: entry, es: entry };
}

// B1B2 events — admin-facing (English for all langs)
const B1B2_EVENTS: Record<string, { title: string; message: string }> = {
  ds160_completed:       { title: "B1/B2: DS-160 Completed",           message: "{{client_name}} completed the DS-160 form." },
  ds160_signed:          { title: "B1/B2: DS-160 Signed",              message: "{{client_name}} completed review and uploaded DS-160 signature documents." },
  casv_scheduled:        { title: "B1/B2: CASV Scheduling Submitted",  message: "{{client_name}} submitted preferred date for CASV scheduling." },
  mrv_payment_confirmed: { title: "B1/B2: MRV Payment Confirmed",      message: "{{client_name}} confirmed MRV fee payment." },
};
for (const event of Object.keys(B1B2_EVENTS)) {
  CONTENT[`b1b2__${event}`] = { en: B1B2_EVENTS[event], pt: B1B2_EVENTS[event], es: B1B2_EVENTS[event] };
}

// F1 events — admin-facing
CONTENT["f1__i20_uploaded"] = {
  en: { title: "F1: I-20 Uploaded", message: "{{client_name}} uploaded the I-20 document for review." },
  pt: { title: "F1: I-20 Uploaded", message: "{{client_name}} uploaded the I-20 document for review." },
  es: { title: "F1: I-20 Uploaded", message: "{{client_name}} uploaded the I-20 document for review." },
};

export function getNotificationContent(
  category: string,
  action: string,
  lang: string,
  meta: Record<string, unknown>,
): { title: string; message: string } {
  const key   = `${category}__${action}`;
  const langs = CONTENT[key];
  const l     = lang === "pt" || lang === "es" ? lang : "en";
  const entry = langs?.[l] ?? langs?.["en"];

  if (!entry) {
    return { title: `${category}/${action}`, message: "" };
  }

  return {
    title:   interpolate(entry.title,   meta),
    message: interpolate(entry.message, meta),
  };
}
