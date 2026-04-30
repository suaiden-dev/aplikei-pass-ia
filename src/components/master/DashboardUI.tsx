import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../utils/cn";

interface DashboardPageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export function DashboardPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: DashboardPageHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-card p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-28 w-28 rounded-full bg-info/10 blur-3xl" />
      </div>
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl font-black tracking-[-0.04em] text-text">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm font-medium text-text-muted">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
    </div>
  );
}

interface DashboardSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function DashboardSection({
  title,
  description,
  children,
  className,
}: DashboardSectionProps) {
  return (
    <section className={cn("rounded-[1.5rem] border border-border bg-card p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]", className)}>
      <div className="mb-4">
        <h2 className="font-display text-xl font-black tracking-[-0.03em] text-text">{title}</h2>
        {description ? <p className="mt-1 text-sm text-text-muted">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

interface DashboardToolbarProps {
  children: ReactNode;
}

export function DashboardToolbar({ children }: DashboardToolbarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-[1.5rem] border border-border bg-card/85 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur lg:flex-row lg:items-center lg:justify-between">
      {children}
    </div>
  );
}

interface ToolbarPillProps {
  label: string;
  icon?: LucideIcon;
  active?: boolean;
}

export function ToolbarPill({ label, icon: Icon, active = false }: ToolbarPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold uppercase tracking-[0.14em]",
        active
          ? "border-primary/20 bg-primary/10 text-primary"
          : "border-border bg-bg-subtle text-text-muted",
      )}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {label}
    </span>
  );
}

interface KpiCardProps {
  label: string;
  value: string;
  delta: string;
  icon: LucideIcon;
}

export function KpiCard({ label, value, delta, icon: Icon }: KpiCardProps) {
  return (
    <div className="rounded-[1.5rem] border border-border bg-card p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-text-muted">{label}</p>
          <p className="mt-3 font-display text-3xl font-black tracking-[-0.04em] text-text">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-success">{delta}</p>
    </div>
  );
}

interface InlineMetricProps {
  label: string;
  value: string;
  helper?: string;
}

export function InlineMetric({ label, value, helper }: InlineMetricProps) {
  return (
    <div className="rounded-2xl border border-border bg-bg-subtle p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-text-muted">{label}</p>
      <p className="mt-2 font-display text-2xl font-black tracking-[-0.03em] text-text">{value}</p>
      {helper ? <p className="mt-1 text-sm text-text-muted">{helper}</p> : null}
    </div>
  );
}

interface StatusBadgeProps {
  label: string;
  tone:
    | "green"
    | "amber"
    | "red"
    | "blue"
    | "slate"
    | "purple";
}

const toneMap: Record<StatusBadgeProps["tone"], string> = {
  green: "bg-success/12 text-success",
  amber: "bg-warning/12 text-warning",
  red: "bg-danger/12 text-danger",
  blue: "bg-info/12 text-info",
  slate: "bg-bg-subtle text-text-muted",
  purple: "bg-primary/12 text-primary",
};

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-[0.14em]", toneMap[tone])}>
      {label}
    </span>
  );
}
