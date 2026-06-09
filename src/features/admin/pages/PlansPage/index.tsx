import { useCallback, useEffect, useMemo, useState } from "react";
import { RiEditLine, RiPercentLine, RiStackLine } from "react-icons/ri";
import { toast } from "sonner";
import {
  listSubscriptionPlans,
  updateSubscriptionPlanPercentage,
} from "@features/admin/services/subscriptionPlansService";
import type { SubscriptionPlan } from "@features/admin/types";
import { Button } from "@shared/components/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/components/atoms/dialog";
import { cn } from "@shared/utils/cn";

type Plan = SubscriptionPlan;

type EditablePlanData = {
  percentage_fee: number;
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
  onClose,
  onSave,
}: {
  plan: Plan;
  onClose: () => void;
  onSave: (data: EditablePlanData) => Promise<void>;
}) {
  const [percentageFee, setPercentageFee] = useState<number>(plan.percentage_fee || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSave({
        percentage_fee: Math.max(0, toNumber(percentageFee, 0)),
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
            You can only change the plan percentage.
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
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const loadPlans = useCallback(async () => {
    setPlans(await listSubscriptionPlans());
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      await loadPlans();
    } catch (error) {
      toast.error("Error loading plans");
    } finally {
      setIsLoading(false);
    }
  }, [loadPlans]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (payload: EditablePlanData) => {
    if (!selectedPlan) return;

    await updateSubscriptionPlanPercentage(selectedPlan.id, payload.percentage_fee);
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
          On this screen, you can only change the plan percentage.
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
          onClose={() => setSelectedPlan(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
