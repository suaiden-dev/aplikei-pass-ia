import * as React from "react";
import { 
  RiBuilding2Line, 
  RiUserStarLine, 
  RiStackLine, 
  RiSearchLine, 
  RiEyeLine,
} from "react-icons/ri";
import { supabase } from "../../../shared/lib/supabase";
import { Button } from "../../../components/atoms/button";
import { toast } from "sonner";
import { cn } from "../../../utils/cn";
import { useT } from "../../../i18n";
import { useNavigate } from "react-router-dom";

interface OfficeStats {
  office_id: string;
  office_name: string;
  owner_id?: string | null;
  responsible_name: string | null;
  cnpj: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  facebook_url: string | null;
  process_count: number;
  total_revenue: number;
  available_balance: number;
  pending_requests: number;
  pending_amount: number;
  active_plan_name: string;
  subscription_status: string;
  subscription_id: string;
  plan_id: string;
}

export default function OfficesPage() {
  const t = useT("admin");
  const navigate = useNavigate();
  const [offices, setOffices] = React.useState<OfficeStats[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");

  const loadOffices = React.useCallback(async () => {
    const { data, error } = await supabase.from("v_master_office_stats").select("*");
    if (error) throw error;

    const officesData = (data || []) as OfficeStats[];
    const ownerIds = Array.from(new Set(officesData.map((office) => office.owner_id).filter(Boolean)));

    if (ownerIds.length === 0) {
      setOffices(officesData);
      return;
    }

    const { data: owners, error: ownersError } = await supabase
      .from("user_accounts")
      .select("id, full_name, email")
      .in("id", ownerIds);

    if (ownersError) throw ownersError;

    const ownerById = new Map(
      (owners || []).map((owner) => [owner.id, owner.full_name?.trim() || owner.email || null]),
    );

    const officesWithOwnerNames = officesData.map((office) => ({
      ...office,
      responsible_name: (office.owner_id && ownerById.get(office.owner_id)) || office.responsible_name || null,
    }));

    setOffices(officesWithOwnerNames);
  }, []);

  React.useEffect(() => {
    async function fetchData() {
      try {
        await loadOffices();
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error(t.offices.messages.loadError);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [loadOffices, t]);

  const filteredOffices = offices.filter(o => 
    o.office_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.responsible_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-left">
          <h1 className="text-3xl font-black text-text tracking-tighter uppercase">{t.offices.title}</h1>
          <p className="text-text-muted font-medium mt-1">{t.offices.subtitle}</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-lg" />
          <input 
            type="text" 
            placeholder={t.offices.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-2xl border border-border bg-card text-sm font-medium focus:border-primary transition-all outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredOffices.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-[32px] border border-border">
            <RiBuilding2Line className="text-5xl text-text-muted/20 mx-auto mb-4" />
            <p className="text-text-muted font-bold">{t.offices.emptyState}</p>
          </div>
        ) : (
          <div className="rounded-[32px] border border-border bg-card shadow-sm overflow-visible">
            <div className="overflow-visible rounded-[32px] min-h-[450px] relative z-0">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-bg-subtle/50">
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">{t.offices.table.office}</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted text-center">{t.offices.table.processes}</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">{t.offices.table.revenue}</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">{t.offices.table.balance}</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">{t.offices.table.plan}</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">{t.offices.table.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredOffices.map((office) => (
                    <tr key={office.office_id} className="hover:bg-bg-subtle/30 transition-colors group relative hover:z-50">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <RiBuilding2Line className="text-xl" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-text">{office.office_name}</p>
                            <p className="text-[11px] text-text-muted font-bold uppercase tracking-tight flex items-center gap-1">
                              <RiUserStarLine className="text-xs" /> {office.responsible_name || t.offices.table.noResponsible}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-info/10 text-info text-xs font-black">
                          <RiStackLine /> {office.process_count}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-black text-text">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(office.total_revenue)}
                        </p>
                        <p className="text-[10px] text-text-muted font-bold uppercase">{t.offices.table.totalRevenue}</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-black text-success">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(office.available_balance)}
                          </p>
                          {office.pending_amount > 0 && (
                            <p className="text-[10px] text-warning font-black uppercase">
                              {t.offices.table.pendingRequests.replace("{{count}}", office.pending_requests.toString())}: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(office.pending_amount)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {office.active_plan_name ? (
                          <div className="space-y-1">
                            <p className="text-xs font-black text-text uppercase tracking-tight">{office.active_plan_name}</p>
                            <span className={cn(
                              "inline-flex px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                              office.subscription_status === 'active' 
                                ? "bg-success/10 text-success border-success/20" 
                                : "bg-warning/10 text-warning border-warning/20"
                            )}>
                              {office.subscription_status === 'active' ? t.offices.table.active : t.offices.table.inactive}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-black text-text-muted uppercase tracking-widest bg-bg-subtle px-2 py-1 rounded-lg">{t.offices.table.noPlan}</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-9 px-3 rounded-xl border-border" 
                            title={t.offices.tooltips.viewDetails}
                            onClick={() => navigate(`/master/offices/${office.office_id}`)}
                          >
                            <RiEyeLine size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
