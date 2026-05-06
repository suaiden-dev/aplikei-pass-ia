import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../shared/lib/supabase";
import { toast } from "sonner";
import type { PaymentMethodConfig } from "../types";

export function usePaymentSettings(userId?: string) {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["payment-settings", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("admin_lawyer_payment_methods")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;
      return data as PaymentMethodConfig[];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    placeholderData: [],
  });

  const upsertSetting = useMutation({
    mutationFn: async (setting: Partial<PaymentMethodConfig>) => {
      if (!userId) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("admin_lawyer_payment_methods")
        .upsert({
          ...setting,
          user_id: userId,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id,provider"
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-settings", userId] });
    },
  });

  return {
    settings,
    isLoading,
    saveSetting: upsertSetting.mutateAsync,
    isSaving: upsertSetting.isPending,
  };
}
