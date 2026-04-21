// ATENÇÃO: arquivo espelhado em:
//   src/services/notification-templates.ts  (frontend)
//   supabase/functions/_shared/notif-templates.ts  (Deno)
// Manter os dois em sincronia.

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

export type NotifLang = "en" | "pt" | "es";

export type NotifTemplate =
  | "payment_confirmed"
  | "zelle_payment_approved"
  | "zelle_payment_rejected"
  | "step_approved"
  | "step_rejected_feedback"
  | "process_completed_approved"
  | "process_completed_denied"
  | "uscis_result_approved"
  | "uscis_result_denied"
  | "rfe_received"
  | "interview_scheduled"
  | "motion_submitted"
  | "admin_message";

type NotifData = Record<string, string>;

type TemplateBuilder = (data: NotifData) => { title: string; message: string };

const withFallback = (value: string | undefined, fallback = "") => value ?? fallback;

const templates: Record<NotifLang, Record<NotifTemplate, TemplateBuilder>> = {
  en: {
    payment_confirmed: (data) => ({
      title: "Payment Confirmed!",
      message: `Your payment for ${withFallback(data.service_name, "your service")} was processed successfully.`,
    }),
    zelle_payment_approved: (data) => ({
      title: "Zelle Payment Approved!",
      message: `Your Zelle payment of ${withFallback(data.amount, "$0")} for ${withFallback(data.service_name, "your service")} has been approved.`,
    }),
    zelle_payment_rejected: (data) => ({
      title: "Problem with Your Zelle Payment",
      message: data.reason
        ? `We found an issue with your Zelle payment. Reason: ${data.reason}.`
        : "We found an issue with your Zelle payment. Please contact support.",
    }),
    step_approved: (data) => ({
      title: "Step Approved",
      message: data.next_step_name
        ? `The step "${withFallback(data.step_name, "Current Step")}" was approved. Next step: ${data.next_step_name}.`
        : `The step "${withFallback(data.step_name, "Current Step")}" was approved.`,
    }),
    step_rejected_feedback: (data) => ({
      title: "Changes Required",
      message: data.feedback
        ? `The step "${withFallback(data.step_name, "Current Step")}" needs updates. Feedback: ${data.feedback}`
        : `The step "${withFallback(data.step_name, "Current Step")}" needs updates.`,
    }),
    process_completed_approved: (data) => ({
      title: "Process Completed Successfully",
      message: `Your ${withFallback(data.service_name, "process")} has been completed successfully.`,
    }),
    process_completed_denied: (data) => ({
      title: "Process Completed",
      message: `Your ${withFallback(data.service_name, "process")} was completed with a denied result.`,
    }),
    uscis_result_approved: (data) => ({
      title: "USCIS Approved Your Case",
      message: `Great news! USCIS approved your ${withFallback(data.service_name, "case")}.`,
    }),
    uscis_result_denied: (data) => ({
      title: "USCIS Decision Received",
      message: data.next_steps
        ? `USCIS denied your ${withFallback(data.service_name, "case")}. Next steps: ${data.next_steps}`
        : `USCIS denied your ${withFallback(data.service_name, "case")}.`,
    }),
    rfe_received: (data) => ({
      title: "RFE Received",
      message: data.deadline
        ? `USCIS issued an RFE for your case. Deadline: ${data.deadline}. Please check your dashboard urgently.`
        : "USCIS issued an RFE for your case. Please check your dashboard urgently.",
    }),
    interview_scheduled: (data) => ({
      title: "Interview Scheduled",
      message: [
        data.interview_date ? `Date: ${data.interview_date}` : "",
        data.interview_location ? `Location: ${data.interview_location}` : "",
      ].filter(Boolean).join(" | ") || "Your interview has been scheduled.",
    }),
    motion_submitted: () => ({
      title: "Motion Submitted",
      message: "Your payment was confirmed and we have started the next steps for your motion.",
    }),
    admin_message: (data) => ({
      title: withFallback(data.title),
      message: withFallback(data.body),
    }),
  },
  pt: {
    payment_confirmed: (data) => ({
      title: "Pagamento Confirmado!",
      message: `Seu pagamento para ${withFallback(data.service_name, "seu serviço")} foi processado com sucesso.`,
    }),
    zelle_payment_approved: (data) => ({
      title: "Pagamento Zelle Aprovado!",
      message: `Seu pagamento via Zelle de ${withFallback(data.amount, "$0")} para ${withFallback(data.service_name, "seu serviço")} foi aprovado.`,
    }),
    zelle_payment_rejected: (data) => ({
      title: "Problema com seu pagamento Zelle",
      message: data.reason
        ? `Identificamos um problema com seu pagamento Zelle. Motivo: ${data.reason}.`
        : "Identificamos um problema com seu pagamento Zelle. Entre em contato com o suporte.",
    }),
    step_approved: (data) => ({
      title: "Etapa Aprovada",
      message: data.next_step_name
        ? `A etapa "${withFallback(data.step_name, "Etapa Atual")}" foi aprovada. Próxima etapa: ${data.next_step_name}.`
        : `A etapa "${withFallback(data.step_name, "Etapa Atual")}" foi aprovada.`,
    }),
    step_rejected_feedback: (data) => ({
      title: "Ajustes Necessários",
      message: data.feedback
        ? `A etapa "${withFallback(data.step_name, "Etapa Atual")}" precisa de ajustes. Feedback: ${data.feedback}`
        : `A etapa "${withFallback(data.step_name, "Etapa Atual")}" precisa de ajustes.`,
    }),
    process_completed_approved: (data) => ({
      title: "Processo Concluído com Sucesso",
      message: `Seu processo de ${withFallback(data.service_name, "serviço")} foi concluído com sucesso.`,
    }),
    process_completed_denied: (data) => ({
      title: "Processo Finalizado",
      message: `Seu processo de ${withFallback(data.service_name, "serviço")} foi finalizado com resultado negado.`,
    }),
    uscis_result_approved: (data) => ({
      title: "USCIS Aprovou seu Caso",
      message: `Otima noticia! O USCIS aprovou seu processo de ${withFallback(data.service_name, "serviço")}.`,
    }),
    uscis_result_denied: (data) => ({
      title: "Resultado do USCIS Recebido",
      message: data.next_steps
        ? `O USCIS negou seu processo de ${withFallback(data.service_name, "serviço")}. Próximos passos: ${data.next_steps}`
        : `O USCIS negou seu processo de ${withFallback(data.service_name, "serviço")}.`,
    }),
    rfe_received: (data) => ({
      title: "RFE Recebida",
      message: data.deadline
        ? `O USCIS emitiu uma RFE para seu caso. Prazo: ${data.deadline}. Verifique seu painel com urgência.`
        : "O USCIS emitiu uma RFE para seu caso. Verifique seu painel com urgência.",
    }),
    interview_scheduled: (data) => ({
      title: "Entrevista Agendada",
      message: [
        data.interview_date ? `Data: ${data.interview_date}` : "",
        data.interview_location ? `Local: ${data.interview_location}` : "",
      ].filter(Boolean).join(" | ") || "Sua entrevista foi agendada.",
    }),
    motion_submitted: () => ({
      title: "Motion Enviado",
      message: "Seu pagamento foi confirmado e iniciamos os próximos passos do seu motion.",
    }),
    admin_message: (data) => ({
      title: withFallback(data.title),
      message: withFallback(data.body),
    }),
  },
  es: {
    payment_confirmed: (data) => ({
      title: "Pago Confirmado!",
      message: `Su pago para ${withFallback(data.service_name, "su servicio")} fue procesado con exito.`,
    }),
    zelle_payment_approved: (data) => ({
      title: "Pago Zelle Aprobado!",
      message: `Su pago por Zelle de ${withFallback(data.amount, "$0")} para ${withFallback(data.service_name, "su servicio")} fue aprobado.`,
    }),
    zelle_payment_rejected: (data) => ({
      title: "Problema con su pago Zelle",
      message: data.reason
        ? `Encontramos un problema con su pago Zelle. Motivo: ${data.reason}.`
        : "Encontramos un problema con su pago Zelle. Contacte al soporte.",
    }),
    step_approved: (data) => ({
      title: "Paso Aprobado",
      message: data.next_step_name
        ? `El paso "${withFallback(data.step_name, "Paso Actual")}" fue aprobado. Siguiente paso: ${data.next_step_name}.`
        : `El paso "${withFallback(data.step_name, "Paso Actual")}" fue aprobado.`,
    }),
    step_rejected_feedback: (data) => ({
      title: "Cambios Necesarios",
      message: data.feedback
        ? `El paso "${withFallback(data.step_name, "Paso Actual")}" necesita ajustes. Comentario: ${data.feedback}`
        : `El paso "${withFallback(data.step_name, "Paso Actual")}" necesita ajustes.`,
    }),
    process_completed_approved: (data) => ({
      title: "Proceso Completado con Exito",
      message: `Su proceso de ${withFallback(data.service_name, "servicio")} fue completado con exito.`,
    }),
    process_completed_denied: (data) => ({
      title: "Proceso Finalizado",
      message: `Su proceso de ${withFallback(data.service_name, "servicio")} finalizo con resultado denegado.`,
    }),
    uscis_result_approved: (data) => ({
      title: "USCIS Aprobo su Caso",
      message: `Buenas noticias! USCIS aprobo su proceso de ${withFallback(data.service_name, "servicio")}.`,
    }),
    uscis_result_denied: (data) => ({
      title: "Decision de USCIS Recibida",
      message: data.next_steps
        ? `USCIS nego su proceso de ${withFallback(data.service_name, "servicio")}. Proximos pasos: ${data.next_steps}`
        : `USCIS nego su proceso de ${withFallback(data.service_name, "servicio")}.`,
    }),
    rfe_received: (data) => ({
      title: "RFE Recibida",
      message: data.deadline
        ? `USCIS emitio una RFE para su caso. Fecha limite: ${data.deadline}. Revise su panel con urgencia.`
        : "USCIS emitio una RFE para su caso. Revise su panel con urgencia.",
    }),
    interview_scheduled: (data) => ({
      title: "Entrevista Programada",
      message: [
        data.interview_date ? `Fecha: ${data.interview_date}` : "",
        data.interview_location ? `Lugar: ${data.interview_location}` : "",
      ].filter(Boolean).join(" | ") || "Su entrevista fue programada.",
    }),
    motion_submitted: () => ({
      title: "Motion Enviado",
      message: "Su pago fue confirmado y ya iniciamos los siguientes pasos de su motion.",
    }),
    admin_message: (data) => ({
      title: withFallback(data.title),
      message: withFallback(data.body),
    }),
  },
};

export function buildNotifContent(
  template: NotifTemplate,
  data: NotifData = {},
  lang: NotifLang = "en",
): { title: string; message: string } {
  const normalizedLang = templates[lang] ? lang : "en";
  const builder = templates[normalizedLang][template];

  if (!builder) {
    return {
      title: data.title ?? "",
      message: data.body ?? "",
    };
  }

  return builder(data);
}

export async function getUserLang(
  supabase: SupabaseClient,
  userId: string | null,
): Promise<NotifLang> {
  if (!userId) return "en";

  const { data } = await supabase
    .from("user_accounts")
    .select("preferred_language")
    .eq("id", userId)
    .maybeSingle();

  return (data?.preferred_language as NotifLang) ?? "en";
}
