import { handler } from "../_shared/core/handler.ts";
import { err, json } from "../_shared/core/http.ts";
import { createAdminClient } from "../_shared/core/supabase.ts";
import { requireUser } from "../_shared/core/auth.ts";
import { createNotification } from "../_shared/notifications/application/create-notification.ts";

Deno.serve(handler(async (req) => {
  const supabase = createAdminClient();
  const user = await requireUser(req, supabase);
  if (!user) return err("Unauthorized", 401);
  return json(await createNotification(supabase, await req.json()));
}));
