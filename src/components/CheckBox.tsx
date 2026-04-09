import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "../utils/cn";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    return (
      <span
        className={cn(
          "group relative flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-primary ring-offset-background cursor-pointer",
          "has-[:checked]:bg-primary has-[:checked]:text-primary-foreground",
          "has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2",
          "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
          className,
        )}
      >
        <input
          type="checkbox"
          ref={ref}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          {...props}
        />
        <Check className="h-3 w-3 scale-0 group-has-[:checked]:scale-100 transition-transform duration-150 pointer-events-none" />
      </span>
    );
  },
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
