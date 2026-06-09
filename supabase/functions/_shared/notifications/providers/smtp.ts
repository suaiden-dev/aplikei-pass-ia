import nodemailer from "npm:nodemailer@6.9.7";

export async function sendNotificationEmail(input: {
  to: string;
  title: string;
  message: string;
  subject?: string;
  showPortalLink?: boolean;
  appendPortalText?: boolean;
}) {
  const subject = input.subject ?? `Aplikei: ${input.title}`;
  const showPortalLink = input.showPortalLink ?? true;
  const text = input.appendPortalText === false ? input.message : `${input.message}\n\nAcesse o sistema para mais detalhes.`;
  const safeTitle = escapeHtml(input.title);
  const safeMessage = escapeHtml(input.message);
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-bottom: 1px solid #ddd;">
        <h2 style="color: #0f172a; margin: 0;">Aplikei Passaporte</h2>
      </div>
      <div style="padding: 20px;">
        <h3 style="color: #334155; margin-top: 0;">${safeTitle}</h3>
        <p style="color: #475569; line-height: 1.5; white-space: pre-line;">${safeMessage}</p>
        ${showPortalLink ? `<div style="margin-top: 30px; text-align: center;">
          <a href="https://aplikeipass.com/dashboard" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Acessar Portal</a>
        </div>` : ""}
      </div>
    </div>
  `;

  const transporter = nodemailer.createTransport({
    host: Deno.env.get("SMTP_HOST"),
    port: parseInt(Deno.env.get("SMTP_PORT") || "587"),
    secure: parseInt(Deno.env.get("SMTP_PORT") || "587") === 465,
    auth: {
      user: Deno.env.get("SMTP_USER"),
      pass: Deno.env.get("SMTP_PASSWORD"),
    },
  });

  const info = await transporter.sendMail({
    from: Deno.env.get("EMAIL_FROM") || '"Aplikei Passaporte" <no-reply@aplikeipass.com>',
    to: input.to,
    subject,
    text,
    html,
  });

  return { success: true, messageId: info.messageId };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
