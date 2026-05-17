import type { UserAccountRole } from "./users-account";

export type NotificationTargetRole = "admin" | "customer";
export type NotificationQueryRole = NotificationTargetRole | "client";

export type NotificationType = "admin_action" | "client_action" | "system";

export type NotificationCategory = "process" | "payment" | "chat" | "system";

export type NotificationKind =
  | "customer_admin_message"
  | "customer_step_approved"
  | "customer_step_rejected_feedback"
  | "customer_process_completed"
  | "customer_payment_received"
  | "customer_payment_failed"
  | "customer_chat_message"
  | "admin_customer_step_submitted"
  | "admin_customer_checkout_started"
  | "admin_customer_payment_proof"
  | "admin_customer_message"
  | "system_notice";

export type NotificationActorRole = UserAccountRole | "system";

export interface NotificationRecord {
  id: string;
  user_id: string | null;
  actor_user_id: string | null;
  actor_role: NotificationActorRole | null;
  target_role: NotificationTargetRole;
  type: NotificationType;
  kind: NotificationKind;
  category: NotificationCategory;
  service_id: string | null;
  title: string;
  message: string | null;
  link: string | null;
  is_read: boolean;
  read_at: string | null;
  email_sent: boolean;
  email_sent_at: string | null;
  send_email: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type Notification = NotificationRecord;

export interface NotificationCreateInput {
  user_id?: string | null;
  actor_user_id?: string | null;
  actor_role?: NotificationActorRole | null;
  target_role: NotificationQueryRole;
  type?: NotificationType;
  kind?: NotificationKind;
  category?: NotificationCategory;
  service_id?: string | null;
  title: string;
  message?: string | null;
  link?: string | null;
  is_read?: boolean;
  read_at?: string | null;
  email_sent?: boolean;
  email_sent_at?: string | null;
  send_email?: boolean;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface NotificationUpdateInput {
  title?: string;
  message?: string | null;
  link?: string | null;
  is_read?: boolean;
  read_at?: string | null;
  email_sent?: boolean;
  email_sent_at?: string | null;
  send_email?: boolean;
  metadata?: Record<string, unknown>;
  updated_at?: string;
}

export interface NotificationFilters {
  role?: NotificationQueryRole;
  userId?: string;
  serviceId?: string;
  unreadOnly?: boolean;
  kinds?: NotificationKind[];
  types?: NotificationType[];
  limit?: number;
}

export type NotificationTemplate =
  | "admin_message"
  | "step_approved"
  | "step_rejected_feedback"
  | "process_completed_approved"
  | "process_completed_denied"
  | "new_chat_message"
  | "payment_received"
  | "payment_failed";

export interface NotifyAdminOptions {
  title: string;
  body?: string;
  serviceId?: string;
  userId?: string;
  actorUserId?: string;
  actorRole?: NotificationActorRole | null;
  link?: string;
  metadata?: Record<string, unknown>;
  kind?: NotificationKind;
  category?: NotificationCategory;
}

export interface NotifyCustomerOptions {
  userId: string;
  template?: NotificationTemplate;
  title?: string;
  body?: string;
  serviceId?: string;
  actorUserId?: string;
  actorRole?: NotificationActorRole | null;
  link?: string;
  templateData?: Record<string, unknown>;
  sendEmail?: boolean;
  kind?: NotificationKind;
  category?: NotificationCategory;
}

export function normalizeNotificationRole(role: NotificationQueryRole): NotificationTargetRole {
  return role === "client" ? "customer" : role;
}
