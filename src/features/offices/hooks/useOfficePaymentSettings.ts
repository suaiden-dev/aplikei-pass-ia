import { useQuery } from "@tanstack/react-query";
import { supabase } from "@shared/lib/supabase";
import type { OfficePaymentSettings } from "@features/offices/types/office";

export function useOfficePaymentSettings(officeId?: string) {
  return useQuery({
    queryKey: ["office-payment-settings", officeId],
    queryFn: async () => {
      if (!officeId) return null;
      const { data, error } = await supabase
        .from("office_payment_settings")
        .select("*")
        .eq("office_id", officeId)
        .maybeSingle();

      if (error) throw error;
      return data as OfficePaymentSettings;
    },
    enabled: !!officeId,
  });
}
