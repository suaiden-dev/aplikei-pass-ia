import * as React from "react";
import { 
  RiBuilding2Line, 
  RiUserStarLine, 
  RiStackLine, 
  RiSearchLine, 
  RiMore2Fill,
  RiEyeLine,
  RiGlobalLine,
  RiSettings4Line,
  RiCloseCircleLine,
  RiArrowLeftRightLine,
} from "react-icons/ri";
import { supabase } from "../../../shared/lib/supabase";
import { Button } from "../../../components/atoms/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../../components/atoms/dialog";
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

interface Plan {
  id: string;
  name: string;
  type: string;
}

export default function OfficesPage() {
  const t = useT("admin");
  const navigate = useNavigate();
  const [offices, setOffices] = React.useState<OfficeStats[]>([]);
  const [plans, setPlans] = React.useState<Plan[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  
  // Modal states
  const [selectedOffice, setSelectedOffice] = React.useState<OfficeStats | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [newPlanId, setNewPlanId] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

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
        const [officesRes, plansRes] = await Promise.all([
          loadOffices(),
          supabase.from("subscription_plans").select("id, name, type")
        ]);

        if (plansRes.error) throw plansRes.error;

        setPlans(plansRes.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error(t.offices.messages.loadError);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [loadOffices, t]);

  const handleOpenModal = (office: OfficeStats) => {
    setSelectedOffice(office);
    setNewPlanId(office.plan_id || "");

    setIsModalOpen(true);
  };

  const handleUpdateSubscription = async () => {
    if (!selectedOffice) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("office_subscriptions")
        .upsert({
          office_id: selectedOffice.office_id,
          plan_id: newPlanId || null,
          status: 'active',
          updated_at: new Date().toISOString()
        }, { onConflict: 'office_id' });

      if (error) throw error;

      toast.success(t.offices.messages.updateSuccess);
      setIsModalOpen(false);
      
      await loadOffices();
    } catch (err) {
      console.error("Error updating subscription:", err);
      toast.error(t.offices.messages.updateError);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExpirePlan = async (office: OfficeStats) => {
    if (!confirm(t.offices.messages.expireConfirm.replace("{{name}}", office.office_name))) return;
    
    try {
      const { error } = await supabase
        .from("office_subscriptions")
        .update({ status: 'canceled', current_period_end: new Date().toISOString() })
        .eq("office_id", office.office_id);

      if (error) throw error;
      toast.success(t.offices.messages.expireSuccess);
      
      await loadOffices();
    } catch (err) {
      console.error("Error expiring plan:", err);
      toast.error(t.offices.messages.expireError);
    }
  };

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
                          <Button variant="outline" size="sm" className="h-9 px-3 rounded-xl border-border" title={t.offices.tooltips.visitWebsite}>
                            <RiGlobalLine size={16} />
                          </Button>
                          
                          <div className="relative group/menu z-10 hover:z-[120]">
                            <Button className="h-9 px-3 rounded-xl bg-bg-subtle text-text-muted hover:bg-primary/10 hover:text-primary transition-all border border-border">
                              <RiMore2Fill size={16} />
                            </Button>
                            
                          {/* Dropdown Menu */}
                          <div className="absolute right-0 bottom-full mb-2 w-56 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-[200] opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-200 origin-bottom-right text-left">
                              <button 
                                onClick={() => handleOpenModal(office)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-bold text-text hover:bg-primary/5 hover:text-primary transition-colors"
                              >
                                <RiArrowLeftRightLine className="text-lg opacity-60" />
                                {t.offices.menu.changePlan}
                              </button>
                              <div className="h-px bg-border mx-2" />
                              <button 
                                onClick={() => handleExpirePlan(office)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-bold text-danger hover:bg-danger/5 transition-colors"
                              >
                                <RiCloseCircleLine className="text-lg opacity-60" />
                                {t.offices.menu.expirePlan}
                              </button>
                            </div>
                          </div>
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

      {/* Change Plan Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md border-border bg-card p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-text flex items-center gap-3 uppercase">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <RiArrowLeftRightLine />
              </div>
              {t.offices.modals.manageSubscription}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Modal for changing plan.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4 text-left">
            <div className="p-4 rounded-2xl bg-bg-subtle border border-border">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">{t.offices.modals.selectedOffice}</p>
              <p className="text-sm font-black text-text">{selectedOffice?.office_name}</p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                <RiSettings4Line /> {t.offices.modals.changePlanTo}
              </label>
              <select 
                value={newPlanId}
                onChange={(e) => setNewPlanId(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-border bg-bg-subtle text-sm font-medium focus:border-primary outline-none"
              >
                <option value="">{t.offices.modals.noPlan}</option>
                {plans.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                ))}
              </select>
            </div>

          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl h-12 flex-1 font-bold">
              {t.shared.cancel}
            </Button>
            <Button 
              onClick={handleUpdateSubscription} 
              disabled={isSaving}
              className="rounded-xl h-12 flex-1 bg-primary text-white shadow-xl shadow-primary/20 font-bold"
            >
              {isSaving ? t.shared.loading : t.shared.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
