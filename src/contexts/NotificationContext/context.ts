import { createContext } from "react";
import type { AppNotification } from "../../services/notification.service";

export interface ToastItem {
  id: string;
  notificationId: string;
  title: string;
  message?: string | null;
  type: "admin_action" | "client_action" | "system";
  link?: string | null;
  createdAt: string;
}

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
