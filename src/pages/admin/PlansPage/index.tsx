import { useCallback, useEffect, useMemo, useState } from "react";
import { RiEditLine, RiInformationLine, RiPercentLine, RiStackLine } from "react-icons/ri";
import { toast } from "sonner";
import { supabase } from "../../../shared/lib/supabase";
import { Button } from "../../../components/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/atoms/dialog";
import { cn } from "../../../utils/cn";

type Plan = {
  id: string;
  name: string;
  percentage_fee: number;
  available_after_minutes: number;
  is_active: boolean;
  category_minimums?: Record<string, number> | null;
};

type ServiceCategory = {
  category: string;
  description: string;
};

type EditablePlanData = {
  percentage_fee: number;
  available_after_minutes: number;
  category_minimums: Record<string, number>;
};

function normalizePlanName(name: string): string {
  const key = String(name || "").trim().toLowerCase();
  if (key === "crescimento (variável)" || key === "crescimento (variavel)") return "Scalable Plan";
  if (key === "plano fixo") return "Fixed Plan";
  return name;
}

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeCategoryMinimums(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};

  const input = raw as Record<string, unknown>;
  const normalized: Record<string, number> = {};

  Object.entries(input).forEach(([key, value]) => {
    const n = toNumber(value, 0);
    if (n > 0) normalized[key] = n;
  });

  return normalized;
}

