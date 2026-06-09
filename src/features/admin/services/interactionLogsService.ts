import { supabase } from "@shared/lib/supabase";
import type { InteractionLog, InteractionLogFilters, InteractionLogStats } from "../types";

function applyOfficeFilter<T extends { eq: (column: string, value: string) => T }>(
  query: T,
  officeId: string | null | undefined,
  isMaster: boolean,
) {
  return !isMaster && officeId ? query.eq("office_id", officeId) : query;
}

export async function fetchInteractionLogStats(params: {
  officeId?: string | null;
  isMaster: boolean;
}): Promise<InteractionLogStats> {
  let totalQuery = supabase.from("checkout_logs").select("id", { count: "exact", head: true });
  totalQuery = applyOfficeFilter(totalQuery, params.officeId, params.isMaster);
  const { count: total, error: totalError } = await totalQuery;
  if (totalError) throw Error(totalError.message);

  let errorQuery = supabase
    .from("checkout_logs")
    .select("id", { count: "exact", head: true })
    .ilike("event_name", "%erro%");
  errorQuery = applyOfficeFilter(errorQuery, params.officeId, params.isMaster);
  const { count: errors, error: errorsError } = await errorQuery;
  if (errorsError) throw Error(errorsError.message);

  return { total: total ?? 0, errors: errors ?? 0 };
}

export async function listInteractionLogs(params: InteractionLogFilters): Promise<{
  logs: InteractionLog[];
  totalCount: number;
}> {
  let query = supabase
    .from("checkout_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(params.page * params.pageSize, (params.page + 1) * params.pageSize - 1);

  query = applyOfficeFilter(query, params.officeId, params.isMaster);

  if (params.filter === "error") {
    query = query.ilike("event_name", "%error%");
  } else if (params.filter === "warning") {
    query = query.or("event_name.ilike.%aviso%,event_name.ilike.%tentativa%,event_name.ilike.%recusad%,event_name.ilike.%warning%,details.ilike.%aviso%,details.ilike.%tentativa%,details.ilike.%recusad%,details.ilike.%warning%");
  }

  if (params.search) {
    query = query.or(`details.ilike.%${params.search}%,email.ilike.%${params.search}%,event_name.ilike.%${params.search}%`);
  }

  const { data, count, error } = await query;
  if (error) throw Error(error.message);
  return {
    logs: (data ?? []) as InteractionLog[],
    totalCount: count ?? 0,
  };
}
