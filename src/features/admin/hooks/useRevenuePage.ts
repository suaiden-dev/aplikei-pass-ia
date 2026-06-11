import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as paymentService from "@features/payments/lib/paymentOps";
import * as notificationService from "@features/notifications/services/notify";
import {
  inferOfficeIdsByOwner,
  listApprovedOrders,
  listOfficeNames,
  listOfficeWithdrawals,
  listPayoutSettings,
  listPendingZellePayments,
  updateOrderOfficeIds,
  updateOrderPaymentStatus,
  updateWithdrawalStatus,
  type ZellePaymentRow,
  type OrderPaymentRow,
} from "@features/admin/services/revenuePageService";
import { useAuth } from "@shared/hooks/useAuth";
import { useT } from "@app/app/i18n";
import { adminQueryKeys } from "@features/admin/lib/queryKeys";
import {
  canAccessOfficeRequests,
  computeProcessingFee,
  filterRevenuePayments,
  paginateRevenuePayments,
} from "./revenueCalculations";

export type RevenueTab = "zelle" | "office_requests" | "approved_payments";

export interface UnifiedPayment {
  id: string;
  source: "zelle" | "stripe" | "order" | "withdrawal";
  clientName: string;
  clientEmail: string;
  serviceName: string;
  serviceSlug: string;
  amount: number;
  officeNetAmount?: number;
  platformFeeAmount?: number;
  processingFeeAmount?: number;
  method: string;
  createdAt: string;
  officeName?: string;
  officeId?: string;
  status: string;
  zelleId?: string;
  proofUrl?: string | null;
  confirmationCode?: string | null;
  adminNotes?: string | null;
  paymentLink?: string | null;
  reviewedByName?: string | null;
  zelleName?: string | null;
  zelleIdentifier?: string | null;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

export function buildProofUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (raw.startsWith("http")) return raw;
  return `${SUPABASE_URL}/storage/v1/object/public/zelle_comprovantes/${raw}`;
}

const ITEMS_PER_PAGE = 10;

