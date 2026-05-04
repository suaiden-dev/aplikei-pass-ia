import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({ eyebrow, title, description, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="space-y-2">
        {eyebrow ? <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p> : null}
        <h2 className="font-display text-2xl font-bold tracking-[-0.03em] text-text sm:text-3xl">{title}</h2>
        {description ? <p className="max-w-2xl text-sm text-text-muted sm:text-base">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
