import { useState } from "react";
import { Bell, Check, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";

export function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    if (notification.link) {
      setIsOpen(false);
      navigate(notification.link);
    }
  };

  if (!user) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-full hover:bg-accent/10 transition-colors"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center border-2 border-background animate-in zoom-in">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[380px] p-0 shadow-2xl rounded-2xl border-accent/20 overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 bg-muted/30 border-b border-accent/10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
              <BellRing className="h-4 w-4 text-accent" />
            </div>
            <span className="font-bold text-sm">Notificações</span>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-8 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              <Check className="h-3 w-3 mr-1" />
              Marcar lidas
            </Button>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center">
              <Bell className="h-8 w-8 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground font-medium">
                Nenhuma notificação
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Você está em dia com seus avisos.
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={cn(
                    "flex flex-col gap-1 p-4 border-b border-border/40 hover:bg-muted/30 cursor-pointer transition-colors relative",
                    !notif.is_read ? "bg-accent/5" : "",
                  )}
                >
                  {!notif.is_read && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-r-md" />
                  )}
                  <div className="flex justify-between items-start gap-4">
                    <h4
                      className={cn(
                        "text-sm font-semibold",
                        !notif.is_read
                          ? "text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0 mt-0.5">
                      {new Date(notif.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
