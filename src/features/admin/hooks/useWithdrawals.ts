import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@shared/lib/supabase";
import { toast } from "sonner";
import { notifyMaster } from "@features/notifications/services/notify";
import { useT } from "@app/app/i18n";
import { adminQueryKeys } from "@features/admin/lib/queryKeys";

export interface WithdrawalRequest {
  id?: string;
  office_id: string;
  amount: number;
  method: 'stripe' | 'zelle';
  payment_link?: string;
  status?: 'pending' | 'completed' | 'cancelled';
  created_at?: string;
}

export function useWithdrawals(officeId?: string) {
  const t = useT("admin");
  const queryClient = useQueryClient();

  const { data: withdrawals, isLoading } = useQuery({
    queryKey: adminQueryKeys.officeWithdrawals(officeId),
    queryFn: async () => {
      if (!officeId) return [];
      const { data, error } = await supabase
        .from("office_withdrawals")
        .select("*")
        .eq("office_id", officeId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as WithdrawalRequest[];
    },
    enabled: !!officeId,
  });

  const createWithdrawal = useMutation({
    mutationFn: async (request: WithdrawalRequest) => {
      const { data, error } = await supabase.functions.invoke("withdrawals", {
        body: {
          action: "request",
          office_id: request.office_id,
          amount: request.amount,
          method: request.method,
          payment_link: request.payment_link ?? null,
        },
      });

      if (error) throw error;
      if (!data?.success || !data?.withdrawal) {
        throw new Error(data?.error || "Error creating withdrawal request.");
      }
      return data.withdrawal as WithdrawalRequest;
    },
    onSuccess: async (created) => {
      await notifyMaster({
        link: "/payments?tab=office_requests",
        category: "billing",
        action: "withdrawal_requested",
        metadata: {
          office_id: created?.office_id,
          amount: Number(created?.amount || 0).toFixed(2),
          withdrawal_id: created?.id,
          method: created?.method,
        },
      }).catch(err => console.warn("[withdrawals] Notification failed but request was created:", err));
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.officeWithdrawals(officeId) });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.officeOverviewStats(officeId) });
      toast.success(t.payoutSettings.messages.requestCreated);
    },
    onError: (error: Error) => {
      toast.error(error.message || t.payoutSettings.messages.saveError);
    }
  });

  return {
    withdrawals,
    isLoading,
    createWithdrawal: createWithdrawal.mutateAsync,
    isCreating: createWithdrawal.isPending,
  };
}
