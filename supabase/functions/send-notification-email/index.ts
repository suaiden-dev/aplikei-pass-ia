// supabase/functions/send-notification-email/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import nodemailer from "npm:nodemailer@6.9.7";

serve(async (req) => {
  // We only handle POST requests (Webhooks)
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const payload = await req.json();
    console.log("Webhook payload:", payload);

    // Only process inserts where send_email is true
    const notification = payload.record;
    if (!notification || !notification.send_email || notification.email_sent) {
      return new Response(JSON.stringify({ message: "No email to send" }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Initialize Supabase admin client to fetch user email and update the row
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user email
    if (!notification.user_id) {
       throw new Error("No user_id provided for email notification");
    }

    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(notification.user_id);
    if (userError || !userData?.user?.email) {
      throw new Error(`Could not find email for user ${notification.user_id}`);
    }

    const recipientEmail = userData.user.email;

    // SMTP Config
    const transporter = nodemailer.createTransport({
      host: Deno.env.get("SMTP_HOST"),
      port: parseInt(Deno.env.get("SMTP_PORT") || "587"),
      secure: parseInt(Deno.env.get("SMTP_PORT") || "587") === 465,
      auth: {
        user: Deno.env.get("SMTP_USER"),
        pass: Deno.env.get("SMTP_PASSWORD"),
      },
    });

    // Send email
    const subject = `Aplikei: ${notification.title}`;
    const textBody = `${notification.message}\n\nAcesse o sistema para mais detalhes.`;
    const htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-bottom: 1px solid #ddd;">
          <h2 style="color: #0f172a; margin: 0;">Aplikei Passaporte</h2>
        </div>
        <div style="padding: 20px;">
          <h3 style="color: #334155; margin-top: 0;">${notification.title}</h3>
          <p style="color: #475569; line-height: 1.5;">${notification.message}</p>
          <div style="margin-top: 30px; text-align: center;">
            <a href="https://aplikeipass.com/dashboard" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Acessar Portal</a>
          </div>
        </div>
      </div>
    `;

    const TEST_MODE = true; // Set to false to actually send emails

    if (TEST_MODE) {
      console.log("------- TEST_MODE: EMAIL INTERCEPTED -------");
      console.log("To:", recipientEmail);
      console.log("Subject:", subject);
      console.log("Text Body:", textBody);
      console.log("--------------------------------------------");
      
      // Mock sent message ID for test mode
      const mockMessageId = `test-msg-${Date.now()}@aplikeipass.com`;
      console.log("Message intercepted in test mode: %s", mockMessageId);

      // Mark as sent in DB even in test mode so it doesn't try again
      await supabase
        .from("notifications")
        .update({ email_sent: true })
        .eq("id", notification.id);

      return new Response(JSON.stringify({ success: true, messageId: mockMessageId, testMode: true }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    const info = await transporter.sendMail({
      from: Deno.env.get("EMAIL_FROM") || '"Aplikei Passaporte" <no-reply@aplikeipass.com>',
      to: recipientEmail,
      subject: subject,
      text: textBody,
      html: htmlBody,
    });

    console.log("Message sent: %s", info.messageId);

    // Mark as sent
    await supabase
      .from("notifications")
      .update({ email_sent: true })
      .eq("id", notification.id);

    return new Response(JSON.stringify({ success: true, messageId: info.messageId }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err: any) {
    console.error("Error sending notification email:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
