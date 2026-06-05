import type { ReactNode, InputHTMLAttributes } from "react";
import { cn } from "@shared/utils/cn";
import { Label } from "../atoms/label";
import { Input } from "../atoms/input";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shared/components/atoms/tooltip";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  optional?: boolean;
  endAdornment?: ReactNode;
  tooltip?: string;
}

export function Field({ label, error, helperText, optional, endAdornment, className, id, tooltip, ...props }: FieldProps) {
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-2">
        <Label htmlFor={inputId} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5">
            <span>{label}</span>
            {tooltip && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="text-text-muted hover:text-text focus:outline-none transition-colors"
                    tabIndex={-1}
                  >
                    <HelpCircle size={14} className="inline-block" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[240px] text-xs bg-popover text-popover-foreground border border-border p-2 shadow-md z-50">
                  {tooltip}
                </TooltipContent>
              </Tooltip>
            )}
          </span>
          {optional ? <span className="text-[11px] font-medium text-text-muted">Opcional</span> : null}
        </Label>
        <div className="relative">
          <Input id={inputId} className={cn(endAdornment ? "pr-11" : "", className)} {...props} />
          {endAdornment ? <div className="absolute inset-y-0 right-3 flex items-center text-text-muted">{endAdornment}</div> : null}
        </div>
        {error ? (
          <p className="text-xs font-medium text-danger">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-text-muted">{helperText}</p>
        ) : null}
      </div>
    </TooltipProvider>
  );
}

