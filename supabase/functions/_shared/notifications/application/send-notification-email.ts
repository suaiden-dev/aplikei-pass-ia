import { createAdminClient } from "../../core/supabase.ts";
import { sendNotificationEmail } from "../providers/smtp.ts";
import { getNotificationContent } from "../domain/notification-content.ts";

export async function processNotificationEmailWebhook(payload: Record<string, unknown>) {
  const group = payload.record as Record<string, unknown>;
  if (!group) return { message: "No record" };

  if (group.email_sent) return { message: "Email already sent" };

  const groupId = group.id as string;
  const userId  = group.user_id as string | null;
  const notifId = group.notification_id as string;

  if (!userId) throw new Error("No user_id in notifications_groups row");

  const supabase = createAdminClient();

  const { data: message, error: msgError } = await supabase
    .from("notifications_messages")
    .select("send_email, category, action, metadata")
    .eq("id", notifId)
    .maybeSingle();

  if (msgError) throw msgError;
  if (!message)            return { message: "Parent message not found" };
  if (!message.send_email) return { message: "send_email is false on message" };

  // Resolve recipient's email and preferred language
  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
  if (userError || !userData?.user?.email) {
    throw new Error(`Could not find email for user ${userId}`);
  }

  const lang = await (async (): Promise<string> => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("preferred_language")
        .eq("id", userId)
        .maybeSingle();
      const v = String((profile as { preferred_language?: string } | null)?.preferred_language ?? "").toLowerCase();
      if (v === "pt" || v === "es") return v;
    } catch { /* ignore */ }
    try {
      const { data: account } = await supabase
        .from("user_accounts")
        .select("preferred_language")
        .eq("id", userId)
        .maybeSingle();
      const v = String((account as { preferred_language?: string } | null)?.preferred_language ?? "").toLowerCase();
      if (v === "pt" || v === "es") return v;
    } catch { /* ignore */ }
    return "en";
  })();

  const meta     = (message.metadata && typeof message.metadata === "object" && !Array.isArray(message.metadata))
    ? (message.metadata as Record<string, unknown>)
    : {};
  const category = typeof message.category === "string" ? message.category : "system";
  const action   = typeof message.action   === "string" ? message.action   : "message";

  const { title, message: body } = getNotificationContent(category, action, lang, meta);

  const result = await sendNotificationEmail({
    to:      userData.user.email,
    title:   title   || `${category}/${action}`,
    message: body    || "",
  });

  await supabase
    .from("notifications_groups")
    .update({ email_sent: true })
    .eq("id", groupId);

  return result;
}
