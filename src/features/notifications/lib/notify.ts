import { getSessionSafe, supabase } from "../../../shared/lib/supabase";
import { buildNotifContent, type NotifLang, type NotifTemplate } from "./templates";

export interface NotifyClientParams {
  userId?: string;
  clientEmail?: string;
  clientName?: string;
  template?: NotifTemplate;
  title?: string;
  body?: string;
  serviceId?: string;
  templateData?: Record<string, string>;
  sendEmail?: boolean;
  link?: string;
}

export interface NotifyAdminParams {
  title: string;
  body?: string;
  serviceId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  link?: string;
}

type NotificationPayload = Record<string, unknown>;

async function insertNotification(payload: NotificationPayload): Promise<void> {
  const cachedSession = await getSessionSafe();
  const accessToken = cachedSession?.access_token ?? null;
  const expiresAtMs = cachedSession?.expires_at ? cachedSession.expires_at * 1000 : null;

  if (!accessToken || (expiresAtMs !== null && expiresAtMs <= Date.now() + 60_000)) {
    throw new Error("Auth session unavailable");
  }

  const { error } = await supabase.functions.invoke("send-notification", {
    body: payload,
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (error) {
    const maybeHttpError = error as { name?: string; context?: { status?: number } };
    if (maybeHttpError.name === "FunctionsHttpError" && maybeHttpError.context?.status) {
      throw new Error(`HTTP ${maybeHttpError.context.status}`);
    }
    throw new Error(error.message);
  }
}

async function getUserLang(userId: string): Promise<NotifLang> {
  const { data } = await supabase
    .from("user_accounts")
    .select("preferred_language")
    .eq("id", userId)
    .maybeSingle();
  return (data?.preferred_language as NotifLang) ?? "en";
}

function isSilentError(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return (
    msg.includes("Auth session unavailable") ||
    msg.includes("Unauthorized") ||
    msg.includes("HTTP 401") ||
    msg.includes("HTTP 403") ||
    msg.includes("HTTP 429")
  );
}

export async function notifyAdmin(params: NotifyAdminParams): Promise<void> {
  try {
    await insertNotification({
      type: "admin_action",
      target_role: "admin",
      user_id: params.userId || null,
      service_id: params.serviceId || null,
      title: params.title,
      message: params.body || null,
      link: params.link ?? null,
      email_sent: false,
      send_email: false,
      metadata: params.metadata || {},
    });
  } catch (e) {
    if (isSilentError(e)) return;
    console.error("[notify] notifyAdmin failed:", e);
  }
}

export async function notifyClient(params: NotifyClientParams): Promise<void> {
  try {
    const lang = params.userId ? await getUserLang(params.userId) : "en";
    const { title, message } = params.template
      ? buildNotifContent(
          params.template,
          { ...(params.templateData ?? {}), title: params.title ?? "", body: params.body ?? "" },
          lang,
        )
      : { title: params.title ?? "", message: params.body ?? "" };

    await insertNotification({
      type: "client_action",
      target_role: "client",
      user_id: params.userId || null,
      service_id: params.serviceId || null,
      title,
      message,
      link: params.link ?? null,
      send_email: params.sendEmail ?? true,
      email_sent: false,
      metadata: params.templateData ?? {},
    });
  } catch (e) {
    if (isSilentError(e)) return;
    console.error("[notify] notifyClient failed:", e);
  }
}
