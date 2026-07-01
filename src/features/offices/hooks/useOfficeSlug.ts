import { useQuery } from "@tanstack/react-query";
import { supabase } from "@shared/lib/supabase";

export function useOfficeSlug(officeId?: string | null) {
  return useQuery({
    queryKey: ["office", "slug", officeId],
    queryFn: async () => {
      const { data } = await supabase
        .from("offices")
        .select("slug")
        .eq("id", officeId!)
        .single();
      return data?.slug ?? null;
    },
    enabled: !!officeId,
    staleTime: 10 * 60 * 1000,
  });
}
