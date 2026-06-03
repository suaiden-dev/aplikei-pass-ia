// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

const templateToMeta: Record<string, { category: string; action: string }> = {
  payment_confirmed:          { category: "payment",    action: "confirmed" },
  zelle_payment_approved:     { category: "payment",    action: "zelle_approved" },
  zelle_payment_rejected:     { category: "payment",    action: "zelle_rejected" },
  step_approved:              { category: "process",    action: "step_approved" },
  step_rejected_feedback:     { category: "process",    action: "step_rejected" },
  process_completed_approved: { category: "process",    action: "completed_approved" },
  process_completed_denied:   { category: "process",    action: "completed_denied" },
  uscis_result_approved:      { category: "uscis",      action: "result_approved" },
  uscis_result_denied:        { category: "uscis",      action: "result_denied" },
  rfe_received:               { category: "rfe",        action: "received" },
  interview_scheduled:        { category: "scheduling", action: "interview_scheduled" },
  motion_submitted:           { category: "motion",     action: "submitted" },
  admin_message:              { category: "admin",      action: "message" },
};

function resolveMeta(payload: Record<string, unknown>) {
  const template =
    typeof payload.metadata === "object" && payload.metadata !== null
      ? (payload.metadata as Record<string, unknown>).template as string | undefined
      : undefined;

  if (template && templateToMeta[template]) return templateToMeta[template];

  const cat = typeof payload.category === "string" ? payload.category : null;
  const act = typeof payload.action   === "string" ? payload.action   : null;

  const targetRole = String(payload.target_role ?? "");
  const isAdminSide = targetRole === "admin" || targetRole === "master" || targetRole === "admin_lawyer";
  const defaultCategory = cat ?? (isAdminSide ? "admin" : "system");
  const defaultAction   = act ?? "message";

  return { category: defaultCategory, action: defaultAction };
}

type FanOutEntry = { userId: string; role: string | null; officeId: string | null };

async function resolveAdminsByOffice(
  supabase: SupabaseClient,
  officeId: string,
): Promise<FanOutEntry[]> {
  const { data } = await supabase
    .from("user_accounts")
    .select("id, role, office_id")
    .eq("office_id", officeId)
    .in("role", ["manager", "admin_lawyer", "admin"]);
  return ((data ?? []) as Array<{ id: string; role: string; office_id: string | null }>)
    .map((a) => ({ userId: a.id, role: a.role, officeId: officeId }));
}

