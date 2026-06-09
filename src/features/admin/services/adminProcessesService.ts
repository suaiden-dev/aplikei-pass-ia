import { supabase } from "@shared/lib/supabase";
import type { UserService } from "@features/process/types";

export interface ProcessLog {
  id: string;
  user_service_id: string;
  actor_id?: string;
  actor_name?: string;
  actor_role?: string;
  action_type?: string;
  action?: string;
  message?: string;
  previous_step?: number;
  new_step?: number;
  previous_status?: string;
  new_status?: string;
  created_at: string;
}

export interface AdminProcessWithUser extends UserService {
  user_accounts?: {
    full_name: string;
    email?: string;
  };
  service_name?: string;
}

export async function listProcessLogs(serviceId: string): Promise<ProcessLog[]> {
  const { data, error } = await supabase
    .from("process_logs")
    .select("*")
    .eq("user_service_id", serviceId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) throw Error(error.message);
  return (data ?? []) as ProcessLog[];
}

async function fetchAccountOfficeId(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("user_accounts")
    .select("office_id")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw Error(error.message);
  return data?.office_id ?? null;
}

async function fetchOfficeScopedProcesses(officeId: string): Promise<AdminProcessWithUser[]> {
  const [officeServicesRes, officeCustomersRes] = await Promise.all([
    supabase
      .from("user_services")
      .select("*")
      .eq("office_id", officeId)
      .order("created_at", { ascending: false }),
    supabase
      .from("office_customers" as any)
      .select("user_id")
      .eq("office_id", officeId),
  ]);

  if (officeServicesRes.error) throw Error(officeServicesRes.error.message);
  if (officeCustomersRes.error) throw Error(officeCustomersRes.error.message);

  const direct = (officeServicesRes.data ?? []) as AdminProcessWithUser[];
  const customerUserIds = Array.from(
    new Set(
      ((officeCustomersRes.data ?? []) as Array<{ user_id: string }>)
        .map((row) => row.user_id)
        .filter(Boolean),
    ),
  );

  let byCustomer: AdminProcessWithUser[] = [];
  if (customerUserIds.length > 0) {
    const { data, error } = await supabase
      .from("user_services")
      .select("*")
      .in("user_id", customerUserIds)
      .order("created_at", { ascending: false });
    if (error) throw Error(error.message);
    byCustomer = (data ?? []) as AdminProcessWithUser[];
  }

  const mergedById = new Map<string, AdminProcessWithUser>();
  [...direct, ...byCustomer].forEach((process) => {
    mergedById.set(process.id, process);
  });

  return Array.from(mergedById.values()).sort(
    (a, b) =>
      new Date(b.created_at || 0).getTime() -
      new Date(a.created_at || 0).getTime(),
  );
}

async function fetchAllProcesses(): Promise<AdminProcessWithUser[]> {
  const { data, error } = await supabase
    .from("user_services")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw Error(error.message);
  return (data ?? []) as AdminProcessWithUser[];
}

export async function listAdminProcesses(params: {
  userId?: string;
  userRole?: string | null;
  officeId?: string | null;
  defaultClientName: string;
}): Promise<AdminProcessWithUser[]> {
  let officeId = params.officeId ?? null;

  if (!officeId && params.userId) {
    officeId = await fetchAccountOfficeId(params.userId);
  }

  if (params.userRole === "admin_lawyer" && !officeId) {
    return [];
  }

  const base =
    officeId && params.userRole !== "master"
      ? await fetchOfficeScopedProcesses(officeId)
      : await fetchAllProcesses();

  const userIds = [...new Set(base.map((process) => process.user_id).filter(Boolean))];
  const slugs = [...new Set(base.map((process) => process.service_slug).filter(Boolean))];

  const [usersResult, servicesResult] = await Promise.all([
    userIds.length > 0
      ? supabase.from("profiles").select("id, full_name, email").in("id", userIds)
      : Promise.resolve({ data: [], error: null }),
    slugs.length > 0
      ? supabase.from("services").select("slug, name").in("slug", slugs)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (usersResult.error) throw Error(usersResult.error.message);
  if (servicesResult.error) throw Error(servicesResult.error.message);

  const usersById = Object.fromEntries(
    ((usersResult.data as Array<{ id: string; full_name?: string | null; email?: string | null }>) || [])
      .map((user) => [
        user.id,
        {
          full_name: user.full_name || params.defaultClientName,
          email: user.email || undefined,
        },
      ]),
  );

  const serviceNameBySlug = Object.fromEntries(
    ((servicesResult.data as Array<{ slug: string; name: string }>) || [])
      .map((service) => [service.slug, service.name]),
  );

  return base.map((process) => ({
    ...process,
    user_accounts: usersById[process.user_id],
    service_name: serviceNameBySlug[process.service_slug],
  }));
}
