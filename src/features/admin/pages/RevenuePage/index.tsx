import { AnimatePresence, motion } from "framer-motion";
import {
  RiSearchLine,
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiInformationLine,
  RiUser3Line,
  RiBuilding2Line,
  RiMoneyDollarCircleLine,
  RiShoppingBag3Line,
} from "react-icons/ri";
import { useT } from "@app/app/i18n";
import { Button } from "@shared/components/atoms/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@shared/components/atoms/dialog";
import { cn } from "@shared/utils/cn";
import { useRevenuePage, type UnifiedPayment, buildProofUrl as _buildProofUrl } from "@features/admin/hooks/useRevenuePage";
import { shouldShowPaymentsOfficeField } from "@features/admin/hooks/revenueCalculations";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeExternalUrl(raw: string): string {
  const value = raw.trim();
  if (!value) return "#";
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

function fmtCurrency(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─── DetailModal ──────────────────────────────────────────────────────────────

function DetailModal({
  payment,
  onClose,
  onApprove,
  onReject,
  busy,
  onPay,
  showOfficeField,
}: {
  payment: UnifiedPayment;
  onClose: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  busy?: boolean;
  onPay?: () => void;
  showOfficeField: boolean;
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
            {showOfficeField && (
              <div className="p-4 rounded-2xl bg-bg-subtle border border-border space-y-1">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-1">
                  <RiBuilding2Line /> {t.offices.table.office}
                </p>
                <p className="text-sm font-black text-text">{payment.officeName || "—"}</p>
              </div>
            )}
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
                <a href={payment.proofUrl} target="_blank" rel="noopener noreferrer" className="block cursor-zoom-in" title={t.payments.modals.openOriginal}>
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
                <Button type="button" onClick={onPay} className="h-10 rounded-xl bg-primary text-white font-bold hover:bg-primary/90">
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

        {(onApprove || onReject) && (
          <DialogFooter className="p-6 border-t border-border bg-bg-subtle/30 gap-2">
            <Button variant="outline" onClick={onClose} className="rounded-xl h-12 flex-1 font-bold">
              {t.shared.cancel}
            </Button>
            {onReject && (
              <Button onClick={onReject} disabled={busy} variant="outline" className="rounded-xl h-12 flex-1 border-danger text-danger hover:bg-danger/5 font-bold">
                {t.shared.rejection.confirm}
              </Button>
            )}
            {onApprove && (
              <Button onClick={onApprove} disabled={busy} className="rounded-xl h-12 flex-1 bg-success text-white shadow-xl shadow-success/20 font-bold hover:bg-success/90">
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
  const {
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
    canAccessOfficeRequests,
    handleApproveZelle,
    handleRejectZelle,
    handleUpdateWithdrawalStatus,
  } = useRevenuePage();
  const showOfficeField = shouldShowPaymentsOfficeField(isMaster ? "master" : undefined);

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
          <p className="text-sm font-black uppercase tracking-widest text-primary">{"Payments"}</p>
        </div>
      ) : (
        <div className="flex flex-wrap items-end gap-6 border-b border-border">
          <button
            onClick={() => setTab("zelle")}
            className={cn("pb-4 text-sm font-black uppercase tracking-widest transition-all relative", tab === "zelle" ? "text-primary" : "text-text-muted hover:text-text")}
          >
            {t.payments?.tabs?.pending || "Payment Pending"}
            {tab === "zelle" && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
          </button>
          {canAccessOfficeRequests && (
            <button
              onClick={() => setTab("office_requests")}
              className={cn("pb-4 text-sm font-black uppercase tracking-widest transition-all relative", tab === "office_requests" ? "text-primary" : "text-text-muted hover:text-text")}
            >
              {t.payments?.tabs?.officeRequests || "Withdrawal Requests"}
              {tab === "office_requests" && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
            </button>
          )}
          <button
            onClick={() => setTab("approved_payments")}
            className={cn("pb-4 text-sm font-black uppercase tracking-widest transition-all relative", tab === "approved_payments" ? "text-primary" : "text-text-muted hover:text-text")}
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
            <select value={officeRequestStatusFilter} onChange={(e) => setOfficeRequestStatusFilter(e.target.value as typeof officeRequestStatusFilter)} className="h-10 px-3 rounded-xl border border-border bg-card text-xs font-bold uppercase tracking-wider">
              <option value="all">All</option>
              <option value="pending">Pending approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Period</span>
            <select value={officeRequestPeriodFilter} onChange={(e) => setOfficeRequestPeriodFilter(e.target.value as typeof officeRequestPeriodFilter)} className="h-10 px-3 rounded-xl border border-border bg-card text-xs font-bold uppercase tracking-wider">
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
            <select value={paymentsStatusFilter} onChange={(e) => setPaymentsStatusFilter(e.target.value as typeof paymentsStatusFilter)} className="h-10 px-3 rounded-xl border border-border bg-card text-xs font-bold uppercase tracking-wider">
              <option value="all">All</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Period</span>
            <select value={paymentsPeriodFilter} onChange={(e) => setPaymentsPeriodFilter(e.target.value as typeof paymentsPeriodFilter)} className="h-10 px-3 rounded-xl border border-border bg-card text-xs font-bold uppercase tracking-wider">
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
            <div className="py-20 text-center text-text-muted font-bold">{t.payments.table.noResults}</div>
          ) : tab === "approved_payments" ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-bg-subtle/50">
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">{t.payments.table.customer}</th>
                  {showOfficeField && (
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">{t.offices.table.office}</th>
                  )}
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">{t.payments.table.serviceName}</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Paid by customer</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Received</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Fee / Profit</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Status</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Date & Time</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Method</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginated.map((p) => {
                  const normalizedStatus = String(p.status || "").toLowerCase();
                  const isApprovedStatus = ["paid", "approved", "complete", "completed", "succeeded"].includes(normalizedStatus);
                  const isRejectedStatus = ["rejected", "cancelled", "canceled", "failed"].includes(normalizedStatus);
                  const statusClass = isApprovedStatus ? "text-success" : isRejectedStatus ? "text-danger" : "text-warning";
                  const feeAmt = Number(p.platformFeeAmount ?? 0);
                  return (
                    <tr key={p.id} className="hover:bg-bg-subtle/30 transition-colors text-left">
                      <td className="px-6 py-5">
                        <p className="text-sm font-black text-text">{p.clientName}</p>
                        <p className="text-[11px] text-text-muted font-medium">{p.clientEmail}</p>
                      </td>
                      {showOfficeField && (
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <RiBuilding2Line className="text-text-muted" />
                            <span className="text-xs font-bold text-text-muted uppercase tracking-tight">{p.officeName || "UNASSIGNED OFFICE"}</span>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-5">
                        <span className="inline-flex px-2 py-1 rounded-lg bg-primary/5 border border-primary/10 text-[10px] font-black text-primary uppercase tracking-widest">
                          {p.serviceName}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-black text-text">{fmtCurrency(p.amount)}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-black text-primary">{fmtCurrency(Number(p.officeNetAmount ?? p.amount))}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className={`text-sm font-black ${feeAmt > 0 ? (isAdminLawyer ? "text-danger" : "text-success") : "text-text-muted"}`}>
                          {feeAmt > 0 ? (isAdminLawyer ? `-${fmtCurrency(feeAmt)}` : fmtCurrency(feeAmt)) : "—"}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg", isApprovedStatus ? "bg-success/10 text-success" : isRejectedStatus ? "bg-danger/10 text-danger" : "bg-warning/10 text-warning", statusClass)}>
                          {p.status || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-xs font-bold text-text">{new Date(p.createdAt).toLocaleDateString("en-US")}</p>
                        <p className="text-[10px] font-medium text-text-muted">{new Date(p.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest bg-bg-subtle px-2 py-1 rounded-lg">{p.method}</span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Button variant="outline" size="sm" className="h-8 rounded-xl border-border px-3 font-bold text-[11px] uppercase tracking-wider inline-flex items-center gap-1.5" onClick={() => setSelectedPayment(p)}>
                          <RiInformationLine className="text-sm" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-bg-subtle/50">
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">{t.payments.table.customer}</th>
                  {showOfficeField && (
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">{t.offices.table.office}</th>
                  )}
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">{t.payments.table.serviceName}</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">{t.payments.table.payment}</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Date & Time</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Method</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginated.map((p) => {
                  const normalizedStatus = String(p.status || "").toLowerCase();
                  const isApprovedStatus = ["paid", "approved", "complete", "completed", "succeeded"].includes(normalizedStatus);
                  const isRejectedStatus = ["rejected", "cancelled", "canceled", "failed"].includes(normalizedStatus);
                  const statusClass = isApprovedStatus ? "text-success" : isRejectedStatus ? "text-danger" : "text-warning";
                  return (
                    <tr key={p.id} className="hover:bg-bg-subtle/30 transition-colors text-left">
                      <td className="px-6 py-5">
                        <p className="text-sm font-black text-text">{p.clientName}</p>
                        <p className="text-[11px] text-text-muted font-medium">{p.clientEmail}</p>
                      </td>
                      {showOfficeField && (
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <RiBuilding2Line className="text-text-muted" />
                            <span className="text-xs font-bold text-text-muted uppercase tracking-tight">{p.officeName || "UNASSIGNED OFFICE"}</span>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-5">
                        <span className="inline-flex px-2 py-1 rounded-lg bg-primary/5 border border-primary/10 text-[10px] font-black text-primary uppercase tracking-widest">
                          {p.serviceName}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-black text-text">{fmtCurrency(p.amount)}</p>
                        <p className={cn("text-[9px] font-black uppercase tracking-tighter", statusClass)}>{p.status}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-xs font-bold text-text">{new Date(p.createdAt).toLocaleDateString("en-US")}</p>
                        <p className="text-[10px] font-medium text-text-muted">{new Date(p.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest bg-bg-subtle px-2 py-1 rounded-lg">{p.method}</span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Button variant="outline" size="sm" className="h-8 rounded-xl border-border px-3 font-bold text-[11px] uppercase tracking-wider inline-flex items-center gap-1.5" onClick={() => setSelectedPayment(p)}>
                          <RiInformationLine className="text-sm" />
                          {t.payments.table.detailsBtn}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
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
              <Button variant="outline" size="sm" className="h-8 px-3 rounded-xl border-border text-[11px] font-bold uppercase tracking-wider" disabled={safeCurrentPage <= 1} onClick={() => setPageByTab((prev) => ({ ...prev, [tab]: Math.max(1, safeCurrentPage - 1) }))}>
                Anterior
              </Button>
              <span className="text-[11px] font-black text-text uppercase tracking-wider px-2">{`Página ${safeCurrentPage} de ${totalPages}`}</span>
              <Button variant="outline" size="sm" className="h-8 px-3 rounded-xl border-border text-[11px] font-bold uppercase tracking-wider" disabled={safeCurrentPage >= totalPages} onClick={() => setPageByTab((prev) => ({ ...prev, [tab]: Math.min(totalPages, safeCurrentPage + 1) }))}>
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
              tab === "zelle" && selectedPayment.source === "zelle" && String(selectedPayment.status).toLowerCase() === "pending_verification"
                ? () => void handleApproveZelle(selectedPayment)
                : tab === "office_requests" && selectedPayment.source === "withdrawal" && String(selectedPayment.status).toLowerCase() === "pending"
                  ? () => void handleUpdateWithdrawalStatus(selectedPayment.id, "approved")
                  : undefined
            }
            onReject={
              tab === "zelle" && selectedPayment.source === "zelle" && String(selectedPayment.status).toLowerCase() === "pending_verification"
                ? () => void handleRejectZelle(selectedPayment)
                : tab === "office_requests" && selectedPayment.source === "withdrawal" && String(selectedPayment.status).toLowerCase() === "pending"
                  ? () => void handleUpdateWithdrawalStatus(selectedPayment.id, "rejected")
                  : undefined
            }
            onPay={
              tab === "office_requests" && selectedPayment.source === "withdrawal" && !!selectedPayment.paymentLink
                ? () => setConfirmPayLink(normalizeExternalUrl(selectedPayment.paymentLink || ""))
                : undefined
            }
            busy={!!busy}
            showOfficeField={showOfficeField}
          />
        )}
      </AnimatePresence>

      <Dialog open={!!confirmPayLink} onOpenChange={(open) => { if (!open) setConfirmPayLink(null); }}>
        <DialogContent className="max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-text uppercase">Confirmar pagamento</DialogTitle>
            <DialogDescription className="text-sm text-text-muted">
              Você está prestes a abrir o link de pagamento. Deseja continuar?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmPayLink(null)}>Cancelar</Button>
            <Button onClick={() => { if (confirmPayLink) window.open(confirmPayLink, "_blank", "noopener,noreferrer"); setConfirmPayLink(null); }} className="bg-primary text-white hover:bg-primary/90">
              Confirmar e abrir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
