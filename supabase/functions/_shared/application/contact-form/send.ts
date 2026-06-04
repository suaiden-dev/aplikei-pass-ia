import { sendNotificationEmail } from "../../notifications/providers/smtp.ts";
import { isValidEmail } from "../../domain/validation.ts";

type ContactFormPayload = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

export async function handleContactForm(raw: unknown): Promise<{ success: true }> {
  const body = raw as ContactFormPayload;
  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim();
  const subject = String(body?.subject ?? "").trim();
  const message = String(body?.message ?? "").trim();

  if (!name || !email || !subject || !message) {
    throw Object.assign(new Error("Missing required fields"), { status: 400 });
  }
  if (!isValidEmail(email)) {
    throw Object.assign(new Error("Invalid email"), { status: 400 });
  }

  await sendNotificationEmail({
    to: "admin@aplikei.com",
    title: `Contact Form: ${subject}`,
    message: [`Name: ${name}`, `Email: ${email}`, `Subject: ${subject}`, "", "Message:", message].join("\n"),
  });

  return { success: true };
}
