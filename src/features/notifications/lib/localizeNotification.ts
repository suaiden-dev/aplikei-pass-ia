import type { AppNotification } from "@app/app/providers/NotificationProvider";
import type { NotifLang, NotifTemplate } from "@features/notifications/services/templates";
import { buildNotifContent } from "@features/notifications/services/templates";

type Labels = Record<string, string | undefined>;

type NotificationLike = {
  title: string;
  message?: string | null;
  metadata?: Record<string, unknown>;
};

function toTemplate(value: unknown): NotifTemplate | null {
  if (typeof value !== "string") return null;
  const allowed: NotifTemplate[] = [
    "payment_confirmed",
    "zelle_payment_approved",
    "zelle_payment_rejected",
    "step_approved",
    "step_rejected_feedback",
    "process_completed_approved",
    "process_completed_denied",
    "uscis_result_approved",
    "uscis_result_denied",
    "rfe_received",
    "interview_scheduled",
    "motion_submitted",
  ];
  return allowed.includes(value as NotifTemplate) ? (value as NotifTemplate) : null;
}

function metadataToStringMap(metadata?: Record<string, unknown>): Record<string, string> {
  if (!metadata) return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (typeof value === "string") out[key] = value;
  }
  return out;
}

export function localizeNotificationContent(
  notification: NotificationLike | AppNotification,
  lang: NotifLang,
  labels?: Labels,
): { title: string; message: string } {
  const title = notification.title?.trim() ?? "";
  const message = notification.message?.trim() ?? "";
  const fallbackTitle = labels?.system ?? "Notification";

  const template = toTemplate(notification.metadata?.template);
  if (template) {
    const localized = buildNotifContent(template, metadataToStringMap(notification.metadata), lang);
    return {
      title: localized.title || title || fallbackTitle,
      message: localized.message || message,
    };
  }

  type LabelKey =
    | "stepApproved"
    | "changesRequired"
    | "processCompleted"
    | "interviewScheduled"
    | "actionRequiredReview"
    | "underReview";

  const keyByTitle: Record<string, LabelKey> = {
    "Estamos Revisando!": "underReview",
    "We are reviewing!": "underReview",
    "Estamos revisando!": "underReview",
    "Etapa Aprovada": "stepApproved",
    "Step Approved": "stepApproved",
    "Paso Aprobado": "stepApproved",
    "Ajustes Necessários": "changesRequired",
    "Changes Required": "changesRequired",
    "Cambios Necesarios": "changesRequired",
    "Processo Concluído com Sucesso": "processCompleted",
    "Process Completed Successfully": "processCompleted",
    "Proceso Completado con Exito": "processCompleted",
    "Entrevista Agendada": "interviewScheduled",
    "Interview Scheduled": "interviewScheduled",
    "Entrevista Programada": "interviewScheduled",
    "Processo Finalizado": "processCompleted",
    "Process Completed": "processCompleted",
    "Proceso Finalizado": "processCompleted",
    "Acao necessaria: revisar etapa": "actionRequiredReview",
    "Ação necessária: revisar etapa": "actionRequiredReview",
    "Action required: review step": "actionRequiredReview",
  };

  const titleByKey = {
    stepApproved: labels?.stepApproved ?? "Step approved",
    changesRequired: labels?.changesRequired ?? "Changes required",
    processCompleted: labels?.processCompleted ?? "Process completed",
    interviewScheduled: labels?.interviewScheduled ?? "Interview scheduled",
    actionRequiredReview: labels?.actionRequiredReview ?? "Action required: review step",
    underReview: labels?.underReview ?? "We are reviewing!",
  };

  const messageByKey = {
    stepApproved: labels?.stepApprovedMessage ?? message,
    changesRequired: labels?.changesRequiredMessage ?? message,
    processCompleted: labels?.processCompletedMessage ?? message,
    interviewScheduled: labels?.interviewScheduledMessage ?? message,
    actionRequiredReview: labels?.actionRequiredReviewMessage ?? message,
    underReview: labels?.underReviewMessage ?? message,
  };

  const key = keyByTitle[title];
  const normalizedMessage = message
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const isReviewMessage =
    (normalizedMessage.includes("sua etapa foi enviada com sucesso") &&
      (normalizedMessage.includes("equipe de analise") || normalizedMessage.includes("equiepe de analise"))) ||
    (normalizedMessage.includes("your step was submitted successfully") &&
      normalizedMessage.includes("review team")) ||
    (normalizedMessage.includes("tu etapa se envio correctamente") &&
      normalizedMessage.includes("equipo de analisis"));

  const completedStepRegexPT = /O cliente concluiu a etapa "(.+)" de (.+) e aguarda sua revisao\./i;
  const completedStepRegexEN = /Client completed step "(.+)" in (.+) and is waiting for your review\./i;
  const completedStepRegexES = /El cliente completo el paso "(.+)" de (.+) y espera su revision\./i;

  const completedGenericRegexPT = /O cliente concluiu uma etapa de (.+) e aguarda sua revisao\./i;
  const completedGenericRegexEN = /Client completed a step in (.+) and is waiting for your review\./i;
  const completedGenericRegexES = /El cliente completo un paso de (.+) y espera su revision\./i;

  const completedStepMatch =
    message.match(completedStepRegexPT) ||
    message.match(completedStepRegexEN) ||
    message.match(completedStepRegexES);

  const completedGenericMatch =
    message.match(completedGenericRegexPT) ||
    message.match(completedGenericRegexEN) ||
    message.match(completedGenericRegexES);

  if (!key && isReviewMessage) {
    return {
      title: titleByKey.underReview,
      message: messageByKey.underReview || message,
    };
  }

  if (key === "actionRequiredReview" && completedStepMatch) {
    const stepName = completedStepMatch[1];
    const serviceName = completedStepMatch[2];
    const translated = (labels?.clientCompletedStepMessage ?? "")
      .replace("{{step}}", stepName)
      .replace("{{service}}", serviceName);
    return {
      title: titleByKey.actionRequiredReview,
      message: translated || messageByKey.actionRequiredReview || message,
    };
  }

  if (key === "actionRequiredReview" && completedGenericMatch) {
    const serviceName = completedGenericMatch[1];
    const translated = (labels?.clientCompletedGenericMessage ?? "").replace("{{service}}", serviceName);
    return {
      title: titleByKey.actionRequiredReview,
      message: translated || messageByKey.actionRequiredReview || message,
    };
  }

  if (!key) {
    return { title: title || fallbackTitle, message };
  }

  return {
    title: titleByKey[key],
    message: messageByKey[key] || message,
  };
}
