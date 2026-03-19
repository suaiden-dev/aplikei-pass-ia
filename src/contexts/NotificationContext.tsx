import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { useToast } from "@/presentation/components/atoms/use-toast";

export interface Notification {
  id: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
  target_type: "admin" | "user";
  user_id: string | null;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  loading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

const NOTIFICATION_BEEP = "/notification.mp3";

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { session } = useAuth();
  const user = session?.user;
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Check if user is admin based on email
      const isAdmin = user.email ? [
        "info@thefutureofenglish.com",
        "admin@suaiden.com",
        "suaiden@suaiden.com",
        "fernanda@suaiden.com",
        "victuribdev@gmail.com",
        "newvicturibdev@gmail.com",
        "dev01@suaiden.com",
      ].includes(user.email.toLowerCase()) : false;

      let query = supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (isAdmin) {
        // Admins see notifications where target_type is 'admin'
        query = query.eq("target_type", "admin");
      } else {
        // Customers see notifications where user_id is their own and target_type is 'user'
        query = query.eq("user_id", user.id).eq("target_type", "user");
      }

      const { data, error } = await query;

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio(NOTIFICATION_BEEP);
      audio.play().catch((e) => {
        console.warn("Audio playback blocked by browser automatically:", e);
      });
    } catch (e) {
      console.error("Audio creation failed", e);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();

    const isAdmin = user.email ? [
      "info@thefutureofenglish.com",
      "admin@suaiden.com",
      "suaiden@suaiden.com",
      "fernanda@suaiden.com",
      "victuribdev@gmail.com",
      "newvicturibdev@gmail.com",
      "dev01@suaiden.com",
    ].includes(user.email.toLowerCase()) : false;

    const uniqueChannel = `notifications-global-${user.id}`;
    const channel = supabase
      .channel(uniqueChannel)
      .on(
        "postgres_changes",
        { 
          event: "INSERT", 
          schema: "public", 
          table: "notifications" 
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          
          // Only show/add notification if it's meant for the current user's role
          const isTargetedToMe = isAdmin 
            ? newNotif.target_type === 'admin'
            : (newNotif.target_type === 'user' && newNotif.user_id === user.id);

          if (isTargetedToMe) {
            setNotifications((prev) => [newNotif, ...prev]);
            playNotificationSound();
            toast({
              title: newNotif.title,
              description: newNotif.message,
              duration: 3000,
            });
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications" },
        (payload) => {
          const updated = payload.new as Notification;
          setNotifications((prev) =>
            prev.map((n) => (n.id === updated.id ? updated : n)),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, user?.email, fetchNotifications, playNotificationSound, toast]);

  useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.is_read).length);
  }, [notifications]);

  const markAsRead = async (id: string) => {
    try {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter((n) => !n.is_read)
        .map((n) => n.id);
      if (unreadIds.length === 0) return;

      await supabase
        .from("notifications")
        .update({ is_read: true })
        .in("id", unreadIds);

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        loading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components -- hook and provider are intentionally co-located
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
};
