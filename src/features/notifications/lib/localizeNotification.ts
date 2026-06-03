type NotifContent = Record<string, { title: string; message: string }>;

type NotificationLike = {
  category?: string;
  action?: string;
  metadata?: Record<string, unknown>;
  title?: string;
  message?: string | null;
};

function interpolate(template: string, meta: Record<string, unknown>): string {
  return template
    .replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
      const val = meta[key];
      return typeof val === "string" ? val : typeof val === "number" ? String(val) : "";
    })
    .replace(/:\s*\./g, ".")
    .replace(/\s{2,}/g, " ")
    .replace(/"\s*"\s*/g, "")
    .trim();
}

export function localizeNotificationContent(
  notification: NotificationLike,
  _lang: string,
  content?: NotifContent,
): { title: string; message: string } {
  const category = notification.category ?? "system";
  const action   = notification.action   ?? "message";
  const key      = `${category}__${action}`;
  const entry    = content?.[key];
  const meta     = notification.metadata ?? {};

  const storedTitle   = notification.title   ?? "";
  const storedMessage = notification.message ?? "";

  if (!entry) {
    return { title: storedTitle || key, message: storedMessage };
  }

  return {
    title:   interpolate(entry.title,   meta) || storedTitle,
    message: interpolate(entry.message, meta) || storedMessage,
  };
}
