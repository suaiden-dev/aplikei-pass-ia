import {
  insertNotificationRecord,
  listNotificationRecords,
  markNotificationAsRead,
  markNotificationsAsRead,
} from "../database/notifications.database";
import { emitPortalEvent } from "../mocks/customer-portal";
import {
  type Notification,
  type NotificationCategory,
  type NotificationKind,
  type NotificationQueryRole,
  type NotificationTemplate,
  type NotifyAdminOptions,
  type NotifyCustomerOptions,
} from "../models/notification.model";

export interface NotifyClientParams extends NotifyCustomerOptions {
  clientEmail?: string;
  clientName?: string;
}

export type NotifyAdminParams = NotifyAdminOptions;
export type AppNotification = Notification;

function publishNotificationEvent(notification: AppNotification) {
  emitPortalEvent("aplikei:notifications:changed", { notification });
}

function resolveCustomerTemplate(
  template?: NotificationTemplate,
): Pick<AppNotification, "type" | "kind" | "category"> {
  switch (template) {
    case "step_approved":
      return { type: "client_action", kind: "customer_step_approved", category: "process" };
    case "step_rejected_feedback":
      return { type: "client_action", kind: "customer_step_rejected_feedback", category: "process" };
    case "process_completed_approved":
    case "process_completed_denied":
      return { type: "client_action", kind: "customer_process_completed", category: "process" };
    case "new_chat_message":
      return { type: "client_action", kind: "customer_chat_message", category: "chat" };
    case "payment_received":
      return { type: "client_action", kind: "customer_payment_received", category: "payment" };
    case "payment_failed":
      return { type: "system", kind: "customer_payment_failed", category: "payment" };
    case "admin_message":
    default:
      return { type: "client_action", kind: "customer_admin_message", category: "system" };
  }
}

function inferAdminKind(params: NotifyAdminParams): {
  kind: NotificationKind;
  category: NotificationCategory;
} {
  if (params.kind && params.category) {
    return {
      kind: params.kind,
      category: params.category,
    };
  }

  const haystack = `${params.title} ${params.body ?? ""}`.toLowerCase();

  if (haystack.includes("checkout")) {
    return {
      kind: params.kind ?? "admin_customer_checkout_started",
      category: params.category ?? "payment",
    };
  }

  if (haystack.includes("comprovante") || haystack.includes("zelle")) {
    return {
      kind: params.kind ?? "admin_customer_payment_proof",
      category: params.category ?? "payment",
    };
  }

  if (haystack.includes("etapa") || haystack.includes("revis")) {
    return {
      kind: params.kind ?? "admin_customer_step_submitted",
      category: params.category ?? "process",
    };
  }

  return {
    kind: params.kind ?? "admin_customer_message",
    category: params.category ?? "system",
  };
}

export const notificationService = {
  async notifyClient(params: NotifyClientParams): Promise<void> {
    const templateConfig = resolveCustomerTemplate(params.template);
    const notification = insertNotificationRecord({
      type: params.kind ? "client_action" : templateConfig.type,
      kind: params.kind ?? templateConfig.kind,
      category: params.category ?? templateConfig.category,
      target_role: "customer",
      user_id: params.userId,
      actor_user_id: params.actorUserId ?? null,
      actor_role: params.actorRole ?? "admin",
      service_id: params.serviceId ?? null,
      title: params.title ?? "Atualização do processo",
      message: params.body ?? null,
      link: params.link ?? null,
      send_email: params.sendEmail ?? false,
      metadata: params.templateData ?? {},
    });

    publishNotificationEvent(notification);
  },

  async notifyCustomer(params: NotifyCustomerOptions): Promise<void> {
    await this.notifyClient(params);
  },

  async notifyAdmin(params: NotifyAdminParams): Promise<void> {
    const adminConfig = inferAdminKind(params);
    const notification = insertNotificationRecord({
      type: "admin_action",
      target_role: "admin",
      user_id: params.userId ?? null,
      actor_user_id: params.actorUserId ?? params.userId ?? null,
      actor_role: params.actorRole ?? "customer",
      kind: adminConfig.kind,
      category: adminConfig.category,
      service_id: params.serviceId ?? null,
      title: params.title,
      message: params.body ?? null,
      link: params.link ?? null,
      send_email: false,
      metadata: params.metadata ?? {},
    });

    publishNotificationEvent(notification);
  },

  async getUnreadCount(role: NotificationQueryRole, userId?: string): Promise<number> {
    return listNotificationRecords({
      role,
      userId,
      unreadOnly: true,
    }).length;
  },

  async getNotifications(role: NotificationQueryRole, userId?: string): Promise<AppNotification[]> {
    return listNotificationRecords({
      role,
      userId,
    });
  },

  async markAsRead(notificationId: string): Promise<void> {
    markNotificationAsRead(notificationId);
  },

  async markAllAdminAsRead(): Promise<void> {
    markNotificationsAsRead({
      role: "admin",
    });
  },

  async markAllClientAsRead(userId: string): Promise<void> {
    markNotificationsAsRead({
      role: "customer",
      userId,
    });
  },
};
