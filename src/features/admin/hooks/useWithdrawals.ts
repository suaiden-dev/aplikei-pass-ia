import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@shared/lib/supabase";
import { toast } from "sonner";
import { notifyMaster } from "@features/notifications/services/notify";

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
  const queryClient = useQueryClient();

  const { data: withdrawals, isLoading } = useQuery({
    queryKey: ["office-withdrawals", officeId],
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
        title: "Nova requisicao de saque",
        body: `Uma office solicitou saque de $${Number(created?.amount || 0).toFixed(2)}.`,
        serviceId: created?.id,
        link: "/payments?tab=office_requests",
        metadata: {
          office_id: created?.office_id,
          withdrawal_id: created?.id,
          method: created?.method,
        },
      });
      queryClient.invalidateQueries({ queryKey: ["office-withdrawals", officeId] });
      queryClient.invalidateQueries({ queryKey: ["office-overview-stats", officeId] });
      toast.success("Withdrawal request created successfully!");
    },
    onError: (error: any) => {
      console.error("Error creating withdrawal:", error);
      toast.error(error.message || "Error creating withdrawal request.");
    }
  });

  return {
    withdrawals,
    isLoading,
    createWithdrawal: createWithdrawal.mutateAsync,
    isCreating: createWithdrawal.isPending,
  };
}
