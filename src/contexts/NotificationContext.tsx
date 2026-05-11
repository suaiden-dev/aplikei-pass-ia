import { useState, useEffect, useRef, useMemo, useCallback, type ReactNode } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { supabase } from "../shared/lib/supabase";
import { useAuth } from "../hooks/useAuth";
import type { AppNotification } from "./NotificationContext/context";
import { NotificationContext, type NotificationContextValue, type ToastItem } from "./NotificationContext/context";
import { onPortalEvent } from "../mocks/customer-portal";

function normalizeRealtimeNotification(payload: any): AppNotification {
  return {
    id: payload.id || "",
    type: payload.type || "system",
    target_role: payload.target_role || "client",
    user_id: payload.user_id || null,
    service_id: payload.service_id || null,
    title: payload.title || "Notification",
    message: payload.message || "",
    link: payload.link || null,
    is_read: payload.is_read || false,
    send_email: payload.send_email || false,
    email_sent: payload.email_sent || false,
    metadata: payload.metadata || {},
    created_at: payload.created_at || new Date().toISOString(),
  };
}

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

async function fetchNotifications(
  role: "admin" | "client",
  userId: string,
): Promise<AppNotification[]> {
  const limit = role === "admin" ? 50 : 30;

  if (role === "client") {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    return ((data as Record<string, unknown>[] | null) ?? []).map(normalizeRealtimeNotification);
  }

  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("target_role", "admin")
    .order("created_at", { ascending: false })
    .limit(limit);
  return ((data as Record<string, unknown>[] | null) ?? []).map(normalizeRealtimeNotification);
}

export function NotificationProvider({ children, role }: NotificationProviderProps) {
  const { user } = useAuth();
  const userId = user?.id;
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeToasts, setActiveToasts] = useState<ToastItem[]>([]);
  const [realtimeStatus, setRealtimeStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const toastQueueRef = useRef<ToastItem[]>([]);
  const cacheKey = userId ? `notif_${userId}_${role}` : null;

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications],
  );

  const loadHistory = useCallback(async () => {
    if (!userId || !cacheKey) return;

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
      const data = await fetchNotifications(role, userId);
      setNotifications(data);
    } catch (error) {
      console.error("[NotificationContext] Error loading history:", error);
    }
  }, [cacheKey, role, userId]);

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

  const handleInsert = useCallback((payload: RealtimePostgresChangesPayload<AppNotification>) => {
    const newNotif = normalizeRealtimeNotification(payload.new as unknown as Record<string, unknown>);
    if (!matchesNotificationRole(newNotif, role, userId)) {
      return;
    }

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
  }, [addToToastQueue, cacheKey, role, userId]);

  const handleUpdate = useCallback((payload: RealtimePostgresChangesPayload<AppNotification>) => {
    const updated = normalizeRealtimeNotification(payload.new as unknown as Record<string, unknown>);
    if (!matchesNotificationRole(updated, role, userId)) {
      return;
    }

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
  }, [cacheKey, role, userId]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await supabase.from("notifications").update({ is_read: true }).eq("id", id);
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
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      if (role === "admin") {
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("target_role", "admin")
          .eq("is_read", false);
      } else if (userId) {
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("user_id", userId)
          .eq("is_read", false);
      }
      setNotifications((prev) => prev.map((notification) => ({ ...notification, is_read: true })));
    } catch (error) {
      console.error("[NotificationContext] Error marking all as read:", error);
    }
  }, [cacheKey, role, userId]);

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
    if (!userId) {
      return;
    }

    const loadTimerId = window.setTimeout(() => {
      setRealtimeStatus("connecting");
      void loadHistory();
    }, 0);

    const channel = supabase
      .channel(`notif_realtime_${role}_${userId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
      }, handleInsert)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "notifications",
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
