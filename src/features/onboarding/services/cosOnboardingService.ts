import { getSessionSafe, supabase } from "@shared/lib/supabase";
import type { UserService } from "@features/process/types";

export interface CheckoutAccountContact {
  email: string;
  fullName: string;
  phone: string;
}

export async function fetchUserAccountContact(userId: string): Promise<Partial<CheckoutAccountContact>> {
  const { data, error } = await supabase
    .from("user_accounts")
    .select("email, name, phone")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw Error(error.message);

  return {
    email: data?.email ?? "",
    fullName: data?.name ?? "",
    phone: data?.phone ?? "",
  };
}

export async function fetchActiveServicePrice(
  serviceIds: string[],
  fallbackAmount: number,
): Promise<number> {
  const { data, error } = await supabase
    .from("services_prices")
    .select("price")
    .in("service_id", serviceIds)
    .eq("is_active", true)
    .limit(1);

  if (error) throw Error(error.message);

  const parsedPrice = Number(data?.[0]?.price);
  return Number.isFinite(parsedPrice) && parsedPrice > 0 ? parsedPrice : fallbackAmount;
}

export async function fetchCosProcessById(
  processId: string,
  userId: string,
): Promise<UserService | null> {
  const { data, error } = await supabase
    .from("user_services")
    .select("*")
    .eq("id", processId)
    .single();

  if (error) throw Error(error.message);
  return data && data.user_id === userId ? (data as UserService) : null;
}

export async function fetchLatestCosProcess(
  userId: string,
  serviceSlug: string,
): Promise<UserService | null> {
  const { data, error } = await supabase
    .from("user_services")
    .select("*")
    .eq("user_id", userId)
    .eq("service_slug", serviceSlug)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw Error(error.message);
  return (data as UserService | null) ?? null;
}

export async function fetchValidChildRecoveryProcess(
  childProcessId: string,
  userId: string,
  parentProcessId: string,
): Promise<UserService | null> {
  const child = await fetchCosProcessById(childProcessId, userId);
  if (!child) return null;

  const childParentId = String((child.step_data as Record<string, unknown> | null)?.parent_process_id || "");
  return childParentId === parentProcessId ? child : null;
}

export async function fetchCurrentUserId(): Promise<string | null> {
  const session = await getSessionSafe();
  return session?.user?.id ?? null;
}
