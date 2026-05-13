import { useEffect, useState } from "react";
import { CircleDollarSign, Download, UserPlus, Users } from "lucide-react";
import { Button } from "../../components/atoms/button";
import {
  DashboardPageHeader,
  DashboardSection,
  DashboardToolbar,
  InlineMetric,
  KpiCard,
  StatusBadge,
  ToolbarPill,
} from "../../components/organisms/DashboardUI";
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
        description="Customer relationship management panel with premium design and centralized list."
        actions={(
          <>
            <Button variant="outline" className="h-11 rounded-2xl px-4 font-semibold">
              <Download className="h-4 w-4" />
              Export data
            </Button>
            <Button className="h-11 rounded-2xl px-4 font-semibold">
              <UserPlus className="h-4 w-4" />
              New customer
            </Button>
          </>
        )}
      />

      <DashboardToolbar>
        <div className="flex flex-wrap items-center gap-2">
          <ToolbarPill label="Pipeline" active />
          <ToolbarPill label="Brazil" />
          <ToolbarPill label="At Risk" />
          <ToolbarPill label="High LTV" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <InlineMetric label="CAC (Mocked)" value="R$ 420" helper="Acquisition Avg" />
          <InlineMetric label="Retention" value="88%" helper="Active Portfolio" />
          <InlineMetric label="Cycle Time" value="19 days" helper="Lead to Close" />
        </div>
      </DashboardToolbar>

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Customer base" value={formatCompactNumber(customers.length)} delta="Consolidated CRM" icon={Users} />
        <KpiCard label="New customers" value={String(newCount)} delta="Onboarding in progress" icon={UserPlus} />
        <KpiCard label="Consolidated LTV" value={formatCurrency(totalValue)} delta={`${activeCount} active`} icon={CircleDollarSign} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
        <DashboardSection title="Customers list" description="Main table with CRM data and risk signals.">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-text-muted">
                <tr>
                  <th className="pb-3 pr-4 font-semibold">Customer</th>
                  <th className="pb-3 pr-4 font-semibold">Stage</th>
                  <th className="pb-3 pr-4 font-semibold">Country</th>
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
          <DashboardSection title="Customer spotlight" description="Detailed view of the selected customer.">
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
                  <InlineMetric label="Main Stage" value={highlightedCustomer.stage} />
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

          <DashboardSection title="Flags" description="Attention items for commercial prioritization.">
            <div className="space-y-3">
              <div className="rounded-2xl border border-border bg-bg-subtle p-4 text-sm text-text-muted">
                2 customers are at risk due to payment or document pending.
              </div>
              <div className="rounded-2xl border border-border bg-bg-subtle p-4 text-sm text-text-muted">
                Customers from Portugal are converting better on F-1 premium line.
              </div>
            </div>
          </DashboardSection>
        </div>
      </div>
    </div>
  );
}
