import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  listOrderPaymentsByStatus,
  listZellePaymentsByStatus,
  type StripeRecord,
  type ZelleRecord,
} from "@features/admin/services/zellePaymentsPageService";
import * as paymentService from "@features/payments/lib/paymentOps";
import * as notificationService from "@features/notifications/services/notify";
import { useAuth } from "@shared/hooks/useAuth";
import { useT } from "@app/app/i18n";

export type ZelleTab = "pending" | "approved" | "rejected";

export interface ZelleUnifiedPayment {
  id: string;
  source: "zelle" | "stripe";
  clientName: string;
  clientEmail: string;
  serviceName: string;
  serviceSlug: string;
  amount: number;
  method: string;
  createdAt: string;
  zelleId?: string;
  userId?: string | null;
  proofUrl?: string | null;
  confirmationCode?: string | null;
  paymentDate?: string;
  adminNotes?: string | null;
  expectedAmount?: number | null;
  paymentStatus?: string | null;
  couponCode?: string | null;
  discountAmount?: number | null;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

export function buildZelleProofUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (raw.startsWith("http")) return raw;
  return `${SUPABASE_URL}/storage/v1/object/public/zelle_comprovantes/${raw}`;
}

export function useZellePayments() {
  const { user } = useAuth();
  const isMaster = user?.role === "master";
  const officeId = user?.officeId ?? null;

  const t = useT("admin");
  const tVisas = useT("visas");

  const [tab, setTab] = useState<ZelleTab>("pending");
  const [search, setSearch] = useState("");
  const [payments, setPayments] = useState<ZelleUnifiedPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<ZelleUnifiedPayment | null>(null);
  const [proofTarget, setProofTarget] = useState<ZelleUnifiedPayment | null>(null);

  const slugToName = useCallback((slug: string | null | undefined): string => {
    if (!slug) return "—";
    const serviceNameMap: Record<string, string> = {
      "visto-b1-b2": tVisas.processDetail.services["visto-b1-b2"].label,
      "visto-b1-b2-reaplicacao": tVisas.processDetail.services["visto-b1-b2-reaplicacao"].label,
      "visto-f1": tVisas.processDetail.services["visto-f1"].label,
      "visto-f1-reaplicacao": tVisas.processDetail.services["visto-f1-reaplicacao"].label,
      "extensao-status": tVisas.processDetail.services["extensao-status"].label,
      "troca-status": tVisas.processDetail.services["troca-status"].label,
      "analise-especialista-cos": t.payments.services.analiseCos,
      "analise-especialista-eos": t.payments.services.analiseEos,
      "motion-reconsideracao-cos": t.payments.services.motionCos,
      "motion-reconsideracao-eos": t.payments.services.motionEos,
      "rfe-support": t.payments.services.rfeSupport,
      "suporte-rfe-eos": t.payments.services.rfeEos,
      "suporte-rfe-cos": t.payments.services.rfeCos,
      "recovery-eos": t.payments.services.recoveryEos,
      "recovery-cos": t.payments.services.recoveryCos,
      "motion-support": t.payments.services.motionSupport,
      "mentoria-bronze": t.payments.services.mentoriaBronze,
      "mentoria-gold": t.payments.services.mentoriaGold,
    };
    return serviceNameMap[slug] ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }, [t, tVisas]);

  const load = useCallback(async () => {
    setIsLoading(true);
    const results: ZelleUnifiedPayment[] = [];

    if (tab === "pending") {
      const zelleData = await listZellePaymentsByStatus({ status: "pending_verification", officeId, isMaster });
      (zelleData ?? []).forEach((r: ZelleRecord) => {
        results.push({
          id: r.id,
          source: "zelle",
          zelleId: r.id,
          userId: r.user_id ?? null,
          clientName: r.guest_name ?? "",
          clientEmail: r.guest_email ?? "",
          serviceName: slugToName(r.service_slug),
          serviceSlug: r.service_slug,
          amount: r.amount,
          method: "zelle",
          createdAt: r.created_at,
          paymentStatus: r.status,
          proofUrl: buildZelleProofUrl(r.image_url || r.proof_path),
          confirmationCode: r.confirmation_code,
          paymentDate: r.payment_date,
          adminNotes: r.admin_notes,
          expectedAmount: r.expected_amount ?? null,
          couponCode: r.coupon_code || null,
          discountAmount: r.discount_amount ?? 0,
        });
      });
    } else if (tab === "approved") {
      const zelleData = await listZellePaymentsByStatus({ status: "approved", officeId, isMaster });
      (zelleData ?? []).forEach((r: ZelleRecord) => {
        results.push({
          id: r.id,
          source: "zelle",
          zelleId: r.id,
          userId: r.user_id ?? null,
          clientName: r.guest_name ?? "",
          clientEmail: r.guest_email ?? "",
          serviceName: slugToName(r.service_slug),
          serviceSlug: r.service_slug,
          amount: r.amount,
          method: "zelle",
          createdAt: r.created_at,
          proofUrl: buildZelleProofUrl(r.image_url || r.proof_path),
          confirmationCode: r.confirmation_code,
          expectedAmount: r.expected_amount ?? null,
          couponCode: r.coupon_code || null,
          discountAmount: r.discount_amount ?? 0,
        });
      });

      const stripeData = await listOrderPaymentsByStatus({
        statuses: ["paid", "complete", "succeeded", "completed"],
        officeId,
        isMaster,
      });
      (stripeData ?? []).forEach((r: StripeRecord) => {
        results.push({
          id: r.id,
          source: "stripe",
          clientName: r.client_name ?? "",
          clientEmail: r.client_email ?? "",
          serviceName: slugToName(r.product_slug ?? ""),
          serviceSlug: r.product_slug ?? "",
          amount: typeof r.total_price_usd === "string" ? parseFloat(r.total_price_usd) : (Number(r.total_price_usd) || 0),
          method: r.payment_method ?? "stripe_card",
          createdAt: r.created_at,
          paymentStatus: r.payment_status,
        });
      });
    } else if (tab === "rejected") {
      const [zelleData, stripeData] = await Promise.all([
        listZellePaymentsByStatus({ status: "rejected", officeId, isMaster }),
        listOrderPaymentsByStatus({ statuses: ["rejected", "cancelled", "failed", "error"], officeId, isMaster }),
      ]);

      (zelleData ?? []).forEach((r: ZelleRecord) => {
        results.push({
          id: r.id,
          source: "zelle",
          zelleId: r.id,
          clientName: r.guest_name ?? "",
          clientEmail: r.guest_email ?? "",
          serviceName: slugToName(r.service_slug),
          serviceSlug: r.service_slug,
          amount: r.amount,
          method: "zelle",
          createdAt: r.created_at,
          paymentStatus: r.status,
          proofUrl: buildZelleProofUrl(r.image_url || r.proof_path),
          confirmationCode: r.confirmation_code,
          adminNotes: r.admin_notes,
          expectedAmount: r.expected_amount ?? null,
          couponCode: r.coupon_code || null,
          discountAmount: r.discount_amount ?? 0,
        });
      });
      (stripeData ?? []).forEach((r: StripeRecord) => {
        results.push({
          id: r.id,
          source: "stripe",
          clientName: r.client_name ?? "",
          clientEmail: r.client_email ?? "",
          serviceName: slugToName(r.product_slug ?? ""),
          serviceSlug: r.product_slug ?? "",
          amount: typeof r.total_price_usd === "string" ? parseFloat(r.total_price_usd) : (Number(r.total_price_usd) || 0),
          method: r.payment_method ?? "stripe_card",
          createdAt: r.created_at,
          paymentStatus: r.payment_status,
        });
      });
    }

    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setPayments(results);
    setIsLoading(false);
  }, [tab, slugToName, isMaster, officeId]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (p: ZelleUnifiedPayment) => {
    if (!p.zelleId) return;
    setBusy(p.id);
    try {
      const approvedByName = user?.fullName || user?.email || "Admin";
      await paymentService.approveZellePayment(p.zelleId, approvedByName);
      await notificationService.notifyClient({
        userId: p.userId ?? undefined,
        link: "/dashboard",
        category: "payment",
        action: "zelle_approved",
        metadata: { amount: `$${p.amount.toFixed(2)}`, service_name: p.serviceName },
      });
      toast.success(t.payments.messages.approveSuccess.replace("{{name}}", p.clientName || "Client"));
      await load();
    } catch {
      toast.error(t.payments.messages.approveError);
    } finally {
      setBusy(null);
    }
  };

  const handleReject = async (p: ZelleUnifiedPayment, reason: string) => {
    if (!p.zelleId) return;
    setRejectTarget(null);
    setBusy(p.id);
    try {
      await paymentService.rejectZellePayment(p.zelleId, reason);
      await notificationService.notifyClient({
        userId: p.userId ?? undefined,
        link: "/dashboard",
        category: "payment",
        action: "zelle_rejected",
        metadata: { reason: reason || "Payment rejected by administrator.", service_name: p.serviceName },
      });
      toast.success(t.payments.messages.rejectSuccess);
      await load();
    } catch {
      toast.error(t.payments.messages.rejectError);
    } finally {
      setBusy(null);
    }
  };

  const filtered = payments.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.clientName.toLowerCase().includes(q) ||
      p.clientEmail.toLowerCase().includes(q) ||
      p.serviceName.toLowerCase().includes(q) ||
      (p.confirmationCode ?? "").toLowerCase().includes(q)
    );
  });

  return {
    tab, setTab,
    search, setSearch,
    isLoading,
    busy,
    filtered,
    rejectTarget, setRejectTarget,
    proofTarget, setProofTarget,
    handleApprove,
    handleReject,
    load,
  };
}
