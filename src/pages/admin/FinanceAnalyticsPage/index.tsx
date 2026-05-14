import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  RiLineChartLine, 
  RiBarChartGroupedLine, 
  RiBuilding2Line, 
  RiInformationLine,
  RiArrowRightUpLine
} from "react-icons/ri";
import { useT } from "../../../i18n";
import { useAuth } from "../../../hooks/useAuth";
import { Button } from "../../../components/atoms/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../../components/atoms/dialog";
import { cn } from "../../../utils/cn";
import {
  financeAnalyticsService,
  type FinanceMonthlyAnalytics,
  type FinanceTransaction,
} from "../../../services/finance-analytics.service";

// ─── Types ────────────────────────────────────────────────────────────────────

type AnalyticsData = FinanceMonthlyAnalytics;
type Transaction = FinanceTransaction;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtCurrency(n: number) {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─── Components ───────────────────────────────────────────────────────────────

function AnalyticsChart({
  data,
  title,
  type = "revenue",
  revenueLabel,
  profitLabel,
}: {
  data: AnalyticsData[];
  title: string;
  type?: "revenue" | "comparison";
  revenueLabel: string;
  profitLabel: string;
}) {
  const maxVal = data.length
    ? Math.max(...data.map((d) => (type === "comparison" ? Math.max(d.revenue, d.profit) : d.revenue)))
    : 1000;
  
  return (
    <div className="bg-card rounded-3xl border border-border p-6 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-sm font-black uppercase tracking-widest text-text flex items-center gap-2">
          {type === "revenue" ? <RiLineChartLine className="text-primary" /> : <RiBarChartGroupedLine className="text-success" />}
          {title}
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-[10px] font-bold text-text-muted uppercase">{revenueLabel}</span>
          </div>
          {type === "comparison" && (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-[10px] font-bold text-text-muted uppercase">{profitLabel}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex items-end gap-2 sm:gap-4 min-h-[200px]">
        {data.map((item, i) => {
          const revHeight = (item.revenue / maxVal) * 100;
          const profHeight = (item.profit / maxVal) * 100;

          return (
            <div key={item.month} className="flex-1 flex flex-col items-center gap-3 group relative">
              <div className="w-full flex items-end justify-center gap-1 h-48 relative">
                {/* Revenue Bar */}
                <motion.div 
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: i * 0.05 }}
                  style={{ height: `${Math.max(revHeight, 2)}%`, originY: 1 }}
                  className={cn(
                    "w-full max-w-[16px] rounded-t-md transition-all relative group/bar",
                    type === "revenue" ? "bg-primary/80 hover:bg-primary hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]" : "bg-primary/60"
                  )}
                >
                   <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-text text-bg text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-30">
                    {fmtCurrency(item.revenue)}
                  </div>
                </motion.div>

                {/* Profit Bar (if comparison) */}
                {type === "comparison" && (
                  <motion.div 
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: (i * 0.05) + 0.1 }}
                    style={{ height: `${Math.max(profHeight, 2)}%`, originY: 1 }}
                    className="w-full max-w-[16px] rounded-t-md bg-success/80 hover:bg-success hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all relative group/bar2"
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-text text-bg text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover/bar2:opacity-100 transition-opacity whitespace-nowrap z-30">
                      {fmtCurrency(item.profit)}
                    </div>
                  </motion.div>
                )}
              </div>
              <span className="text-[10px] font-black text-text-muted uppercase tracking-tighter">{item.month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FinanceAnalyticsPage() {
  const t = useT("admin");
  const { user: currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const officeId = currentUser?.role === "admin_lawyer" ? currentUser.officeId : undefined;
      
      const [txData, monthlyData] = await Promise.all([
        financeAnalyticsService.getRecentTransactions(50, officeId || undefined),
        financeAnalyticsService.getMonthlyAnalytics(6, officeId || undefined),
      ]);
      setTransactions(txData);
      setAnalytics(monthlyData);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load analytics data.");
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col gap-1 text-left">
        <h1 className="text-3xl font-black text-text tracking-tighter uppercase flex items-center gap-3">
          {t.financeAnalytics.title}
          {currentUser?.role === "master" && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{t.financeAnalytics.masterOnly}</span>
          )}
          {currentUser?.role === "admin_lawyer" && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">OFFICE CONTEXT</span>
          )}
        </h1>
        <p className="text-text-muted font-medium text-sm">{t.financeAnalytics.subtitle}</p>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          data={analytics.length ? analytics : []}
          title={t.financeAnalytics.charts.revenueGrowth}
          type="revenue"
          revenueLabel={t.financeAnalytics.charts.revenueLegend}
          profitLabel={t.financeAnalytics.charts.profitLegend}
        />
        <AnalyticsChart
          data={analytics.length ? analytics : []}
          title={t.financeAnalytics.charts.revenueVsProfit}
          type="comparison"
          revenueLabel={t.financeAnalytics.charts.revenueLegend}
          profitLabel={t.financeAnalytics.charts.profitLegend}
        />
      </div>

      {/* Transactions Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-text uppercase tracking-tight">{t.financeAnalytics.table.title}</h2>
          <div className="flex items-center gap-2 text-xs font-bold text-success">
            <RiArrowRightUpLine />
            <span>{t.financeAnalytics.table.growthBadge}</span>
          </div>
        </div>

        <div className="bg-card rounded-[32px] border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto min-h-[300px]">
            {isLoading ? (
               <div className="flex items-center justify-center py-20">
                 <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
               </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center gap-3">
                <p className="text-sm font-black text-red-500 uppercase tracking-wider">{t.financeAnalytics.states.loadErrorTitle}</p>
                <p className="text-xs text-text-muted font-medium max-w-xl">{error}</p>
                <Button variant="outline" size="sm" className="rounded-xl font-bold uppercase text-[10px]" onClick={load}>
                  {t.financeAnalytics.states.retry}
                </Button>
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex items-center justify-center py-20 px-6 text-center">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider">{t.financeAnalytics.table.empty}</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-bg-subtle/50">
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">{t.financeAnalytics.table.customer}</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">{t.financeAnalytics.table.office}</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">{t.financeAnalytics.table.product}</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">{t.financeAnalytics.table.amount}</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">{t.financeAnalytics.table.method}</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">{t.financeAnalytics.table.action}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-bg-subtle/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-black text-text">{tx.clientName}</p>
                        <p className="text-[10px] text-text-muted font-medium">{tx.clientEmail}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <RiBuilding2Line className="text-text-muted" />
                          <span className="text-xs font-bold text-text-muted uppercase">{tx.officeName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-lg bg-primary/5 border border-primary/10 text-[10px] font-black text-primary uppercase">
                          {tx.productName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-black text-text">{fmtCurrency(tx.amount)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest bg-bg-subtle px-2 py-1 rounded-lg">
                          {tx.method}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 rounded-xl font-bold text-[10px] uppercase"
                          onClick={() => setSelectedTx(tx)}
                        >
                          {t.financeAnalytics.table.details}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedTx && (
          <Dialog open={true} onOpenChange={() => setSelectedTx(null)}>
            <DialogContent className="max-w-md border-border bg-card">
              <DialogHeader>
                <DialogTitle className="text-xl font-black text-text uppercase flex items-center gap-2">
                  <RiInformationLine className="text-primary" />
                  {t.financeAnalytics.modal.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-text-muted">
                  ID: {selectedTx.id}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-2xl bg-bg-subtle border border-border">
                    <p className="text-[9px] font-black text-text-muted uppercase mb-1">{t.financeAnalytics.modal.customer}</p>
                    <p className="text-xs font-bold text-text">{selectedTx.clientName}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-bg-subtle border border-border">
                    <p className="text-[9px] font-black text-text-muted uppercase mb-1">{t.financeAnalytics.modal.office}</p>
                    <p className="text-xs font-bold text-text">{selectedTx.officeName}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-bg-subtle border border-border">
                    <p className="text-[9px] font-black text-text-muted uppercase mb-1">{t.financeAnalytics.modal.product}</p>
                    <p className="text-xs font-bold text-text">{selectedTx.productName}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-bg-subtle border border-border">
                    <p className="text-[9px] font-black text-text-muted uppercase mb-1">{t.financeAnalytics.modal.total}</p>
                    <p className="text-sm font-black text-primary">{fmtCurrency(selectedTx.amount)}</p>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-bg-subtle border border-border">
                   <p className="text-[9px] font-black text-text-muted uppercase mb-1">{t.financeAnalytics.modal.statusMethod}</p>
                   <p className="text-xs font-bold text-text uppercase">{selectedTx.status} · {selectedTx.method}</p>
                </div>
              </div>

              <DialogFooter>
                <Button onClick={() => setSelectedTx(null)} className="w-full rounded-xl h-12 font-bold">
                  {t.financeAnalytics.modal.close}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
