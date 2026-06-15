import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowUpRight,
  CheckCircle2,
  Layers3,
  HelpCircle,
  Package2,
  PencilLine,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@shared/components/atoms/button";
import { Label } from "@shared/components/atoms/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shared/components/atoms/tooltip";
import { formatCurrency } from "@shared/utils/format";
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

type RulesValidationResult = {
  parsed: Record<string, unknown> | null;
  error: string | null;
};

type RulesScope = "office" | "billing" | "operations";

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

function validateRulesText(rulesText: string): RulesValidationResult {
  const trimmed = rulesText.trim();
  if (!trimmed) {
    return { parsed: null, error: "Rules JSON is required." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return { parsed: null, error: "Rules JSON has invalid syntax." };
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { parsed: null, error: "Rules JSON must be an object." };
  }

  const record = parsed as Record<string, unknown>;
  const scope = record.scope;
  const categories = record.categories;

  if (typeof scope !== "string" || scope.trim().length === 0) {
    return { parsed: null, error: "Missing required field: scope (string)." };
  }

  if (!Array.isArray(categories) || categories.length === 0 || categories.some((item) => typeof item !== "string" || !String(item).trim())) {
    return { parsed: null, error: "Missing required field: categories (non-empty string array)." };
  }

  return { parsed: record, error: null };
}

function normalizeCategories(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
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

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: "green" | "amber" | "slate" | "blue" | "purple";
}) {
  const tones = {
    green: "border-success/20 bg-success/10 text-success",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    slate: "border-border bg-bg-subtle text-text-muted",
    blue: "border-info/20 bg-info/10 text-info",
    purple: "border-violet-200 bg-violet-50 text-violet-700",
  } as const;

  return (
    <span className={cn("shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]", tones[tone])}>
      {label}
    </span>
  );
}

