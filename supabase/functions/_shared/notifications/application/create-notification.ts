// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

export async function createNotification(
  supabase: SupabaseClient,
  payload: Record<string, unknown>,
) {
  const rawUserId = typeof payload.user_id === "string" && payload.user_id.trim().length > 0
    ? payload.user_id.trim()
    : null;
  let notificationUserId = rawUserId;

  if (rawUserId) {
    try {
      const { data: existingProfile, error: profileLookupError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", rawUserId)
        .maybeSingle();

      if (profileLookupError) throw profileLookupError;

      if (!existingProfile) {
        const { error: profileInsertError } = await supabase
          .from("profiles")
          .upsert({
            id: rawUserId,
            email: typeof payload.client_email === "string" ? payload.client_email : null,
            full_name: typeof payload.client_name === "string" ? payload.client_name : null,
          }, { onConflict: "id" });

        if (profileInsertError) throw profileInsertError;
      }
    } catch (error) {
      console.warn("[send-notification] profile sync failed, fallback to broadcast admin notification:", error);
      notificationUserId = null;
    }
  }

  const { error } = await supabase.from("notifications").insert({
    type: payload.type ?? "system",
    target_role: payload.target_role ?? payload.target_type ?? "client",
    user_id: notificationUserId,
    service_id: payload.service_id ?? null,
    title: payload.title ?? "",
    message: payload.message ?? payload.body ?? null,
    link: payload.link ?? null,
    is_read: payload.is_read ?? false,
    send_email: payload.send_email ?? false,
    email_sent: payload.email_sent ?? false,
    metadata: payload.metadata ?? {},
  });

  if (error) throw error;
  return { success: true };
}
