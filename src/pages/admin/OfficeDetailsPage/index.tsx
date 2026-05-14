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
import { supabase } from "../../../shared/lib/supabase";
import { useT } from "../../../i18n";
import { toast } from "sonner";
import { useAuth } from "../../../hooks/useAuth";

type OfficeStats = {
  office_id: string;
  office_name: string;
  responsible_name: string | null;
  cnpj: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  process_count: number;
  total_revenue: number;
  available_balance: number;
  pending_requests: number;
  pending_amount: number;
  active_plan_name: string;
  subscription_status: string;
};

type TeamMember = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
};

type OfficeProcess = {
  id: string;
  service_slug: string;
  status: string | null;
  current_step: number | null;
  created_at: string | null;
  user_id: string;
  user_accounts?: {
    full_name: string | null;
    email: string | null;
  } | null;
};

type OfficeProcessRow = Omit<OfficeProcess, "user_accounts"> & {
  user_accounts?: Array<{ full_name: string | null; email: string | null }> | { full_name: string | null; email: string | null } | null;
};

export default function OfficeDetailsPage() {
  const t = useT("admin");
  const { officeId = "" } = useParams<{ officeId: string }>();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [office, setOffice] = useState<OfficeStats | null>(null);
  const [sellers, setSellers] = useState<TeamMember[]>([]);
  const [managers, setManagers] = useState<TeamMember[]>([]);
  const [processes, setProcesses] = useState<OfficeProcess[]>([]);

  const routePrefix = user?.role === "master" ? "/master" : "";

  const load = useCallback(async () => {
    if (!officeId) return;
    setLoading(true);
    try {
      const [{ data: officeData, error: officeError }, { data: membersData, error: membersError }, { data: processData, error: processError }] = await Promise.all([
        supabase.from("v_master_office_stats").select("*").eq("office_id", officeId).maybeSingle(),
        supabase
          .from("user_accounts")
          .select("id, full_name, email, role")
          .eq("office_id", officeId)
          .in("role", ["seller", "manager", "admin_lawyer"]),
        supabase
          .from("user_services")
          .select("id, service_slug, status, current_step, created_at, user_id, office_id, user_accounts:profiles(full_name, email)")
          .eq("office_id", officeId)
          .order("created_at", { ascending: false }),
      ]);

      if (officeError) throw officeError;
      if (membersError) throw membersError;
      if (processError) throw processError;

      setOffice((officeData as OfficeStats | null) ?? null);

      const members = (membersData as TeamMember[] | null) ?? [];
      setSellers(members.filter((m) => m.role === "seller"));
      setManagers(members.filter((m) => m.role === "manager" || m.role === "admin_lawyer"));

      const processRows = ((processData as unknown as OfficeProcessRow[] | null) ?? []);
      setProcesses(processRows.map((p) => ({
        ...p,
        user_accounts: Array.isArray(p.user_accounts) ? p.user_accounts[0] : p.user_accounts,
      })));
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
          <div className="flex items-center gap-2 mb-4 font-black uppercase text-text"><RiBuilding2Line /> Informações principais</div>
          <div className="space-y-2 text-sm">
            <p><strong>Office:</strong> {office.office_name}</p>
            <p><strong>Responsible:</strong> {office.responsible_name || "-"}</p>
            <p><strong>CNPJ:</strong> {office.cnpj || "-"}</p>
            <p className="flex items-center gap-2"><RiMailLine /> {office.email || "-"}</p>
            <p className="flex items-center gap-2"><RiPhoneLine /> {office.phone || "-"}</p>
            <p><strong>Website:</strong> {office.website || "-"}</p>
            <p><strong>Plano:</strong> {office.active_plan_name || "-"} ({office.subscription_status})</p>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 text-left">
          <div className="flex items-center gap-2 mb-4 font-black uppercase text-text"><RiFileList3Line /> Métricas do escritório</div>
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
          title="Todos os vendedores"
          icon={<RiUserLine />}
          items={sellers.map((s) => ({ id: s.id, title: s.full_name || s.email || "-", subtitle: s.email || "-" }))}
        />

        <ListCard
          title="Todos os managers"
          icon={<RiTeamLine />}
          items={managers.map((m) => ({ id: m.id, title: m.full_name || m.email || "-", subtitle: `${m.role} • ${m.email || "-"}` }))}
        />
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 text-left">
        <h3 className="font-black uppercase mb-4">Todos os processos</h3>
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
                      <Link className="text-primary font-bold" to={`${routePrefix}/processes/${p.id}`}>Ver processo</Link>
                      <Link className="text-text-muted font-bold" to={`${routePrefix}/customers`}>Ver cliente</Link>
                    </div>
                  </td>
                </tr>
              ))}
              {processes.length === 0 && (
                <tr>
                  <td className="py-4 text-text-muted" colSpan={4}>Nenhum processo encontrado.</td>
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
        {items.length === 0 && <p className="text-sm text-text-muted">Nenhum registro.</p>}
      </div>
    </div>
  );
}
