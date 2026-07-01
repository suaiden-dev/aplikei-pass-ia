import * as React from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowUpCircle, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Loader2,
  DollarSign,
  Calendar,
  Filter,
  Settings
} from "lucide-react";
import { hasOfficeWithdrawalMethod } from "@features/admin/services/paymentSettingsService";
import { listOfficeWithdrawals } from "@features/admin/services/withdrawalsService";
import type { Withdrawal } from "@features/admin/types";
import { useAuth } from "@shared/hooks/useAuth";
import { Button } from "@shared/components/atoms/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/components/atoms/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/atoms/select";
import { DashboardPageHeader } from "@shared/components/organisms/DashboardUI";
import { Badge } from "@shared/components/atoms/badge";
import { toast } from "sonner";
import { useT } from "@app/app/i18n";
import { useOfficeOverview } from "@features/offices/hooks/useOfficeOverview";
import { WithdrawalModal } from "@features/admin/components/WithdrawalModal";

type WithdrawalHistoryFilter = "all" | "pending" | "approved" | "rejected";

function normalizeWithdrawalStatus(rawStatus: string | null | undefined): WithdrawalHistoryFilter | "other" {
  const status = String(rawStatus || "").toLowerCase();

  if (status === "pending") return "pending";
  if (status === "completed" || status === "approved" || status === "paid" || status === "processing") return "approved";
  if (status === "rejected" || status === "cancelled" || status === "canceled") return "rejected";

  return "other";
}

function getWithdrawalStatusMeta(rawStatus: string | null | undefined) {
  const status = normalizeWithdrawalStatus(rawStatus);

  if (status === "approved") {
    return {
      iconClass: "bg-green-500/10 text-green-600",
      badgeClass: "bg-green-500/10 text-green-700 border-green-200",
    };
  }

  if (status === "pending") {
    return {
      iconClass: "bg-amber-500/10 text-amber-600",
      badgeClass: "bg-amber-500/10 text-amber-700 border-amber-200",
    };
  }

  if (status === "rejected") {
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
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [loadingSettings, setLoadingSettings] = React.useState(true);
  const [withdrawals, setWithdrawals] = React.useState<Withdrawal[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [hasWithdrawalMethod, setHasWithdrawalMethod] = React.useState(false);
  const [historyFilter, setHistoryFilter] = React.useState<WithdrawalHistoryFilter>("all");

  const { data: officeStats } = useOfficeOverview();

  const pendingBalance = withdrawals
    .filter(w => w.status === 'pending')
    .reduce((sum, w) => sum + w.amount, 0);

  const totalWithdrawn = withdrawals
    .filter((w) => normalizeWithdrawalStatus(w.status) === "approved")
    .reduce((sum, w) => sum + w.amount, 0);

  const filteredWithdrawals = React.useMemo(() => {
    if (historyFilter === "all") return withdrawals;
    return withdrawals.filter((withdrawal) => normalizeWithdrawalStatus(withdrawal.status) === historyFilter);
  }, [historyFilter, withdrawals]);

  const fetchWithdrawals = React.useCallback(async () => {
    if (!user?.officeId) return;
    
    try {
      setWithdrawals(await listOfficeWithdrawals(user.officeId));
    } catch (err: unknown) {
      toast.error(t.withdrawals.messages.loadError);
    } finally {
      setLoading(false);
    }
  }, [user?.officeId]);

  React.useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  const fetchPayoutSettings = React.useCallback(async () => {
    if (!user?.officeId) {
      setLoadingSettings(false);
      setHasWithdrawalMethod(false);
      return;
    }

    try {
      setHasWithdrawalMethod(await hasOfficeWithdrawalMethod(user.officeId));
    } catch {
      setHasWithdrawalMethod(false);
    } finally {
      setLoadingSettings(false);
    }
  }, [user?.officeId]);

  React.useEffect(() => {
    fetchPayoutSettings();
  }, [fetchPayoutSettings]);

  const fmtCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="space-y-6 max-w-6xl pb-10">
      <DashboardPageHeader
        eyebrow={t.nav.billings}
        title={t.nav.withdrawals}
        description={t.withdrawals.subtitle}
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-primary/5 border-primary/10 shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="text-primary/70">{t.withdrawals.availableForPayout}</CardDescription>
            <CardTitle className="text-3xl font-black text-primary">
              {fmtCurrency(officeStats?.availableBalance ?? 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => {
                if (hasWithdrawalMethod) {
                  setIsModalOpen(true);
                } else {
                  navigate("/admin/settings/payout");
                }
              }}
              disabled={loadingSettings}
              className="w-full rounded-xl bg-primary shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
            >
              {loadingSettings ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : hasWithdrawalMethod ? (
                <Plus className="mr-2 h-4 w-4" />
              ) : (
                <Settings className="mr-2 h-4 w-4" />
              )}
              {hasWithdrawalMethod ? t.withdrawals.requestBtn : t.withdrawals.configureBtn}
            </Button>
            {!loadingSettings && !hasWithdrawalMethod && (
              <p className="mt-3 text-xs font-medium text-text-muted">
                {t.withdrawals.configureHint}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-bg-subtle/50 border-border/50 shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>{t.withdrawals.pendingRequests}</CardDescription>
            <CardTitle className="text-3xl font-black">{fmtCurrency(pendingBalance)}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-text-muted text-sm">
            <Clock className="h-4 w-4" /> {t.withdrawals.activeRequests.replace("{{count}}", String(withdrawals.filter(w => w.status === 'pending').length))}
          </CardContent>
        </Card>

        <Card className="bg-bg-subtle/50 border-border/50 shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>{t.withdrawals.totalWithdrawn}</CardDescription>
            <CardTitle className="text-3xl font-black">{fmtCurrency(totalWithdrawn)}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-text-muted text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-500" /> {t.withdrawals.allTimePayouts}
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
              <CardTitle className="text-lg uppercase tracking-tight">{t.withdrawals.historyTitle}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-text-muted" />
              <Select value={historyFilter} onValueChange={(value) => setHistoryFilter(value as WithdrawalHistoryFilter)}>
                <SelectTrigger className="h-9 w-[150px] rounded-lg bg-card px-3">
                  <SelectValue placeholder={t.withdrawals.filterPlaceholder} />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="all">{t.withdrawals.filters.all}</SelectItem>
                  <SelectItem value="pending">{t.withdrawals.filters.pending}</SelectItem>
                  <SelectItem value="approved">{t.withdrawals.filters.approved}</SelectItem>
                  <SelectItem value="rejected">{t.withdrawals.filters.rejected}</SelectItem>
                </SelectContent>
              </Select>
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
              <h3 className="text-lg font-bold">{t.withdrawals.empty.title}</h3>
              <p className="text-text-muted max-w-xs mx-auto mb-6">
                {t.withdrawals.empty.subtitle}
              </p>
              <Button variant="outline" className="rounded-xl px-8">
                {t.withdrawals.empty.learnMore}
              </Button>
            </div>
          ) : filteredWithdrawals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="h-16 w-16 rounded-full bg-bg-subtle flex items-center justify-center mb-4">
                <Filter className="h-8 w-8 text-text-muted/30" />
              </div>
              <h3 className="text-lg font-bold">{t.withdrawals.emptyFiltered.title}</h3>
              <p className="text-text-muted max-w-xs mx-auto">
                {t.withdrawals.emptyFiltered.subtitle}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredWithdrawals.map((withdrawal) => (
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
                      {t.withdrawals.status[withdrawal.status.toLowerCase() as keyof typeof t.withdrawals.status] || withdrawal.status.toUpperCase()}
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
