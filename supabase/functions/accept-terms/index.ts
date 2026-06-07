import { handler } from "../_shared/core/handler.ts";
import { err, json } from "../_shared/core/http.ts";
import { handleAcceptTerms } from "../_shared/application/accept-terms/handler.ts";

Deno.serve(handler(async (req) => {
  if (req.method !== "POST") return err("Method not allowed", 405);
  const body = await req.json();
  const { userId, role, name, email } = body;
  if (!userId || !role || !name || !email) return err("Missing required fields", 400);
  return json(await handleAcceptTerms(req, { userId, role, name, email }));
}));
