import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  RiNotification3Line, 
  RiUserLine, 
  RiAlertLine, 
  RiCloseLine 
} from "react-icons/ri";
import { ToastItem } from "../../contexts/NotificationContext";

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
  duration = 5000 
}: NotificationToastProps) {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const remainingRef = useRef<number>(duration);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const config = typeConfig[toast.type] || typeConfig.system;

  const tick = useCallback(function tick(timestamp: number) {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    
    const elapsed = timestamp - startTimeRef.current;
    const newRemaining = remainingRef.current - elapsed;

    if (newRemaining <= 0) {
      setProgress(0);
      onDismiss();
      return;
    }

    setProgress((newRemaining / duration) * 100);
    startTimeRef.current = timestamp;
    remainingRef.current = newRemaining;
    rafRef.current = requestAnimationFrame(tick);
  }, [duration, onDismiss]);

  useEffect(() => {
    if (!isPaused) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
    
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPaused, tick]);

  // Reset the start time relative to the current timestamp when unpausing
  // However, the tick logic subtracts elapsed from remaining and then updates 
  // remainingRef and resets startTimeRef to current timestamp. 
  // This approach actually works fine for pausing/resuming as long as we reset 
  // startTimeRef when resuming.
  useEffect(() => {
    if (!isPaused) {
      startTimeRef.current = null; // Forces recalculation in next frame
    }
  }, [isPaused]);

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

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 leading-snug">
            {toast.title}
          </p>
          {toast.message && (
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
              {toast.message}
            </p>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
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
          className="h-full bg-primary transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
}
