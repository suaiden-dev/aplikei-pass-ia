import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import {
  RiArrowLeftLine,
  RiBuilding2Line,
  RiFileList3Line,
  RiMailLine,
  RiPhoneLine,
  RiTeamLine,
  RiUserLine,
} from "react-icons/ri";
import { fetchOfficeDetails } from "@features/offices/services/officeOps";
import type { MasterOfficeStats, OfficeProcess, OfficeTeamMember } from "@features/offices/types";
import { useT } from "@app/app/i18n";
import { toast } from "sonner";
import { useAuth } from "@shared/hooks/useAuth";

function normalizePlanName(name: string | null | undefined): string {
  const value = String(name || "").trim();
  const key = value.toLowerCase();
  if (key === "crescimento (variável)" || key === "crescimento (variavel)") return "Scalable Plan";
  if (key === "plano fixo") return "Fixed Plan";
  return value || "-";
}

export default function OfficeDetailsPage() {
  const t = useT("admin");
  const { officeId = "" } = useParams<{ officeId: string }>();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [office, setOffice] = useState<MasterOfficeStats | null>(null);
  const [sellers, setSellers] = useState<OfficeTeamMember[]>([]);
  const [managers, setManagers] = useState<OfficeTeamMember[]>([]);
  const [processes, setProcesses] = useState<OfficeProcess[]>([]);

  const routePrefix = user?.role === "master" ? "/master" : "";

  const load = useCallback(async () => {
    if (!officeId) return;
    setLoading(true);
    try {
      const details = await fetchOfficeDetails(officeId);
      setOffice(details.office);
      setSellers(details.sellers);
      setManagers(details.managers);
      setProcesses(details.processes);
    } catch (error) {
      console.error("[OfficeDetails] error:", error);
      toast.error(t.offices.messages.loadError);
    } finally {
      setLoading(false);
    }
  }, [officeId, t.offices.messages.loadError]);

  useEffect(() => {
    void load();
  }, [load]);

  const metrics = useMemo(() => {
    const total = office?.total_revenue ?? 0;
    const available = office?.available_balance ?? 0;
    const pending = office?.pending_amount ?? 0;
    const done = processes.filter((p) => p.status === "completed").length;
    return { total, available, pending, done };
  }, [office, processes]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!office) {
    return <div className="p-8">Office not found.</div>;
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-[1600px] mx-auto">
      <Link to="/master/offices" className="inline-flex items-center gap-2 text-sm font-bold text-text-muted hover:text-text">
        <RiArrowLeftLine /> Back to offices
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-3xl border border-border bg-card p-6 text-left">
          <div className="flex items-center gap-2 mb-4 font-black uppercase text-text"><RiBuilding2Line /> Main information</div>
          <div className="space-y-2 text-sm">
            <p><strong>Office:</strong> {office.office_name}</p>
            <p><strong>Responsible:</strong> {office.responsible_name || "-"}</p>
            <p><strong>CNPJ:</strong> {office.cnpj || "-"}</p>
            <p className="flex items-center gap-2"><RiMailLine /> {office.email || "-"}</p>
            <p className="flex items-center gap-2"><RiPhoneLine /> {office.phone || "-"}</p>
            <p><strong>Website:</strong> {office.website || "-"}</p>
            <p><strong>Plan:</strong> {normalizePlanName(office.active_plan_name)} ({office.subscription_status})</p>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 text-left">
          <div className="flex items-center gap-2 mb-4 font-black uppercase text-text"><RiFileList3Line /> Office metrics</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Metric label="Revenue" value={`$${metrics.total.toFixed(2)}`} />
            <Metric label="Available" value={`$${metrics.available.toFixed(2)}`} />
            <Metric label="Pending" value={`$${metrics.pending.toFixed(2)}`} />
            <Metric label="Processes" value={String(office.process_count)} />
            <Metric label="Completed" value={String(metrics.done)} />
            <Metric label="Pending Requests" value={String(office.pending_requests)} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ListCard
          title="All sellers"
          icon={<RiUserLine />}
          items={sellers.map((s) => ({ id: s.id, title: s.full_name || s.email || "-", subtitle: s.email || "-" }))}
        />

        <ListCard
          title="All managers"
          icon={<RiTeamLine />}
          items={managers.map((m) => ({ id: m.id, title: m.full_name || m.email || "-", subtitle: `${m.role} • ${m.email || "-"}` }))}
        />
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 text-left">
        <h3 className="font-black uppercase mb-4">All processes</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-border">
                <th className="py-2">Process</th>
                <th className="py-2">Client</th>
                <th className="py-2">Status</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {processes.map((p) => (
                <tr key={p.id} className="border-b border-border/60">
                  <td className="py-2">{p.service_slug}</td>
                  <td className="py-2">{p.user_accounts?.full_name || p.user_accounts?.email || p.user_id}</td>
                  <td className="py-2">{p.status || "-"}</td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <Link className="text-primary font-bold" to={`${routePrefix}/processes/${p.id}`}>View process</Link>
                      <Link className="text-text-muted font-bold" to={`${routePrefix}/customers`}>View customer</Link>
                    </div>
                  </td>
                </tr>
              ))}
              {processes.length === 0 && (
                <tr>
                  <td className="py-4 text-text-muted" colSpan={4}>No processes found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <p className="text-[10px] uppercase font-black text-text-muted">{label}</p>
      <p className="text-lg font-black text-text">{value}</p>
    </div>
  );
}

function ListCard({
  title,
  icon,
  items,
}: {
  title: string;
  icon: ReactNode;
  items: Array<{ id: string; title: string; subtitle: string }>;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 text-left">
      <h3 className="font-black uppercase mb-4 flex items-center gap-2">{icon} {title}</h3>
      <div className="space-y-2 max-h-72 overflow-auto pr-1">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-border p-3">
            <p className="font-bold text-sm">{item.title}</p>
            <p className="text-xs text-text-muted">{item.subtitle}</p>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-text-muted">No records.</p>}
      </div>
    </div>
  );
}
