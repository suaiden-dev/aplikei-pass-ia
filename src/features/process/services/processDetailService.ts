import { supabase } from "@shared/lib/supabase";
import type { UserService } from "@shared/types/process.model";

interface ProcessOfficeBrand {
  name?: string | null;
  logo_url?: string | null;
  landing_page_config?: { logoUrl?: string | null } | null;
}

export async function fetchCustomerProcessById(
  processId: string,
  userId: string,
  isAllowedService: (serviceSlug: string) => boolean,
): Promise<UserService | null> {
  const { data, error } = await supabase
    .from("user_services")
    .select("*")
    .eq("id", processId)
    .single();

  if (error || !data) return null;
  if (data.user_id !== userId || !isAllowedService(data.service_slug)) return null;
  return data as UserService;
}

export async function fetchLatestCustomerProcess(
  userId: string,
  serviceSlugs: string[],
): Promise<UserService | null> {
  const { data } = await supabase
    .from("user_services")
    .select("*")
    .eq("user_id", userId)
    .in("service_slug", serviceSlugs)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data as UserService | null) ?? null;
}

export async function fetchProcessOfficeBrand(officeId: string): Promise<ProcessOfficeBrand | null> {
  const { data } = await supabase
    .from("offices")
    .select("name, logo_url, landing_page_config")
    .eq("id", officeId)
    .single();

  return (data as ProcessOfficeBrand | null) ?? null;
}

export async function fetchCustomerProcessWithOffice(params: {
  processId?: string | null;
  userId: string;
  userOfficeId?: string | null;
  serviceSlugs: string[];
  isAllowedService: (serviceSlug: string) => boolean;
}): Promise<UserService | null> {
  const process = params.processId
    ? await fetchCustomerProcessById(params.processId, params.userId, params.isAllowedService)
    : await fetchLatestCustomerProcess(params.userId, params.serviceSlugs);

  if (!process) return null;

  const officeIdToFetch = process.office_id || params.userOfficeId;
  if (!officeIdToFetch) return process;

  const office = await fetchProcessOfficeBrand(officeIdToFetch);
  if (!office) return process;

  return {
    ...process,
    officeName: office.name ?? undefined,
    officeLogoUrl: office.logo_url || office.landing_page_config?.logoUrl || undefined,
  };
}

export async function fetchCustomerChildProcess(
  childId: string,
  userId: string,
  parentProcessId: string,
): Promise<UserService | null> {
  const { data, error } = await supabase
    .from("user_services")
    .select("*")
    .eq("id", childId)
    .maybeSingle();

  if (error || !data) return null;
  if (data.user_id !== userId) return null;

  const parentId = String((data.step_data as Record<string, unknown> | null)?.parent_process_id || "").trim();
  if (parentId && parentId !== parentProcessId) return null;

  return data as UserService;
}

export async function fetchCustomerRecoveryChildren(
  parentProcessId: string,
  userId: string,
): Promise<UserService[]> {
  const { data, error } = await supabase
    .from("user_services")
    .select("*")
    .eq("user_id", userId)
    .contains("step_data", { parent_process_id: parentProcessId })
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as UserService[];
}

export function subscribeToProcessChanges(
  processId: string,
  onChange: () => void,
): () => void {
  const channel = supabase
    .channel(`process-realtime-${processId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "user_services",
        filter: `id=eq.${processId}`,
      },
      onChange,
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
