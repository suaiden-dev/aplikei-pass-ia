import { Activity, BadgeDollarSign, Clock3, Users } from "lucide-react";
import { DashboardPageHeader, DashboardSection, KpiCard, StatusBadge } from "../../components/master/DashboardUI";
import {
  caseRecords,
  chatRecords,
  customerRecords,
  paymentRecords,
  productRecords,
} from "../../mocks/master-dashboard";
import { formatCompactNumber, formatCurrency, formatDate } from "../../utils/format";

export default function AdminOverviewPage() {
  const paidRevenue = paymentRecords
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const unresolvedChats = chatRecords.filter((chat) => chat.status !== "resolved").length;
  const activeCustomers = customerRecords.filter((customer) => customer.status === "active").length;
  const pendingCases = caseRecords.filter((item) => item.status !== "approved").length;

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Admin operations"
        title="Painel operacional"
        description="Visão diária do admin com foco em atendimento, carteira, pagamentos e andamento dos processos."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Receita acompanhada" value={formatCurrency(paidRevenue)} delta="Recebimentos ativos" icon={BadgeDollarSign} />
        <KpiCard label="Clientes ativos" value={formatCompactNumber(activeCustomers)} delta="Carteira em andamento" icon={Users} />
        <KpiCard label="Chats pendentes" value={String(unresolvedChats)} delta="Atender hoje" icon={Clock3} />
        <KpiCard label="Cases abertos" value={String(pendingCases)} delta="Fila operacional" icon={Activity} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.9fr]">
        <DashboardSection title="Fila prioritária" description="Itens de trabalho com maior impacto operacional para o admin.">
          <div className="space-y-3">
            {caseRecords.slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-bg-subtle p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-text">{item.customer}</p>
                    <p className="text-sm text-text-muted">{item.visaType} • owner {item.owner}</p>
                  </div>
                  <StatusBadge
                    label={item.status.replace("_", " ")}
                    tone={item.status === "approved" ? "green" : item.status === "attention" ? "red" : "amber"}
                  />
                </div>
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-text-muted">
                  Atualizado em {formatDate(item.updatedAt)}
                </p>
              </div>
            ))}
          </div>
        </DashboardSection>

        <DashboardSection title="Resumo rápido" description="Leitura compacta para o turno administrativo.">
          <div className="space-y-3">
            <div className="rounded-2xl border border-border bg-bg-subtle p-4">
              <p className="text-sm text-text-muted">Produtos em atenção</p>
              <p className="mt-2 font-display text-3xl font-black text-text">
                {productRecords.filter((product) => product.status !== "active").length}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-bg-subtle p-4">
              <p className="text-sm text-text-muted">Pagamento pendente</p>
              <p className="mt-2 font-display text-3xl font-black text-text">
                {paymentRecords.filter((payment) => payment.status === "pending").length}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-bg-subtle p-4">
              <p className="text-sm text-text-muted">Clientes em risco</p>
              <p className="mt-2 font-display text-3xl font-black text-text">
                {customerRecords.filter((customer) => customer.status === "risk").length}
              </p>
            </div>
          </div>
        </DashboardSection>
      </div>
    </div>
  );
}