export async function createNotification(
  supabase: SupabaseClient,
  payload: Record<string, unknown>,
) {
  const targetRole = String(payload.target_role ?? payload.target_type ?? "");

  // source_user_id = the actor who triggered the notification (used for admin fan-out).
  // Falls back to user_id when target is not "client" (backward compatibility).
  const sourceUserId =
    typeof payload.source_user_id === "string" && payload.source_user_id.trim()
      ? payload.source_user_id.trim()
      : targetRole !== "client" && typeof payload.user_id === "string" && payload.user_id.trim()
        ? payload.user_id.trim()
        : null;

  // user_id = explicit recipient, only meaningful for client-targeted notifications.
  const clientUserId =
    targetRole === "client" && typeof payload.user_id === "string" && payload.user_id.trim()
      ? payload.user_id.trim()
      : null;

  let fanOutRecipients: FanOutEntry[] = [];
  let resolvedOfficeId: string | null =
    typeof payload.office_id === "string" && payload.office_id.trim()
      ? payload.office_id.trim()
      : null;

  // ----------------------------------------------------------------
  // 1. Resolve recipients — all routing decisions live here
  // ----------------------------------------------------------------

  if (targetRole === "client") {
    if (clientUserId) {
      // Ensure auth profile exists (non-fatal)
      try {
        const { data: existing } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", clientUserId)
          .maybeSingle();
        if (!existing) {
          await supabase.from("profiles").upsert(
            {
              id: clientUserId,
              email:     typeof payload.client_email === "string" ? payload.client_email : null,
              full_name: typeof payload.client_name  === "string" ? payload.client_name  : null,
            },
            { onConflict: "id" },
          );
        }
      } catch (err) {
        console.warn("[create-notification] profile sync failed:", err);
      }

      const { data: account } = await supabase
        .from("user_accounts")
        .select("id, role, office_id")
        .eq("id", clientUserId)
        .maybeSingle();

      fanOutRecipients = [{
        userId:   clientUserId,
        role:     (account as { role?: string } | null)?.role     ?? null,
        officeId: (account as { office_id?: string } | null)?.office_id ?? null,
      }];
    }
  } else if (targetRole === "admin") {
    // Priority order for resolving the target office:
    // 1. office_id provided directly in payload
    // 2. user_services.office_id from service_id (most reliable for customer actions)
    // 3. user_accounts.office_id from source_user_id (works for staff; customers have null here)

    // Step 1: resolve from service — customers don't have office_id in user_accounts,
    // but user_services always has office_id set at purchase time.
    if (!resolvedOfficeId && payload.service_id) {
      const { data: svc } = await supabase
        .from("user_services")
        .select("office_id")
        .eq("id", String(payload.service_id))
        .maybeSingle();
      resolvedOfficeId = (svc as { office_id?: string | null } | null)?.office_id ?? null;
    }

    // Step 2: resolve from source user's staff account (manager/admin_lawyer)
    if (!resolvedOfficeId && sourceUserId) {
      const { data: actor } = await supabase
        .from("user_accounts")
        .select("id, role, office_id")
        .eq("id", sourceUserId)
        .maybeSingle();

      const actorRole   = (actor as { role?: string }     | null)?.role      ?? null;
      const actorOffice = (actor as { office_id?: string } | null)?.office_id ?? null;
      const isAdminRole = actorRole === "manager" || actorRole === "admin_lawyer" || actorRole === "admin";

      if (actorOffice) {
        resolvedOfficeId = actorOffice;
      } else if (isAdminRole) {
        // Staff user with no office assignment → notify them directly
        fanOutRecipients = [{ userId: sourceUserId, role: actorRole, officeId: null }];
      }
    }

    if (resolvedOfficeId && fanOutRecipients.length === 0) {
      fanOutRecipients = await resolveAdminsByOffice(supabase, resolvedOfficeId);
    }
  } else if (targetRole === "master") {
    const { data: masters } = await supabase
      .from("user_accounts")
      .select("id, role, office_id")
      .eq("role", "master");

    fanOutRecipients = ((masters ?? []) as Array<{ id: string; role: string; office_id: string | null }>)
      .map((m) => ({ userId: m.id, role: m.role, officeId: m.office_id ?? null }));
  } else if (targetRole === "admin_lawyer") {
    if (resolvedOfficeId) {
      const { data: lawyers } = await supabase
        .from("user_accounts")
        .select("id, role, office_id")
        .eq("office_id", resolvedOfficeId)
        .eq("role", "admin_lawyer");

      fanOutRecipients = ((lawyers ?? []) as Array<{ id: string; role: string; office_id: string | null }>)
        .map((l) => ({ userId: l.id, role: l.role, officeId: resolvedOfficeId }));
    }
  } else if (Array.isArray(payload.user_ids)) {
    // Explicit list of recipient IDs provided by the caller
    const ids = (payload.user_ids as unknown[]).filter((id): id is string => typeof id === "string");
    fanOutRecipients = ids.map((id) => ({ userId: id, role: null, officeId: null }));
  }

  // ----------------------------------------------------------------
  // 2. Resolve category + action
  // ----------------------------------------------------------------
  const { category, action } = resolveMeta(payload);

  // ----------------------------------------------------------------
  // 3. Insert notifications_messages
  // ----------------------------------------------------------------
  const { data: message, error: msgError } = await supabase
    .from("notifications_messages")
    .insert({
      sender_user_id:   typeof payload.sender_user_id === "string" ? payload.sender_user_id : null,
      status:           "sent",
      category,
      action,
      target_role:      targetRole || null,
      target_office_id: resolvedOfficeId,
      process_id:       typeof payload.service_id === "string" ? payload.service_id : null,
      link:             typeof payload.link    === "string" ? payload.link    : null,
      metadata:         payload.metadata && typeof payload.metadata === "object" && !Array.isArray(payload.metadata)
                          ? payload.metadata : {},
      send_email:       Boolean(payload.send_email ?? false),
    })
    .select("id")
    .single();

  if (msgError) throw msgError;
  const notificationId = message.id as string;

  // ----------------------------------------------------------------
  // 4. Insert notifications_groups (one row per recipient)
  // ----------------------------------------------------------------
  if (fanOutRecipients.length === 0) {
    return { success: true, notification_id: notificationId };
  }

  const groups = fanOutRecipients.map((r) => ({
    notification_id: notificationId,
    user_id:         r.userId,
    role:            r.role,
    office_id:       r.officeId,
    viewed:          false,
    email_sent:      false,
  }));

  const { error: groupError } = await supabase
    .from("notifications_groups")
    .insert(groups);

  if (groupError) throw groupError;

  return { success: true, notification_id: notificationId };
}
