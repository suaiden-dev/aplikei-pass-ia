import * as React from "react";
import { cn } from "@shared/utils/cn";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-[88px] w-full rounded-lg border border-border bg-surface-container-low px-4 py-3 text-sm text-text shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-200 placeholder:text-text-muted/70 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export { Textarea };
