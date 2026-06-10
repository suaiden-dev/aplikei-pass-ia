import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RiSearchLine, RiCheckboxCircleLine, RiCloseCircleLine, RiImageLine, RiExternalLinkLine, RiCloseLine } from "react-icons/ri";
import { useT } from "@app/app/i18n";
import { useZellePayments, type ZelleUnifiedPayment, type ZelleTab } from "@features/admin/hooks/useZellePayments";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtCurrency(n: number) {
    return `$${n.toFixed(2)}`;
}

// ─── Proof lightbox ───────────────────────────────────────────────────────────

function ProofLightbox({ url, name, onClose }: { url: string; name: string; onClose: () => void }) {
    const t = useT("admin");
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
                className="bg-card rounded-2xl shadow-2xl overflow-hidden max-w-xl w-full"
            >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <p className="text-sm font-bold text-text">{t.payments.modals.proofTitle.replace("{{name}}", name)}</p>
                    <div className="flex items-center gap-3">
                        <a href={url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-primary hover:underline">
                            <RiExternalLinkLine /> {t.payments.modals.openOriginal}
                        </a>
                        <button onClick={onClose}
                            className="w-7 h-7 rounded-lg hover:bg-bg-subtle flex items-center justify-center text-text-muted transition-colors">
                            <RiCloseLine />
                        </button>
                    </div>
                </div>
                <img src={url} alt="Comprovante" className="w-full max-h-[70vh] object-contain bg-bg-subtle" />
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
    payment: ZelleUnifiedPayment;
    onConfirm: (reason: string) => void;
    onClose: () => void;
}) {
    const t = useT("admin");
    const tShared = useT("common");
    const [reason, setReason] = useState("");
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card rounded-2xl shadow-2xl p-6 w-full max-w-md"
            >
                <h3 className="font-display font-bold text-text text-lg mb-1">{t.payments.modals.rejectTitle}</h3>
                <p className="text-sm text-text-muted mb-4 text-left">
                    <strong className="text-text">{payment.clientName}</strong> — {fmtCurrency(payment.amount)}
                </p>
                <label className="block text-xs font-semibold text-text mb-1.5 text-left">{t.payments.modals.reasonLabel}</label>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    placeholder={t.payments.modals.reasonPlaceholder}
                    className="w-full rounded-xl border border-border bg-bg-subtle px-3 py-2.5 text-sm text-text resize-none focus:outline-none focus:ring-2 focus:ring-danger/20"
                />
                <div className="flex gap-3 mt-4">
                    <button onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-text-muted hover:bg-bg-subtle transition-colors">
                        {tShared?.rejection?.cancel || "Cancelar"}
                    </button>
                    <button onClick={() => onConfirm(reason || t.payments.messages.rejectedByAdmin)}
                        className="flex-1 py-2.5 rounded-xl bg-danger text-white text-sm font-bold hover:bg-danger/90 transition-colors">
                        {(tShared?.confirm || "Confirm").replace("Confirm", tShared?.rejection?.confirm || "Reject")}
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
    p: ZelleUnifiedPayment;
    tab: ZelleTab;
    onApprove: () => void;
    onReject: () => void;
    onViewProof: () => void;
    busy: boolean;
}) {
    const t = useT("admin");
    const tShared = useT("common");

    const methodLabel = (m: string): string => {
        const map: Record<string, string> = {
            stripe_card: "Stripe Card",
            stripe_pix: "Stripe Pix",
            zelle: "Zelle",
            card: "Stripe Card",
            pix: "Stripe Pix",
        };
        const label = map[m] ?? m.toUpperCase();
        return t.payments.table.method.replace("{{method}}", label);
    };

    return (
        <tr className="border-b border-border last:border-0 hover:bg-bg-subtle/40 transition-colors">
            <td className="px-6 py-4 text-left">
                <p className="font-semibold text-text text-sm">{p.clientName || t.payments.table.noClientName}</p>
                {p.clientEmail && <p className="text-xs text-text-muted mt-0.5">{p.clientEmail}</p>}
            </td>

            <td className="px-6 py-4 text-left">
                <span className="inline-flex items-center px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold">
                    {p.serviceName}
                </span>
                {p.expectedAmount && (
                    <p className="text-[10px] text-text-muted mt-1">
                        {t.payments.table.expected.replace("{{amount}}", fmtCurrency(p.expectedAmount))}
                    </p>
                )}
                {p.confirmationCode && (
                    <p className="text-[10px] text-text-muted mt-0.5 font-mono">
                        {t.payments.table.code.replace("{{code}}", p.confirmationCode)}
                    </p>
                )}
            </td>

            <td className="px-6 py-4 text-left">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">
                    {methodLabel(p.method)}
                </p>
                <p className="font-black text-primary text-lg leading-tight">
                    {fmtCurrency(p.amount)}
                </p>
                {p.proofUrl && (
                    <button onClick={onViewProof}
                        className="flex items-center gap-1 text-[10px] text-text-muted hover:text-primary transition-colors mt-1">
                        <RiImageLine className="text-xs" /> {t.payments.table.viewProof}
                    </button>
                )}
                {p.source === "stripe" && p.paymentStatus && (
                    <p className="flex items-center gap-1 text-[10px] text-success font-bold uppercase mt-1">
                        <RiCheckboxCircleLine className="text-xs" /> {t.payments.table.statusSuffix.replace("{{status}}", p.paymentStatus)}
                    </p>
                )}
                {p.couponCode && (
                    <div className="mt-1.5 p-1.5 bg-success/10 border border-success/20 rounded-lg">
                        <p className="text-[9px] font-black text-success uppercase tracking-widest leading-none mb-1">{t.payments.table.couponApplied}</p>
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-text font-mono">{p.couponCode}</span>
                            {p.discountAmount ? (
                                <span className="text-[10px] font-black text-success">-{fmtCurrency(p.discountAmount)}</span>
                            ) : null}
                        </div>
                    </div>
                )}
            </td>

            <td className="px-6 py-4 text-right">
                {tab === "pending" && p.source === "zelle" && (
                    <div className="flex items-center justify-end gap-2">
                        <button
                            onClick={onApprove}
                            disabled={busy}
                            title={(tShared?.confirm || "Confirm").replace("Confirm", "Approve")}
                            className="w-9 h-9 rounded-full border-2 border-success text-success flex items-center justify-center hover:bg-success/10 disabled:opacity-40 transition-colors"
                        >
                            <RiCheckboxCircleLine className="text-xl" />
                        </button>
                        <button
                            onClick={onReject}
                            disabled={busy}
                            title={tShared?.rejection?.confirm || "Reject"}
                            className="w-9 h-9 rounded-full border-2 border-danger text-danger flex items-center justify-center hover:bg-danger/10 disabled:opacity-40 transition-colors"
                        >
                            <RiCloseCircleLine className="text-xl" />
                        </button>
                    </div>
                )}
                {tab === "pending" && p.source === "stripe" && (
                    <p className="text-[10px] text-text-muted italic">
                        {t.payments.table.autoProcessing || "Automatic Processing"}
                    </p>
                )}
                {tab === "rejected" && p.adminNotes && (
                    <p className="text-xs text-text-muted max-w-[160px] text-right">{p.adminNotes}</p>
                )}
            </td>
        </tr>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ZellePaymentsPage() {
    const t = useT("admin");
    const {
        tab, setTab,
        search, setSearch,
        isLoading,
        busy,
        filtered,
        rejectTarget, setRejectTarget,
        proofTarget, setProofTarget,
        handleApprove,
        handleReject,
    } = useZellePayments();

    const TABS: { key: ZelleTab; label: string }[] = [
        { key: "pending", label: t.payments?.tabs?.pending || "Payment Pending" },
        { key: "approved", label: t.payments?.tabs?.approved || "Approved Payments" },
        { key: "rejected", label: t.payments?.tabs?.rejected || "Rejected" },
    ];

    return (
        <>
            <div className="p-8 w-full">
                <div className="mb-8 text-left">
                    <h1 className="font-display text-3xl font-black text-text uppercase tracking-tight">
                        {t.payments.title}
                    </h1>
                    <p className="text-sm text-text-muted mt-1">
                        {t.payments.subtitle}
                    </p>
                </div>

                <div className="flex items-end gap-6 border-b border-border mb-6">
                    {TABS.map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => { setTab(key); setSearch(""); }}
                            className={`pb-3 text-sm font-semibold transition-colors ${tab === key
                                ? "text-text border-b-2 border-primary -mb-px"
                                : "text-text-muted hover:text-text"
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-border">
                        <div className="relative max-w-xs group">
                            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder={t.payments.searchPlaceholder}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-bg-subtle rounded-xl border border-border text-sm text-text focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all"
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-16 text-center text-sm text-text-muted">
                            {t.payments.title.toLowerCase()}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border bg-bg-subtle/50">
                                        {[t.payments.table.customer, t.payments.table.serviceName, t.payments.table.payment, t.payments.table.actions].map((h) => (
                                            <th key={h}
                                                className="px-6 py-3 text-left text-xs font-black text-text-muted tracking-widest uppercase">
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
                        </div>
                    )}
                </div>
            </div>

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
