import * as React from "react";
import { cn } from "@shared/utils/cn";
import { Button, type ButtonProps } from "./button";

type PublicButtonTone = "solid" | "outline" | "ghost" | "soft" | "inverse";

const toneClasses: Record<PublicButtonTone, string> = {
  solid:
    "border border-transparent bg-primary text-on-primary shadow-[0_14px_32px_rgba(45,99,255,0.22)] hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(45,99,255,0.26)]",
  outline:
    "border border-border bg-card text-text shadow-[0_10px_24px_rgba(15,23,42,0.08)] hover:border-primary/30 hover:bg-bg-subtle hover:text-text hover:-translate-y-0.5",
  ghost:
    "border border-transparent bg-transparent text-text-muted hover:bg-bg-subtle hover:text-text",
  soft:
    "border border-primary/15 bg-primary/10 text-primary hover:border-primary/20 hover:bg-primary/15",
  inverse:
    "border border-transparent bg-white text-primary shadow-[0_14px_32px_rgba(15,23,42,0.14)] hover:bg-white/90 hover:-translate-y-0.5",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  default: "h-12 px-5 text-sm sm:text-base",
  sm: "h-10 px-4 text-sm",
  lg: "h-14 px-7 text-base sm:text-lg",
  icon: "h-11 w-11",
};

export interface PublicButtonProps extends Omit<ButtonProps, "variant"> {
  tone?: PublicButtonTone;
}

export const PublicButton = React.forwardRef<HTMLButtonElement, PublicButtonProps>(
  ({ className, size = "default", tone = "solid", asChild = false, ...props }, ref) => {
    const resolvedSize = size ?? "default";
    return (
      <Button
        asChild={asChild}
        ref={ref}
        size={resolvedSize}
        className={cn(
          "rounded-full font-bold tracking-[-0.01em] transition-all duration-200",
          "gap-2",
          sizeClasses[resolvedSize],
          toneClasses[tone],
          className,
        )}
        {...props}
      />
    );
  },
);

PublicButton.displayName = "PublicButton";
