import { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback, type ReactNode } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { notificationService, AppNotification } from "../services/notification.service";
import { useAuth } from "../hooks/useAuth";

export interface ToastItem {
  id: string;               // Unique toast UUID
  notificationId: string;   // The actual notification DB ID
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
  const [realtimeStatus, setRealtimeStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const toastQueueRef = useRef<ToastItem[]>([]);
  const cacheKey = user ? `notif_${user.id}_${role}` : null;

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications],
  );

  const loadHistory = useCallback(async () => {
    if (!user || !cacheKey) return;

    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as { data: AppNotification[]; ts: number };
        if (Date.now() - parsed.ts < 30_000) {
          setNotifications(parsed.data);
          return;
        }
      }
    } catch {
      // ignore session storage issues
    }

    try {
      const data = await notificationService.getNotifications(role, user.id);
      setNotifications(data);
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify({ data, ts: Date.now() }));
      } catch {
        // ignore session storage issues
      }
    } catch (error) {
      console.error("[NotificationContext] Error loading history:", error);
    }
  }, [cacheKey, role, user]);

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

    setActiveToasts(prev => {
      if (prev.length < MAX_TOASTS) {
        return [...prev, item];
      } else {
        toastQueueRef.current.push(item);
        return prev;
      }
    });
  }, []);

  const dismissToast = useCallback((toastId: string) => {
    setActiveToasts(prev => {
      const next = prev.filter(t => t.id !== toastId);
      if (toastQueueRef.current.length > 0 && next.length < MAX_TOASTS) {
        const [promoted, ...rest] = toastQueueRef.current;
        toastQueueRef.current = rest;
        return [...next, promoted];
      }
      return next;
    });
  }, []);

  const handleInsert = useCallback((payload: RealtimePostgresChangesPayload<AppNotification>) => {
    const newNotif = payload.new as AppNotification;

    setNotifications((prev) => {
      if (prev.some((notification) => notification.id === newNotif.id)) {
        return prev;
      }
      return [newNotif, ...prev];
    });

    if (cacheKey) {
      try {
        sessionStorage.removeItem(cacheKey);
      } catch {
        // ignore session storage issues
      }
    }

    addToToastQueue(newNotif);
  }, [addToToastQueue, cacheKey]);

  const handleUpdate = useCallback((payload: RealtimePostgresChangesPayload<AppNotification>) => {
    const updated = payload.new as AppNotification;
    setNotifications((prev) =>
      prev.map((notification) => notification.id === updated.id ? { ...notification, ...updated } : notification),
    );

    if (cacheKey) {
      try {
        sessionStorage.removeItem(cacheKey);
      } catch {
        // ignore session storage issues
      }
    }
  }, [cacheKey]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      if (cacheKey) {
        try {
          sessionStorage.removeItem(cacheKey);
        } catch {
          // ignore session storage issues
        }
      }
    } catch (error) {
      console.error("[NotificationContext] Error marking as read:", error);
    }
  }, [cacheKey]);

  const markAllAsRead = useCallback(async () => {
    try {
      if (role === "admin") {
        await notificationService.markAllAdminAsRead();
      } else if (user) {
        await notificationService.markAllClientAsRead(user.id);
      }
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      if (cacheKey) {
        try {
          sessionStorage.removeItem(cacheKey);
        } catch {
          // ignore session storage issues
        }
      }
    } catch (error) {
      console.error("[NotificationContext] Error marking all as read:", error);
    }
  }, [cacheKey, role, user]);

  useEffect(() => {
    if (!user) {
      setActiveToasts([]);
      toastQueueRef.current = [];
      setNotifications([]);
      setRealtimeStatus("disconnected");
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    setRealtimeStatus("connecting");
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
      }, handleInsert)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "notifications",
        filter,
      }, handleUpdate)
      .subscribe((status, error) => {
        setRealtimeStatus(
          status === "SUBSCRIBED"
            ? "connected"
            : status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED"
              ? "disconnected"
              : "connecting",
        );
        if (error) {
          console.warn("[Notif] Realtime error:", error);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [handleInsert, handleUpdate, loadHistory, role, user]);

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

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
