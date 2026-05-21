import { getSessionSafe, supabase } from "@shared/lib/supabase";
import { buildNotifContent, type NotifLang, type NotifTemplate } from "./templates";
import { LANGUAGE_STORAGE_KEY, isSupportedLanguage } from "@shared/types/language";

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
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("preferred_language")
      .eq("id", userId)
      .maybeSingle();
    const value = String((profile as { preferred_language?: string } | null)?.preferred_language ?? "").toLowerCase();
    if (isSupportedLanguage(value)) return value;
  } catch {
    // ignore profile lookup mismatch
  }

  try {
    const { data: account } = await supabase
      .from("user_accounts")
      .select("preferred_language")
      .eq("id", userId)
      .maybeSingle();
    const value = String((account as { preferred_language?: string } | null)?.preferred_language ?? "").toLowerCase();
    if (isSupportedLanguage(value)) return value;
  } catch {
    // ignore user_accounts schema mismatch
  }

  if (typeof window !== "undefined") {
    const local = String(window.localStorage.getItem(LANGUAGE_STORAGE_KEY) ?? "").toLowerCase();
    if (isSupportedLanguage(local)) return local;
  }

  return "en";
}

function normalizeAdminCopyToEnglish(input: string | undefined): string | undefined {
  if (!input) return input;
  const map: Array<[RegExp, string]> = [
    [/Ac[aã]o necess[aá]ria: revisar etapa/gi, "Action required: review step"],
    [/O cliente concluiu a etapa "(.+)" de (.+) e aguarda sua revis[aã]o\./gi, 'Client completed step "$1" in $2 and is waiting for your review.'],
    [/O cliente concluiu uma etapa de (.+) e aguarda sua revis[aã]o\./gi, "Client completed a step in $1 and is waiting for your review."],
    [/COS: novo I-20 recebido/gi, "COS: new I-20 received"],
    [/COS: comprovante SEVIS recebido/gi, "COS: SEVIS receipt received"],
    [/COS: cover letter respondida/gi, "COS: cover letter completed"],
    [/COS: formulario I-539 gerado/gi, "COS: I-539 form generated"],
    [/COS: carta de RFE recebida/gi, "COS: RFE letter received"],
    [/COS: descricao de RFE enviada/gi, "COS: RFE description submitted"],
    [/COS: justificativa de motion enviada/gi, "COS: motion reason submitted"],
    [/COS: carta de negativa recebida/gi, "COS: denial letter received"],
    [/COS: documentos de apoio enviados/gi, "COS: supporting docs uploaded"],
    [/COS: resultado USCIS informado/gi, "COS: USCIS result reported"],
    [/COS: workflow de Motion iniciado/gi, "COS: Motion workflow started"],
    [/COS: workflow de RFE iniciado/gi, "COS: RFE workflow started"],
    [/COS: resultado de Motion informado/gi, "COS: Motion result reported"],
    [/COS: resultado de RFE informado/gi, "COS: RFE result reported"],
    [/enviou o documento I-20 para analise no processo/gi, "uploaded the I-20 document for review in process"],
    [/anexou o comprovante da taxa SEVIS para conferencia no processo/gi, "uploaded the SEVIS fee receipt for verification in process"],
    [/concluiu o questionario da cover letter no processo/gi, "completed the cover letter questionnaire in process"],
    [/concluiu o preenchimento e gerou o PDF do I-539 no processo/gi, "completed and generated the I-539 PDF in process"],
    [/submeteu a carta de RFE no processo/gi, "submitted the RFE letter in process"],
    [/descreveu os requisitos da RFE no processo/gi, "submitted the RFE requirements description in process"],
    [/enviou a justificativa para o motion no processo/gi, "submitted the motion reason in process"],
    [/submeteu a carta de negativa para iniciar o motion no processo/gi, "submitted the denial letter to start motion in process"],
    [/anexou documentos de apoio para o motion no processo/gi, "uploaded supporting motion documents in process"],
    [/informou um novo resultado do USCIS no processo/gi, "reported a new USCIS result in process"],
    [/informou o resultado do Motion no processo/gi, "reported the Motion result in process"],
    [/informou o resultado da RFE no processo/gi, "reported the RFE result in process"],
  ];

  let result = input;
  for (const [pattern, replacement] of map) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

function localizeClientFreeformContent(
  lang: NotifLang,
  title: string,
  message: string,
): { title: string; message: string } {
  const normalizedTitle = title.trim().toLowerCase();
  const normalizedMessage = message.trim().toLowerCase();
  const isReviewTitle = normalizedTitle === "estamos revisando!" || normalizedTitle === "we are reviewing!";
  const isReviewMessage =
    normalizedMessage.includes("sua etapa foi enviada com sucesso") ||
    normalizedMessage.includes("your step was submitted successfully");

  if (!isReviewTitle && !isReviewMessage) {
    return { title, message };
  }

  if (lang === "pt") {
    return {
      title: "Estamos Revisando!",
      message: "Sua etapa foi enviada com sucesso para nossa equipe de análise. Aguarde a validação.",
    };
  }

  if (lang === "es") {
    return {
      title: "Estamos Revisando!",
      message: "Tu etapa se envió correctamente para nuestro equipo de análisis. Espera la validación.",
    };
  }

  return {
    title: "We are reviewing!",
    message: "Your step was submitted successfully to our review team. Please wait for validation.",
  };
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
  const title = normalizeAdminCopyToEnglish(params.title) ?? params.title;
  const body = normalizeAdminCopyToEnglish(params.body);
  // Use allSettled to ensure one failure doesn't block others
  await Promise.allSettled(userIds.map((id) => insertNotification({
    type: "admin_action",
    target_role: "admin",
    user_id: id,
    service_id: params.serviceId || null,
    title,
    message: body || null,
    link: params.link ?? null,
    email_sent: false,
    send_email: false,
    metadata: params.metadata || {},
  })));
}

export async function notifyAdmin(params: NotifyAdminParams): Promise<void> {
  try {
    const title = normalizeAdminCopyToEnglish(params.title) ?? params.title;
    const body = normalizeAdminCopyToEnglish(params.body);
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
      title,
      message: body || null,
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
    const templated = params.template
      ? buildNotifContent(
          params.template,
          { ...(params.templateData ?? {}), title: params.title ?? "", body: params.body ?? "" },
          lang,
        )
      : { title: params.title ?? "", message: params.body ?? "" };
    const { title, message } = localizeClientFreeformContent(
      lang,
      templated.title,
      templated.message,
    );

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
      metadata: {
        ...(params.templateData ?? {}),
        ...(params.template ? { template: params.template } : {}),
      },
    });
  } catch (e) {
    if (isSilentError(e)) return;
    console.error("[notify] notifyClient failed:", e);
  }
}
