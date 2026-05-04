import * as React from "react";
import { cn } from "../../utils/cn";

export interface InputProps extends React.ComponentProps<"input"> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-lg border bg-surface-container-low px-4 text-sm text-text shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-200 placeholder:text-text-muted/70 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-text md:text-sm",
            error ? "border-danger ring-danger/10" : "border-border",
            className,
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs font-semibold text-danger">{error}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
