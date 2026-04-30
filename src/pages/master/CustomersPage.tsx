import { useEffect, useState } from "react";
import { CircleDollarSign, Download, UserPlus, Users } from "lucide-react";
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
import { onPortalEvent } from "../../mocks/customer-portal";
import { adminCustomerService, type AdminCustomerRecord } from "../../services/admin-customer.service";
import { formatCompactNumber, formatCurrency } from "../../utils/format";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomerRecord[]>(() =>
    adminCustomerService.listCustomers(),
  );

  useEffect(() => {
    const syncCustomers = () => {
      setCustomers(adminCustomerService.listCustomers());
    };

    syncCustomers();

    return onPortalEvent("aplikei:processes:changed", syncCustomers);
  }, []);

  const totalValue = customers.reduce((sum, item) => sum + item.lifetimeValue, 0);
  const activeCount = customers.filter((item) => item.status === "active").length;
  const newCount = customers.filter((item) => item.status === "new").length;
  const highlightedCustomer = customers[0];

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="CRM"
        title="Customers"
        description="Painel comercial mais próximo do visual premium do produto, com lista central e ficha lateral do cliente."
        actions={(
          <>
            <Button variant="outline" className="h-11 rounded-2xl px-4 font-semibold">
              <Download className="h-4 w-4" />
              Exportar base
            </Button>
            <Button className="h-11 rounded-2xl px-4 font-semibold">
              <UserPlus className="h-4 w-4" />
              Novo customer
            </Button>
          </>
        )}
      />

      <DashboardToolbar>
        <div className="flex flex-wrap items-center gap-2">
          <ToolbarPill label="Pipeline" active />
          <ToolbarPill label="Brasil" />
          <ToolbarPill label="Em risco" />
          <ToolbarPill label="High LTV" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <InlineMetric label="CAC mockado" value="R$ 420" helper="Aquisição média" />
          <InlineMetric label="Retenção" value="88%" helper="Carteira ativa" />
          <InlineMetric label="Tempo de ciclo" value="19 dias" helper="Lead ao fechamento" />
        </div>
      </DashboardToolbar>

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Base de clientes" value={formatCompactNumber(customers.length)} delta="CRM consolidado" icon={Users} />
        <KpiCard label="Clientes novos" value={String(newCount)} delta="Onboarding em curso" icon={UserPlus} />
        <KpiCard label="LTV consolidado" value={formatCurrency(totalValue)} delta={`${activeCount} ativos`} icon={CircleDollarSign} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
        <DashboardSection title="Customers list" description="Tabela principal com leitura de CRM e sinais de risco.">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-text-muted">
                <tr>
                  <th className="pb-3 pr-4 font-semibold">Cliente</th>
                  <th className="pb-3 pr-4 font-semibold">Etapa</th>
                  <th className="pb-3 pr-4 font-semibold">País</th>
                  <th className="pb-3 pr-4 font-semibold">Owner</th>
                  <th className="pb-3 pr-4 font-semibold">LTV</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-t border-border align-top">
                    <td className="py-4 pr-4">
                      <p className="font-semibold text-text">{customer.name}</p>
                      <p className="text-text-muted">{customer.email}</p>
                    </td>
                    <td className="py-4 pr-4 text-text-muted">
                      <div className="space-y-1">
                        {customer.stageDetails.map((stage) => (
                          <p key={`${customer.id}-${stage}`} className="leading-snug">
                            {stage}
                          </p>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-text-muted">{customer.country}</td>
                    <td className="py-4 pr-4 text-text-muted">{customer.owner}</td>
                    <td className="py-4 pr-4 font-semibold text-text">{formatCurrency(customer.lifetimeValue)}</td>
                    <td className="py-4">
                      <StatusBadge
                        label={customer.status}
                        tone={customer.status === "active" ? "green" : customer.status === "new" ? "blue" : "red"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardSection>

        <div className="space-y-6">
          <DashboardSection title="Customer spotlight" description="Leitura lateral, mais próxima do card profile/admin do pass-ia.">
            {highlightedCustomer ? (
              <div className="rounded-[1.5rem] border border-border bg-bg-subtle p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 font-display text-lg font-black text-primary">
                    {highlightedCustomer.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-display text-2xl font-black tracking-[-0.03em] text-text">{highlightedCustomer.name}</p>
                    <p className="text-sm text-text-muted">{highlightedCustomer.email}</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-3">
                  <InlineMetric label="Etapa principal" value={highlightedCustomer.stage} />
                  <InlineMetric label="Owner" value={highlightedCustomer.owner} />
                  <InlineMetric label="LTV" value={formatCurrency(highlightedCustomer.lifetimeValue)} />
                </div>
                {highlightedCustomer.stageDetails.length > 1 && (
                  <div className="mt-4 space-y-2 rounded-2xl border border-border bg-white/70 p-4 text-sm text-text-muted">
                    {highlightedCustomer.stageDetails.map((stage) => (
                      <p key={`spotlight-${stage}`}>{stage}</p>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </DashboardSection>

          <DashboardSection title="Flags" description="Itens de atenção para priorização comercial.">
            <div className="space-y-3">
              <div className="rounded-2xl border border-border bg-bg-subtle p-4 text-sm text-text-muted">
                2 clientes estão em risco por pendência de pagamento ou atraso documental.
              </div>
              <div className="rounded-2xl border border-border bg-bg-subtle p-4 text-sm text-text-muted">
                Clientes de Portugal estão convertendo melhor na linha de F-1 premium.
              </div>
            </div>
          </DashboardSection>
        </div>
      </div>
    </div>
  );
}
