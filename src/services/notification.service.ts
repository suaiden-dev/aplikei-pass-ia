import { supabase } from "../lib/supabase";
import { buildNotifContent, type NotifLang, type NotifTemplate } from "./notification-templates";

export type EmailTemplate = NotifTemplate;

export interface NotifyClientParams {
  userId?: string;
  clientEmail?: string;
  clientName?: string;
  template?: NotifTemplate;
  title?: string;
  body?: string;
  serviceId?: string;
  templateData?: Record<string, string>;
  sendEmail?: boolean;
  link?: string;
}

export interface NotifyAdminParams {
  title: string;
  body?: string;
  serviceId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  link?: string;
}

export interface AppNotification {
  id: string;
  type: string;
  target_role: "admin" | "client";
  user_id: string | null;
  service_id: string | null;
  title: string;
  message: string | null;
  link: string | null;
  is_read: boolean;
  send_email: boolean;
  email_sent: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

async function getUserLang(userId: string): Promise<NotifLang> {
  const { data } = await supabase
    .from("user_accounts")
    .select("preferred_language")
    .eq("id", userId)
    .maybeSingle();

  return (data?.preferred_language as NotifLang) ?? "en";
}

export const notificationService = {
  async notifyClient(params: NotifyClientParams): Promise<void> {
    try {
      const lang = params.userId ? await getUserLang(params.userId) : "en";
      const { title, message } = params.template
        ? buildNotifContent(params.template, {
            ...(params.templateData ?? {}),
            title: params.title ?? "",
            body: params.body ?? "",
          }, lang)
        : { title: params.title ?? "", message: params.body ?? "" };

      const { error } = await supabase.from("notifications").insert({
        type: "client_action",
        target_role: "client",
        user_id: params.userId || null,
        service_id: params.serviceId || null,
        title,
        message,
        link: params.link ?? null,
        send_email: params.sendEmail ?? true,
        email_sent: false,
        metadata: params.templateData ?? {},
      });

      if (error) {
        console.error("[notificationService] notifyClient error:", error.message);
      }
    } catch (e) {
      console.error("[notificationService] notifyClient failed:", e);
    }
  },

  async notifyAdmin(params: NotifyAdminParams): Promise<void> {
    try {
      const { error } = await supabase.from("notifications").insert({
        type: "admin_action",
        target_role: "admin",
        user_id: params.userId || null,
        service_id: params.serviceId || null,
        title: params.title,
        message: params.body || null,
        link: params.link ?? null,
        email_sent: false,
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

  async getUnreadCount(role: "admin" | "client", userId?: string): Promise<number> {
    if (role === "client" && !userId) return 0;

    const query = supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("is_read", false);

    if (role === "client") {
      query.eq("user_id", userId!);
    } else {
      query.eq("target_role", "admin");
    }

    const { count, error } = await query;

    if (error) {
      console.error("[notif] getUnreadCount error:", error.message);
    }

    return count ?? 0;
  },

  async getNotifications(role: "admin" | "client", userId?: string): Promise<AppNotification[]> {
    const limit = role === "admin" ? 50 : 30;
    const query = supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (role === "client") {
      if (!userId) return [];
      query.eq("user_id", userId);
    } else {
      query.eq("target_role", "admin");
    }

    const { data, error } = await query;

    if (error) {
      console.error("[notif] getNotifications error:", error.message);
    }

    return (data as AppNotification[]) ?? [];
  },

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (error) {
      console.error("[notif] markAsRead error:", error.message);
    }
  },

  async markAllAdminAsRead(): Promise<void> {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("target_role", "admin")
      .eq("is_read", false);

    if (error) {
      console.error("[notif] markAllAdminAsRead error:", error.message);
    }
  },
  
  async markAllClientAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      console.error("[notif] markAllClientAsRead error:", error.message);
    }
  },
};
