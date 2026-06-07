import nodemailer from "npm:nodemailer@6.9.7";

export async function sendTermsAcceptanceEmail(input: {
  to: string;
  name: string;
  role: string;
  acceptedAt: string;
  ip: string;
  pdfBytes: Uint8Array;
  docId: string;
}) {
  const dateStr = new Date(input.acceptedAt).toLocaleString("en-US", { timeZone: "America/Sao_Paulo" });
  const roleLabel = input.role === "lawyer" ? "Lawyer / Law Firm" : "Client";

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
      <div style="background:#1e40af;padding:24px;text-align:center">
        <h2 style="color:#fff;margin:0;font-size:20px">Aplikei Passaporte</h2>
        <p style="color:#bfdbfe;margin:8px 0 0;font-size:13px">Terms Acceptance Receipt</p>
      </div>
      <div style="padding:28px">
        <p style="color:#1e293b;font-size:15px">Hello, <strong>${input.name}</strong>,</p>
        <p style="color:#475569;font-size:14px;line-height:1.6">
          We confirm your acceptance of the <strong>Aplikei</strong> Terms of Use and Privacy Policy on <strong>${dateStr}</strong>.
        </p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:13px">
          <tr><td style="padding:8px 12px;background:#f8fafc;font-weight:bold;color:#64748b;border-radius:6px 0 0 6px">Reference ID</td><td style="padding:8px 12px;background:#f8fafc;border-radius:0 6px 6px 0;color:#1e293b;font-family:monospace">${input.docId}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:bold;color:#64748b">Date and Time</td><td style="padding:8px 12px;color:#1e293b">${dateStr}</td></tr>
          <tr><td style="padding:8px 12px;background:#f8fafc;font-weight:bold;color:#64748b;border-radius:6px 0 0 6px">Profile</td><td style="padding:8px 12px;background:#f8fafc;border-radius:0 6px 6px 0;color:#1e293b">${roleLabel}</td></tr>
          <tr><td style="padding:8px 12px;font-weight:bold;color:#64748b">IP</td><td style="padding:8px 12px;color:#1e293b">${input.ip}</td></tr>
        </table>
        <p style="color:#475569;font-size:13px">The PDF receipt is attached to this email. Please keep it for your records.</p>
      </div>
      <div style="background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e2e8f0">
        <p style="color:#94a3b8;font-size:11px;margin:0">© 2026 Aplikei Technologies — apliceipass.com</p>
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

  await transporter.sendMail({
    from: Deno.env.get("EMAIL_FROM") || '"Aplikei Passaporte" <no-reply@aplikeipass.com>',
    to: input.to,
    cc: "admin@aplikei.com",
    subject: "Aplikei: Terms Acceptance Receipt",
    html,
    attachments: [{
      filename: `terms-acceptance-receipt-${input.docId.slice(0, 8)}.pdf`,
      content: input.pdfBytes,
      contentType: "application/pdf",
    }],
  });
}
