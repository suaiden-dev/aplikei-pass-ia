import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
    RiSearchLine,
    RiTimeLine,
    RiArrowUpSLine,
    RiArrowDownSLine,
    RiExpandUpDownLine,
    RiShoppingBag3Line,
    RiInformationLine,
    RiUser3Line,
    RiBuilding2Line,
    RiMoneyDollarCircleLine,
} from "react-icons/ri";
import { supabase } from "@shared/lib/supabase";
import * as paymentService from "@features/payments/lib/paymentOps";
import * as notificationService from "@features/notifications/services/notify";
import { useT } from "@app/app/i18n";
import { Button } from "@shared/components/atoms/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@shared/components/atoms/dialog";
import { cn } from "@shared/utils/cn";
import { useAuth } from "@shared/hooks/useAuth";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "zelle" | "office_requests" | "approved_payments";

interface UnifiedPayment {
    id: string;
    source: "zelle" | "stripe" | "order" | "withdrawal";
    clientName: string;
    clientEmail: string;
    serviceName: string;
    serviceSlug: string;
    amount: number;
    officeNetAmount?: number;
    platformFeeAmount?: number;
    method: string;
    createdAt: string;
    officeName?: string;
    officeId?: string;
    status: string;
    // Zelle-only
    zelleId?: string;
    proofUrl?: string | null;
    confirmationCode?: string | null;
    adminNotes?: string | null;
    paymentLink?: string | null;
    reviewedByName?: string | null;
    zelleName?: string | null;
    zelleIdentifier?: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

function buildProofUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (raw.startsWith("http")) return raw;
  return `${SUPABASE_URL}/storage/v1/object/public/zelle_comprovantes/${raw}`;
}

