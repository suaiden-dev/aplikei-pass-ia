import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors focus:outline-none focus:ring-4 focus:ring-primary/10",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/15 text-primary hover:bg-primary/20",
        secondary:
          "border-transparent bg-secondary/15 text-secondary hover:bg-secondary/20",
        destructive:
          "border-transparent bg-danger/15 text-danger hover:bg-danger/20",
        success:
          "border-transparent bg-success/15 text-success hover:bg-success/20",
        warning:
          "border-transparent bg-warning/15 text-warning hover:bg-warning/20",
        error:
          "border-transparent bg-danger/15 text-danger hover:bg-danger/20",
        info: "border-transparent bg-info/15 text-info hover:bg-info/20",
        outline: "border-border bg-transparent text-text-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
