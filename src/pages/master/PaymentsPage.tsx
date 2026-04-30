import { ArrowDownRight, BadgeDollarSign, Clock3, Download, Filter, Plus, RotateCcw } from "lucide-react";
import { Button } from "../../components/Button";
import {
  DashboardPageHeader,
  DashboardSection,
  DashboardToolbar,
  InlineMetric,
  KpiCard,
  StatusBadge,
  ToolbarPill,
} from "../../components/master/DashboardUI";
import { paymentRecords } from "../../mocks/master-dashboard";
import { formatCurrency, formatDate } from "../../utils/format";

export default function PaymentsPage() {
  const paidTotal = paymentRecords.filter((item) => item.status === "paid").reduce((sum, item) => sum + item.amount, 0);
  const pendingTotal = paymentRecords.filter((item) => item.status === "pending").reduce((sum, item) => sum + item.amount, 0);
  const refundedTotal = paymentRecords.filter((item) => item.status === "refunded").reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Financeiro"
        title="Payments"
        description="Fluxo financeiro em formato executivo, com ledger central, filtros rápidos e monitoramento de pendências."
        actions={(
          <>
            <Button variant="outline" className="h-11 rounded-2xl px-4 font-semibold">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button className="h-11 rounded-2xl px-4 font-semibold">
              <Plus className="h-4 w-4" />
              Novo recebimento
            </Button>
          </>
        )}
      />

      <DashboardToolbar>
        <div className="flex flex-wrap items-center gap-2">
          <ToolbarPill label="Hoje" active />
          <ToolbarPill label="PIX" />
          <ToolbarPill label="High ticket" />
          <ToolbarPill label="Falhas" icon={Filter} />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <InlineMetric label="Aprovacao" value="84%" helper="Taxa do checkout mockado" />
          <InlineMetric label="Ticket medio" value="R$ 3,8 mil" helper="Clientes com maior conversao" />
          <InlineMetric label="SLA financeiro" value="12 min" helper="Tempo medio para conferência" />
        </div>
      </DashboardToolbar>

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Recebido" value={formatCurrency(paidTotal)} delta="Fluxo positivo" icon={BadgeDollarSign} />
        <KpiCard label="Pendente" value={formatCurrency(pendingTotal)} delta="Cobrar hoje" icon={Clock3} />
        <KpiCard label="Reembolsado" value={formatCurrency(refundedTotal)} delta="Monitorar churn" icon={RotateCcw} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <DashboardSection title="Transactions board" description="Tabela principal em estilo operacional para conferência de recebimentos.">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-text-muted">
                <tr>
                  <th className="pb-3 pr-4 font-semibold">Cliente</th>
                  <th className="pb-3 pr-4 font-semibold">Produto</th>
                  <th className="pb-3 pr-4 font-semibold">Metodo</th>
                  <th className="pb-3 pr-4 font-semibold">Data</th>
                  <th className="pb-3 pr-4 font-semibold">Valor</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {paymentRecords.map((payment) => (
                  <tr key={payment.id} className="border-t border-border align-top">
                    <td className="py-4 pr-4">
                      <p className="font-semibold text-text">{payment.customer}</p>
                      <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-text-muted">{payment.id}</p>
                    </td>
                    <td className="py-4 pr-4 text-text-muted">{payment.product}</td>
                    <td className="py-4 pr-4 text-text-muted">{payment.method}</td>
                    <td className="py-4 pr-4 text-text-muted">{formatDate(payment.date)}</td>
                    <td className="py-4 pr-4 font-semibold text-text">{formatCurrency(payment.amount)}</td>
                    <td className="py-4">
                      <StatusBadge
                        label={payment.status}
                        tone={
                          payment.status === "paid"
                            ? "green"
                            : payment.status === "pending"
                              ? "amber"
                              : payment.status === "refunded"
                                ? "blue"
                                : "red"
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardSection>

        <div className="space-y-6">
          <DashboardSection title="Settlement focus" description="Fila curta para atuação do master financeiro.">
            <div className="space-y-3">
              {paymentRecords.slice(0, 3).map((payment) => (
                <div key={payment.id} className="rounded-2xl border border-border bg-bg-subtle p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-text">{payment.customer}</p>
                      <p className="text-sm text-text-muted">{payment.method} • {payment.product}</p>
                    </div>
                    <StatusBadge
                      label={payment.status}
                      tone={payment.status === "paid" ? "green" : payment.status === "pending" ? "amber" : "blue"}
                    />
                  </div>
                  <p className="mt-3 font-display text-xl font-black text-text">{formatCurrency(payment.amount)}</p>
                </div>
              ))}
            </div>
          </DashboardSection>

          <DashboardSection title="Insight rápido" description="Leitura curta para tomada de decisão.">
            <div className="space-y-3 text-sm text-text-muted">
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-bg-subtle p-4">
                <ArrowDownRight className="h-4 w-4 text-success" />
                72% dos payments do período foram via PIX, mantendo custo operacional menor.
              </div>
              <div className="rounded-2xl border border-border bg-bg-subtle p-4">
                O lote com maior risco está em cartões internacionais com tentativa duplicada.
              </div>
            </div>
          </DashboardSection>
        </div>
      </div>
    </div>
  );
}
