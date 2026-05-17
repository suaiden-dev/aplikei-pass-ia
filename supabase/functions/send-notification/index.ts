import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireUser } from "../_shared/core/auth.ts";
import { err, json, options } from "../_shared/core/http.ts";
import { createAdminClient } from "../_shared/core/supabase.ts";
import { createNotification } from "../_shared/notifications/application/create-notification.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return options();

  try {
    const supabase = createAdminClient();
    const user = await requireUser(req, supabase);
    if (!user) return err("Unauthorized", 401);

    return json(await createNotification(supabase, await req.json()));
  } catch (error) {
    console.error("[send-notification] Error:", error);
    return err((error as Error).message, 500);
  }
});
