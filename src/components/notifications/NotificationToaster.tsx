
import { AnimatePresence } from "framer-motion";
import { useNotifications } from "../../contexts/NotificationContext";
import { NotificationToast } from "./NotificationToast";

export function NotificationToaster() {
  const { activeToasts, dismissToast } = useNotifications();

  return (
    <div
      className="
        fixed z-[9999] pointer-events-none
        top-6 right-6
        flex flex-col gap-3 items-end
        xl:w-auto w-[calc(100vw-32px)] xl:left-auto left-4
      "
    >
      <AnimatePresence mode="popLayout">
        {activeToasts.map((toast, index) => (
          <NotificationToast
            key={toast.id}
            toast={toast}
            index={index}
            onDismiss={() => dismissToast(toast.id)}
            duration={5000}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
