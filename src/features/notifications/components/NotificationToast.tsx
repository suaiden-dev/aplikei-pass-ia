import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  RiNotification3Line, 
  RiUserLine, 
  RiAlertLine, 
  RiCloseLine 
} from "react-icons/ri";
import type { ToastItem } from "../types";
import { useAuth } from "@shared/hooks/useAuth";
import { useLocale, useT } from "@app/app/i18n";
import { localizeNotificationContent } from "@features/notifications/lib/localizeNotification";

interface NotificationToastProps {
  toast: ToastItem;
  index: number;
  onDismiss: () => void;
  duration?: number;
}

const typeConfig = {
  admin_action: {
    border: "border-l-primary",
    icon: <RiNotification3Line />,
    iconBg: "bg-primary/10 text-primary",
  },
  client_action: {
    border: "border-l-emerald-500",
    icon: <RiUserLine />,
    iconBg: "bg-emerald-50 text-emerald-600",
  },
  system: {
    border: "border-l-amber-400",
    icon: <RiAlertLine />,
    iconBg: "bg-amber-50 text-amber-600",
  },
};

export function NotificationToast({ 
  toast, 
  index, 
  onDismiss, 
  duration = 5000,
}: NotificationToastProps) {
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lang } = useLocale();
  const tAdmin = useT("admin");
  const labels = tAdmin?.notificationsCenter?.labels ?? {};
  const notificationLang: "pt" | "en" | "es" = user?.role === "customer" ? lang : "en";

  const resolveLink = (link: string | null | undefined): string | null => {
    if (!link || !user?.role) return link ?? null;
    
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

  const config = typeConfig[toast.type] || typeConfig.system;
  const localized = localizeNotificationContent(toast, notificationLang, labels);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.92, transition: { duration: 0.2 } }}
      transition={{
        type: "spring",
        stiffness: 380,
        damping: 30,
        delay: index * 0.08,
      }}
      className={`
        pointer-events-auto
        w-[360px] max-w-[calc(100vw-32px)]
        bg-white rounded-2xl shadow-2xl shadow-black/10
        border border-slate-100 border-l-4
        ${config.border}
        overflow-hidden
      `}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-base ${config.iconBg}`}>
          {config.icon}
        </div>

        <button
          type="button"
          onClick={() => {
            onDismiss();
            const targetLink = resolveLink(toast.link);
            if (targetLink) {
              navigate(targetLink);
            }
          }}
          className="flex-1 min-w-0 text-left"
        >
          <p className="text-sm font-bold text-slate-800 leading-snug">
            {localized.title}
          </p>
          {localized.message && (
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
              {localized.message}
            </p>
          )}
        </button>

        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            onDismiss();
          }}
          className="shrink-0 p-1 rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <RiCloseLine size={18} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-slate-100">
        <div
          className="h-full bg-primary origin-left"
          style={{
            animationName: "notif-shrink",
            animationDuration: `${duration}ms`,
            animationTimingFunction: "linear",
            animationFillMode: "forwards",
            animationPlayState: isPaused ? "paused" : "running",
          }}
          onAnimationEnd={onDismiss}
        />
      </div>
    </motion.div>
  );
}
