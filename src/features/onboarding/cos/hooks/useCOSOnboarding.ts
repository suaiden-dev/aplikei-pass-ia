import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../../shared/lib/supabase";
import type { UserService } from "../../../process/types";

async function fetchCOSProcess(
  userId: string,
  slug: string,
  parentId?: string | null,
): Promise<UserService | null> {
  if (parentId) {
    const { data } = await supabase
      .from("user_services")
      .select("*")
      .eq("id", parentId)
      .single();
    if (!data || data.user_id !== userId) return null;
    return data as UserService;
  }

  const { data } = await supabase
    .from("user_services")
    .select("*")
    .eq("user_id", userId)
    .eq("service_slug", slug)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data as UserService) ?? null;
}

export function useCOSOnboarding(
  userId: string | undefined,
  slug: string,
  parentId?: string | null,
) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["cos-process", userId, slug, parentId],
    enabled: !!userId && !!slug,
    staleTime: 0,
    queryFn: () => fetchCOSProcess(userId!, slug, parentId),
  });

  const refetch = () =>
    queryClient.invalidateQueries({ queryKey: ["cos-process", userId, slug, parentId] });

  return { ...query, refetch };
}
