import { useState, useEffect, useMemo, useCallback, type ReactNode } from "react";
import { notificationService, type AppNotification } from "../services/notification.service";
import { useAuth } from "../hooks/useAuth";
import {
  NotificationContext,
  type NotificationContextValue,
  type ToastItem,
} from "./NotificationContext/context";
import { onPortalEvent } from "../mocks/customer-portal";

const MAX_TOASTS = 3;

interface NotificationProviderProps {
  children: ReactNode;
  role: "admin" | "client";
}

function matchesNotificationRole(
  row: AppNotification,
  role: "admin" | "client",
  userId?: string,
): boolean {
  if (role === "admin") {
    return row.target_role === "admin";
  }

  return !!userId && row.user_id === userId;
}

export function NotificationProvider({ children, role }: NotificationProviderProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeToasts, setActiveToasts] = useState<ToastItem[]>([]);
  const [realtimeStatus, setRealtimeStatus] = useState<"connecting" | "connected" | "disconnected">("connected");

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications],
  );

  const loadHistory = useCallback(async () => {
    if (!user?.id) return;

    try {
      const data = await notificationService.getNotifications(role, user.id);
      setNotifications(data);
    } catch (error) {
      console.error("[NotificationContext] Error loading history:", error);
    }
  }, [role, user?.id]);

  const addToToastQueue = useCallback((notif: AppNotification) => {
    const item: ToastItem = {
      id: crypto.randomUUID(),
      notificationId: notif.id,
      title: notif.title,
      message: notif.message,
      type: (notif.type as ToastItem["type"]) || "system",
      link: notif.link ?? null,
      createdAt: notif.created_at,
    };

    setActiveToasts((prev) => [...prev, item].slice(0, MAX_TOASTS));
  }, []);

  const dismissToast = useCallback((toastId: string) => {
    setActiveToasts((prev) => prev.filter((toast) => toast.id !== toastId));
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((notification) => (
        notification.id === id ? { ...notification, is_read: true } : notification
      )));
    } catch (error) {
      console.error("[NotificationContext] Error marking as read:", error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      if (role === "admin") {
        await notificationService.markAllAdminAsRead();
      } else if (user) {
        await notificationService.markAllClientAsRead(user.id);
      }
      setNotifications((prev) => prev.map((notification) => ({ ...notification, is_read: true })));
    } catch (error) {
      console.error("[NotificationContext] Error marking all as read:", error);
    }
  }, [role, user]);

  useEffect(() => {
    if (!user) {
      setActiveToasts([]);
      setNotifications([]);
      setRealtimeStatus("disconnected");
      return;
    }
    setRealtimeStatus("connected");
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    void loadHistory();

    return () => {
    };
  }, [loadHistory, role, user]);

  useEffect(() => {
    return onPortalEvent("aplikei:notifications:changed", (event) => {
      const detail = (event as CustomEvent<{ notification?: AppNotification }>).detail;
      const notification = detail?.notification;

      if (!notification || !matchesNotificationRole(notification, role, user?.id)) {
        void loadHistory();
        return;
      }

      setNotifications((prev) => {
        if (prev.some((entry) => entry.id === notification.id)) {
          return prev;
        }
        return [notification, ...prev];
      });

      addToToastQueue(notification);
    });
  }, [addToToastQueue, loadHistory, role, user?.id]);

  const value: NotificationContextValue = {
    notifications,
    unreadCount,
    activeToasts,
    realtimeStatus,
    markAsRead,
    markAllAsRead,
    dismissToast,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
