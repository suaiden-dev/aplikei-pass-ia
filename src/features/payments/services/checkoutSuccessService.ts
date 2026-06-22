import { supabase } from "@shared/lib/supabase";

type OrderPaymentMetadata = {
  proc_id?: string | null;
  parent_process_id?: string | null;
};

type OrderRow = {
  payment_metadata: OrderPaymentMetadata | null;
  current_step?: number | null;
  status?: string | null;
  step_data?: Record<string, unknown> | null;
};

export async function getCurrentAuthUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user?.id ?? null;
}

export async function fetchOrderProcessId(orderId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("orders")
    .select("payment_metadata")
    .eq("id", orderId)
    .maybeSingle();

  if (error) throw Error(error.message);
  const metadata = (data as OrderRow | null)?.payment_metadata;
  return String(metadata?.proc_id || metadata?.parent_process_id || "").trim() || null;
}

export async function findActiveMentorshipProcess(params: {
  userId: string;
  serviceSlugs: string[];
  parentProcessId?: string | null;
}): Promise<string | null> {
  let query = supabase
    .from("user_services")
    .select("id")
    .eq("user_id", params.userId)
    .in("service_slug", params.serviceSlugs)
    .eq("status", "active");

  if (params.parentProcessId) {
    query = query.contains("step_data", { parent_process_id: params.parentProcessId });
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw Error(error.message);
  return String((data as Record<string, unknown> | null)?.id || "").trim() || null;
}

export async function fetchUserServiceCheckoutState(processId: string): Promise<{
  service_slug?: string;
  current_step?: number;
  step_data?: Record<string, unknown>;
  status?: string;
} | null> {
  const { data, error } = await supabase
    .from("user_services")
    .select("service_slug,current_step,step_data,status")
    .eq("id", processId)
    .maybeSingle();

  if (error) throw Error(error.message);
  return data as {
    service_slug?: string;
    current_step?: number;
    step_data?: Record<string, unknown>;
    status?: string;
  } | null;
}

export async function updateUserServiceAfterCheckout(params: {
  processId: string;
  currentStep: number;
  stepData: Record<string, unknown>;
}): Promise<void> {
  const { error } = await supabase
    .from("user_services")
    .update({
      current_step: params.currentStep,
      status: "active",
      step_data: params.stepData,
    })
    .eq("id", params.processId);

  if (error) throw Error(error.message);
}
