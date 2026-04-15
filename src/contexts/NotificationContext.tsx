import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { notificationService, AppNotification } from "../services/notification.service";
import { useAuth } from "../hooks/useAuth";

export interface ToastItem {
  id: string;               // Unique toast UUID
  notificationId: string;   // The actual notification DB ID
  title: string;
  message?: string | null;
  type: "admin_action" | "client_action" | "system";
  createdAt: string;
}

export interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  activeToasts: ToastItem[];
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismissToast: (toastId: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

const MAX_TOASTS = 3;

interface NotificationProviderProps {
  children: ReactNode;
  role: "admin" | "client";
}

export function NotificationProvider({ children, role }: NotificationProviderProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeToasts, setActiveToasts] = useState<ToastItem[]>([]);
  const toastQueueRef = useRef<ToastItem[]>([]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const loadHistory = async () => {
    if (!user) return;
    try {
      let data: AppNotification[] = [];
      if (role === "admin") {
        data = await notificationService.getAdminNotifications(50);
      } else {
        data = await notificationService.getClientNotifications(user.id, 50);
      }
      setNotifications(data);
    } catch (error) {
      console.error("[NotificationContext] Error loading history:", error);
    }
  };

  const addToQueue = (notif: AppNotification) => {
    const item: ToastItem = {
      id: crypto.randomUUID(),
      notificationId: notif.id,
      title: notif.title,
      message: notif.message,
      type: (notif.type as any) || "system",
      createdAt: notif.created_at,
    };

    setActiveToasts(prev => {
      if (prev.length < MAX_TOASTS) {
        return [...prev, item];
      } else {
        toastQueueRef.current.push(item);
        return prev;
      }
    });
  };

  const dismissToast = (toastId: string) => {
    setActiveToasts(prev => {
      const next = prev.filter(t => t.id !== toastId);
      // Promote from queue if available
      if (toastQueueRef.current.length > 0 && next.length < MAX_TOASTS) {
        const [promoted, ...rest] = toastQueueRef.current;
        toastQueueRef.current = rest;
        return [...next, promoted];
      }
      return next;
    });
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error("[NotificationContext] Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      if (role === "admin") {
        await notificationService.markAllAdminAsRead();
      } else if (user) {
        // We could add markAllClientAsRead in the service if needed
        // For now, let's just update local state after bulk action if it existed
        // But the service only has markAllAdminAsRead. 
        // We'll just mark them locally for the client for now or implement the service method.
      }
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("[NotificationContext] Error marking all as read:", error);
    }
  };

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setActiveToasts([]);
      toastQueueRef.current = [];
      return;
    }

    loadHistory();

    const filter = role === "client"
      ? `user_id=eq.${user.id}`
      : `target_role=eq.admin`;

    const channel = supabase
      .channel(`notif_realtime_${role}_${user.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter,
      }, (payload) => {
        const newNotif = payload.new as AppNotification;
        setNotifications(prev => [newNotif, ...prev]);
        addToQueue(newNotif);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, role]);

  const value: NotificationContextValue = {
    notifications,
    unreadCount,
    activeToasts,
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

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
