import { supabase } from "@shared/lib/supabase";

export async function fetchProcessStepData(processId: string): Promise<Record<string, unknown> | null> {
  const { data, error } = await supabase
    .from("user_services")
    .select("step_data")
    .eq("id", processId)
    .maybeSingle();

  if (error) throw Error(error.message);
  return data?.step_data && typeof data.step_data === "object"
    ? (data.step_data as Record<string, unknown>)
    : null;
}

export async function fetchPaidDependentSlots(instanceId: string): Promise<number> {
  const { data, error } = await supabase
    .schema("aplikei")
    .from("user_product_instances")
    .select("metadata")
    .eq("id", instanceId)
    .maybeSingle();

  if (error) throw Error(error.message);

  const paid = (data?.metadata as Record<string, unknown> | null | undefined)?.paid_dependents;
  return typeof paid === "number" ? paid : parseInt(String(paid ?? "0"), 10);
}
