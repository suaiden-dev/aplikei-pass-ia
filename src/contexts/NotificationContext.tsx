import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface Notification {
  id: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
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

const NOTIFICATION_BEEP =
  "data:audio/wav;base64,UklGRpgiAABXQVZFZm10IBAAAAABAAEARKwAAESsAAABAAgAZGF0YXQiAACAgICAgICAgICAgICAf39/f39+fn5+f39/f4CAgYGBgYGBgYGAgH9/fn59fX19fX5+f3+AgYKCgoODg4KCgYB/fn19fHx8fHx9fX5/gIGCg4SEhISDg4KAf359fHt6enp7e31+f4GCg4SFhoaFhYSCgX99fHt6eXl5eXp8fX+Bg4SFhoeHh4aFg4F/fXt6eHh3d3h5e31/gYOFh4iIiIiHhoSCf317eXd2dnZ3eHp8foGDhoiJioqJiIeEgn99enh2dXR0dXd5e36BhIaJiouLi4qIhYJ/fHp3dXRzc3R2eHt+gYSHiouNjYyLiYaDgHx5dnRycXJzdHd6fYGFiIuNjo6OjIqHhIB8eHVzcXBwcXN2eX2BhYiMjo+Qj46LiISAfHh1cnBvb3BydXh9gYWJjI+RkZGPjImFgHx4dHFubW1ucXR4fIGFio2QkpOSkI6KhoF8d3NwbWxsbW9zd3yBhoqOkZOUlJKPi4aBfHdyb2xqamtucXZ7gIaLj5KVlZWTkIyHgnx3cm5raWlqbXB1eoCGi5CTlpeWlZGNiIJ8dnFtamhnaWtvdHqAhoyRlJeYmJaTjomDfHZxbGhmZmdqbnN5f4aMkZaYmpmYlI+Kg3x2cGtnZWRmaGxyeH+GjJKXmpubmZWRi4R9dnBqZmRjZGdrcXd/ho2Tl5udnJqXkouEfXZvaWViYmNlanB3foaNk5icnp6cmJOMhX12b2lkYWBhZGlvdn6FjZSZnZ+fnZqUjYZ+dm5oY2BfYGJnbXV9hY2Ump6hoZ+blo+HfnZuZ2JfXV5hZmx0fIWNlZugoqKhnZeQh392bmdhXVxdX2Rrc3yFjZWcoaOkop6YkYh/dm1mYFxaW15janJ7hI6WnaKlpaSgmpKJgHZtZV9bWVlcYWhxeoSOlp2jpqeloZuTioB2bWVeWlhYW2BncHqEjpeepKeop6OclIuBdm1kXVlWVllfZm95g42Xn6WpqqiknpaMgXdtZFxXVVVYXWRueIONl5+mqquqpp+XjYJ3bWNcVlNTVltjbHeCjZegp6utq6ehmI6Dd21jW1VSUlVaYmt2go2Yoaisrq2popmPhHhtYlpUUVBTWGBqdYGNmKGpra+uqqSbkIR4bWJZU1BPUVdfaXSAjZiiqq+xsKylnJGFeW1iWVJOTVBVXWdzgIyYoqqwsrKup56ShnltYlhRTUxOVFxmcn+MmKOrsbSzr6iflId6bWFXUExKTVJaZXF+i5ijrLK1tbGqoZWIem1hV09KSUtQWWNwfYuYo62ztrazrKKWiXtuYVZOSUhJT1dib3yLmKSttLi4tK2kmIp8bmFWTUhGSE1VYG18ipikrrW5ubavpZmLfW5hVU1HRUZLVF9se4mYpK+2uru3saeajH1vYVVMRkNFSlJda3qJl6Wvt7y8ubKonI1+b2FVS0VCQ0hQXGp5iJelsLi9vru0qp2Pf29hVEpDQEFGT1poeIeXpbG5vr+8tqyfkIBwYVRJQj9ARU1ZZ3aHl6Wxur/BvretoJGBcWFUSUE+PkNLV2V1hpalsbvBwsC5r6KSgnFhU0hAPD1BSlVkdIWWpbK8wsTBu7GjlINyYlNHPzs7QEhUYnOElaWyvcPFw72ypZWEc2JTRz46Oj5GUmFyg5Wls73Ex8W+tKeXhXNiU0Y9ODg8RFBfcIKUpbO+xcjGwLaomIZ0YlNGPDc3OkNPXm+BlKWzv8bJyMK4qpmHdWNTRTw2NTlBTVxugJOktL/Hy8rEuaybiXZjU0U7NTQ3P0tbbH+SpLTAyMzLxbutnYp3ZFNEOjQyNT1JWWt+kqS0wcnOzce9r56LeGRTRDkyMTQ7SFdpfZGktMHKz87Jv7GgjXllU0Q4MS8yOkZWaHyQo7TCy9DQy8GzoY56ZlNDODAuMDhEVGZ7j6O0wszR0szDtKOPe2ZTQzcvLC82QlJleY6itMPN09POxLalkXxnVEM2ListNEBQY3iNorTDztTV0Ma4ppJ9aFRDNi0pKzI+TmJ3jKG0xM/V1tLIuqiUfmhUQzUsKCowPE1gdYuhtMTQ1tjUyryqlX9pVUM0KycoLztLXnSKoLTE0NjZ1cy+rJeBalVDNColJi05SVxyiZ+zxNHZ29fOwK6ZgmtWQzMpJCUrN0dbcYies8XS2tzZ0MKwmoNsVkMzKCMjKTVFWW+HnrPF0tve29LEsZyFbVdDMychISczQ1duhZ2zxdPc39zUxrOehm5XQzImICAlMUFVbIScssXU3eHe1si1n4hvWEMyJh8eJC8/U2qDm7LF1N7i4NfKt6GJcFlDMiUeHSItPVFpgZqxxdXf4+HZzLmji3JZRDEkHBsgKztPZ4CZ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NzpBTFprfY+gr7vDx8fCuaydjHpoWEtBOjg7QkxaanyNnq25wcXFwbisnYx7alpNQjw6PEJNWmp7jJ2rt7/ExMC4rJ2NfGtcTkQ+Oz1DTVppeoubqrW+wsO/t6yejn1tXVBGPz0+RE5aaXmKmqi0vMHBvrarno5+bl9SSEE+QEVOWmh4iZimsrq/wL22q56Pf29gU0lDQEFGTlpoeIeXpbC5vr+8tauekIBwYlVLREFCR09aaHeGlaOvt7y9urSqnpCBcmNXTUZDQ0hQWmh2hZSirbW6vLmzqp6QgnNlWE5IREVJUFtndoSToKu0ubq4sqqekYJ0ZlpQSUZGSlFbZ3WDkp+qsre5t7KpnpGDdWdbUktHR0tSW2d0g5CdqLC2t7axqZ6RhHZpXVNMSUlMUlxndIKPnKavtLa1sKiekoV3al5VTkpKTVNcZ3SBjpqlrbK1s6+onpKFeGtgV1BMS05UXGdzgI2Zo6uxs7Kup52ShnltYVhRTU1PVV1nc3+MmKKqr7KxraadkoZ6bmNaU09OUFVdZ3J/i5agqK6wr6ymnZKHe29kW1VRUFJWXmdyfoqVn6esr66rpZ2Sh3twZl1WUlFTV15ncn2JlJ2lqq2tqqSckoh8cWdeWFRSVFhfaHJ9iJOcpKmsrKmjnJKIfXJoYFlVVFVZYGhyfIeRm6Knqqqoo5uSiH5zaWFbV1VWWmBocnyGkJmgpqmppqKbkol+dGtjXFhXWFthaHF7hY+Yn6Snp6WhmpKJf3VsZF5aWFlcYmlxe4WOl56jpqakoJqSiX92bWVfW1paXWJpcXuEjZWcoaSlo5+ZkomAd25nYV1bXF5janJ6g4yUm6Cio6KemJGJgHhvaGJeXV1fZGpyeoOLk5meoaKgnZiRiYF4cGlkYF5eYWVrcnqCipKYnZ+gn5yXkYmBeXJrZWJgYGJma3J6gYmQlpuen56blpAJgnpzbGdjYWFjZ2xyeYGIj5WanJ2dmpaQiYJ7dG1oZWNiZGhscnmAiI6UmJucm5mVj4mCe3RuamZkZGVobXN5gIeNk5eZm5qYlI+Jg3x1cGtnZmVnaW5zeYCGjJGVmJmZl5OOiYN8dnFsaWdnaGtuc3l/hYuQlJaYl5WSjomDfXdybmppaGlsb3R5f4WKj5KVlpaUkY2Ig314c29sampqbXB0eX+EiY6RlJWVk5CNiIN+eXRwbWtrbG5xdXl+g4iMkJKTk5KPjIiDfnl1cW9tbG1vcnV6foOHi46RkpKRjouHg396dnNwbm5ucHN2en6Ch4qNj5CQj42Kh4N/e3d0cXBvcHFzd3p+goaJjI6Pj46MioeDf3t4dXNxcXFydHd6foKFiIuMjY6Ni4mGg398eXZ0c3JydHV4e36BhIeJi4yMi4qIhYOAfXp3dXR0dHV2eXt+gYSGiIqLi4qJh4WCgH17eHd2dXV2d3l8foGDhYeIiYmJiIaEgoB9e3l4d3d3d3h6fH6AgoSGh4iIh4eFhIKAfnx6eXh4eHl6e3x+gIKDhYaGhoaFhIOCgH59e3p6eXl6e3x9foCBgoSEhYWFhIOCgYB/fXx8e3t7e3x9fn+AgYKCg4ODg4OCgoGAf359fXx8fH19fX5/gICBgYKCgoKCgYGAgH9/fn5+fn5+fn5/f4CAgICBgYGBgICAgIB/f39/f39/f39/f38=";

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

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

    const uniqueChannel = `notifications-global-${user.id}`;
    const channel = supabase
      .channel(uniqueChannel)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications((prev) => [newNotif, ...prev]);
          playNotificationSound();
          toast({
            title: newNotif.title,
            description: newNotif.message,
            duration: 3000,
          });
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
  }, [user?.id, fetchNotifications, playNotificationSound, toast]);

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

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
};
