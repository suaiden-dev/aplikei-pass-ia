import { createContext, useState, useEffect, useRef, useMemo, useCallback, type ReactNode } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { supabase } from "@shared/lib/supabase";
import { useAuth } from "@shared/hooks/useAuth";
import type { ToastItem } from "@features/notifications/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AppNotification {
  /** notifications_groups.id — used for markAsRead */
  id: string;
  /** notifications_messages.id */
  notification_id: string;
  /** notifications_messages.category */
  category: string;
  /** notifications_messages.action */
  action: string;
  /** notifications_messages.status */
  status: string;
  /** notifications_messages.sender_user_id */
  sender_user_id: string | null;
  /** notifications_messages.process_id */
  process_id: string | null;
  /** notifications_groups.user_id */
  user_id: string;
  /** notifications_groups.role */
  role: string | null;
  /** notifications_groups.office_id */
  office_id: string | null;
  /** notifications_groups.viewed (replaces is_read) */
  viewed: boolean;
  /** notifications_groups.email_sent */
  email_sent: boolean;
  /** Deprecated — no longer stored in DB; kept for backward compat with display code */
  title: string;
  /** Deprecated — no longer stored in DB; kept for backward compat */
  message: string | null;
  /** notifications_messages.link */
  link: string | null;
  /** notifications_messages.send_email */
  send_email: boolean;
  /** notifications_messages.metadata */
  metadata: Record<string, unknown>;
  /** notifications_messages.created_at */
  created_at: string;
  /** Backward-compat alias so existing components still compile */
  is_read: boolean;
  /** Backward-compat alias (derived from category) */
  type: string;
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

const MAX_TOASTS = 3;

interface NotificationProviderProps {
  children: ReactNode;
  role: "admin" | "client";
}

// ---------------------------------------------------------------------------
// DB row normaliser — maps the joined Supabase response to AppNotification
// ---------------------------------------------------------------------------

type GroupRow = {
  id: string;
  notification_id: string;
  user_id: string;
  role: string | null;
  office_id: string | null;
  viewed: boolean;
  email_sent: boolean;
  created_at: string;
  notifications_messages: {
    id: string;
    sender_user_id: string | null;
    status: string;
    category: string;
    action: string;
    process_id: string | null;
    link: string | null;
    send_email: boolean;
    metadata: Record<string, unknown> | null;
    created_at: string;
  } | null;
};

function normalizeGroupRow(row: GroupRow): AppNotification | null {
  const msg = row.notifications_messages;
  if (!msg) return null;

  const category = msg.category ?? "system";

  return {
    id:              row.id,
    notification_id: row.notification_id,
    category,
    action:          msg.action          ?? "message",
    status:          msg.status          ?? "sent",
    sender_user_id:  msg.sender_user_id  ?? null,
    process_id:      msg.process_id      ?? null,
    user_id:         row.user_id,
    role:            row.role            ?? null,
    office_id:       row.office_id       ?? null,
    viewed:          Boolean(row.viewed),
    email_sent:      Boolean(row.email_sent),
    title:           "",
    message:         null,
    link:            msg.link            ?? null,
    send_email:      Boolean(msg.send_email),
    metadata:        (msg.metadata && typeof msg.metadata === "object" && !Array.isArray(msg.metadata))
                       ? (msg.metadata as Record<string, unknown>)
                       : {},
    created_at:      msg.created_at,
    // backward-compat aliases
    is_read: Boolean(row.viewed),
    type:    category,
  };
}

// ---------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------

const JOINED_SELECT = `
  id,
  notification_id,
  user_id,
  role,
  office_id,
  viewed,
  email_sent,
  created_at,
  notifications_messages!inner (
    id,
    sender_user_id,
    status,
    category,
    action,
    process_id,
    link,
    send_email,
    metadata,
    created_at
  )
` as const;

