import { buildNotifContent, type NotifLang, type NotifTemplate } from "../services/templates";

type StructuredNotifContent = { title: string; message: string };
type LegacyNotifContent = Record<string, string | StructuredNotifContent>;
type NotifContent = Record<string, StructuredNotifContent> | LegacyNotifContent;

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
  lang: string,
  content?: NotifContent,
): { title: string; message: string } {
  const category = notification.category ?? "system";
  const action   = notification.action   ?? "message";
  const key      = `${category}__${action}`;
  const entry    = content?.[key];
  const meta     = notification.metadata ?? {};

  const storedTitle   = notification.title   ?? "";
  const storedMessage = notification.message ?? "";

  const template = meta.template;
  if (typeof template === "string") {
    return buildNotifContent(
      template as NotifTemplate,
      Object.fromEntries(
        Object.entries(meta).map(([metaKey, value]) => [metaKey, typeof value === "string" ? value : String(value ?? "")]),
      ),
      lang as NotifLang,
    );
  }

  if (entry && typeof entry !== "string") {
    return {
      title:   interpolate(entry.title,   meta) || storedTitle,
      message: interpolate(entry.message, meta) || storedMessage,
    };
  }

  if (content && storedTitle === "Step Approved") {
    return {
      title: String(content.stepApproved ?? storedTitle),
      message: String(content.stepApprovedMessage ?? storedMessage),
    };
  }

  if (content && storedTitle === "Action required: review step") {
    const match = storedMessage.match(/Client completed step "(.+)" in (.+) and is waiting/i);
    return {
      title: String(content.actionRequiredReview ?? storedTitle),
      message: interpolate(String(content.clientCompletedStepMessage ?? storedMessage), {
        step: match?.[1] ?? "",
        service: match?.[2] ?? "",
      }),
    };
  }

  return { title: storedTitle || String(content?.system ?? key), message: storedMessage };
}
