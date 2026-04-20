import { supabase } from "../lib/supabase";

export type EmailTemplate =
  | "zelle_payment_approved"
  | "zelle_payment_rejected"
  | "step_approved"
  | "step_rejected_feedback"
  | "process_completed_approved"
  | "process_completed_denied"
  | "uscis_result_approved"
  | "uscis_result_denied"
  | "rfe_received"
  | "rfe_result"
  | "interview_scheduled"
  | "interview_result"
  | "motion_submitted"
  | "motion_result"
  | "admin_message";

export interface NotifyClientParams {
  userId?: string;       // Opcional se não houver user_id (pagamento Zelle convidado, webhook ignora e-mail)
  clientEmail?: string;
  clientName?: string;
  template: EmailTemplate; // Usado para montar a mensagem, se body for vazio
  title: string;
  body?: string;        // Se enviado, ignora montagem automática
  serviceId?: string;
  templateData?: Record<string, unknown>;
}

export interface NotifyAdminParams {
  title: string;
  body?: string;
  serviceId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface AppNotification {
  id: string;
  type: string;
  target_role: "admin" | "client";
  user_id: string | null;
  service_id: string | null;
  title: string;
  message: string | null;
  is_read: boolean;
  send_email: boolean;
  email_sent: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

// Helper interno para formatar a mensagem conforme template caso o body não venha
function buildMessageFromTemplate(template: EmailTemplate, data: Record<string, unknown>): string {
  switch (template) {
    case "zelle_payment_approved":
      return `Seu pagamento Zelle de ${data.amount || ""} para o serviço ${data.service_name || ""} foi aprovado.`;
    case "zelle_payment_rejected":
      return `Identificamos um problema com seu pagamento Zelle. Motivo: ${data.reason || "Erro na validação"}.`;
    case "step_approved":
      return `A etapa ${data.step_name || ""} do seu processo foi aprovada.${data.next_step_name ? ` Próxima etapa: ${data.next_step_name}.` : ""}`;
    case "step_rejected_feedback":
      return `A etapa ${data.step_name || ""} precisa de ajustes.\nFeedback: ${data.feedback || "Verifique o painel para mais detalhes."}`;
    case "process_completed_approved":
      return `Parabéns! Seu processo de ${data.service_name || "visto"} foi concluído com sucesso.`;
    case "process_completed_denied":
      return `Infelizmente, seu processo de ${data.service_name || "visto"} não foi aprovado nesta solicitação.`;
    case "uscis_result_approved":
      return `Ótima notícia! Seu ${data.service_name || "visto"} foi aprovado pelo USCIS!`;
    case "uscis_result_denied":
      return `O USCIS retornou uma decisão de negação para seu processo.${data.next_steps ? ` Próximos passos: ${data.next_steps}` : ""}`;
    case "rfe_received":
      return `O USCIS emitiu um Request for Evidence (RFE) para seu processo.${data.deadline ? ` Prazo: ${data.deadline}.` : ""} Acesse seu painel com urgência.`;
    case "interview_scheduled":
      return `Sua entrevista foi agendada. ${data.interview_date ? `Data: ${data.interview_date}` : ""} | ${data.interview_location ? `Local: ${data.interview_location}` : ""}`;
    default:
      return "Acesse seu painel para visualizar novas atualizações em seu processo.";
  }
}

export const notificationService = {
  /**
   * ADMIN → CLIENTE
   * Cria notificação com send_email: true. O Webhook do BD vai cuidar do e-mail.
   */
  async notifyClient(params: NotifyClientParams): Promise<void> {
    try {
      if (!params.userId) {
        console.warn("[notificationService] notifyClient called without userId, email cannot be sent via webhook.");
      }

      const message = params.body || buildMessageFromTemplate(params.template, params.templateData || {});

      await supabase.from("notifications").insert({
        type: "admin_action",
        target_role: "client",
        user_id: params.userId || null,
        service_id: params.serviceId || null,
        title: params.title,
        message: message,
        send_email: !!params.userId, // Só marcamos true se houver id confiavel pro webhook resgatar
        email_sent: false,
        metadata: params.templateData || {},
      });
    } catch (e) {
      console.error("[notificationService] notifyClient failed:", e);
    }
  },

  /**
   * CLIENTE → ADMIN
   * Cria notificação interna. Não dispara email.
   */
  async notifyAdmin(params: NotifyAdminParams): Promise<void> {
    try {
      console.log("[notificationService] Sending admin notification:", params.title);
      const { error } = await supabase.from("notifications").insert({
        type: "client_action",
        target_role: "admin",
        user_id: params.userId || null,
        service_id: params.serviceId || null,
        title: params.title,
        message: params.body || null,
        send_email: false,
        metadata: params.metadata || {},
      });
      if (error) {
        console.error("[notificationService] notifyAdmin DB Error:", error);
      }
    } catch (e) {
      console.error("[notificationService] notifyAdmin failed:", e);
    }
  },

  async getAdminUnreadCount(): Promise<number> {
    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("target_role", "admin")
      .eq("is_read", false);
    return count ?? 0;
  },

  async getAdminNotifications(limit = 50): Promise<AppNotification[]> {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("target_role", "admin")
      .order("created_at", { ascending: false })
      .limit(limit);
    return (data as AppNotification[]) ?? [];
  },

  async getClientNotifications(userId: string, limit = 30): Promise<AppNotification[]> {
    // Busca notificações destinadas ao cliente pelo userId
    // Removemos o filtro estrito de target_role para garantir que notificações legadas apareçam
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    return (data as AppNotification[]) ?? [];
  },

  async markAsRead(notificationId: string): Promise<void> {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);
  },

  async markAllAdminAsRead(): Promise<void> {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("target_role", "admin")
      .eq("is_read", false);
  },
  
  async markAllClientAsRead(userId: string): Promise<void> {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("target_role", "client")
      .eq("is_read", false);
  },
};
