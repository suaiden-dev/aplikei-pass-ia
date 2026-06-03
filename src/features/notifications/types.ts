export interface ToastItem {
  id: string;
  notificationId: string;
  title: string;
  message?: string | null;
  type: "admin_action" | "client_action" | "system";
  link?: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
}
