import * as React from "react";
import { 
  ArrowUpCircle, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Loader2,
  DollarSign,
  Calendar,
  Filter
} from "lucide-react";
import { supabase } from "@shared/lib/supabase";
import { useAuth } from "@shared/hooks/useAuth";
import { Button } from "@shared/components/atoms/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/components/atoms/card";
import { DashboardPageHeader } from "@shared/components/organisms/DashboardUI";
import { Badge } from "@shared/components/atoms/badge";
import { toast } from "sonner";
import { useT } from "@app/app/i18n";
import { useOfficeOverview } from "@features/offices/hooks/useOfficeOverview";
import { WithdrawalModal } from "@features/admin/components/WithdrawalModal";

interface Withdrawal {
  id: string;
  amount: number;
  status: 'pending' | 'completed' | 'approved' | 'processing' | 'paid' | 'cancelled';
  method: 'stripe' | 'zelle';
  created_at: string;
  completed_at: string | null;
  payment_link?: string;
}

function getWithdrawalStatusMeta(rawStatus: string | null | undefined) {
  const status = String(rawStatus || "").toLowerCase();

  const isApproved = status === "completed" || status === "approved" || status === "paid" || status === "processing";
  const isPending = status === "pending";
  const isRejected = status === "rejected" || status === "cancelled" || status === "canceled";

  if (isApproved) {
    return {
      iconClass: "bg-green-500/10 text-green-600",
      badgeClass: "bg-green-500/10 text-green-700 border-green-200",
    };
  }

  if (isPending) {
    return {
      iconClass: "bg-amber-500/10 text-amber-600",
      badgeClass: "bg-amber-500/10 text-amber-700 border-amber-200",
    };
  }

  if (isRejected) {
    return {
      iconClass: "bg-red-500/10 text-red-600",
      badgeClass: "bg-red-500/10 text-red-700 border-red-200",
    };
  }

  return {
    iconClass: "bg-red-500/10 text-red-600",
    badgeClass: "bg-red-500/10 text-red-700 border-red-200",
  };
}

export default function WithdrawalsPage() {
  const t = useT("admin");
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [withdrawals, setWithdrawals] = React.useState<Withdrawal[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const { data: officeStats } = useOfficeOverview();

  const pendingBalance = withdrawals
    .filter(w => w.status === 'pending')
    .reduce((sum, w) => sum + w.amount, 0);

  const totalWithdrawn = withdrawals
    .filter((w) => {
      const status = String(w.status || "").toLowerCase();
      return status === "completed" || status === "approved" || status === "paid" || status === "processing";
    })
    .reduce((sum, w) => sum + w.amount, 0);

  const fetchWithdrawals = React.useCallback(async () => {
    if (!user?.officeId) return;
    
    try {
      const { data, error } = await supabase
        .from("office_withdrawals")
        .select("*")
        .eq("office_id", user.officeId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setWithdrawals(data);
      }
    } catch (err) {
      console.error("Error fetching withdrawals:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.officeId]);

  React.useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  const fmtCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="space-y-6 max-w-6xl pb-10">
      <DashboardPageHeader
        eyebrow={t.nav.billings}
        title={t.nav.withdrawals}
        description="Manage your payouts and withdrawal requests"
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-primary/5 border-primary/10 shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="text-primary/70">Available for Payout</CardDescription>
            <CardTitle className="text-3xl font-black text-primary">
              {fmtCurrency(officeStats?.availableBalance ?? 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="w-full rounded-xl bg-primary shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
            >
              <Plus className="mr-2 h-4 w-4" /> Request Withdrawal
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-bg-subtle/50 border-border/50 shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>Pending Requests</CardDescription>
            <CardTitle className="text-3xl font-black">{fmtCurrency(pendingBalance)}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-text-muted text-sm">
            <Clock className="h-4 w-4" /> {withdrawals.filter(w => w.status === 'pending').length} active requests
          </CardContent>
        </Card>

        <Card className="bg-bg-subtle/50 border-border/50 shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>Total Withdrawn</CardDescription>
            <CardTitle className="text-3xl font-black">{fmtCurrency(totalWithdrawn)}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-text-muted text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-500" /> All-time payouts
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-bg-subtle/30 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg-subtle text-text">
                <Calendar className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg uppercase tracking-tight">Withdrawal History</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="rounded-lg h-9">
                <Filter className="mr-2 h-4 w-4" /> Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="h-20 w-20 rounded-full bg-bg-subtle flex items-center justify-center mb-4">
                <DollarSign className="h-10 w-10 text-text-muted/30" />
              </div>
              <h3 className="text-lg font-bold">No withdrawals yet</h3>
              <p className="text-text-muted max-w-xs mx-auto mb-6">
                Your withdrawal requests and payout history will appear here once you start receiving funds.
              </p>
              <Button variant="outline" className="rounded-xl px-8">
                Learn more about payouts
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {withdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="p-6 flex items-center justify-between hover:bg-bg-subtle/30 transition-colors">
                  {(() => {
                    const meta = getWithdrawalStatusMeta(withdrawal.status);
                    return (
                      <>
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${meta.iconClass}`}>
                      <ArrowUpCircle className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-lg">{fmtCurrency(withdrawal.amount)}</p>
                      <p className="text-xs text-text-muted uppercase font-medium">
                        {withdrawal.method} • {new Date(withdrawal.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <Badge className={meta.badgeClass}>
                      {withdrawal.status.toUpperCase()}
                    </Badge>
                  </div>
                      </>
                    );
                  })()}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {user?.officeId && (
        <WithdrawalModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            fetchWithdrawals();
          }}
          availableBalance={officeStats?.availableBalance ?? 0}
          officeId={user.officeId}
          userId={user.id}
        />
      )}
    </div>
  );
}