function FieldLabel({
  children,
  tooltip,
}: {
  children: string;
  tooltip: string;
}) {
  return (
    <TooltipProvider delayDuration={180}>
      <Label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-text-muted">
        <span>{children}</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="inline-flex text-text-muted transition hover:text-primary focus:outline-none"
              tabIndex={-1}
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-[260px] border border-border bg-popover p-3 text-xs leading-5 text-popover-foreground shadow-lg">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </Label>
    </TooltipProvider>
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
  const rulesValidation = useMemo(() => validateRulesText(draft.rulesText), [draft.rulesText]);
  const rulesScope = (rulesValidation.parsed?.scope as RulesScope | undefined) ?? "";
  const rulesCategories = Array.isArray(rulesValidation.parsed?.categories)
    ? (rulesValidation.parsed?.categories as unknown[]).filter((item): item is string => typeof item === "string")
    : [];
  const isSaveDisabled = isSaving || !rulesValidation.parsed || Boolean(rulesValidation.error);
  const updateRulesField = (nextScope: RulesScope, nextCategories: string[]) => {
    onDraftChange({
      ...draft,
      rulesText: JSON.stringify({ scope: nextScope, categories: nextCategories }, null, 2),
    });
  };

  return (
    <div className="rounded-[1.75rem] border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-bg-subtle/60 px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Master editor</p>
            <h3 className="mt-2 flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-text">
              <PencilLine className="h-5 w-5 text-primary" />
              Edit master plan
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
              Update the current plan and bump the version. Historical orders keep their own snapshot.
            </p>
          </div>
          <Button variant="outline" onClick={onClose} className="h-11 rounded-2xl px-5 font-semibold">
            Close
          </Button>
        </div>
      </div>

      <div className="grid gap-5 p-6 lg:grid-cols-2">
          <label className="space-y-2">
            <FieldLabel tooltip="The public plan name shown to the master. Example: 'Scalable Plan' or 'Gold Plan'.">Name</FieldLabel>
            <input
              value={draft.name}
              onChange={(e) => setField("name", e.target.value)}
              className="h-12 w-full rounded-2xl border border-border bg-bg px-4 text-sm font-medium outline-none focus:border-primary"
            />
          </label>

          <label className="space-y-2">
            <FieldLabel tooltip="How the plan is billed. Use prepaid for upfront payment, postpaid for end-of-cycle billing, or hybrid for both. Example: postpaid.">Billing model</FieldLabel>
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
            <FieldLabel tooltip="A short explanation of what this plan covers. Example: 'Pay only a percentage of each sale.'">Description</FieldLabel>
            <textarea
              rows={4}
              value={draft.description}
              onChange={(e) => setField("description", e.target.value)}
              className="w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm font-medium outline-none focus:border-primary"
            />
          </label>

          <label className="space-y-2">
            <FieldLabel tooltip="The pricing formula used by the plan. FIXED charges a flat fee, PERCENTAGE charges a percentage of revenue, HYBRID combines both. Example: PERCENTAGE.">Plan type</FieldLabel>
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
            <FieldLabel tooltip="Read-only version preview. Saving will bump the version so older orders keep the previous snapshot. Example: v3 → v4.">Version</FieldLabel>
            <input
              value={`v${plan.version ?? 1} → v${(plan.version ?? 1) + 1}`}
              disabled
              className="h-12 w-full rounded-2xl border border-border bg-bg-subtle px-4 text-sm font-semibold text-text-muted outline-none"
            />
          </label>

          <label className="space-y-2">
            <FieldLabel tooltip="Flat amount charged by the plan. Example: 150.00 for a fixed monthly fee or the fixed part of a hybrid plan.">Fixed fee</FieldLabel>
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
            <FieldLabel tooltip="Percentage charged on the transaction amount. Example: 10 means the office receives 10% of each sale.">Percentage fee</FieldLabel>
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
            <FieldLabel tooltip="How long the amount stays unavailable before release. Example: 20160 minutes equals 14 days.">Available after (min)</FieldLabel>
            <input
              type="number"
              min={1}
              value={draft.available_after_minutes}
              onChange={(e) => setField("available_after_minutes", Math.max(1, toNumber(e.target.value, 20160)))}
              className="h-12 w-full rounded-2xl border border-border bg-bg px-4 text-sm font-medium outline-none focus:border-primary"
            />
          </label>

          <label className="space-y-2">
            <FieldLabel tooltip="The minimum fee charged on a transaction when the percentage result is too low. Example: 30.00.">Minimum fee / tx</FieldLabel>
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
            <FieldLabel tooltip="Optional monthly floor for percentage-based plans. Example: 500.00 means the office never pays less than that in a cycle.">Min monthly fee</FieldLabel>
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
            <FieldLabel tooltip="Optional monthly cap for percentage-based plans. Example: 2500.00 limits the fee for the month.">Max monthly fee</FieldLabel>
            <input
              type="number"
              step="0.01"
              min={0}
              value={draft.max_monthly_fee ?? ""}
              onChange={(e) => setField("max_monthly_fee", e.target.value === "" ? null : toNumber(e.target.value, 0))}
              className="h-12 w-full rounded-2xl border border-border bg-bg px-4 text-sm font-medium outline-none focus:border-primary"
            />
          </label>

          <div className="space-y-4 lg:col-span-2">
            <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
              <label className="space-y-2">
                <FieldLabel tooltip="Choose the area this plan belongs to. Example: office for general office plans, billing for payment rules, operations for operational rules.">Scope</FieldLabel>
                <select
                  value={rulesScope}
                  onChange={(e) => updateRulesField((e.target.value || "office") as RulesScope, rulesCategories)}
                  className={cn(
                    "h-12 w-full rounded-2xl border bg-bg px-4 text-sm font-medium outline-none focus:border-primary",
                    rulesValidation.error ? "border-danger/40 focus:border-danger" : "border-border",
                  )}
                >
                  <option value="">Select scope</option>
                  <option value="office">Office</option>
                  <option value="billing">Billing</option>
                  <option value="operations">Operations</option>
                </select>
              </label>

              <label className="space-y-2">
                <FieldLabel tooltip="List the categories this rule applies to, separated by commas. Example: f1, b1b2.">Categories</FieldLabel>
                <input
                  value={rulesCategories.join(", ")}
                  onChange={(e) => updateRulesField((rulesScope || "office") as RulesScope, normalizeCategories(e.target.value))}
                  placeholder="f1, b1b2"
                  className={cn(
                    "h-12 w-full rounded-2xl border bg-bg px-4 text-sm font-medium outline-none focus:border-primary",
                    rulesValidation.error ? "border-danger/40 focus:border-danger" : "border-border",
                  )}
                />
              </label>
            </div>

            <div className="rounded-2xl border border-border bg-bg-subtle p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">JSON preview</span>
                <button
                  type="button"
                  onClick={() => updateRulesField((rulesScope || "office") as RulesScope, rulesCategories.length > 0 ? rulesCategories : ["f1"])}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-text transition hover:border-primary hover:text-primary"
                >
                  Normalize preview
                </button>
              </div>
              <pre className="mt-3 overflow-auto rounded-2xl bg-bg p-4 text-xs leading-5 text-text-muted">
                {draft.rulesText || '{"scope":"office","categories":["f1"]}'}
              </pre>
            </div>

            {rulesValidation.error ? (
              <p className="text-xs font-medium text-danger">{rulesValidation.error}</p>
            ) : (
              <p className="text-xs text-text-muted">Required keys: scope (string) and categories (string[]).</p>
            )}
          </div>

        <label className="flex items-center justify-between rounded-2xl border border-border bg-bg-subtle p-4 lg:col-span-2">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-text">Active</p>
              <TooltipProvider delayDuration={180}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="inline-flex text-text-muted transition hover:text-primary focus:outline-none" tabIndex={-1}>
                      <HelpCircle className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[260px] border border-border bg-popover p-3 text-xs leading-5 text-popover-foreground shadow-lg">
                    Toggle this on to make the plan available for new subscriptions. Example: turn it off before retiring a plan.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
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
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-text">Exclusive</p>
              <TooltipProvider delayDuration={180}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="inline-flex text-text-muted transition hover:text-primary focus:outline-none" tabIndex={-1}>
                      <HelpCircle className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[260px] border border-border bg-popover p-3 text-xs leading-5 text-popover-foreground shadow-lg">
                    Use this when the plan should only be assigned manually or via a direct plan link. Example: a private enterprise deal.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
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

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border bg-bg-subtle/30 px-6 py-5">
        <Button variant="outline" onClick={onClose} className="h-11 rounded-2xl px-5 font-semibold">
          Cancel
        </Button>
        <Button onClick={onSave} disabled={isSaveDisabled} className="h-11 rounded-2xl px-5 font-semibold">
          {isSaving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
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

    const rulesValidation = validateRulesText(draft.rulesText);
    if (!rulesValidation.parsed || rulesValidation.error) {
      toast.error(rulesValidation.error || "Invalid rules JSON");
      return;
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
        rules: rulesValidation.parsed,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1500px] space-y-6 px-8 py-8">
        <div className="h-36 rounded-[1.75rem] border border-border bg-card animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
    <div className="mx-auto max-w-[1500px] space-y-6 px-8 py-8 font-['Inter']">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="text-left">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Master billing</p>
          <h1 className="mt-2 text-[56px] leading-[1.02] font-semibold tracking-[-0.03em] text-slate-900">Plans</h1>
          <p className="mt-2 max-w-3xl text-[14px] font-medium leading-6 text-slate-500">
            Versioned subscription plans managed by master. Changes here affect future sales only; historical orders keep their own snapshot.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 self-start">
          <Button variant="outline" className="h-14 rounded-xl px-5 font-semibold" onClick={() => refetch()}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
          <Button className="h-14 rounded-xl px-6 font-semibold">
            <ArrowUpRight className="h-4 w-4" />
            New plan
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {([
            ["all", "All"],
            ["active", "Active"],
            ["exclusive", "Exclusive"],
            ["postpaid", "Postpaid"],
          ] as const).map(([value, label]) => (
            <button key={value} type="button" onClick={() => setFilter(value)}>
              <span className={cn(
                "inline-flex h-10 items-center rounded-full border px-4 text-xs font-black uppercase tracking-[0.18em] transition",
                filter === value ? "border-primary bg-primary text-white shadow-lg shadow-primary/20" : "border-border bg-white text-slate-600 hover:border-primary/30",
              )}>
                {label}
              </span>
            </button>
          ))}
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">
          {filteredPlans.length} plans visible
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Current plans", value: String(plans.length), helper: "Catalog size", icon: Package2 },
          { label: "Active", value: String(metrics.active), helper: "Available for subscription", icon: CheckCircle2 },
          { label: "Exclusive", value: String(metrics.exclusive), helper: "Direct-link only", icon: ShieldCheck },
          { label: "Plan versions", value: String(plans.reduce((sum, plan) => sum + (plan.version ?? 1), 0)), helper: "Historical continuity", icon: Layers3 },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-[1.5rem] border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-3xl font-semibold tracking-tight text-text">{item.value}</p>
                  <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-text-muted">{item.label}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-text-muted">{item.helper}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="rounded-3xl border border-border bg-card p-4 shadow-sm xl:sticky xl:top-6 xl:self-start">
          <div className="mb-4 space-y-2 text-left">
            <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">Plan catalog</p>
            <p className="text-sm font-normal leading-6 text-text-muted">
              Select a plan to edit its version, billing model and rules snapshot.
            </p>
          </div>
          <div className="space-y-3">
            {filteredPlans.map((plan) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => beginEdit(plan)}
                className={cn(
                  "w-full rounded-2xl border p-4 text-left transition-all hover:border-primary/25 hover:shadow-md",
                  selectedPlan?.id === plan.id ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" : "border-border bg-bg-subtle",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-text">{normalizePlanName(plan.name)}</p>
                    <p className="mt-1 truncate text-[10px] font-normal uppercase tracking-[0.16em] text-text-muted">
                      v{plan.version ?? 1} · {plan.billing_model ?? "prepaid"}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <StatusBadge label={plan.is_active ? "active" : "inactive"} tone={toneForPlan(plan)} />
                    {plan.is_exclusive ? <StatusBadge label="exclusive" tone="amber" /> : null}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-2xl font-semibold tracking-tight text-primary">{formatPlanPrice(plan)}</p>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
                    {plan.available_after_minutes}m
                  </span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <div className="min-w-0 space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Editing panel</p>
                <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-text">
                  {selectedPlan ? normalizePlanName(selectedPlan.name) : "Select a plan to edit"}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
                  {selectedPlan
                    ? "Update pricing, billing model and rules. The version bump preserves historical sales snapshots."
                    : "Pick a plan from the catalog to open the editor."}
                </p>
              </div>
              {selectedPlan ? (
                <StatusBadge label={selectedPlan.is_active ? "active" : "inactive"} tone={toneForPlan(selectedPlan)} />
              ) : null}
            </div>

            {selectedPlan && draft ? (
              <div className="mt-6">
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
              </div>
            ) : (
              <div className="mt-6 rounded-3xl border border-dashed border-border bg-bg-subtle p-8 text-sm text-text-muted">
                No plan selected.
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
