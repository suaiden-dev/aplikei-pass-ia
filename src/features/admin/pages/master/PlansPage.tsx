import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Package2, ShieldCheck, ArrowUpRight, CheckCircle2, Clock3, Layers3, Percent, PencilLine, RefreshCcw } from "lucide-react";
import { Button } from "@shared/components/atoms/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/components/atoms/dialog";
import {
  DashboardPageHeader,
  DashboardSection,
  DashboardToolbar,
  InlineMetric,
  KpiCard,
  StatusBadge,
  ToolbarPill,
} from "@shared/components/organisms/DashboardUI";
import { formatCurrency, formatDate } from "@shared/utils/format";
import { cn } from "@shared/utils/cn";
import { listSubscriptionPlans, updateSubscriptionPlan, type UpdateSubscriptionPlanPayload } from "@features/admin/services/subscriptionPlansService";
import type { SubscriptionPlan } from "@features/admin/types";

type PlanFilter = "all" | "active" | "exclusive" | "postpaid";

type PlanDraft = {
  name: string;
  description: string;
  type: SubscriptionPlan["type"];
  fixed_fee: number;
  percentage_fee: number;
  available_after_minutes: number;
  min_fee_per_transaction_usd: number | null;
  min_monthly_fee: number | null;
  max_monthly_fee: number | null;
  is_active: boolean;
  is_exclusive: boolean;
  billing_model: string;
  rulesText: string;
};

function normalizePlanName(name: string) {
  const key = String(name || "").trim().toLowerCase();
  if (key === "crescimento (variável)" || key === "crescimento (variavel)") return "Scalable Plan";
  if (key === "plano fixo") return "Fixed Plan";
  return name;
}

function formatPlanPrice(plan: SubscriptionPlan) {
  if (plan.type === "PERCENTAGE") return `${plan.percentage_fee}%`;
  if (plan.type === "HYBRID") return `${formatCurrency(plan.fixed_fee)} + ${plan.percentage_fee}%`;
  return formatCurrency(plan.fixed_fee);
}

function safeRulesText(plan: SubscriptionPlan) {
  if (!plan.rules || Object.keys(plan.rules).length === 0) return "";
  try {
    return JSON.stringify(plan.rules, null, 2);
  } catch {
    return "";
  }
}

function planToDraft(plan: SubscriptionPlan): PlanDraft {
  return {
    name: plan.name,
    description: plan.description ?? "",
    type: plan.type,
    fixed_fee: Number(plan.fixed_fee ?? 0),
    percentage_fee: Number(plan.percentage_fee ?? 0),
    available_after_minutes: Number(plan.available_after_minutes ?? 20160),
    min_fee_per_transaction_usd: plan.min_fee_per_transaction_usd ?? null,
    min_monthly_fee: plan.min_monthly_fee ?? null,
    max_monthly_fee: plan.max_monthly_fee ?? null,
    is_active: plan.is_active,
    is_exclusive: Boolean(plan.is_exclusive),
    billing_model: plan.billing_model ?? "prepaid",
    rulesText: safeRulesText(plan),
  };
}

