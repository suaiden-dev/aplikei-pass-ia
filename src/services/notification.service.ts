import { supabase } from "../lib/supabase";
import { notificationRepository } from "../repositories";
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

type NotificationInsertPayload = Record<string, unknown>;

function isMissingColumnError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return error.code === "42703" || (error.message?.toLowerCase().includes("column") ?? false);
}

function applyAdminRoleFilter<T extends { eq: (column: string, value: string) => T }>(
  query: T,
  roleColumn: "target_role" | "target_type",
): T {
  return query.eq(roleColumn, "admin");
}

async function insertNotification(payload: NotificationInsertPayload): Promise<void> {
  const { error } = await supabase.from("notifications").insert(payload);

  if (!error) return;

  if (isMissingColumnError(error)) {
    const { link: _link, ...payloadWithoutLink } = payload;
    const { error: retryError } = await supabase.from("notifications").insert(payloadWithoutLink);
    if (retryError) throw new Error(retryError.message);
    return;
  }

  throw new Error(error.message);
}

function normalizeNotification(row: Record<string, unknown>): AppNotification {
  return {
    id: String(row.id ?? ""),
    type: String(row.type ?? "system"),
    target_role: (row.target_role ?? row.target_type ?? "client") as "admin" | "client",
    user_id: (row.user_id as string | null | undefined) ?? null,
    service_id: (row.service_id as string | null | undefined) ?? null,
    title: String(row.title ?? ""),
    message: (row.message as string | null | undefined) ?? (row.body as string | null | undefined) ?? null,
    link: (row.link as string | null | undefined) ?? null,
    is_read: Boolean(row.is_read),
    send_email: Boolean(row.send_email),
    email_sent: Boolean(row.email_sent),
    metadata: (row.metadata as Record<string, unknown> | undefined) ?? {},
    created_at: String(row.created_at ?? new Date().toISOString()),
  };
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

      await insertNotification({
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
    } catch (e) {
      console.error("[notificationService] notifyClient failed:", e);
    }
  },

  async notifyAdmin(params: NotifyAdminParams): Promise<void> {
    try {
      await insertNotification({
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
    } catch (e) {
      console.error("[notificationService] notifyAdmin failed:", e);
    }
  },

  async getUnreadCount(role: "admin" | "client", userId?: string): Promise<number> {
    if (role === "client" && !userId) return 0;

    if (role === "client" && userId) {
      return notificationRepository.getUnreadCount(userId);
    }

    const runQuery = async (roleColumn: "target_role" | "target_type" = "target_role") => {
      const query = supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("is_read", false);

      applyAdminRoleFilter(query, roleColumn);
      return query;
    };

    let { count, error } = await runQuery();

    if (error && isMissingColumnError(error)) {
      ({ count, error } = await runQuery("target_type"));
    }

    if (error) {
      console.error("[notif] getUnreadCount error:", error.message);
    }

    return count ?? 0;
  },

  async getNotifications(role: "admin" | "client", userId?: string): Promise<AppNotification[]> {
    const limit = role === "admin" ? 50 : 30;

    if (role === "client" && userId) {
      const notifications = await notificationRepository.findByUser(userId, limit);
      return notifications.map(n => ({
        id: n.id,
        type: "client_action",
        target_role: "client" as const,
        user_id: n.user_id,
        service_id: null,
        title: n.title,
        message: n.message,
        link: n.link,
        is_read: n.is_read,
        send_email: n.send_email,
        email_sent: n.email_sent,
        metadata: {},
        created_at: n.created_at,
      }));
    }

    const runQuery = async (roleColumn: "target_role" | "target_type" = "target_role") => {
      const query = supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      applyAdminRoleFilter(query, roleColumn);
      return query;
    };

    let { data, error } = await runQuery();

    if (error && isMissingColumnError(error)) {
      ({ data, error } = await runQuery("target_type"));
    }

    if (error) {
      console.error("[notif] getNotifications error:", error.message);
    }

    return ((data as Record<string, unknown>[] | null) ?? []).map(normalizeNotification);
  },

  async markAsRead(notificationId: string): Promise<void> {
    await notificationRepository.markAsRead(notificationId);
  },

  async markAllAdminAsRead(): Promise<void> {
    const runUpdate = async (roleColumn: "target_role" | "target_type" = "target_role") =>
      supabase
        .from("notifications")
        .update({ is_read: true })
        .eq(roleColumn, "admin")
        .eq("is_read", false);

    let { error } = await runUpdate();

    if (error && isMissingColumnError(error)) {
      ({ error } = await runUpdate("target_type"));
    }

    if (error) {
      console.error("[notif] markAllAdminAsRead error:", error.message);
    }
  },

  async markAllClientAsRead(userId: string): Promise<void> {
    await notificationRepository.markAllAsRead(userId);
  },
};