function PlanEditModal({
  plan,
  categories,
  onClose,
  onSave,
}: {
  plan: Plan;
  categories: ServiceCategory[];
  onClose: () => void;
  onSave: (data: EditablePlanData) => Promise<void>;
}) {
  const [percentageFee, setPercentageFee] = useState<number>(plan.percentage_fee || 0);
  const [availableAfterMinutes, setAvailableAfterMinutes] = useState<number>(
    Math.min(20160, Math.max(1, toNumber(plan.available_after_minutes, 20160))),
  );
  const [categoryMinimums, setCategoryMinimums] = useState<Record<string, number>>(
    normalizeCategoryMinimums(plan.category_minimums),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMinimumChange = (category: string, rawValue: string) => {
    const value = rawValue.trim();
    setCategoryMinimums((prev) => {
      const next = { ...prev };

      if (!value) {
        delete next[category];
        return next;
      }

      const numberValue = toNumber(value, 0);
      if (numberValue <= 0) {
        delete next[category];
      } else {
        next[category] = numberValue;
      }

      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSave({
        percentage_fee: Math.max(0, toNumber(percentageFee, 0)),
        available_after_minutes: Math.min(20160, Math.max(1, toNumber(availableAfterMinutes, 20160))),
        category_minimums: categoryMinimums,
      });
      onClose();
    } catch (error) {
      toast.error("Error saving plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl border-border bg-card p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b border-border bg-bg-subtle/50">
          <DialogTitle className="text-xl font-black text-text uppercase flex items-center gap-2">
            <RiEditLine className="text-primary" />
            Edit Plan Rules
          </DialogTitle>
          <DialogDescription className="text-xs text-text-muted">
            You can only change the percentage and minimum value charged per category.
          </DialogDescription>
        </DialogHeader>

        <form id="plan-edit-form" onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">
              Plan Percentage (%)
            </label>
            <input
              type="number"
              step="0.01"
              min={0}
              value={percentageFee}
              onChange={(e) => setPercentageFee(toNumber(e.target.value, 0))}
              className="w-full h-12 px-4 rounded-2xl border border-border bg-card text-sm font-medium focus:border-primary outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">
              Time Until Funds Are Available (minutes)
            </label>
            <input
              type="number"
              min={1}
              max={20160}
              step={1}
              value={availableAfterMinutes}
              onChange={(e) => setAvailableAfterMinutes(Math.min(20160, Math.max(1, toNumber(e.target.value, 20160))))}
              className="w-full h-12 px-4 rounded-2xl border border-border bg-card text-sm font-medium focus:border-primary outline-none"
            />
            <p className="text-[10px] text-text-muted font-medium">
              Default: 20160 minutes (14 days). Master can reduce it as needed.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                Minimum by Category (Products)
              </label>
              <span className="text-[10px] text-text-muted font-medium">Leave blank for no specific minimum.</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((item) => {
                const minValue = categoryMinimums[item.category];
                return (
                  <div key={item.category} className="space-y-2 p-3 border border-border rounded-2xl bg-bg-subtle/20">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-text uppercase tracking-wide">{item.category}</p>
                      <span
                        title={item.description || "No description available"}
                        className="text-text-muted cursor-help"
                        aria-label={`Category description ${item.category}`}
                      >
                        <RiInformationLine className="text-sm" />
                      </span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={typeof minValue === "number" ? minValue : ""}
                      onChange={(e) => handleMinimumChange(item.category, e.target.value)}
                      placeholder="Ex: 150.00"
                      className="w-full h-11 px-3 rounded-xl border border-border bg-card text-sm font-medium focus:border-primary outline-none"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </form>

        <DialogFooter className="p-6 border-t border-border bg-bg-subtle/30">
          <Button variant="outline" onClick={onClose} className="rounded-xl h-12 px-6 font-bold">
            Cancel
          </Button>
          <Button
            type="submit"
            form="plan-edit-form"
            disabled={isSubmitting}
            className="rounded-xl h-12 px-10 font-bold bg-primary text-white"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PlanCard({ plan, onEdit }: { plan: Plan; onEdit: () => void }) {
  const minimumCount = Object.keys(normalizeCategoryMinimums(plan.category_minimums)).length;

  return (
    <div
      className={cn(
        "relative p-7 rounded-[30px] border-2 bg-card transition-all flex flex-col gap-5 shadow-xl shadow-bg-subtle/5",
        plan.is_active ? "border-border hover:border-primary/40" : "border-border/50 opacity-60",
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center text-xl">
        <RiPercentLine />
      </div>

      <div>
        <h3 className="text-xl font-black text-text uppercase tracking-tight">{normalizePlanName(plan.name)}</h3>
        <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-1">
          {plan.is_active ? "Active" : "Inactive"}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-text">
          <RiPercentLine className="text-primary" />
          <span className="font-bold">Percentage:</span>
          <span className="font-black">{plan.percentage_fee}%</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-text">
          <RiStackLine className="text-primary" />
          <span className="font-bold">Categories with minimum:</span>
          <span className="font-black">{minimumCount}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-text">
          <RiStackLine className="text-primary" />
          <span className="font-bold">Available after:</span>
          <span className="font-black">{plan.available_after_minutes} min</span>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={onEdit}
        className="h-11 rounded-2xl text-[10px] font-black uppercase tracking-widest border-border hover:border-primary hover:text-primary"
      >
        <RiEditLine className="text-lg" />
        Edit Rules
      </Button>
    </div>
  );
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const loadPlans = useCallback(async () => {
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("id, name, percentage_fee, available_after_minutes, is_active, category_minimums")
      .order("created_at", { ascending: false });

    if (error) throw error;
    setPlans((data || []) as Plan[]);
  }, []);

  const loadCategories = useCallback(async () => {
    const { data, error } = await supabase
      .from("services")
      .select("category, description")
      .not("category", "is", null)
      .order("category", { ascending: true });

    if (error) throw error;

    const uniq = new Map<string, string>();
    (data || []).forEach((item) => {
      const category = String(item.category || "").trim();
      if (!category) return;
      if (!uniq.has(category)) {
        uniq.set(category, String(item.description || "").trim());
      }
    });

    setCategories(
      Array.from(uniq.entries()).map(([category, description]) => ({
        category,
        description,
      })),
    );
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadPlans(), loadCategories()]);
    } catch (error) {
      toast.error("Error loading plans");
    } finally {
      setIsLoading(false);
    }
  }, [loadPlans, loadCategories]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (payload: EditablePlanData) => {
    if (!selectedPlan) return;

    const { error } = await supabase
      .from("subscription_plans")
      .update({
        percentage_fee: payload.percentage_fee,
        available_after_minutes: payload.available_after_minutes,
        category_minimums: payload.category_minimums,
      })
      .eq("id", selectedPlan.id);

    if (error) throw error;

    toast.success("Plan updated");
    await loadPlans();
  };

  const activePlans = useMemo(() => plans.filter((p) => p.is_active), [plans]);
  const inactivePlans = useMemo(() => plans.filter((p) => !p.is_active), [plans]);

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      <div className="text-left">
        <h1 className="text-3xl font-black text-text tracking-tighter uppercase">Subscription Plans</h1>
        <p className="text-text-muted font-medium mt-1">
          On this screen, you can only change plan percentage and minimum by category.
        </p>
      </div>

      {isLoading ? (
        <div className="text-sm text-text-muted font-medium">Loading plans...</div>
      ) : (
        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-sm font-black text-success uppercase tracking-widest">
              Active ({activePlans.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activePlans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} onEdit={() => setSelectedPlan(plan)} />
              ))}
            </div>
          </section>

          {inactivePlans.length > 0 && (
            <section className="space-y-4 pt-8 border-t border-border">
              <h2 className="text-sm font-black text-text-muted uppercase tracking-widest">
                Inactive ({inactivePlans.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inactivePlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} onEdit={() => setSelectedPlan(plan)} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {selectedPlan && (
        <PlanEditModal
          plan={selectedPlan}
          categories={categories}
          onClose={() => setSelectedPlan(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
