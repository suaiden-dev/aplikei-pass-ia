import { useState, useEffect, useRef, useMemo, useCallback, type ReactNode } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { notificationService, AppNotification } from "../services/notification.service";
import { useAuth } from "../hooks/useAuth";
import {
  NotificationContext,
  type NotificationContextValue,
  type ToastItem,
} from "./NotificationContext/context";

const MAX_TOASTS = 3;

interface NotificationProviderProps {
  children: ReactNode;
  role: "admin" | "client";
}

function normalizeRealtimeNotification(row: Record<string, unknown>): AppNotification {
  return {
    id: String(row.id ?? ""),
    type: String(row.type ?? "system"),
    target_role: (row.target_role ?? row.target_type ?? "client") as "admin" | "client",
    user_id: (row.user_id as string | null | undefined) ?? null,
    service_id: (row.service_id as string | null | undefined) ?? null,
    title: String(row.title ?? ""),
    message: (row.message as string | null | undefined) ?? (row.body as string | null | undefined) ?? null,
    link: (row.link as string | null | undefined) ?? null,
    is_read: Boolean(row.is_read),
    send_email: Boolean(row.send_email),
    email_sent: Boolean(row.email_sent),
    metadata: (row.metadata as Record<string, unknown> | undefined) ?? {},
    created_at: String(row.created_at ?? new Date().toISOString()),
  };
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
  const [realtimeStatus, setRealtimeStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const toastQueueRef = useRef<ToastItem[]>([]);
  const cacheKey = user ? `notif_${user.id}_${role}` : null;

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications],
  );

  const loadHistory = useCallback(async () => {
    if (!user?.id || !cacheKey) return;

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
  // user?.id (primitive) instead of user (object) prevents re-runs when same user re-authenticates
  }, [cacheKey, role, user?.id]);

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

  const userId = user?.id;

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
      toastQueueRef.current = [];
      const resetTimerId = window.setTimeout(() => {
        setActiveToasts([]);
        setNotifications([]);
        setRealtimeStatus("disconnected");
      }, 0);

      return () => {
        window.clearTimeout(resetTimerId);
      };
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const loadTimerId = window.setTimeout(() => {
      setRealtimeStatus("connecting");
      void loadHistory();
    }, 0);

    const channel = supabase
      .channel(`notif_realtime_${role}_${user.id}`)
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
      window.clearTimeout(loadTimerId);
      supabase.removeChannel(channel);
    };
  }, [handleInsert, handleUpdate, loadHistory, role, userId]);

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
