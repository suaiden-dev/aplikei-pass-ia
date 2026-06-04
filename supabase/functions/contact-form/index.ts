import { handler } from "../_shared/core/handler.ts";
import { err, json } from "../_shared/core/http.ts";
import { handleContactForm } from "../_shared/application/contact-form/send.ts";

Deno.serve(handler(async (req) => {
  if (req.method !== "POST") return err("Method not allowed", 405);
  return json(await handleContactForm(await req.json()));
}));