function toNumber(value: string, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toneForPlan(plan: SubscriptionPlan): "green" | "amber" | "slate" | "blue" | "purple" {
  if (!plan.is_active) return "slate";
  if (plan.billing_model === "postpaid") return "purple";
  if (plan.is_exclusive) return "amber";
  if (plan.type === "HYBRID") return "blue";
  return "green";
}

function PlanCard({
  plan,
  onEdit,
}: {
  plan: SubscriptionPlan;
  onEdit: (plan: SubscriptionPlan) => void;
}) {
  const planRules = plan.rules && typeof plan.rules === "object" ? Object.entries(plan.rules).slice(0, 3) : [];

  return (
    <div className="rounded-[1.5rem] border border-border bg-card p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-1 hover:border-primary/25">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Package2 className="h-5 w-5" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge label={plan.is_active ? "active" : "inactive"} tone={plan.is_active ? "green" : "slate"} />
          {plan.is_exclusive ? <StatusBadge label="exclusive" tone="amber" /> : null}
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <h3 className="font-display text-2xl font-black tracking-[-0.03em] text-text">{normalizePlanName(plan.name)}</h3>
        <p className="text-sm text-text-muted">{plan.description || "No description provided."}</p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <InlineMetric label="Price" value={formatPlanPrice(plan)} helper={`${plan.type} · v${plan.version ?? 1}`} />
        <InlineMetric
          label="Model"
          value={String(plan.billing_model ?? "prepaid")}
          helper={plan.effective_from ? `Since ${formatDate(plan.effective_from)}` : "No start date"}
        />
      </div>

      <div className="mt-4 grid gap-2 text-sm text-text-muted">
        <div className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-primary" />
          <span>{plan.available_after_minutes} min availability</span>
        </div>
        <div className="flex items-center gap-2">
          <Percent className="h-4 w-4 text-primary" />
          <span>{plan.percentage_fee}% fee</span>
        </div>
        {plan.min_fee_per_transaction_usd ? (
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>Min per transaction {formatCurrency(plan.min_fee_per_transaction_usd)}</span>
          </div>
        ) : null}
      </div>

      {planRules.length > 0 ? (
        <div className="mt-5 rounded-2xl border border-border bg-bg-subtle p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">Rules snapshot</p>
          <div className="mt-2 space-y-1 text-xs text-text-muted">
            {planRules.map(([key, value]) => (
              <div key={key} className="flex items-start justify-between gap-3">
                <span className="font-semibold text-text">{key}</span>
                <span className="max-w-[70%] truncate">{typeof value === "string" ? value : JSON.stringify(value)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <Button
        variant="outline"
        className="mt-5 h-11 w-full rounded-2xl border-border font-semibold hover:border-primary hover:text-primary"
        onClick={() => onEdit(plan)}
      >
        <PencilLine className="h-4 w-4" />
        Edit plan
      </Button>
    </div>
  );
}

function PlanEditorDialog({
  plan,
  draft,
  onDraftChange,
  onClose,
  onSave,
  isSaving,
}: {
  plan: SubscriptionPlan;
  draft: PlanDraft;
  onDraftChange: (next: PlanDraft) => void;
  onClose: () => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
}) {
  const setField = <K extends keyof PlanDraft>(key: K, value: PlanDraft[K]) => {
    onDraftChange({ ...draft, [key]: value });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl border-border bg-card p-0">
        <DialogHeader className="border-b border-border bg-bg-subtle/50 p-6">
          <DialogTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tight text-text">
            <PencilLine className="h-5 w-5 text-primary" />
            Edit master plan
          </DialogTitle>
          <DialogDescription>
            Update the current plan and bump the version. Historical orders keep their own snapshot.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 p-6 lg:grid-cols-2">
          <label className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Name</span>
            <input
              value={draft.name}
              onChange={(e) => setField("name", e.target.value)}
              className="h-12 w-full rounded-2xl border border-border bg-bg px-4 text-sm font-medium outline-none focus:border-primary"
            />
          </label>

          <label className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Billing model</span>
            <select
              value={draft.billing_model}
              onChange={(e) => setField("billing_model", e.target.value)}
              className="h-12 w-full rounded-2xl border border-border bg-bg px-4 text-sm font-medium outline-none focus:border-primary"
            >
              <option value="prepaid">prepaid</option>
              <option value="postpaid">postpaid</option>
              <option value="hybrid">hybrid</option>
            </select>
          </label>

          <label className="space-y-2 lg:col-span-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Description</span>
            <textarea
              rows={4}
              value={draft.description}
              onChange={(e) => setField("description", e.target.value)}
              className="w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm font-medium outline-none focus:border-primary"
            />
          </label>

          <label className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Plan type</span>
            <select
              value={draft.type}
              onChange={(e) => setField("type", e.target.value as SubscriptionPlan["type"])}
              className="h-12 w-full rounded-2xl border border-border bg-bg px-4 text-sm font-medium outline-none focus:border-primary"
            >
              <option value="FIXED">FIXED</option>
              <option value="PERCENTAGE">PERCENTAGE</option>
              <option value="HYBRID">HYBRID</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Version</span>
            <input
              value={`v${plan.version ?? 1} → v${(plan.version ?? 1) + 1}`}
              disabled
              className="h-12 w-full rounded-2xl border border-border bg-bg-subtle px-4 text-sm font-semibold text-text-muted outline-none"
            />
          </label>

          <label className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Fixed fee</span>
            <input
              type="number"
              step="0.01"
              min={0}
              value={draft.fixed_fee}
              onChange={(e) => setField("fixed_fee", toNumber(e.target.value, 0))}
              className="h-12 w-full rounded-2xl border border-border bg-bg px-4 text-sm font-medium outline-none focus:border-primary"
            />
          </label>

          <label className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Percentage fee</span>
            <input
              type="number"
              step="0.01"
              min={0}
              value={draft.percentage_fee}
              onChange={(e) => setField("percentage_fee", toNumber(e.target.value, 0))}
              className="h-12 w-full rounded-2xl border border-border bg-bg px-4 text-sm font-medium outline-none focus:border-primary"
            />
          </label>

          <label className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Available after (min)</span>
            <input
              type="number"
              min={1}
              value={draft.available_after_minutes}
              onChange={(e) => setField("available_after_minutes", Math.max(1, toNumber(e.target.value, 20160)))}
              className="h-12 w-full rounded-2xl border border-border bg-bg px-4 text-sm font-medium outline-none focus:border-primary"
            />
          </label>

          <label className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Minimum fee / tx</span>
            <input
              type="number"
              step="0.01"
              min={0}
              value={draft.min_fee_per_transaction_usd ?? ""}
              onChange={(e) => setField("min_fee_per_transaction_usd", e.target.value === "" ? null : toNumber(e.target.value, 0))}
              className="h-12 w-full rounded-2xl border border-border bg-bg px-4 text-sm font-medium outline-none focus:border-primary"
            />
          </label>

          <label className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Min monthly fee</span>
            <input
              type="number"
              step="0.01"
              min={0}
              value={draft.min_monthly_fee ?? ""}
              onChange={(e) => setField("min_monthly_fee", e.target.value === "" ? null : toNumber(e.target.value, 0))}
              className="h-12 w-full rounded-2xl border border-border bg-bg px-4 text-sm font-medium outline-none focus:border-primary"
            />
          </label>

          <label className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Max monthly fee</span>
            <input
              type="number"
              step="0.01"
              min={0}
              value={draft.max_monthly_fee ?? ""}
              onChange={(e) => setField("max_monthly_fee", e.target.value === "" ? null : toNumber(e.target.value, 0))}
              className="h-12 w-full rounded-2xl border border-border bg-bg px-4 text-sm font-medium outline-none focus:border-primary"
            />
          </label>

          <label className="space-y-2 lg:col-span-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Rules JSON</span>
            <textarea
              rows={6}
              value={draft.rulesText}
              onChange={(e) => setField("rulesText", e.target.value)}
              className="w-full rounded-2xl border border-border bg-bg px-4 py-3 font-mono text-xs font-medium outline-none focus:border-primary"
              placeholder='{"scope":"office","categories":["f1"]}'
            />
          </label>

          <label className="flex items-center justify-between rounded-2xl border border-border bg-bg-subtle p-4 lg:col-span-2">
            <div>
              <p className="font-semibold text-text">Active</p>
              <p className="text-sm text-text-muted">Keep this plan visible to the master and available for activation.</p>
            </div>
            <input
              type="checkbox"
              checked={draft.is_active}
              onChange={(e) => setField("is_active", e.target.checked)}
              className="h-5 w-5 accent-primary"
            />
          </label>

          <label className="flex items-center justify-between rounded-2xl border border-border bg-bg-subtle p-4 lg:col-span-2">
            <div>
              <p className="font-semibold text-text">Exclusive</p>
              <p className="text-sm text-text-muted">Hide the plan unless a direct planId is shared.</p>
            </div>
            <input
              type="checkbox"
              checked={draft.is_exclusive}
              onChange={(e) => setField("is_exclusive", e.target.checked)}
              className="h-5 w-5 accent-primary"
            />
          </label>
        </div>

        <DialogFooter className="border-t border-border bg-bg-subtle/30 p-6">
          <Button variant="outline" onClick={onClose} className="h-11 rounded-2xl px-5 font-semibold">
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSaving} className="h-11 rounded-2xl px-5 font-semibold">
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function PlansPage() {
  const [filter, setFilter] = useState<PlanFilter>("all");
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [draft, setDraft] = useState<PlanDraft | null>(null);

  const { data: plans = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["master-subscription-plans"],
    queryFn: listSubscriptionPlans,
    staleTime: 5 * 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ planId, payload }: { planId: string; payload: UpdateSubscriptionPlanPayload }) => {
      await updateSubscriptionPlan(planId, payload);
    },
    onSuccess: async () => {
      toast.success("Plan updated");
      setSelectedPlan(null);
      setDraft(null);
      await refetch();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Could not update plan");
    },
  });

  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      if (filter === "active") return plan.is_active;
      if (filter === "exclusive") return Boolean(plan.is_exclusive);
      if (filter === "postpaid") return plan.billing_model === "postpaid";
      return true;
    });
  }, [filter, plans]);

  const metrics = useMemo(() => {
    const active = plans.filter((plan) => plan.is_active).length;
    const exclusive = plans.filter((plan) => plan.is_exclusive).length;
    const postpaid = plans.filter((plan) => plan.billing_model === "postpaid").length;
    const avgFee = plans.length > 0 ? plans.reduce((sum, plan) => sum + Number(plan.percentage_fee || 0), 0) / plans.length : 0;
    return { active, exclusive, postpaid, avgFee };
  }, [plans]);

  const beginEdit = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setDraft(planToDraft(plan));
  };

  const handleSave = async () => {
    if (!selectedPlan || !draft) return;

    let rules: Record<string, unknown> = {};
    const trimmedRules = draft.rulesText.trim();
    if (trimmedRules) {
      try {
        const parsed = JSON.parse(trimmedRules) as Record<string, unknown>;
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          throw new Error("Rules must be a JSON object.");
        }
        rules = parsed;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Invalid rules JSON");
        return;
      }
    }

    await updateMutation.mutateAsync({
      planId: selectedPlan.id,
      payload: {
        name: draft.name.trim(),
        description: draft.description.trim() || null,
        type: draft.type,
        fixed_fee: Math.max(0, draft.fixed_fee),
        percentage_fee: Math.max(0, draft.percentage_fee),
        available_after_minutes: Math.max(1, draft.available_after_minutes),
        min_fee_per_transaction_usd: draft.min_fee_per_transaction_usd,
        min_monthly_fee: draft.min_monthly_fee,
        max_monthly_fee: draft.max_monthly_fee,
        is_active: draft.is_active,
        is_exclusive: draft.is_exclusive,
        billing_model: draft.billing_model,
        rules,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 sm:p-8">
        <div className="h-48 rounded-[1.75rem] border border-border bg-card animate-pulse" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 rounded-[1.5rem] border border-border bg-card animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 sm:p-8">
        <div className="rounded-[1.75rem] border border-danger/20 bg-danger/5 p-8">
          <h1 className="text-2xl font-black uppercase tracking-tight text-danger">Error loading plans</h1>
          <p className="mt-2 text-sm text-text-muted">Could not load the subscription plan catalog.</p>
          <Button onClick={() => refetch()} className="mt-5 h-11 rounded-2xl px-5 font-semibold">Try again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 p-4 sm:p-8">
      <DashboardPageHeader
        eyebrow="Master billing"
        title="Plans"
        description="Versioned subscription plans managed by master. Changes here affect future sales only; historical orders keep their own snapshot."
        actions={(
          <>
            <Button variant="outline" className="h-11 rounded-2xl px-4 font-semibold" onClick={() => refetch()}>
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
            <Button className="h-11 rounded-2xl px-4 font-semibold">
              <ArrowUpRight className="h-4 w-4" />
              New plan
            </Button>
          </>
        )}
      />

      <DashboardToolbar>
        <div className="flex flex-wrap items-center gap-2">
          {([
            ["all", "All"],
            ["active", "Active"],
            ["exclusive", "Exclusive"],
            ["postpaid", "Postpaid"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
            >
              <ToolbarPill label={label} active={filter === value} />
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          <InlineMetric label="Current plans" value={String(plans.length)} helper="Catalog size" />
          <InlineMetric label="Active" value={String(metrics.active)} helper="Available for subscription" />
          <InlineMetric label="Exclusive" value={String(metrics.exclusive)} helper="Direct-link only" />
          <InlineMetric label="Avg fee" value={`${metrics.avgFee.toFixed(1)}%`} helper="Percentage average" />
        </div>
      </DashboardToolbar>

      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Active plans" value={String(metrics.active)} delta="Ready for activation" icon={CheckCircle2} />
        <KpiCard label="Exclusive plans" value={String(metrics.exclusive)} delta="Hidden by default" icon={ShieldCheck} />
        <KpiCard label="Postpaid plans" value={String(metrics.postpaid)} delta="Billed after cycle" icon={Clock3} />
        <KpiCard label="Plan versions" value={String(plans.reduce((sum, plan) => sum + (plan.version ?? 1), 0))} delta="Historical continuity" icon={Layers3} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <DashboardSection title="Featured plans" description="Cards focused on what the master needs to compare quickly.">
          <div className="grid gap-4 md:grid-cols-2">
            {filteredPlans.slice(0, 4).map((plan) => (
              <PlanCard key={plan.id} plan={plan} onEdit={beginEdit} />
            ))}
          </div>
        </DashboardSection>

        <DashboardSection title="Operational catalog" description="Compact list for editing and version control.">
          <div className="space-y-3">
            {filteredPlans.map((plan) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => beginEdit(plan)}
                className={cn(
                  "w-full rounded-2xl border p-4 text-left transition-all hover:border-primary/25",
                  selectedPlan?.id === plan.id ? "border-primary/30 bg-primary/5" : "border-border bg-bg-subtle",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-text">{normalizePlanName(plan.name)}</p>
                    <p className="text-sm text-text-muted">
                      v{plan.version ?? 1} · {plan.billing_model ?? "prepaid"} · {formatPlanPrice(plan)}
                    </p>
                  </div>
                  <StatusBadge label={plan.is_active ? "active" : "inactive"} tone={toneForPlan(plan)} />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <InlineMetric label="Price" value={formatPlanPrice(plan)} />
                  <InlineMetric label="Fee" value={`${plan.percentage_fee}%`} />
                  <InlineMetric label="Delay" value={`${plan.available_after_minutes}m`} />
                </div>
              </button>
            ))}
          </div>
        </DashboardSection>
      </div>

      {selectedPlan && draft ? (
        <PlanEditorDialog
          plan={selectedPlan}
          draft={draft}
          onDraftChange={setDraft}
          onClose={() => {
            setSelectedPlan(null);
            setDraft(null);
          }}
          onSave={handleSave}
          isSaving={updateMutation.isPending}
        />
      ) : null}
    </div>
  );
}
