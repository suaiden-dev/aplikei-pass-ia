import * as React from "react";
import { cn } from "../../utils/cn";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary cursor-pointer",
            className,
          )}
          {...props}
        />
        {label && (
          <label htmlFor={id} className="text-xs text-text-muted leading-relaxed cursor-pointer">
            {label}
          </label>
        )}
      </div>
      {error && <p className="text-xs text-danger ml-7">{error}</p>}
    </div>
  ),
);
Checkbox.displayName = "Checkbox";
