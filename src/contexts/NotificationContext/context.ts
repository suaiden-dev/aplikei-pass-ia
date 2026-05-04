import { createContext } from "react";
import type { ToastItem } from "../../features/notifications/types";

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

export type { ToastItem };

export interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  activeToasts: ToastItem[];
  realtimeStatus: "connecting" | "connected" | "disconnected";
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismissToast: (toastId: string) => void;
}

export const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);
