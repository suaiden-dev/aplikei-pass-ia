
import React from "react";
import { Label } from "@/presentation/components/atoms/label";
import { Input } from "@/presentation/components/atoms/input";
import { PhoneInput } from "@/presentation/components/atoms/phone-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/presentation/components/atoms/select";
import { Checkbox } from "@/presentation/components/atoms/checkbox";
import { cn } from "@/lib/utils";

interface FormGroupProps {
  label?: string;
  error?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  id?: string;
  required?: boolean;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  label,
  error,
  hint,
  children,
  className,
  id,
  required
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={id} className={cn(error && "text-destructive")}>
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      {children}
      {hint && !error && <div className="text-[10px] text-muted-foreground">{hint}</div>}
      {error && <p className="text-[10px] text-destructive font-medium">{error}</p>}
    </div>
  );
};

interface FormInputProps extends React.ComponentProps<typeof Input> {
  label?: string;
  error?: string;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
}

export const FormInput: React.FC<FormInputProps> = ({ label, error, hint, icon, className, ...props }) => {
  return (
    <FormGroup label={label} error={error} hint={hint} id={props.id} required={props.required}>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        <Input 
          {...props} 
          className={cn(
            error && "border-destructive focus-visible:ring-destructive", 
            icon && "pl-10",
            className
          )} 
        />
      </div>
    </FormGroup>
  );
};

interface FormPhoneInputProps extends React.ComponentProps<typeof PhoneInput> {
  label?: string;
  error?: string;
  hint?: React.ReactNode;
}

export const FormPhoneInput: React.FC<FormPhoneInputProps> = ({ label, error, hint, ...props }) => {
  return (
    <FormGroup label={label} error={error} hint={hint} id={props.id} required={props.required}>
      <PhoneInput {...props} className={cn(error && "border-destructive")} />
    </FormGroup>
  );
};

interface FormSelectProps extends React.ComponentProps<typeof Select> {
  label?: string;
  error?: string;
  hint?: React.ReactNode;
  placeholder?: string;
  options: { value: string; label: string }[];
  id?: string;
  required?: boolean;
}

export const FormSelect: React.FC<FormSelectProps> = ({ 
  label, 
  error, 
  hint, 
  placeholder, 
  options, 
  id, 
  required,
  ...props 
}) => {
  return (
    <FormGroup label={label} error={error} hint={hint} id={id} required={required}>
      <Select {...props}>
        <SelectTrigger id={id} className={cn(error && "border-destructive")}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormGroup>
  );
};

interface FormCheckboxProps extends React.ComponentProps<typeof Checkbox> {
  label: string;
  description?: string;
  error?: string;
}

export const FormCheckbox: React.FC<FormCheckboxProps> = ({ label, description, error, className, ...props }) => {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-start space-x-2">
        <Checkbox {...props} className={cn("mt-1", error && "border-destructive")} />
        <div className="grid gap-1.5 leading-none">
          <Label
            htmlFor={props.id}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            {label}
          </Label>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      </div>
      {error && <p className="text-[10px] text-destructive font-medium">{error}</p>}
    </div>
  );
};
interface FormNativeSelectProps extends React.ComponentProps<"select"> {
  label?: string;
  error?: string;
  hint?: React.ReactNode;
  options: { value: string; label: string }[];
}

export const FormNativeSelect = React.forwardRef<HTMLSelectElement, FormNativeSelectProps>(
  ({ label, error, hint, options, className, ...props }, ref) => {
    return (
      <FormGroup label={label} error={error} hint={hint} id={props.id} required={props.required}>
        <select
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </FormGroup>
    );
  }
);
FormNativeSelect.displayName = "FormNativeSelect";
import { RadioGroup, RadioGroupItem } from "@/presentation/components/atoms/radio-group";

interface FormRadioGroupProps extends React.ComponentProps<typeof RadioGroup> {
  label?: string;
  error?: string;
  hint?: React.ReactNode;
  options: { value: string; label: string; id?: string }[];
}

export const FormRadioGroup: React.FC<FormRadioGroupProps> = ({ 
  label, 
  error, 
  hint, 
  options, 
  className,
  ...props 
}) => {
  return (
    <FormGroup label={label} error={error} hint={hint} className={className}>
      <RadioGroup {...props}>
        {options.map((opt) => {
          const radioId = opt.id || `radio-${props.name || label}-${opt.value}`;
          return (
            <div key={opt.value} className="flex items-center space-x-2">
              <RadioGroupItem value={opt.value} id={radioId} />
              <Label htmlFor={radioId} className="cursor-pointer font-normal">
                {opt.label}
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </FormGroup>
  );
};

interface FormViewFieldProps {
  label: string;
  value?: string | React.ReactNode;
  className?: string;
}

export const FormViewField: React.FC<FormViewFieldProps> = ({ 
  label, 
  value, 
  className 
}) => {
  return (
    <div className={cn(
      "flex flex-col bg-muted/40 p-4 rounded-2xl border border-border/50 transition-all hover:border-primary/30 group",
      className
    )}>
      <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1.5 group-hover:text-primary/70 transition-colors">
        {label}
      </span>
      <span className="text-sm font-semibold text-foreground break-words leading-snug">
        {value || "—"}
      </span>
    </div>
  );
};

interface FormTextareaProps extends React.ComponentProps<"textarea"> {
  label?: string;
  error?: string;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, hint, icon, className, ...props }, ref) => {
    return (
      <FormGroup label={label} error={error} hint={hint} id={props.id} required={props.required}>
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-3 text-muted-foreground">
              {icon}
            </div>
          )}
          <textarea
            ref={ref}
            className={cn(
              "flex min-h-[100px] w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
              error && "border-destructive focus-visible:ring-destructive",
              icon && "pl-10",
              className
            )}
            {...props}
          />
        </div>
      </FormGroup>
    );
  }
);
FormTextarea.displayName = "FormTextarea";
