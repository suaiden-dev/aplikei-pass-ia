import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { RiSearchLine, RiCheckboxCircleLine, RiCloseCircleLine, RiImageLine, RiExternalLinkLine, RiCloseLine } from "react-icons/ri";
import { supabase } from "../../../lib/supabase";
import { paymentService } from "../../../services/payment.service";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "pending" | "approved" | "rejected";

interface UnifiedPayment {
  id: string;
  source: "zelle" | "stripe";
  clientName: string;
  clientEmail: string;
  serviceName: string;
  serviceSlug: string;
  amount: number;
  method: string;
  createdAt: string;
  // Zelle-only
  zelleId?: string;
  userId?: string | null;
  proofUrl?: string | null;
  confirmationCode?: string | null;
  paymentDate?: string;
  adminNotes?: string | null;
  expectedAmount?: number | null;
  paymentStatus?: string | null;
}

interface ZelleRecord {
  id: string;
  user_id?: string | null;
  guest_name?: string;
  guest_email?: string;
  service_slug: string;
  amount: number;
  created_at: string;
  status: string;
  image_url?: string;
  proof_path?: string;
  confirmation_code?: string;
  payment_date?: string;
  admin_notes?: string;
  expected_amount?: number;
}

interface StripeRecord {
  id: string;
  client_name?: string;
  client_email?: string;
  product_slug?: string;
  total_price_usd: string | number;
  payment_method?: string;
  created_at: string;
  payment_status?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

const APLIKEI_SLUGS = [
  "visto-b1-b2", 
  "visto-f1", 
  "extensao-status", 
  "troca-status", 
  "analise-especialista-cos",
  "mentoria-bronze",
  "mentoria-silver",
  "mentoria-gold",
  "consultoria-especialista",
  "consultoria-b1-negativa"
];

function slugToName(slug: string | null | undefined): string {
  if (!slug) return "—";
  const map: Record<string, string> = {
    "visto-b1-b2":     "Visto B1 B2",
    "visto-f1":        "Visto F1",
    "extensao-status": "Extensão Status",
    "troca-status":    "Troca Status",
  };
  return (
    map[slug] ??
    slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

function methodLabel(m: string): string {
  const map: Record<string, string> = {
    stripe_card: "Stripe Card",
    stripe_pix:  "Stripe Pix",
    zelle:       "Zelle",
    card:        "Stripe Card",
    pix:         "Stripe Pix",
  };
  return map[m] ?? m.toUpperCase();
}

function buildProofUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (raw.startsWith("http")) return raw;
  return `${SUPABASE_URL}/storage/v1/object/public/zelle_comprovantes/${raw}`;
}

function fmtCurrency(n: number) {
  return `$${n.toFixed(2)}`;
}

// ─── Proof lightbox ───────────────────────────────────────────────────────────

function ProofLightbox({ url, name, onClose }: { url: string; name: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-xl w-full"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <p className="text-sm font-bold text-slate-800">Comprovante — {name}</p>
          <div className="flex items-center gap-3">
            <a href={url} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1 text-xs text-primary hover:underline">
              <RiExternalLinkLine /> Abrir
            </a>
            <button onClick={onClose}
              className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
              <RiCloseLine />
            </button>
          </div>
        </div>
        <img src={url} alt="Comprovante" className="w-full max-h-[70vh] object-contain bg-slate-50" />
      </motion.div>
    </div>
  );
}

// ─── Reject modal ─────────────────────────────────────────────────────────────

function RejectModal({
  payment,
  onConfirm,
  onClose,
}: {
  payment: UnifiedPayment;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
         onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
      >
        <h3 className="font-display font-bold text-slate-800 text-lg mb-1">Rejeitar pagamento</h3>
        <p className="text-sm text-slate-400 mb-4">
          <strong className="text-slate-600">{payment.clientName}</strong> — {fmtCurrency(payment.amount)}
        </p>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Motivo (opcional)</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Ex: Comprovante ilegível, valor incorreto..."
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-red-200"
        />
        <div className="flex gap-3 mt-4">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button onClick={() => onConfirm(reason || "Rejeitado pelo administrador.")}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors">
            Confirmar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Payment row ──────────────────────────────────────────────────────────────

function PaymentRow({
  p,
  tab,
  onApprove,
  onReject,
  onViewProof,
  busy,
}: {
  p: UnifiedPayment;
  tab: Tab;
  onApprove: () => void;
  onReject: () => void;
  onViewProof: () => void;
  busy: boolean;
}) {
  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/40 transition-colors">
      {/* Cliente */}
      <td className="px-6 py-4">
        <p className="font-semibold text-slate-800 text-sm">{p.clientName || "Cliente sem nome"}</p>
        {p.clientEmail && <p className="text-xs text-slate-400 mt-0.5">{p.clientEmail}</p>}
      </td>

      {/* Serviço */}
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold">
          {p.serviceName}
        </span>
        {p.expectedAmount && (
          <p className="text-[10px] text-slate-400 mt-1">
            Esperado: {fmtCurrency(p.expectedAmount)}
          </p>
        )}
        {p.confirmationCode && (
          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
            Cód: {p.confirmationCode}
          </p>
        )}
      </td>

      {/* Pagamento */}
      <td className="px-6 py-4">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
          Método: {methodLabel(p.method)}
        </p>
        <p className="font-black text-primary text-lg leading-tight">
          {fmtCurrency(p.amount)}
        </p>
        {p.proofUrl && (
          <button onClick={onViewProof}
            className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-primary transition-colors mt-1">
            <RiImageLine className="text-xs" /> Ver comprovante
          </button>
        )}
        {p.source === "stripe" && p.paymentStatus && (
          <p className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold uppercase mt-1">
            <RiCheckboxCircleLine className="text-xs" /> Status: {p.paymentStatus}
          </p>
        )}
      </td>

      {/* Ações */}
      <td className="px-6 py-4 text-right">
        {tab === "pending" && (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={onApprove}
              disabled={busy}
              title="Aprovar"
              className="w-9 h-9 rounded-full border-2 border-emerald-500 text-emerald-500 flex items-center justify-center hover:bg-emerald-50 disabled:opacity-40 transition-colors"
            >
              <RiCheckboxCircleLine className="text-xl" />
            </button>
            <button
              onClick={onReject}
              disabled={busy}
              title="Rejeitar"
              className="w-9 h-9 rounded-full border-2 border-red-400 text-red-400 flex items-center justify-center hover:bg-red-50 disabled:opacity-40 transition-colors"
            >
              <RiCloseCircleLine className="text-xl" />
            </button>
          </div>
        )}
        {tab === "rejected" && p.adminNotes && (
          <p className="text-xs text-slate-400 max-w-[160px] text-right">{p.adminNotes}</p>
        )}
      </td>
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ZellePaymentsPage() {
  const [tab, setTab] = useState<Tab>("pending");
  const [search, setSearch] = useState("");
  const [payments, setPayments] = useState<UnifiedPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<UnifiedPayment | null>(null);
  const [proofTarget, setProofTarget] = useState<UnifiedPayment | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    const results: UnifiedPayment[] = [];


    if (tab === "pending") {
      const { data: zelleData, error: zelleErr } = await supabase
        .from("zelle_payments")
        .select("*")
        .eq("status", "pending_verification")
        .order("created_at", { ascending: false });

      if (zelleErr)  console.error("[Payments] zelle_payments error:", zelleErr);

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
          proofUrl: buildProofUrl(r.image_url || r.proof_path),
          confirmationCode: r.confirmation_code,
          paymentDate: r.payment_date,
          adminNotes: r.admin_notes,
          expectedAmount: r.expected_amount ?? null,
        });
      });

      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    if (tab === "approved") {
      // Zelle approved
      const { data: zelleData } = await supabase
        .from("zelle_payments")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

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
          proofUrl: buildProofUrl(r.image_url || r.proof_path),
          confirmationCode: r.confirmation_code,
          expectedAmount: r.expected_amount ?? null,
        });
      });

      // Stripe approved (visa_orders) — include more successful statuses just in case
      const { data: stripeData, error: stripeError } = await supabase
        .from("visa_orders")
        .select("id, client_name, client_email, product_slug, total_price_usd, payment_method, created_at, payment_status")
        .in("payment_status", ["paid", "complete", "succeeded", "completed"])
        .in("product_slug", APLIKEI_SLUGS)
        .order("created_at", { ascending: false });

      if (stripeError) console.error("[Payments] visa_orders error:", stripeError);
      else console.log("[Payments] visa_orders rows:", stripeData?.length, stripeData);

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

      // Sort combined by date
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    if (tab === "rejected") {
      const [{ data: zelleData }, { data: stripeData }] = await Promise.all([
        supabase
          .from("zelle_payments")
          .select("*")
          .eq("status", "rejected")
          .order("created_at", { ascending: false }),
        supabase
          .from("visa_orders")
          .select("*")
          .in("payment_status", ["rejected", "cancelled", "failed", "error"])
          .in("product_slug", APLIKEI_SLUGS)
          .order("created_at", { ascending: false })
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
          proofUrl: buildProofUrl(r.image_url || r.proof_path),
          confirmationCode: r.confirmation_code,
          adminNotes: r.admin_notes,
          expectedAmount: r.expected_amount ?? null,
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
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    setPayments(results);
    setIsLoading(false);
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (p: UnifiedPayment) => {
    if (!p.zelleId) return;
    setBusy(p.id);
    try {
      await paymentService.approveZellePayment(p.zelleId);

      // Activate service in user_services if we have the user_id
      if (p.userId && p.serviceSlug) {
        let paidDependents = 0;
        if (p.adminNotes) {
          const match = p.adminNotes.match(/Dependentes:\s*(\d+)/i);
          if (match) paidDependents = parseInt(match[1], 10);
        }

        await supabase.from("user_services").insert(
          { 
            user_id: p.userId, 
            service_slug: p.serviceSlug, 
            status: "active", 
            current_step: 0,
            step_data: { paid_dependents: paidDependents }
          }
        );
      }

      toast.success(`${p.clientName || "Cliente"} aprovado!`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao aprovar.");
    } finally {
      setBusy(null);
    }
  };

  const handleReject = async (p: UnifiedPayment, reason: string) => {
    if (!p.zelleId) return;
    setRejectTarget(null);
    setBusy(p.id);
    try {
      await paymentService.rejectZellePayment(p.zelleId, reason);
      toast.success("Pagamento rejeitado.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao rejeitar.");
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

  const TABS: { key: Tab; label: string }[] = [
    { key: "pending",  label: "Pendentes" },
    { key: "approved", label: "Aprovados" },
    { key: "rejected", label: "Rejeitados" },
  ];

  return (
    <>
      <div className="p-8 w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-black text-slate-800 uppercase tracking-tight">
            Gestão de Pagamentos
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Fila de verificação manual de transferências Zelle e ativação de serviços.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-end gap-6 border-b border-slate-200 mb-6">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setTab(key); setSearch(""); }}
              className={`pb-3 text-sm font-semibold transition-colors ${
                tab === key
                  ? "text-slate-800 border-b-2 border-slate-800 -mb-px"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Search */}
          <div className="px-6 py-4 border-b border-slate-100">
            <div className="relative max-w-xs">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
              <input
                type="text"
                placeholder="Buscar por serviço..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400">
              Nenhum pagamento encontrado.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Cliente", "Nome do Serviço", "Pagamento", "Ações"].map((h) => (
                    <th key={h}
                      className="px-6 py-3 text-left text-xs font-semibold text-slate-400 tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <PaymentRow
                    key={`${p.source}-${p.id}`}
                    p={p}
                    tab={tab}
                    busy={busy === p.id}
                    onApprove={() => handleApprove(p)}
                    onReject={() => setRejectTarget(p)}
                    onViewProof={() => setProofTarget(p)}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {rejectTarget && (
          <RejectModal
            payment={rejectTarget}
            onConfirm={(r) => handleReject(rejectTarget, r)}
            onClose={() => setRejectTarget(null)}
          />
        )}
        {proofTarget?.proofUrl && (
          <ProofLightbox
            url={proofTarget.proofUrl}
            name={proofTarget.clientName}
            onClose={() => setProofTarget(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
