import { supabase } from "@shared/lib/supabase";

export async function fetchOfficeNameMap(officeIds: string[]): Promise<Record<string, string>> {
  if (officeIds.length === 0) return {};

  const { data, error } = await supabase
    .from("offices")
    .select("id, name")
    .in("id", officeIds);

  if (error) throw Error(error.message);

  const map: Record<string, string> = {};
  (data ?? []).forEach((row: { id: string; name: string | null }) => {
    map[row.id] = row.name ?? "Office";
  });
  return map;
}
