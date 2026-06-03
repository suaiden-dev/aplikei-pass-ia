import { getSessionSafe, supabase } from "@shared/lib/supabase";

export interface NotifyClientParams {
  userId?: string;
  clientEmail?: string;
  clientName?: string;
  serviceId?: string;
  metadata?: Record<string, unknown>;
  sendEmail?: boolean;
  link?: string;
  category?: string;
  action?: string;
}

export interface NotifyAdminParams {
  serviceId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  link?: string;
  category?: string;
  action?: string;
}

type NotificationPayload = Record<string, unknown>;

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

export async function notifyAdmin(params: NotifyAdminParams): Promise<void> {
  try {
    await insertNotification({
      target_role:    "admin",
      source_user_id: params.userId    ?? null,
      service_id:     params.serviceId ?? null,
      link:           params.link      ?? null,
      send_email:     true,
      metadata:       params.metadata  ?? {},
      category:       params.category  ?? "admin",
      action:         params.action    ?? "message",
    });
  } catch (e) {
    if (isSilentError(e)) return;
    console.error("[notify] notifyAdmin failed:", e);
  }
}

export async function notifyMaster(params: NotifyAdminParams): Promise<void> {
  try {
    await insertNotification({
      target_role:    "master",
      source_user_id: params.userId    ?? null,
      service_id:     params.serviceId ?? null,
      link:           params.link      ?? null,
      send_email:     true,
      metadata:       params.metadata  ?? {},
      category:       params.category  ?? "admin",
      action:         params.action    ?? "message",
    });
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
    await insertNotification({
      target_role: "admin_lawyer",
      office_id:   officeId,
      service_id:  params.serviceId ?? null,
      link:        params.link      ?? null,
      send_email:  true,
      metadata:    params.metadata  ?? {},
      category:    params.category  ?? "admin",
      action:      params.action    ?? "message",
    });
  } catch (e) {
    if (isSilentError(e)) return;
    console.error("[notify] notifyAdminLawyersByOffice failed:", e);
  }
}

/** Notifies a single known user ID regardless of their role. */
export async function notifyUser(
  userId: string,
  params: Omit<NotifyAdminParams, "userId">,
): Promise<void> {
  try {
    await insertNotification({
      user_ids:   [userId],
      link:       params.link     ?? null,
      send_email: true,
      metadata:   params.metadata ?? {},
      category:   params.category ?? "admin",
      action:     params.action   ?? "message",
    });
  } catch (e) {
    if (isSilentError(e)) return;
    console.error("[notify] notifyUser failed:", e);
  }
}

export async function notifyClient(params: NotifyClientParams): Promise<void> {
  try {
    await insertNotification({
      target_role: "client",
      user_id:     params.userId    ?? null,
      service_id:  params.serviceId ?? null,
      link:        params.link      ?? null,
      send_email:  params.sendEmail ?? true,
      metadata: {
        ...(params.metadata ?? {}),
        ...(params.clientName  ? { client_name:  params.clientName  } : {}),
        ...(params.clientEmail ? { client_email: params.clientEmail } : {}),
      },
      category: params.category ?? "system",
      action:   params.action   ?? "message",
    });
  } catch (e) {
    if (isSilentError(e)) return;
    console.error("[notify] notifyClient failed:", e);
  }
}