async function fetchRevenueData(tab: RevenueTab, isMaster: boolean, officeId: string | null): Promise<UnifiedPayment[]> {
  const results: UnifiedPayment[] = [];
  const officeNameById = new Map<string, string>();

  const resolveOfficeNames = async (rows: Array<{ office_id?: string | null }>) => {
    const ids = Array.from(new Set(rows.map((r) => r.office_id).filter((id): id is string => Boolean(id))));
    if (ids.length === 0) return;
    const data = await listOfficeNames(ids);
    data.forEach((o) => { if (o?.id) officeNameById.set(o.id, o.name ?? ""); });
  };

  if (tab === "zelle") {
    const zelleData = await listPendingZellePayments({ isMaster, officeId });
    await resolveOfficeNames(zelleData as Array<{ office_id?: string | null }>);
    zelleData.forEach((r: ZellePaymentRow) => {
      results.push({
        id: r.id, source: "zelle", zelleId: r.id,
        clientName: r.guest_name ?? "Guest", clientEmail: r.guest_email ?? "",
        serviceName: r.service_slug.replace(/-/g, " ").toUpperCase(),
        serviceSlug: r.service_slug, amount: r.amount, method: "Zelle",
        createdAt: r.created_at,
        officeName: r.office_id ? officeNameById.get(r.office_id) : undefined,
        officeId: r.office_id ?? undefined, status: r.status,
        proofUrl: buildProofUrl(r.image_url || r.proof_path),
        confirmationCode: r.confirmation_code,
      });
    });
  }

  if (tab === "office_requests") {
    const withdrawalRows = await listOfficeWithdrawals({ isMaster, officeId });
    const withdrawalOfficeIds = Array.from(
      new Set(withdrawalRows.map((row) => row.office_id).filter((id): id is string => Boolean(id))),
    );
    const payoutSettingsByOfficeId = new Map<string, { zelle_name?: string | null; zelle_identifier?: string | null }>();

    if (withdrawalOfficeIds.length > 0) {
      const payoutSettingsData = await listPayoutSettings(withdrawalOfficeIds);
      payoutSettingsData.forEach((s) => {
        if (s?.office_id) payoutSettingsByOfficeId.set(s.office_id, { zelle_name: s.zelle_name ?? null, zelle_identifier: s.zelle_identifier ?? null });
      });
    }

    withdrawalRows.forEach((r) => {
      const rawStatus = String(r.status || "").toLowerCase();
      const normalizedStatus = rawStatus === "completed" ? "approved" : rawStatus === "cancelled" ? "rejected" : rawStatus;
      const method = String(r.method || r.payment_method || "manual").toUpperCase();
      const payoutSettings = r.office_id ? payoutSettingsByOfficeId.get(r.office_id) : undefined;
      results.push({
        id: r.id, source: "withdrawal",
        clientName: r.offices?.name ?? "Office", clientEmail: "",
        serviceName: "WITHDRAWAL REQUEST", serviceSlug: "withdrawal_request",
        amount: Number(r.amount) || 0, method, createdAt: r.created_at,
        officeName: r.offices?.name ?? undefined,
        officeId: r.office_id ?? undefined, status: normalizedStatus,
        paymentLink: r.payment_link ?? null, reviewedByName: r.reviewed_by_name ?? null,
        zelleName: payoutSettings?.zelle_name ?? null,
        zelleIdentifier: payoutSettings?.zelle_identifier ?? null,
      });
    });
  }

  if (tab === "approved_payments") {
    const ordersRows = await listApprovedOrders({ isMaster, officeId });
    const missingOfficeOrders = ordersRows.filter((row) => !row.office_id);
    const ownerIds = Array.from(new Set(
      missingOfficeOrders.flatMap((row) => [row.seller_id, row.user_id]).filter((id): id is string => Boolean(id)),
    ));

    if (ownerIds.length > 0) {
      const inferred = await inferOfficeIdsByOwner(ownerIds);
      const inferredUpdates: Array<{ id: string; office_id: string }> = [];
      ordersRows.forEach((row) => {
        if (row.office_id) return;
        const inferredOfficeId = (row.seller_id && inferred.get(row.seller_id)) || (row.user_id && inferred.get(row.user_id));
        if (inferredOfficeId) { row.office_id = inferredOfficeId; inferredUpdates.push({ id: row.id, office_id: inferredOfficeId }); }
      });
      if (inferredUpdates.length > 0) await updateOrderOfficeIds(inferredUpdates);
    }

    await resolveOfficeNames(ordersRows as Array<{ office_id?: string | null }>);
    ordersRows.forEach((r: OrderPaymentRow) => {
      const grossAmount = Number(r.total_price_usd) || 0;
      const officeNetAmount = Number(r.office_net_amount_usd ?? r.total_price_usd) || 0;
      const method = r.payment_method?.toUpperCase() || "STRIPE";
      results.push({
        id: r.id, source: "order",
        clientName: r.client_name ?? "Client", clientEmail: r.client_email ?? "",
        serviceName: r.product_slug?.replace(/-/g, " ").toUpperCase() || "General",
        serviceSlug: r.product_slug || "",
        amount: grossAmount, officeNetAmount,
        platformFeeAmount: Math.max(0, grossAmount - officeNetAmount),
        processingFeeAmount: computeProcessingFee(grossAmount, method),
        method, createdAt: r.created_at,
        officeName: r.office_id ? officeNameById.get(r.office_id) : "UNASSIGNED OFFICE",
        officeId: r.office_id ?? undefined, status: r.payment_status ?? "",
      });
    });
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return results;
}

export function useRevenuePage() {
  const t = useT("admin");
  const { user } = useAuth();
  const isMaster = user?.role === "master";
  const isAdminLawyer = user?.role === "admin_lawyer";
  const officeId = user?.officeId ?? null;
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<RevenueTab>(isAdminLawyer ? "approved_payments" : "zelle");
  const [search, setSearch] = useState("");
  const [officeRequestStatusFilter, setOfficeRequestStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [officeRequestPeriodFilter, setOfficeRequestPeriodFilter] = useState<"all" | "7d" | "30d" | "90d">("all");
  const [paymentsStatusFilter, setPaymentsStatusFilter] = useState<"all" | "approved" | "pending">("all");
  const [paymentsPeriodFilter, setPaymentsPeriodFilter] = useState<"all" | "7d" | "30d" | "90d">("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<UnifiedPayment | null>(null);
  const [confirmPayLink, setConfirmPayLink] = useState<string | null>(null);
  const [pageByTab, setPageByTab] = useState<Record<RevenueTab, number>>({ zelle: 1, office_requests: 1, approved_payments: 1 });

  const { data: payments = [], isLoading } = useQuery({
    queryKey: adminQueryKeys.revenue(tab, isMaster, officeId ?? undefined),
    queryFn: () => fetchRevenueData(tab, isMaster, officeId),
    staleTime: 0,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: adminQueryKeys.revenue(tab, isMaster, officeId ?? undefined) });

  const approveZelleMutation = useMutation({
    mutationFn: (p: UnifiedPayment) =>
      paymentService.approveZellePayment(p.zelleId!, user?.fullName || user?.email || "Admin"),
    onSuccess: () => { toast.success(t.payments.messages.approveSuccess); setSelectedPayment(null); invalidate(); },
    onError: () => toast.error(t.payments.messages.approveError),
    onSettled: () => setBusy(null),
  });

  const rejectZelleMutation = useMutation({
    mutationFn: (p: UnifiedPayment) =>
      paymentService.rejectZellePayment(p.zelleId!, "Rejeitado manualmente via Painel Admin"),
    onSuccess: () => { toast.success(t.payments.messages.rejectSuccess); setSelectedPayment(null); invalidate(); },
    onError: () => toast.error(t.payments.messages.rejectError),
    onSettled: () => setBusy(null),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateOrderPaymentStatus(id, status),
    onSuccess: (_, { status }) => {
      toast.success(t.payments.messages.updateStatusSuccess.replace("{{status}}", status));
      setSelectedPayment(null);
      invalidate();
    },
    onError: () => toast.error(t.payments.messages.updateStatusError),
    onSettled: () => setBusy(null),
  });

  const updateWithdrawalMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" }) =>
      updateWithdrawalStatus(id, status),
    onSuccess: async (withdrawal, { status }) => {
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
      toast.success(t.payments.messages.updateStatusSuccess.replace("{{status}}", status));
      setSelectedPayment(null);
      invalidate();
    },
    onError: (err: Error) => {
      let detail = "";
      try { detail = (JSON.parse(err.message) as { error?: string })?.error || ""; } catch { detail = ""; }
      const message = detail || err.message || "";
      toast.error(message ? `${t.payments.messages.updateStatusError} ${message}` : t.payments.messages.updateStatusError);
    },
    onSettled: () => setBusy(null),
  });

  const handleApproveZelle = (p: UnifiedPayment) => {
    if (!p.zelleId) return;
    setBusy(p.id);
    approveZelleMutation.mutate(p);
  };

  const handleRejectZelle = (p: UnifiedPayment) => {
    if (!p.zelleId) return;
    setBusy(p.id);
    rejectZelleMutation.mutate(p);
  };

  const handleUpdateStatus = (id: string, status: string) => {
    setBusy(id);
    updateStatusMutation.mutate({ id, status });
  };

  const handleUpdateWithdrawalStatus = (id: string, status: "approved" | "rejected") => {
    setBusy(id);
    updateWithdrawalMutation.mutate({ id, status });
  };

  const filtered = filterRevenuePayments(payments, {
    tab,
    search,
    officeRequestStatusFilter,
    officeRequestPeriodFilter,
    paymentsStatusFilter,
    paymentsPeriodFilter,
  });

  const currentPage = pageByTab[tab] ?? 1;
  const { totalPages, safeCurrentPage, pageStart, pageEnd, paginated } = paginateRevenuePayments(
    filtered,
    currentPage,
    ITEMS_PER_PAGE,
  );
  const officePendingCount = tab === "office_requests"
    ? payments.filter((p) => String(p.status).toLowerCase() === "pending").length
    : 0;

  useEffect(() => {
    if (currentPage !== safeCurrentPage) setPageByTab((prev) => ({ ...prev, [tab]: safeCurrentPage }));
  }, [currentPage, safeCurrentPage, tab]);

  return {
    tab, setTab,
    search, setSearch,
    officeRequestStatusFilter, setOfficeRequestStatusFilter,
    officeRequestPeriodFilter, setOfficeRequestPeriodFilter,
    paymentsStatusFilter, setPaymentsStatusFilter,
    paymentsPeriodFilter, setPaymentsPeriodFilter,
    isLoading,
    busy,
    selectedPayment, setSelectedPayment,
    confirmPayLink, setConfirmPayLink,
    pageByTab, setPageByTab,
    filtered,
    paginated,
    safeCurrentPage,
    totalPages,
    pageStart,
    pageEnd,
    officePendingCount,
    isMaster,
    isAdminLawyer,
    canAccessOfficeRequests: canAccessOfficeRequests(user?.role),
    handleApproveZelle,
    handleRejectZelle,
    handleUpdateStatus,
    handleUpdateWithdrawalStatus,
    load: invalidate,
  };
}