async function fetchNotifications(
  role: "admin" | "client",
  userId: string,
  userCreatedAt?: string,
): Promise<AppNotification[]> {
  const limit = role === "admin" ? 50 : 30;

  let query = supabase
    .from("notifications_groups")
    .select(JOINED_SELECT)
    .eq("user_id", userId);

  if (userCreatedAt) {
    query = query.gte("created_at", userCreatedAt);
  }

  const { data } = await query
    .order("created_at", { ascending: false })
    .limit(limit);

  return ((data as GroupRow[] | null) ?? [])
    .map(normalizeGroupRow)
    .filter((n): n is AppNotification => n !== null);
}

// ---------------------------------------------------------------------------
// Realtime normaliser — INSERT on notifications_groups arrives without the
// joined message, so we re-fetch the full row by id.
// ---------------------------------------------------------------------------

async function fetchGroupById(groupId: string): Promise<AppNotification | null> {
  const { data } = await supabase
    .from("notifications_groups")
    .select(JOINED_SELECT)
    .eq("id", groupId)
    .maybeSingle();

  if (!data) return null;
  return normalizeGroupRow(data as GroupRow);
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function NotificationProvider({ children, role }: NotificationProviderProps) {
  const { user } = useAuth();
  const userId   = user?.id;
  const [notifications, setNotifications]   = useState<AppNotification[]>([]);
  const [activeToasts,  setActiveToasts]    = useState<ToastItem[]>([]);
  const [realtimeStatus, setRealtimeStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const cacheKey = userId ? `notif2_${userId}_${role}` : null;

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.viewed).length,
    [notifications],
  );

  const loadHistory = useCallback(async () => {
    if (!userId || !cacheKey) return;

    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as { data: AppNotification[]; ts: number };
        if (Date.now() - parsed.ts < 30_000) {
          const filtered = user?.createdAt
            ? parsed.data.filter((n) => new Date(n.created_at) >= new Date(user.createdAt))
            : parsed.data;
          setNotifications(filtered);
          return;
        }
      }
    } catch { /* ignore */ }

    try {
      const data = await fetchNotifications(role, userId, user?.createdAt);
      setNotifications(data);
      if (cacheKey) {
        try { sessionStorage.setItem(cacheKey, JSON.stringify({ data, ts: Date.now() })); } catch { /* ignore */ }
      }
    } catch (error) {
      console.error("[NotificationProvider] Error loading history:", error);
    }
  }, [cacheKey, role, userId, user?.createdAt]);

  const addToToastQueue = useCallback((notif: AppNotification) => {
    const item: ToastItem = {
      id:             crypto.randomUUID(),
      notificationId: notif.id,
      title:          notif.title,
      message:        notif.message,
      type:           (notif.category as ToastItem["type"]) || "system",
      category:       notif.category,
      action:         notif.action,
      link:           notif.link ?? null,
      metadata:       notif.metadata,
      createdAt:      notif.created_at,
    };

    setActiveToasts((prev) => {
      if (prev.some((t) => t.notificationId === notif.id)) return prev;
      return [...prev, item].slice(0, MAX_TOASTS);
    });
  }, []);

  const dismissToast = useCallback((toastId: string) => {
    setActiveToasts((prev) => prev.filter((t) => t.id !== toastId));
  }, []);

  // Realtime INSERT on notifications_groups for this user
  const handleInsert = useCallback(async (
    payload: RealtimePostgresChangesPayload<Record<string, unknown>>,
  ) => {
    const raw = payload.new as Record<string, unknown>;
    if (raw.user_id !== userId) return;
    if (user?.createdAt) {
      const rowDate = raw.created_at ? new Date(raw.created_at as string) : null;
      if (rowDate && rowDate < new Date(user.createdAt)) return;
    }

    if (cacheKey) { try { sessionStorage.removeItem(cacheKey); } catch { /* ignore */ } }

    // Re-fetch the full row with join
    const groupId = raw.id as string;
    const notif = await fetchGroupById(groupId).catch(() => null);
    if (!notif) return;

    setNotifications((prev) => {
      if (prev.some((n) => n.id === notif.id)) return prev;
      return [notif, ...prev];
    });

    addToToastQueue(notif);
  }, [addToToastQueue, cacheKey, userId, user?.createdAt]);

  // Realtime UPDATE (viewed changed)
  const handleUpdate = useCallback((
    payload: RealtimePostgresChangesPayload<Record<string, unknown>>,
  ) => {
    const raw = payload.new as Record<string, unknown>;
    if (raw.user_id !== userId) return;

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === raw.id
          ? { ...n, viewed: Boolean(raw.viewed), is_read: Boolean(raw.viewed) }
          : n,
      ),
    );

    if (cacheKey) { try { sessionStorage.removeItem(cacheKey); } catch { /* ignore */ } }
  }, [cacheKey, userId]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await supabase
        .from("notifications_groups")
        .update({ viewed: true })
        .eq("id", id);
      setNotifications((prev) =>
        prev.map((n) => n.id === id ? { ...n, viewed: true, is_read: true } : n),
      );
      if (cacheKey) { try { sessionStorage.removeItem(cacheKey); } catch { /* ignore */ } }
    } catch (error) {
      console.error("[NotificationProvider] Error marking as read:", error);
    }
  }, [cacheKey]);

  const markAllAsRead = useCallback(async () => {
    try {
      if (!userId) return;
      await supabase
        .from("notifications_groups")
        .update({ viewed: true })
        .eq("user_id", userId)
        .eq("viewed", false);
      setNotifications((prev) => prev.map((n) => ({ ...n, viewed: true, is_read: true })));
      if (cacheKey) { try { sessionStorage.removeItem(cacheKey); } catch { /* ignore */ } }
    } catch (error) {
      console.error("[NotificationProvider] Error marking all as read:", error);
    }
  }, [cacheKey, userId]);

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
    if (!userId) return;

    const loadTimerId = window.setTimeout(() => {
      setRealtimeStatus("connecting");
      void loadHistory();
    }, 0);

    const channel = supabase
      .channel(`notif_realtime_${role}_${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications_groups", filter: `user_id=eq.${userId}` },
        handleInsert,
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications_groups", filter: `user_id=eq.${userId}` },
        handleUpdate,
      )
      .subscribe((status, error) => {
        setRealtimeStatus(
          status === "SUBSCRIBED"
            ? "connected"
            : status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED"
              ? "disconnected"
              : "connecting",
        );
        if (error) console.warn("[NotificationProvider] Realtime error:", error);
      });

    return () => {
      supabase.removeChannel(channel);
      window.clearTimeout(loadTimerId);
    };
  }, [loadHistory, role, userId, handleInsert, handleUpdate]);

  // Fallback: reload when the tab becomes visible or the window is focused,
  // and poll every 30 s in case realtime events are missed.
  useEffect(() => {
    if (!userId) return;

    const refresh = () => {
      if (cacheKey) { try { sessionStorage.removeItem(cacheKey); } catch { /* ignore */ } }
      void loadHistory();
    };

    const onVisibility = () => { if (document.visibilityState === "visible") refresh(); };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", refresh);
    const pollId = window.setInterval(refresh, 30_000);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", refresh);
      window.clearInterval(pollId);
    };
  }, [cacheKey, loadHistory, userId]);

  useEffect(() => {
    function handler(event: Event) {
      const detail = (event as CustomEvent<{ notification?: AppNotification }>).detail;
      const notification = detail?.notification;

      if (!notification || notification.user_id !== user?.id) {
        void loadHistory();
        return;
      }

      if (user?.createdAt && new Date(notification.created_at) < new Date(user.createdAt)) return;

      setNotifications((prev) => {
        if (prev.some((n) => n.id === notification.id)) return prev;
        return [notification, ...prev];
      });

      addToToastQueue(notification);
    }

    window.addEventListener("aplikei:notifications:changed", handler);
    return () => window.removeEventListener("aplikei:notifications:changed", handler);
  }, [addToToastQueue, loadHistory, user?.id, user?.createdAt]);

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
