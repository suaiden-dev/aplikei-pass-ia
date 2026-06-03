import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  RiNotification3Line, 
  RiCheckDoubleLine, 
  RiMailSendLine,
  RiUserLine,
  RiAlertLine
} from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "../hooks/useNotifications";
import { useAuth } from "@shared/hooks/useAuth";
import { cn } from "@shared/utils/cn";
import { useLocale, useT } from "@app/app/i18n";
import type { AppNotification } from "@app/app/providers/NotificationProvider";
import { localizeNotificationContent } from "@features/notifications/lib/localizeNotification";

interface NotificationBellProps {
  role: "admin" | "client" | "master" | "seller";
  theme?: "light" | "dark";
  align?: "left" | "right";
}

export function NotificationBell({ role, align = "right" }: NotificationBellProps) {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    realtimeStatus,
  } = useNotifications();
  
  const { user } = useAuth();
  const { lang } = useLocale();
  const tNotif = useT("notifications") ?? {};
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread" | "process" | "payment" | "admin" | "system">("all");
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const notificationLang = lang;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.viewed;
    return n.category === filter;
  });

  const resolveLink = (link: string | null) => {
    if (!link || !user?.role) return link;
    
    // For admin users, ensure the process link matches their dashboard prefix
    if (user.role !== "customer" && link.includes("/processes/")) {
      const parts = link.split("/processes/");
      const id = parts[1]?.split("/")[0];
      if (!id) return link;

      const prefix = user.role === "master" ? "/master" : (user.role === "manager" ? "/manager" : "/admin");
      return `${prefix}/processes/${id}`;
    }
    
    return link;
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Bell */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2 rounded-xl transition-all duration-200 border",
          "bg-bg-subtle hover:bg-primary/10 text-text-muted hover:text-primary border-border"
        )}
        aria-label="Notificações"
      >
        <RiNotification3Line size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-black text-white shadow-sm ring-2 ring-bg">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        {realtimeStatus === "disconnected" && unreadCount === 0 && (
          <span
            title="Notificações temporariamente offline"
            className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400"
          />
        )}
      </button>

      {/* History Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "fixed sm:absolute top-16 sm:top-full mt-2 sm:mt-3 left-4 right-4 sm:left-auto sm:right-auto sm:w-[340px] bg-card rounded-[24px] shadow-2xl border border-border overflow-hidden z-[100] flex flex-col",
              align === "right" ? "sm:right-0" : "sm:left-0"
            )}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-bg-subtle/50">
              <h3 className="text-sm font-black text-text tracking-tight uppercase">
                {tNotif.bell?.tooltip ?? "Notifications"}
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-[10px] font-black text-primary hover:text-primary/70 uppercase tracking-widest transition-colors flex items-center gap-1"
                >
                  <RiCheckDoubleLine className="text-sm" />
                  {tNotif.bell?.markAllRead ?? "Mark all"}
                </button>
              )}
            </div>

            <div className="px-4 py-2 border-b border-border bg-bg-subtle/30">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-text"
              >
                <option value="all">{tNotif.filters?.all ?? "All"}</option>
                <option value="unread">{tNotif.filters?.unread ?? "Unread"}</option>
                <option value="process">{tNotif.filters?.process ?? "Process"}</option>
                <option value="payment">{tNotif.filters?.payment ?? "Payment"}</option>
                <option value="admin">{tNotif.filters?.admin ?? "Admin"}</option>
                <option value="system">{tNotif.filters?.system ?? "System"}</option>
              </select>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto max-h-[400px] custom-scrollbar p-2">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <div className="w-12 h-12 rounded-full bg-bg-subtle border border-border flex items-center justify-center mx-auto mb-3 text-text-muted">
                    <RiNotification3Line size={24} />
                  </div>
                  <p className="text-xs font-bold text-text uppercase tracking-tight">
                    {tNotif.empty?.title ?? "No notifications"}
                  </p>
                  <p className="text-[10px] font-medium text-text-muted mt-1 uppercase tracking-widest">
                    {tNotif.empty?.subtitle ?? "You're all caught up!"}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredNotifications.map(n => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      lang={notificationLang}
                      content={tNotif.content}
                      onClick={async () => {
                        if (!n.viewed) {
                          await markAsRead(n.id);
                        }
                        setIsOpen(false);
                        const targetLink = resolveLink(n.link);
                        if (targetLink) {
                          navigate(targetLink);
                        }
                      }} 
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {role === "admin" && (
              <div className="p-3 bg-bg-subtle/50 border-t border-border text-center">
                <button className="text-[10px] font-black text-text-muted hover:text-text uppercase tracking-widest transition-colors">
                  {tNotif.bell?.viewAll ?? "View all"}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotificationItem({
  notification,
  lang,
  content,
  onClick,
}: {
  notification: AppNotification;
  lang: "pt" | "en" | "es";
  content?: Record<string, { title: string; message: string }>;
  onClick: () => void;
}) {
  const getIcon = () => {
    switch (notification.category) {
      case "payment":   return <RiMailSendLine size={16} />;
      case "process":
      case "uscis":
      case "rfe":       return <RiUserLine size={16} />;
      case "admin":     return <RiNotification3Line size={16} />;
      case "system":    return <RiAlertLine size={16} />;
      default:          return <RiNotification3Line size={16} />;
    }
  };

  const getIconColor = () => {
    if (notification.viewed) return "bg-bg-subtle text-text-muted";
    switch (notification.category) {
      case "payment":   return "bg-success text-white shadow-sm shadow-success/20";
      case "process":
      case "uscis":
      case "rfe":       return "bg-primary text-white shadow-sm shadow-primary/20";
      case "system":    return "bg-warning text-white shadow-sm shadow-warning/20";
      default:          return "bg-primary text-white shadow-sm shadow-primary/20";
    }
  };

  const localized = localizeNotificationContent(notification, lang, content);

  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 rounded-2xl transition-all border group",
        notification.viewed
          ? "bg-transparent border-transparent hover:bg-bg-subtle"
          : "bg-primary/5 border-primary/10 hover:bg-primary/10",
        notification.link ? "cursor-pointer" : "cursor-default",
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon Type */}
        <div className={cn(
          "mt-0.5 shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
          getIconColor()
        )}>
          {getIcon()}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            "text-xs font-bold truncate tracking-tight uppercase",
            notification.viewed ? "text-text-muted" : "text-text"
          )}>
            {localized.title}
          </h4>
          <p className={cn(
            "text-[11px] leading-snug mt-0.5",
            notification.viewed ? "text-text-muted line-clamp-2" : "text-text font-medium line-clamp-3"
          )}>
            {localized.message}
          </p>
          <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block mt-2">
            {new Intl.DateTimeFormat(lang === "pt" ? "pt-BR" : lang === "es" ? "es-ES" : "en-US", {
              dateStyle: "short",
              timeStyle: "short",
            }).format(new Date(notification.created_at))}
          </span>
        </div>

        {/* Status Dot */}
        {!notification.viewed && (
          <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2 animate-pulse" />
        )}
      </div>
    </button>
  );
}
