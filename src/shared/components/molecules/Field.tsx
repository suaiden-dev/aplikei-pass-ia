import type { ReactNode, InputHTMLAttributes } from "react";
import { cn } from "@shared/utils/cn";
import { Label } from "../atoms/label";
import { Input } from "../atoms/input";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  optional?: boolean;
  endAdornment?: ReactNode;
}

export function Field({ label, error, helperText, optional, endAdornment, className, id, ...props }: FieldProps) {
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId} className="flex items-center justify-between gap-3">
        <span>{label}</span>
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
  );
}
