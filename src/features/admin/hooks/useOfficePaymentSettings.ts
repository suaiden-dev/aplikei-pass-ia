import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../shared/lib/supabase";

export interface OfficePaymentSettings {
  id: string;
  office_id: string;
  default_payout_method: 'stripe' | 'zelle';
  zelle_name: string | null;
  zelle_identifier: string | null;
  stripe_payment_link?: string;
  zelle_payment_link?: string;
}

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
