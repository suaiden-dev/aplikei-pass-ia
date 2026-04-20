import { useState, useRef, useEffect } from "react";
import { 
  RiNotification3Line, 
  RiCheckDoubleLine, 
  RiMailSendLine,
  RiUserLine,
  RiAlertLine
} from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "../../contexts/NotificationContext";
import { cn } from "../../utils/cn";
import { AppNotification } from "../../services/notification.service";

interface NotificationBellProps {
  role: "admin" | "client";
  theme?: "light" | "dark";
  align?: "left" | "right";
}

export function NotificationBell({ role, theme = "dark", align = "right" }: NotificationBellProps) {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const buttonClasses = cn(
    "relative p-2 rounded-xl transition-all duration-200",
    theme === "dark" 
      ? "bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white" 
      : "bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800"
  );

  const ringClass = theme === "dark" ? "ring-slate-900" : "ring-white";

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Bell */}
      <button 
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0) {
            markAllAsRead();
          }
        }}
        className={buttonClasses}
        aria-label="Notificações"
      >
        <RiNotification3Line size={20} />
        {unreadCount > 0 && (
          <span className={cn(
            "absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-black text-white shadow-sm ring-2",
            ringClass
          )}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
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
              "fixed sm:absolute top-16 sm:top-full mt-2 sm:mt-3 left-4 right-4 sm:left-auto sm:right-auto sm:w-[340px] bg-white rounded-[24px] shadow-2xl border border-slate-100 overflow-hidden z-[100] flex flex-col",
              align === "right" ? "sm:right-0" : "sm:left-0"
            )}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-black text-slate-800 tracking-tight uppercase">Notificações</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={() => markAllAsRead()}
                  className="text-[10px] font-black text-primary hover:text-primary/70 uppercase tracking-widest transition-colors flex items-center gap-1"
                >
                  <RiCheckDoubleLine className="text-sm" />
                  Marcar tudo
                </button>
              )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto max-h-[400px] custom-scrollbar p-2">
              {notifications.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-300">
                    <RiNotification3Line size={24} />
                  </div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">Sem notificações</p>
                  <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-widest">Tudo em dia!</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map(n => (
                    <NotificationItem 
                      key={n.id} 
                      notification={n} 
                      onClick={() => markAsRead(n.id)} 
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {role === "admin" && (
              <div className="p-3 bg-slate-50/50 border-t border-slate-100 text-center">
                <button className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">
                  Ver log completo
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
  onClick 
}: { 
  notification: AppNotification; 
  onClick: () => void;
}) {
  const isEmail = notification.send_email;
  
  const getIcon = () => {
    if (isEmail) return <RiMailSendLine size={16} />;
    
    switch (notification.type) {
      case "admin_action":
        return <RiNotification3Line size={16} />;
      case "client_action":
        return <RiUserLine size={16} />;
      case "system":
        return <RiAlertLine size={16} />;
      default:
        return <RiNotification3Line size={16} />;
    }
  };
  
  const getIconColor = () => {
    if (notification.is_read) return "bg-slate-100 text-slate-400";
    
    switch (notification.type) {
      case "admin_action":
        return "bg-primary text-white shadow-sm shadow-primary/20";
      case "client_action":
        return "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20";
      case "system":
        return "bg-amber-500 text-white shadow-sm shadow-amber-500/20";
      default:
        return "bg-primary text-white shadow-sm shadow-primary/20";
    }
  };

  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 rounded-2xl transition-all border group",
        notification.is_read 
          ? "bg-transparent border-transparent hover:bg-slate-50" 
          : "bg-primary/5 border-primary/10 hover:bg-primary/10"
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
            notification.is_read ? "text-slate-600" : "text-slate-900"
          )}>
            {notification.title}
          </h4>
          <p className={cn(
            "text-[11px] leading-snug mt-0.5",
            notification.is_read ? "text-slate-500 line-clamp-2" : "text-slate-700 font-medium line-clamp-3"
          )}>
            {notification.message}
          </p>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mt-2">
            {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(notification.created_at))}
          </span>
        </div>

        {/* Status Dot */}
        {!notification.is_read && (
          <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2 animate-pulse" />
        )}
      </div>
    </button>
  );
}
