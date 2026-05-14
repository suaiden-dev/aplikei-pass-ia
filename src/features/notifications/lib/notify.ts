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
type UserAccountLite = {
  id: string;
  role: string;
  office_id: string | null;
};

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
  // preferred_language column was removed from user_accounts.
  // Keep safe fallback to avoid 400 errors from PostgREST schema mismatch.
  void userId;
  return "en";
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

async function getUserAccountLite(userId: string): Promise<UserAccountLite | null> {
  const { data } = await supabase
    .from("user_accounts")
    .select("id, role, office_id")
    .eq("id", userId)
    .maybeSingle();
  return (data as UserAccountLite | null) ?? null;
}

async function getOfficeAdminRecipients(officeId: string): Promise<string[]> {
  const { data } = await supabase
    .from("user_accounts")
    .select("id")
    .eq("office_id", officeId)
    .in("role", ["manager", "admin_lawyer"]);
  return ((data as Array<{ id: string }> | null) ?? []).map((row) => row.id);
}

async function getMasterRecipients(): Promise<string[]> {
  const { data } = await supabase
    .from("user_accounts")
    .select("id")
    .eq("role", "master");
  return ((data as Array<{ id: string }> | null) ?? []).map((row) => row.id);
}

async function createAdminNotificationsForUsers(
  userIds: string[],
  params: NotifyAdminParams,
): Promise<void> {
  await Promise.all(userIds.map((id) => insertNotification({
    type: "admin_action",
    target_role: "admin",
    user_id: id,
    service_id: params.serviceId || null,
    title: params.title,
    message: params.body || null,
    link: params.link ?? null,
    email_sent: false,
    send_email: false,
    metadata: params.metadata || {},
  })));
}

export async function notifyAdmin(params: NotifyAdminParams): Promise<void> {
  try {
    if (params.userId) {
      const actor = await getUserAccountLite(params.userId);

      if (actor?.role === "customer" && actor.office_id) {
        const officeRecipients = await getOfficeAdminRecipients(actor.office_id);
        if (officeRecipients.length > 0) {
          await createAdminNotificationsForUsers(officeRecipients, params);
          return;
        }
      }
    }

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

export async function notifyMaster(params: NotifyAdminParams): Promise<void> {
  try {
    const masterIds = await getMasterRecipients();
    if (masterIds.length > 0) {
      await createAdminNotificationsForUsers(masterIds, params);
      return;
    }
    await notifyAdmin(params);
  } catch (e) {
    if (isSilentError(e)) return;
    console.error("[notify] notifyMaster failed:", e);
  }
}

export async function notifyAdminLawyersByOffice(
  officeId: string,
  params: NotifyAdminParams,
): Promise<void> {
  try {
    const { data } = await supabase
      .from("user_accounts")
      .select("id")
      .eq("office_id", officeId)
      .eq("role", "admin_lawyer");
    const targetIds = ((data as Array<{ id: string }> | null) ?? []).map((row) => row.id);
    if (targetIds.length === 0) return;
    await createAdminNotificationsForUsers(targetIds, params);
  } catch (e) {
    if (isSilentError(e)) return;
    console.error("[notify] notifyAdminLawyersByOffice failed:", e);
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