function normalizeExternalUrl(raw: string): string {
  const value = raw.trim();
  if (!value) return "#";
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

function fmtCurrency(n: number) {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function computeProcessingFee(gross: number, method: string): number {
  const m = method.toUpperCase();
  if (m.includes("ZELLE")) return 0;
  if (m.includes("PIX")) return Math.round(gross * 0.01 * 100) / 100;
  // Stripe card: 2.9% + $0.30
  return Math.round((gross * 0.029 + 0.30) * 100) / 100;
}

// ─── Components ───────────────────────────────────────────────────────────────

function DetailModal({
  payment,
  onClose,
  onApprove,
  onReject,
  busy,
  onPay
}: {
  payment: UnifiedPayment;
  onClose: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  busy?: boolean;
  onPay?: () => void;
}) {
  const t = useT("admin");
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl border-border bg-card p-0 overflow-hidden text-left">
        <DialogHeader className="p-6 border-b border-border bg-bg-subtle/50">
          <DialogTitle className="text-xl font-black text-text flex items-center gap-3 uppercase">
            <RiInformationLine className="text-primary" />
            {t.payments.modals.detailsTitle}
          </DialogTitle>
          <DialogDescription className="text-xs text-text-muted">
            {payment.id} · {new Date(payment.createdAt).toLocaleString("en-US")}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-bg-subtle border border-border space-y-1">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-1">
                <RiUser3Line /> {t.payments.table.customer}
              </p>
              <p className="text-sm font-black text-text">{payment.clientName}</p>
              <p className="text-xs text-text-muted">{payment.clientEmail}</p>
            </div>
            <div className="p-4 rounded-2xl bg-bg-subtle border border-border space-y-1">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-1">
                <RiBuilding2Line /> {t.offices.table.office}
              </p>
              <p className="text-sm font-black text-text">{payment.officeName || "—"}</p>
            </div>
            <div className="p-4 rounded-2xl bg-bg-subtle border border-border space-y-1">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-1">
                <RiShoppingBag3Line /> {t.payments.table.serviceName}
              </p>
              <p className="text-sm font-black text-text">{payment.serviceName}</p>
            </div>
            <div className="p-4 rounded-2xl bg-bg-subtle border border-border space-y-1">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-1">
                <RiMoneyDollarCircleLine /> {t.payments.table.payment}
              </p>
              <p className="text-lg font-black text-primary">{fmtCurrency(payment.amount)}</p>
              <p className="text-[10px] text-text-muted font-bold uppercase">{payment.method}</p>
            </div>
          </div>

          {payment.proofUrl && (
            <div className="space-y-2">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{t.payments.table.viewProof}</p>
              <div className="rounded-2xl border border-border overflow-hidden bg-bg-subtle">
                <a
                  href={payment.proofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block cursor-zoom-in"
                  title={t.payments.modals.openOriginal}
                >
                  <img src={payment.proofUrl} alt="Proof" className="w-full h-auto max-h-96 object-contain" />
                </a>
              </div>
            </div>
          )}

          {payment.adminNotes && (
            <div className="p-4 rounded-2xl bg-danger/5 border border-danger/10 space-y-1">
              <p className="text-[10px] font-black text-danger uppercase tracking-widest">Notes</p>
              <p className="text-sm text-text-muted italic">"{payment.adminNotes}"</p>
            </div>
          )}

          {payment.source === "withdrawal" && payment.paymentLink && (
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-2">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest">Stripe Payment Link</p>
              <p className="text-xs font-bold text-primary break-all">{payment.paymentLink}</p>
              {onPay && (
                <Button
                  type="button"
                  onClick={onPay}
                  className="h-10 rounded-xl bg-primary text-white font-bold hover:bg-primary/90"
                >
                  Pagar
                </Button>
              )}
            </div>
          )}

                    {payment.source === "withdrawal" && payment.method.toLowerCase() === "zelle" && (
                        <div className="p-4 rounded-2xl bg-info/5 border border-info/10 space-y-2">
                            <p className="text-[10px] font-black text-info uppercase tracking-widest">Zelle do advogado</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Nome</p>
                                    <p className="text-sm font-black text-text">{payment.zelleName || "Não configurado"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Identificador</p>
                                    <p className="text-sm font-black text-text break-all">{payment.zelleIdentifier || "Não configurado"}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {payment.source === "withdrawal" && payment.reviewedByName && (
                        <div className="p-4 rounded-2xl bg-success/5 border border-success/10 space-y-1">
                            <p className="text-[10px] font-black text-success uppercase tracking-widest">Aprovado por</p>
                            <p className="text-sm font-black text-text">{payment.reviewedByName}</p>
                        </div>
                    )}
                </div>
                <div>
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Identificador</p>
                  <p className="text-sm font-black text-text break-all">{payment.zelleIdentifier || "Não configurado"}</p>
                </div>
              </div>
            </div>
          )}

          {payment.source === "withdrawal" && payment.reviewedByName && (
            <div className="p-4 rounded-2xl bg-success/5 border border-success/10 space-y-1">
              <p className="text-[10px] font-black text-success uppercase tracking-widest">Aprovado por</p>
              <p className="text-sm font-black text-text">{payment.reviewedByName}</p>
            </div>
          )}
        </div>

        {(onApprove || onReject) && (
          <DialogFooter className="p-6 border-t border-border bg-bg-subtle/30 gap-2">
            <Button variant="outline" onClick={onClose} className="rounded-xl h-12 flex-1 font-bold">
              {t.shared.cancel}
            </Button>
            {onReject && (
              <Button
                onClick={onReject}
                disabled={busy}
                variant="outline"
                className="rounded-xl h-12 flex-1 border-danger text-danger hover:bg-danger/5 font-bold"
              >
                {t.shared.rejection.confirm}
              </Button>
            )}
            {onApprove && (
              <Button
                onClick={onApprove}
                disabled={busy}
                className="rounded-xl h-12 flex-1 bg-success text-white shadow-xl shadow-success/20 font-bold hover:bg-success/90"
              >
                {busy ? t.shared.loading : t.shared.confirm}
              </Button>
            )}
          </DialogFooter>
        )}
        {!onApprove && !onReject && (
          <DialogFooter className="p-6 border-t border-border bg-bg-subtle/30">
            <Button onClick={onClose} className="rounded-xl h-12 w-full font-bold">
              {t.shared.back}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RevenuePage() {
  const t = useT("admin");
  const { user } = useAuth();
  const isMaster = user?.role === "master";
  const officeId = user?.officeId ?? null;
  const isAdminLawyer = user?.role === "admin_lawyer";
  const canAccessOfficeRequests = !isAdminLawyer;

  const [tab, setTab] = useState<Tab>(isAdminLawyer ? "approved_payments" : "zelle");
  const [search, setSearch] = useState("");
  const [officeRequestStatusFilter, setOfficeRequestStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [officeRequestPeriodFilter, setOfficeRequestPeriodFilter] = useState<"all" | "7d" | "30d" | "90d">("all");
  const [paymentsStatusFilter, setPaymentsStatusFilter] = useState<"all" | "approved" | "pending">("all");
  const [paymentsPeriodFilter, setPaymentsPeriodFilter] = useState<"all" | "7d" | "30d" | "90d">("all");
  const [payments, setPayments] = useState<UnifiedPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<UnifiedPayment | null>(null);
  const [confirmPayLink, setConfirmPayLink] = useState<string | null>(null);
  const ITEMS_PER_PAGE = 10;
  const [pageByTab, setPageByTab] = useState<Record<Tab, number>>({
    zelle: 1,
    office_requests: 1,
    approved_payments: 1,
  });

  const load = useCallback(async () => {
    setIsLoading(true);
    const results: UnifiedPayment[] = [];
    const officeNameById = new Map<string, string>();

    const resolveOfficeNames = async (rows: Array<{ office_id?: string | null }>) => {
      const officeIds = Array.from(
        new Set(rows.map((r) => r.office_id).filter((id): id is string => Boolean(id))),
      );
      if (officeIds.length === 0) return;
      const { data } = await supabase.from("offices").select("id, name").in("id", officeIds);
      (data ?? []).forEach((office: any) => {
        if (office?.id) officeNameById.set(office.id, office.name ?? "");
      });
    };

    if (tab === "zelle") {
      let zelleQuery = supabase
        .from("zelle_payments")
        .select("*")
        .eq("status", "pending_verification")
        .order("created_at", { ascending: false });

      if (!isMaster && officeId) {
        zelleQuery = zelleQuery.eq("office_id", officeId);
      }

      const { data: zelleData, error: zelleError } = await zelleQuery;

      if (zelleError) {
        console.error("[RevenuePage] Failed to load pending zelle payments:", zelleError);
      }

      await resolveOfficeNames((zelleData ?? []) as Array<{ office_id?: string | null }>);

      (zelleData ?? []).forEach((r: any) => {
        results.push({
          id: r.id,
          source: "zelle",
          zelleId: r.id,
          clientName: r.guest_name ?? "Guest",
          clientEmail: r.guest_email ?? "",
          serviceName: r.service_slug.replace(/-/g, " ").toUpperCase(),
          serviceSlug: r.service_slug,
          amount: r.amount,
          method: "Zelle",
          createdAt: r.created_at,
          officeName: r.office_id ? officeNameById.get(r.office_id) : undefined,
          officeId: r.office_id,
          status: r.status,
          proofUrl: buildProofUrl(r.image_url || r.proof_path),
          confirmationCode: r.confirmation_code,
        });
      });
    }

    if (tab === "office_requests") {
      let withdrawalsQuery = supabase
        .from("office_withdrawals")
        .select("*, offices(name)")
        .order("created_at", { ascending: false });

      if (!isMaster && officeId) {
        withdrawalsQuery = withdrawalsQuery.eq("office_id", officeId);
      }

      const { data: withdrawalsData } = await withdrawalsQuery;
      const withdrawalRows = (withdrawalsData ?? []) as Array<{
        id: string;
        office_id?: string | null;
        amount?: number | string | null;
        status?: string | null;
        method?: string | null;
        payment_method?: string | null;
        payment_link?: string | null;
        reviewed_by_name?: string | null;
        created_at: string;
        offices?: { name?: string | null } | null;
      }>;
      const withdrawalOfficeIds = Array.from(
        new Set(withdrawalRows.map((row) => row.office_id).filter((id): id is string => Boolean(id))),
      );
      const payoutSettingsByOfficeId = new Map<string, { zelle_name?: string | null; zelle_identifier?: string | null }>();

      if (withdrawalOfficeIds.length > 0) {
        const { data: payoutSettingsData, error: payoutSettingsError } = await supabase
          .from("office_payment_settings")
          .select("office_id, zelle_name, zelle_identifier")
          .in("office_id", withdrawalOfficeIds);

        if (payoutSettingsError) {
          console.error("[RevenuePage] Failed to load withdrawal payout settings:", payoutSettingsError);
        }

        (payoutSettingsData ?? []).forEach((settings: any) => {
          if (settings?.office_id) {
            payoutSettingsByOfficeId.set(settings.office_id, {
              zelle_name: settings.zelle_name ?? null,
              zelle_identifier: settings.zelle_identifier ?? null,
            });
          }
        });
      }

      withdrawalRows.forEach((r) => {
        const rawStatus = String(r.status || "").toLowerCase();
        const normalizedStatus =
          rawStatus === "completed" ? "approved" :
            rawStatus === "cancelled" ? "rejected" :
              rawStatus;
        const method = String(r.method || r.payment_method || "manual").toUpperCase();
        const payoutSettings = r.office_id ? payoutSettingsByOfficeId.get(r.office_id) : undefined;

        results.push({
          id: r.id,
          source: "withdrawal",
          clientName: r.offices?.name ?? "Office",
          clientEmail: "",
          serviceName: "WITHDRAWAL REQUEST",
          serviceSlug: "withdrawal_request",
          amount: Number(r.amount) || 0,
          method,
          createdAt: r.created_at,
          officeName: r.offices?.name ?? undefined,
          officeId: r.office_id ?? undefined,
          status: normalizedStatus,
          paymentLink: r.payment_link ?? null,
          reviewedByName: r.reviewed_by_name ?? null,
          zelleName: payoutSettings?.zelle_name ?? null,
          zelleIdentifier: payoutSettings?.zelle_identifier ?? null,
        });
      });
    }

    if (tab === "approved_payments") {
      let approvedOrdersQuery = supabase
        .from("orders")
        .select("*")
        .in("payment_status", ["paid", "approved", "complete", "completed", "succeeded", "pending"])
        .order("created_at", { ascending: false })
        .limit(100);

      if (!isMaster && officeId) {
        approvedOrdersQuery = approvedOrdersQuery.eq("office_id", officeId);
      }

      const { data: approvedOrders } = await approvedOrdersQuery;

      const ordersRows = (approvedOrders ?? []) as Array<{
        id: string;
        office_id?: string | null;
        seller_id?: string | null;
        user_id?: string | null;
        total_price_usd?: number | string | null;
        office_net_amount_usd?: number | string | null;
        client_name?: string | null;
        client_email?: string | null;
        product_slug?: string | null;
        payment_method?: string | null;
        created_at: string;
        payment_status?: string | null;
      }>;

      const missingOfficeOrders = ordersRows.filter((row) => !row.office_id);
      const ownerIds = Array.from(new Set(
        missingOfficeOrders
          .flatMap((row) => [row.seller_id, row.user_id])
          .filter((id): id is string => Boolean(id)),
      ));

      const inferredOfficeByOwnerId = new Map<string, string>();
      if (ownerIds.length > 0) {
        const { data: ownersData } = await supabase
          .from("user_accounts")
          .select("id, office_id")
          .in("id", ownerIds);

        ((ownersData ?? []) as Array<{ id: string; office_id?: string | null }>)
          .forEach((owner) => {
            if (owner?.id && owner?.office_id) {
              inferredOfficeByOwnerId.set(owner.id, owner.office_id);
            }
          });
      }

      const inferredUpdates: Array<{ id: string; office_id: string }> = [];
      ordersRows.forEach((row) => {
        if (row.office_id) return;
        const inferredOfficeId =
          (row.seller_id && inferredOfficeByOwnerId.get(row.seller_id)) ||
          (row.user_id && inferredOfficeByOwnerId.get(row.user_id));
        if (inferredOfficeId) {
          row.office_id = inferredOfficeId;
          inferredUpdates.push({ id: row.id, office_id: inferredOfficeId });
        }
      });

      if (inferredUpdates.length > 0) {
        await Promise.all(
          inferredUpdates.map((item) =>
            supabase.from("orders").update({ office_id: item.office_id }).eq("id", item.id),
          ),
        );
      }

      await resolveOfficeNames(ordersRows as Array<{ office_id?: string | null }>);

      ordersRows.forEach((r: any) => {
        const grossAmount = Number(r.total_price_usd) || 0;
        const officeNetAmount = Number(r.office_net_amount_usd ?? r.total_price_usd) || 0;
        const method = r.payment_method?.toUpperCase() || "STRIPE";
        results.push({
          id: r.id,
          source: "order",
          clientName: r.client_name ?? "Client",
          clientEmail: r.client_email ?? "",
          serviceName: r.product_slug?.replace(/-/g, " ").toUpperCase() || "General",
          serviceSlug: r.product_slug || "",
          amount: grossAmount,
          officeNetAmount,
          platformFeeAmount: Math.max(0, grossAmount - officeNetAmount),
          processingFeeAmount: computeProcessingFee(grossAmount, method),
          method,
          createdAt: r.created_at,
          officeName: r.office_id ? officeNameById.get(r.office_id) : "UNASSIGNED OFFICE",
          officeId: r.office_id,
          status: r.payment_status,
        });
      });

      results.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    setPayments(results);
    setIsLoading(false);
  }, [tab, isMaster, officeId]);

  useEffect(() => { load(); }, [load]);

  const handleApproveZelle = async (p: UnifiedPayment) => {
    if (!p.zelleId) return;
    setBusy(p.id);
    try {
      const approvedByName = user?.fullName || user?.email || "Admin";
      await paymentService.approveZellePayment(p.zelleId, approvedByName);
      toast.success(t.payments.messages.approveSuccess);
      setSelectedPayment(null);
      await load();
    } catch {
      toast.error(t.payments.messages.approveError);
    } finally {
      setBusy(null);
    }
  };

  const handleRejectZelle = async (p: UnifiedPayment) => {
    if (!p.zelleId) return;
    setBusy(p.id);
    try {
      await paymentService.rejectZellePayment(p.zelleId, "Rejeitado manualmente via Painel Admin");
      toast.success(t.payments.messages.rejectSuccess);
      setSelectedPayment(null);
      await load();
    } catch {
      toast.error(t.payments.messages.rejectError);
    } finally {
      setBusy(null);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    setBusy(id);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ payment_status: status })
        .eq("id", id);

      if (error) throw error;
      toast.success(t.payments.messages.updateStatusSuccess.replace("{{status}}", status));
      setSelectedPayment(null);
      await load();
    } catch {
      toast.error(t.payments.messages.updateStatusError);
    } finally {
      setBusy(null);
    }
  };

  const handleUpdateWithdrawalStatus = async (id: string, status: "approved" | "rejected") => {
    setBusy(id);
    try {
      const { data, error } = await supabase.functions.invoke("withdrawals", {
        body: {
          action: "approve",
          withdrawal_id: id,
          status,
        },
      });
      if (error) throw error;
      if (!data?.success || !data?.withdrawal) {
        throw new Error(data?.error || "Failed to update withdrawal.");
      }
      const withdrawal = data.withdrawal as { id: string; office_id: string; amount: number; payment_link?: string | null; requested_by?: string | null };

      try {
        const notifParams = {
          link: "/billings/withdrawals",
          category: "billing",
          action: status === "approved" ? "withdrawal_approved" : "withdrawal_rejected",
          metadata: {
            amount: Number(withdrawal.amount || 0).toFixed(2),
            withdrawal_id: withdrawal.id,
            office_id: withdrawal.office_id,
            payment_link: withdrawal.payment_link || null,
          },
        };

        if (withdrawal?.requested_by) {
          await notificationService.notifyUser(withdrawal.requested_by, notifParams);
        } else if (withdrawal?.office_id) {
          await notificationService.notifyAdminLawyersByOffice(withdrawal.office_id, notifParams);
        }
      } catch (notificationError) {
        console.error("[withdrawals] approval notification failed:", notificationError);
      }

        if (tab === "office_requests") {
            let withdrawalsQuery = supabase
                .from("office_withdrawals")
                .select("*, offices(name)")
                .order("created_at", { ascending: false });

            if (!isMaster && officeId) {
                withdrawalsQuery = withdrawalsQuery.eq("office_id", officeId);
            }

            const { data: withdrawalsData } = await withdrawalsQuery;
            const withdrawalRows = (withdrawalsData ?? []) as Array<{
                id: string;
                office_id?: string | null;
                amount?: number | string | null;
                status?: string | null;
                method?: string | null;
                payment_method?: string | null;
                payment_link?: string | null;
                reviewed_by_name?: string | null;
                created_at: string;
                offices?: { name?: string | null } | null;
            }>;
            const withdrawalOfficeIds = Array.from(
                new Set(withdrawalRows.map((row) => row.office_id).filter((id): id is string => Boolean(id))),
            );
            const payoutSettingsByOfficeId = new Map<string, { zelle_name?: string | null; zelle_identifier?: string | null }>();

            if (withdrawalOfficeIds.length > 0) {
                const { data: payoutSettingsData, error: payoutSettingsError } = await supabase
                    .from("office_payment_settings")
                    .select("office_id, zelle_name, zelle_identifier")
                    .in("office_id", withdrawalOfficeIds);

                if (payoutSettingsError) {
                    console.error("[RevenuePage] Failed to load withdrawal payout settings:", payoutSettingsError);
                }

                (payoutSettingsData ?? []).forEach((settings: any) => {
                    if (settings?.office_id) {
                        payoutSettingsByOfficeId.set(settings.office_id, {
                            zelle_name: settings.zelle_name ?? null,
                            zelle_identifier: settings.zelle_identifier ?? null,
                        });
                    }
                });
            }

            withdrawalRows.forEach((r) => {
                const rawStatus = String(r.status || "").toLowerCase();
                const normalizedStatus =
                    rawStatus === "completed" ? "approved" :
                        rawStatus === "cancelled" ? "rejected" :
                            rawStatus;
                const method = String(r.method || r.payment_method || "manual").toUpperCase();
                const payoutSettings = r.office_id ? payoutSettingsByOfficeId.get(r.office_id) : undefined;

                results.push({
                    id: r.id,
                    source: "withdrawal",
                    clientName: r.offices?.name ?? "Office",
                    clientEmail: "",
                    serviceName: "WITHDRAWAL REQUEST",
                    serviceSlug: "withdrawal_request",
                    amount: Number(r.amount) || 0,
                    method,
                    createdAt: r.created_at,
                    officeName: r.offices?.name ?? undefined,
                    officeId: r.office_id ?? undefined,
                    status: normalizedStatus,
                    paymentLink: r.payment_link ?? null,
                    reviewedByName: r.reviewed_by_name ?? null,
                    zelleName: payoutSettings?.zelle_name ?? null,
                    zelleIdentifier: payoutSettings?.zelle_identifier ?? null,
                });
            });
        }

        if (tab === "approved_payments") {
            let approvedOrdersQuery = supabase
                .from("orders")
                .select("*")
                .in("payment_status", ["paid", "approved", "complete", "completed", "succeeded", "pending"])
                .order("created_at", { ascending: false })
                .limit(100);

            if (!isMaster && officeId) {
                approvedOrdersQuery = approvedOrdersQuery.eq("office_id", officeId);
            }

            const { data: approvedOrders } = await approvedOrdersQuery;

            const ordersRows = (approvedOrders ?? []) as Array<{
                id: string;
                office_id?: string | null;
                seller_id?: string | null;
                user_id?: string | null;
                total_price_usd?: number | string | null;
                office_net_amount_usd?: number | string | null;
                client_name?: string | null;
                client_email?: string | null;
                product_slug?: string | null;
                payment_method?: string | null;
                created_at: string;
                payment_status?: string | null;
            }>;

            const missingOfficeOrders = ordersRows.filter((row) => !row.office_id);
            const ownerIds = Array.from(new Set(
                missingOfficeOrders
                    .flatMap((row) => [row.seller_id, row.user_id])
                    .filter((id): id is string => Boolean(id)),
            ));

            const inferredOfficeByOwnerId = new Map<string, string>();
            if (ownerIds.length > 0) {
                const { data: ownersData } = await supabase
                    .from("user_accounts")
                    .select("id, office_id")
                    .in("id", ownerIds);

                ((ownersData ?? []) as Array<{ id: string; office_id?: string | null }>)
                    .forEach((owner) => {
                        if (owner?.id && owner?.office_id) {
                            inferredOfficeByOwnerId.set(owner.id, owner.office_id);
                        }
                    });
            }

            const inferredUpdates: Array<{ id: string; office_id: string }> = [];
            ordersRows.forEach((row) => {
                if (row.office_id) return;
                const inferredOfficeId =
                    (row.seller_id && inferredOfficeByOwnerId.get(row.seller_id)) ||
                    (row.user_id && inferredOfficeByOwnerId.get(row.user_id));
                if (inferredOfficeId) {
                    row.office_id = inferredOfficeId;
                    inferredUpdates.push({ id: row.id, office_id: inferredOfficeId });
                }
            });

            if (inferredUpdates.length > 0) {
                await Promise.all(
                    inferredUpdates.map((item) =>
                        supabase.from("orders").update({ office_id: item.office_id }).eq("id", item.id),
                    ),
                );
            }

            await resolveOfficeNames(ordersRows as Array<{ office_id?: string | null }>);

            ordersRows.forEach((r: any) => {
                const grossAmount = Number(r.total_price_usd) || 0;
                const officeNetAmount = Number(r.office_net_amount_usd ?? r.total_price_usd) || 0;
                results.push({
                    id: r.id,
                    source: "order",
                    clientName: r.client_name ?? "Client",
                    clientEmail: r.client_email ?? "",
                    serviceName: r.product_slug?.replace(/-/g, " ").toUpperCase() || "General",
                    serviceSlug: r.product_slug || "",
                    amount: grossAmount,
                    officeNetAmount,
                    platformFeeAmount: Math.max(0, grossAmount - officeNetAmount),
                    method: r.payment_method?.toUpperCase() || "STRIPE",
                    createdAt: r.created_at,
                    officeName: r.office_id ? officeNameById.get(r.office_id) : "UNASSIGNED OFFICE",
                    officeId: r.office_id,
                    status: r.payment_status,
                });
            });

            results.sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            );
        }

        setPayments(results);
        setIsLoading(false);
    }, [tab, isMaster, officeId]);

    useEffect(() => { load(); }, [load]);

    const handleApproveZelle = async (p: UnifiedPayment) => {
        if (!p.zelleId) return;
        setBusy(p.id);
        try {
            const approvedByName = user?.fullName || user?.email || "Admin";
            await paymentService.approveZellePayment(p.zelleId, approvedByName);
            toast.success(t.payments.messages.approveSuccess);
            setSelectedPayment(null);
            await load();
        } catch {
          detail = "";
        }
      }
      const fallback = (err as { message?: string })?.message || "";
      const message = detail || fallback;
      toast.error(
        message
          ? `${t.payments.messages.updateStatusError} ${message}`
          : t.payments.messages.updateStatusError,
      );
    } finally {
      setBusy(null);
    }
  };

  const filtered = payments.filter((p) => {
    if (tab === "office_requests") {
      if (officeRequestStatusFilter !== "all" && String(p.status).toLowerCase() !== officeRequestStatusFilter) {
        return false;
      }

      if (officeRequestPeriodFilter !== "all") {
        const now = Date.now();
        const days = officeRequestPeriodFilter === "7d" ? 7 : officeRequestPeriodFilter === "30d" ? 30 : 90;
        const cutoff = now - days * 24 * 60 * 60 * 1000;
        const createdAt = new Date(p.createdAt).getTime();
        if (createdAt < cutoff) return false;
      }
    } else if (tab === "approved_payments") {
      const normalizedStatus = String(p.status || "").toLowerCase();
      const isApprovedStatus = ["paid", "approved", "complete", "completed", "succeeded"].includes(normalizedStatus);
      const groupedStatus = isApprovedStatus ? "approved" : "pending";

      if (paymentsStatusFilter !== "all" && groupedStatus !== paymentsStatusFilter) {
        return false;
      }

      if (paymentsPeriodFilter !== "all") {
        const now = Date.now();
        const days = paymentsPeriodFilter === "7d" ? 7 : paymentsPeriodFilter === "30d" ? 30 : 90;
        const cutoff = now - days * 24 * 60 * 60 * 1000;
        const createdAt = new Date(p.createdAt).getTime();
        if (createdAt < cutoff) return false;
      }
    }

    if (!search) return true;
    const q = search.toLowerCase();
    return (
        <div className="p-4 sm:p-8 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="text-left">
                    <h1 className="text-3xl font-black text-text tracking-tighter uppercase">{t.payments.title}</h1>
                    <p className="text-text-muted font-medium mt-1">{t.payments.subtitle}</p>
                </div>

                <div className="relative w-full md:w-96">
                    <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-lg" />
                    <input
                        type="text"
                        placeholder={t.payments.searchPlaceholder}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 rounded-2xl border border-border bg-card text-sm font-medium focus:border-primary transition-all outline-none"
                    />
                </div>
            </div>

            {isAdminLawyer ? (
                <div className="border-b border-border pb-4">
                    <p className="text-sm font-black uppercase tracking-widest text-primary">
                        {"Payments"}
                    </p>
                </div>
            ) : (
                <div className="flex flex-wrap items-end gap-6 border-b border-border">
                    <button
                        onClick={() => setTab("zelle")}
                        className={cn(
                            "pb-4 text-sm font-black uppercase tracking-widest transition-all relative",
                            tab === "zelle" ? "text-primary" : "text-text-muted hover:text-text"
                        )}
                    >
                        {t.payments?.tabs?.pending || "Payment Pending"}
                        {tab === "zelle" && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
                    </button>
                    {canAccessOfficeRequests && (
                        <button
                            onClick={() => setTab("office_requests")}
                            className={cn(
                                "pb-4 text-sm font-black uppercase tracking-widest transition-all relative",
                                tab === "office_requests" ? "text-primary" : "text-text-muted hover:text-text"
                            )}
                        >
                            {t.payments?.tabs?.officeRequests || "Withdrawal Requests"}
                            {tab === "office_requests" && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
                        </button>
                    )}
                    <button
                        onClick={() => setTab("approved_payments")}
                        className={cn(
                            "pb-4 text-sm font-black uppercase tracking-widest transition-all relative",
                            tab === "approved_payments" ? "text-primary" : "text-text-muted hover:text-text"
                        )}
                    >
                        {"Payments"}
                        {tab === "approved_payments" && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
                    </button>
                </div>
            )}

            {tab === "office_requests" && canAccessOfficeRequests && (
                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Status</span>
                        <select
                            value={officeRequestStatusFilter}
                            onChange={(e) => setOfficeRequestStatusFilter(e.target.value as typeof officeRequestStatusFilter)}
                            className="h-10 px-3 rounded-xl border border-border bg-card text-xs font-bold uppercase tracking-wider"
                        >
                            <option value="all">All</option>
                            <option value="pending">Pending approval</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Period</span>
                        <select
                            value={officeRequestPeriodFilter}
                            onChange={(e) => setOfficeRequestPeriodFilter(e.target.value as typeof officeRequestPeriodFilter)}
                            className="h-10 px-3 rounded-xl border border-border bg-card text-xs font-bold uppercase tracking-wider"
                        >
                            <option value="all">All time</option>
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                            <option value="90d">Last 90 days</option>
                        </select>
                    </div>

                    <div className="md:ml-auto inline-flex items-center gap-2 px-3 h-10 rounded-xl border border-warning/20 bg-warning/10 text-warning text-xs font-black uppercase tracking-widest">
                        Pending approval: {officePendingCount}
                    </div>
                </div>
            )}
            {tab === "approved_payments" && (
                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Status</span>
                        <select
                            value={paymentsStatusFilter}
                            onChange={(e) => setPaymentsStatusFilter(e.target.value as typeof paymentsStatusFilter)}
                            className="h-10 px-3 rounded-xl border border-border bg-card text-xs font-bold uppercase tracking-wider"
                        >
                            <option value="all">All</option>
                            <option value="approved">Approved</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Period</span>
                        <select
                            value={paymentsPeriodFilter}
                            onChange={(e) => setPaymentsPeriodFilter(e.target.value as typeof paymentsPeriodFilter)}
                            className="h-10 px-3 rounded-xl border border-border bg-card text-xs font-bold uppercase tracking-wider"
                        >
                            <option value="all">All time</option>
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                            <option value="90d">Last 90 days</option>
                        </select>
                    </div>
                </div>
            )}

            <div className="bg-card rounded-[32px] border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto min-h-[400px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-20 text-center text-text-muted font-bold">
                            {t.payments.table.noResults}
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border bg-bg-subtle/50">
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">{t.payments.table.customer}</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">{t.offices.table.office}</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">{t.payments.table.serviceName}</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">{t.payments.table.payment}</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Date & Time</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Method</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {paginated.map((p) => (
                                    <tr key={p.id} className="hover:bg-bg-subtle/30 transition-colors text-left">
                                        <td className="px-6 py-5">
                                            <div>
                                                <p className="text-sm font-black text-text">{p.clientName}</p>
                                                <p className="text-[11px] text-text-muted font-medium">{p.clientEmail}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <RiBuilding2Line className="text-text-muted" />
                                                <span className="text-xs font-bold text-text-muted uppercase tracking-tight">{p.officeName || "UNASSIGNED OFFICE"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="inline-flex px-2 py-1 rounded-lg bg-primary/5 border border-primary/10 text-[10px] font-black text-primary uppercase tracking-widest">
                                                {p.serviceName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            {(() => {
                                                const normalizedStatus = String(p.status || "").toLowerCase();
                                                const isApprovedStatus = ["paid", "approved", "complete", "completed", "succeeded"].includes(normalizedStatus);
                                                const isRejectedStatus = ["rejected", "cancelled", "canceled", "failed"].includes(normalizedStatus);
                                                const statusClass = isApprovedStatus
                                                    ? "text-success"
                                                    : isRejectedStatus
                                                        ? "text-danger"
                                                        : "text-warning";
                                                return (
                                                    <>
                                            {isMaster && tab === "approved_payments" ? (
                                                <>
                                                    <p className="text-[11px] font-black text-text">
                                                        Cliente: {fmtCurrency(p.amount)}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-primary">
                                                        Recebido: {fmtCurrency(Number(p.officeNetAmount ?? p.amount))}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-success">
                                                        Taxa/Lucro: {fmtCurrency(Number(p.platformFeeAmount ?? 0))}
                                                    </p>
                                                    <p className={cn(
                                                        "text-[9px] font-black uppercase tracking-tighter",
                                                        statusClass
                                                    )}>
                                                        {p.status}
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-sm font-black text-text">{fmtCurrency(p.amount)}</p>
                                                    <p className={cn(
                                                        "text-[9px] font-black uppercase tracking-tighter",
                                                        statusClass
                                                    )}>
                                                        {p.status}
                                                    </p>
                                                </>
                                            )}
                                                    </>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-xs font-bold text-text">
                                                {new Date(p.createdAt).toLocaleDateString("en-US")}
                                            </p>
                                            <p className="text-[10px] font-medium text-text-muted">
                                                {new Date(p.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                                            </p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest bg-bg-subtle px-2 py-1 rounded-lg">
                                                {p.method}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 rounded-xl border-border px-3 font-bold text-[11px] uppercase tracking-wider inline-flex items-center gap-1.5"
                                                    onClick={() => setSelectedPayment(p)}
                                                >
                                                    <RiInformationLine className="text-sm" />
                                                    {t.payments.table.detailsBtn}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                {!isLoading && filtered.length > 0 && (
                    <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border bg-bg-subtle/30">
                        <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                            {`Mostrando ${pageStart + 1}-${Math.min(pageEnd, filtered.length)} de ${filtered.length}`}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-3 rounded-xl border-border text-[11px] font-bold uppercase tracking-wider"
                                disabled={safeCurrentPage <= 1}
                                onClick={() =>
                                    setPageByTab((prev) => ({
                                        ...prev,
                                        [tab]: Math.max(1, safeCurrentPage - 1),
                                    }))
                                }
                            >
                                Anterior
                            </Button>
                            <span className="text-[11px] font-black text-text uppercase tracking-wider px-2">
                                {`Página ${safeCurrentPage} de ${totalPages}`}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-3 rounded-xl border-border text-[11px] font-bold uppercase tracking-wider"
                                disabled={safeCurrentPage >= totalPages}
                                onClick={() =>
                                    setPageByTab((prev) => ({
                                        ...prev,
                                        [tab]: Math.min(totalPages, safeCurrentPage + 1),
                                    }))
                                }
                            >
                                Próxima
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {selectedPayment && (
                    <DetailModal
                        payment={selectedPayment}
                        onClose={() => setSelectedPayment(null)}
                        onApprove={
                            tab === "zelle" &&
                                selectedPayment.source === "zelle" &&
                                String(selectedPayment.status).toLowerCase() === "pending_verification"
                                ? () => void handleApproveZelle(selectedPayment)
                                : tab === "office_requests" &&
                                    selectedPayment.source === "withdrawal" &&
                                    String(selectedPayment.status).toLowerCase() === "pending"
                                    ? () => void handleUpdateWithdrawalStatus(selectedPayment.id, "approved")
                                    : undefined
                        }
                        onReject={
                            tab === "zelle" &&
                                selectedPayment.source === "zelle" &&
                                String(selectedPayment.status).toLowerCase() === "pending_verification"
                                ? () => void handleRejectZelle(selectedPayment)
                                : tab === "office_requests" &&
                                    selectedPayment.source === "withdrawal" &&
                                    String(selectedPayment.status).toLowerCase() === "pending"
                                    ? () => void handleUpdateWithdrawalStatus(selectedPayment.id, "rejected")
                                    : undefined
                        }
                        onPay={
                            tab === "office_requests" &&
                                selectedPayment.source === "withdrawal" &&
                                !!selectedPayment.paymentLink
                                ? () => setConfirmPayLink(normalizeExternalUrl(selectedPayment.paymentLink || ""))
                                : undefined
                        }
                        busy={!!busy}
                    />
                )}
            </AnimatePresence>
            <Dialog open={!!confirmPayLink} onOpenChange={(open) => { if (!open) setConfirmPayLink(null); }}>
                <DialogContent className="max-w-md border-border bg-card">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-black text-text uppercase">
                            Confirmar pagamento
                        </DialogTitle>
                        <DialogDescription className="text-sm text-text-muted">
                            Você está prestes a abrir o link de pagamento. Deseja continuar?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setConfirmPayLink(null)}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={() => {
                                if (confirmPayLink) window.open(confirmPayLink, "_blank", "noopener,noreferrer");
                                setConfirmPayLink(null);
                            }}
                            className="bg-primary text-white hover:bg-primary/90"
                        >
                            Confirmar e abrir
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
  });

  const currentPage = pageByTab[tab] ?? 1;
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const pageEnd = pageStart + ITEMS_PER_PAGE;
  const paginated = filtered.slice(pageStart, pageEnd);

  useEffect(() => {
    if (currentPage !== safeCurrentPage) {
      setPageByTab((prev) => ({ ...prev, [tab]: safeCurrentPage }));
    }
  }, [currentPage, safeCurrentPage, tab]);

  const officePendingCount = tab === "office_requests"
    ? payments.filter((p) => String(p.status).toLowerCase() === "pending").length
    : 0;

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-left">
          <h1 className="text-3xl font-black text-text tracking-tighter uppercase">{t.payments.title}</h1>
          <p className="text-text-muted font-medium mt-1">{t.payments.subtitle}</p>
        </div>

        <div className="relative w-full md:w-96">
          <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-lg" />
          <input
            type="text"
            placeholder={t.payments.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-2xl border border-border bg-card text-sm font-medium focus:border-primary transition-all outline-none"
          />
        </div>
      </div>

      {isAdminLawyer ? (
        <div className="border-b border-border pb-4">
          <p className="text-sm font-black uppercase tracking-widest text-primary">
            {"Payments"}
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap items-end gap-6 border-b border-border">
          <button
            onClick={() => setTab("zelle")}
            className={cn(
              "pb-4 text-sm font-black uppercase tracking-widest transition-all relative",
              tab === "zelle" ? "text-primary" : "text-text-muted hover:text-text"
            )}
          >
            {t.payments?.tabs?.pending || "Payment Pending"}
            {tab === "zelle" && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
          </button>
          {canAccessOfficeRequests && (
            <button
              onClick={() => setTab("office_requests")}
              className={cn(
                "pb-4 text-sm font-black uppercase tracking-widest transition-all relative",
                tab === "office_requests" ? "text-primary" : "text-text-muted hover:text-text"
              )}
            >
              {t.payments?.tabs?.officeRequests || "Withdrawal Requests"}
              {tab === "office_requests" && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
            </button>
          )}
          <button
            onClick={() => setTab("approved_payments")}
            className={cn(
              "pb-4 text-sm font-black uppercase tracking-widest transition-all relative",
              tab === "approved_payments" ? "text-primary" : "text-text-muted hover:text-text"
            )}
          >
            {"Payments"}
            {tab === "approved_payments" && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
          </button>
        </div>
      )}

      {tab === "office_requests" && canAccessOfficeRequests && (
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Status</span>
            <select
              value={officeRequestStatusFilter}
              onChange={(e) => setOfficeRequestStatusFilter(e.target.value as typeof officeRequestStatusFilter)}
              className="h-10 px-3 rounded-xl border border-border bg-card text-xs font-bold uppercase tracking-wider"
            >
              <option value="all">All</option>
              <option value="pending">Pending approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Period</span>
            <select
              value={officeRequestPeriodFilter}
              onChange={(e) => setOfficeRequestPeriodFilter(e.target.value as typeof officeRequestPeriodFilter)}
              className="h-10 px-3 rounded-xl border border-border bg-card text-xs font-bold uppercase tracking-wider"
            >
              <option value="all">All time</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>

          <div className="md:ml-auto inline-flex items-center gap-2 px-3 h-10 rounded-xl border border-warning/20 bg-warning/10 text-warning text-xs font-black uppercase tracking-widest">
            Pending approval: {officePendingCount}
          </div>
        </div>
      )}
      {tab === "approved_payments" && (
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Status</span>
            <select
              value={paymentsStatusFilter}
              onChange={(e) => setPaymentsStatusFilter(e.target.value as typeof paymentsStatusFilter)}
              className="h-10 px-3 rounded-xl border border-border bg-card text-xs font-bold uppercase tracking-wider"
            >
              <option value="all">All</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Period</span>
            <select
              value={paymentsPeriodFilter}
              onChange={(e) => setPaymentsPeriodFilter(e.target.value as typeof paymentsPeriodFilter)}
              className="h-10 px-3 rounded-xl border border-border bg-card text-xs font-bold uppercase tracking-wider"
            >
              <option value="all">All time</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>
      )}

      <div className="bg-card rounded-[32px] border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-text-muted font-bold">
              {t.payments.table.noResults}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-bg-subtle/50">
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">{t.payments.table.customer}</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">{t.offices.table.office}</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">{t.payments.table.serviceName}</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Client</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Processing Fee</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Received</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Fee / Profit</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Status</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Date & Time</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Method</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginated.map((p) => (
                  <tr key={p.id} className="hover:bg-bg-subtle/30 transition-colors text-left">
                    <td className="px-6 py-5">
                      <div>
                        <p className="text-sm font-black text-text">{p.clientName}</p>
                        <p className="text-[11px] text-text-muted font-medium">{p.clientEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <RiBuilding2Line className="text-text-muted" />
                        <span className="text-xs font-bold text-text-muted uppercase tracking-tight">{p.officeName || "UNASSIGNED OFFICE"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex px-2 py-1 rounded-lg bg-primary/5 border border-primary/10 text-[10px] font-black text-primary uppercase tracking-widest">
                        {p.serviceName}
                      </span>
                    </td>
                    {(() => {
                      const normalizedStatus = String(p.status || "").toLowerCase();
                      const isApprovedStatus = ["paid", "approved", "complete", "completed", "succeeded"].includes(normalizedStatus);
                      const isRejectedStatus = ["rejected", "cancelled", "canceled", "failed"].includes(normalizedStatus);
                      const statusClass = isApprovedStatus ? "text-success" : isRejectedStatus ? "text-danger" : "text-warning";
                      const clientAmt = p.amount;
                      const processingFee = Number(p.processingFeeAmount ?? 0);
                      const receivedAmt = Number(p.officeNetAmount ?? p.amount);
                      const feeAmt = Number(p.platformFeeAmount ?? 0);
                      return (
                        <>
                          <td className="px-6 py-5">
                            <p className="text-sm font-black text-text">{fmtCurrency(clientAmt)}</p>
                          </td>
                          <td className="px-6 py-5">
                            <p className={`text-sm font-black ${processingFee > 0 ? "text-danger" : "text-text-muted"}`}>
                              {processingFee > 0 ? `-${fmtCurrency(processingFee)}` : "—"}
                            </p>
                            {processingFee > 0 && (
                              <p className="text-[9px] text-text-muted mt-0.5">est.</p>
                            )}
                          </td>
                          <td className="px-6 py-5">
                            <p className="text-sm font-black text-primary">{fmtCurrency(receivedAmt)}</p>
                          </td>
                          <td className="px-6 py-5">
                            <p className={`text-sm font-black ${feeAmt > 0 ? "text-success" : "text-text-muted"}`}>
                              {feeAmt > 0 ? fmtCurrency(feeAmt) : "—"}
                            </p>
                          </td>
                          <td className="px-6 py-5">
                            <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg", isApprovedStatus ? "bg-success/10 text-success" : isRejectedStatus ? "bg-danger/10 text-danger" : "bg-warning/10 text-warning", statusClass)}>
                              {p.status || "—"}
                            </span>
                          </td>
                        </>
                      );
                    })()}
                    <td className="px-6 py-5">
                      <p className="text-xs font-bold text-text">
                        {new Date(p.createdAt).toLocaleDateString("en-US")}
                      </p>
                      <p className="text-[10px] font-medium text-text-muted">
                        {new Date(p.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] font-black text-text-muted uppercase tracking-widest bg-bg-subtle px-2 py-1 rounded-lg">
                        {p.method}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-xl border-border px-3 font-bold text-[11px] uppercase tracking-wider inline-flex items-center gap-1.5"
                          onClick={() => setSelectedPayment(p)}
                        >
                          <RiInformationLine
                            className="text-sm"
                          />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {!isLoading && filtered.length > 0 && (
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border bg-bg-subtle/30">
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
              {`Mostrando ${pageStart + 1}-${Math.min(pageEnd, filtered.length)} de ${filtered.length}`}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 rounded-xl border-border text-[11px] font-bold uppercase tracking-wider"
                disabled={safeCurrentPage <= 1}
                onClick={() =>
                  setPageByTab((prev) => ({
                    ...prev,
                    [tab]: Math.max(1, safeCurrentPage - 1),
                  }))
                }
              >
                Anterior
              </Button>
              <span className="text-[11px] font-black text-text uppercase tracking-wider px-2">
                {`Página ${safeCurrentPage} de ${totalPages}`}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 rounded-xl border-border text-[11px] font-bold uppercase tracking-wider"
                disabled={safeCurrentPage >= totalPages}
                onClick={() =>
                  setPageByTab((prev) => ({
                    ...prev,
                    [tab]: Math.min(totalPages, safeCurrentPage + 1),
                  }))
                }
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedPayment && (
          <DetailModal
            payment={selectedPayment}
            onClose={() => setSelectedPayment(null)}
            onApprove={
              tab === "zelle" &&
                selectedPayment.source === "zelle" &&
                String(selectedPayment.status).toLowerCase() === "pending_verification"
                ? () => void handleApproveZelle(selectedPayment)
                : tab === "office_requests" &&
                  selectedPayment.source === "withdrawal" &&
                  String(selectedPayment.status).toLowerCase() === "pending"
                  ? () => void handleUpdateWithdrawalStatus(selectedPayment.id, "approved")
                  : undefined
            }
            onReject={
              tab === "zelle" &&
                selectedPayment.source === "zelle" &&
                String(selectedPayment.status).toLowerCase() === "pending_verification"
                ? () => void handleRejectZelle(selectedPayment)
                : tab === "office_requests" &&
                  selectedPayment.source === "withdrawal" &&
                  String(selectedPayment.status).toLowerCase() === "pending"
                  ? () => void handleUpdateWithdrawalStatus(selectedPayment.id, "rejected")
                  : undefined
            }
            onPay={
              tab === "office_requests" &&
                selectedPayment.source === "withdrawal" &&
                !!selectedPayment.paymentLink
                ? () => setConfirmPayLink(normalizeExternalUrl(selectedPayment.paymentLink || ""))
                : undefined
            }
            busy={!!busy}
          />
        )}
      </AnimatePresence>
      <Dialog open={!!confirmPayLink} onOpenChange={(open) => { if (!open) setConfirmPayLink(null); }}>
        <DialogContent className="max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-text uppercase">
              Confirmar pagamento
            </DialogTitle>
            <DialogDescription className="text-sm text-text-muted">
              Você está prestes a abrir o link de pagamento. Deseja continuar?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmPayLink(null)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (confirmPayLink) window.open(confirmPayLink, "_blank", "noopener,noreferrer");
                setConfirmPayLink(null);
              }}
              className="bg-primary text-white hover:bg-primary/90"
            >
              Confirmar e abrir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
