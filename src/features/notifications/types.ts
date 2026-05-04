import type { NotificationRow } from "../../shared/db/types";

export type Notification = NotificationRow;

export interface ToastItem {
  id: string;
  notificationId: string;
  title: string;
  message?: string | null;
  type: "admin_action" | "client_action" | "system";
  link?: string | null;
  createdAt: string;
}
