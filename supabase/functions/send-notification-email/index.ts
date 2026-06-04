import { handler } from "../_shared/core/handler.ts";
import { json } from "../_shared/core/http.ts";
import { processNotificationEmailWebhook } from "../_shared/notifications/application/send-notification-email.ts";

Deno.serve(handler(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  return json(await processNotificationEmailWebhook(await req.json()));
}));
