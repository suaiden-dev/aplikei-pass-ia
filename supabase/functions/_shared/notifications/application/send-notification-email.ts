import { createAdminClient } from "../../core/supabase.ts";
import { sendNotificationEmail } from "../providers/smtp.ts";

export async function processNotificationEmailWebhook(payload: Record<string, any>) {
  const notification = payload.record;
  if (!notification || !notification.send_email || notification.email_sent) {
    return { message: "No email to send" };
  }

  if (!notification.user_id) {
    throw new Error("No user_id provided for email notification");
  }

  const supabase = createAdminClient();
  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(notification.user_id);
  if (userError || !userData?.user?.email) {
    throw new Error(`Could not find email for user ${notification.user_id}`);
  }

  const result = await sendNotificationEmail({
    to: userData.user.email,
    title: notification.title,
    message: notification.message,
  });

  await supabase.from("notifications").update({ email_sent: true }).eq("id", notification.id);
  return result;
}
