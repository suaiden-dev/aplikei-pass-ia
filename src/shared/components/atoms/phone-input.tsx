import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@shared/utils/cn";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Input } from "./input";

export interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
  pattern?: string;
}

const countries: Country[] = [
  { name: "Brasil", code: "BR", dialCode: "+55", flag: "🇧🇷", pattern: "(00) 00000-0000" },
  { name: "Estados Unidos", code: "US", dialCode: "+1", flag: "🇺🇸", pattern: "(000) 000-0000" },
  { name: "Portugal", code: "PT", dialCode: "+351", flag: "🇵🇹" },
  { name: "Argentina", code: "AR", dialCode: "+54", flag: "🇦🇷" },
  { name: "Paraguai", code: "PY", dialCode: "+595", flag: "🇵🇾" },
  { name: "Uruguai", code: "UY", dialCode: "+598", flag: "🇺🇾" },
  { name: "Espanha", code: "ES", dialCode: "+34", flag: "🇪🇸" },
  { name: "Itália", code: "IT", dialCode: "+39", flag: "🇮🇹" },
  { name: "França", code: "FR", dialCode: "+33", flag: "🇫🇷" },
  { name: "Alemanha", code: "DE", dialCode: "+49", flag: "🇩🇪" },
  { name: "Reino Unido", code: "GB", dialCode: "+44", flag: "🇬🇧" },
  { name: "Canadá", code: "CA", dialCode: "+1", flag: "🇨🇦" },
];

interface PhoneInputProps extends Omit<React.ComponentPropsWithoutRef<"input">, "value" | "onChange"> {
  value?: string;
  onChange: (value: string) => void;
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value = "", onChange, placeholder = "Digite o telefone", className, required, disabled, id }, ref) => {
    const [open, setOpen] = React.useState(false);
    const [selectedCountry, setSelectedCountry] = React.useState<Country>(() => {
      if (typeof value === "string" && value.startsWith("+")) {
        const found = countries.find((c) => value.startsWith(c.dialCode));
        if (found) return found;
      }
      return countries[0];
    });

    const [displayValue, setDisplayValue] = React.useState(() => {
      if (typeof value === "string" && value.startsWith(selectedCountry.dialCode)) {
        return value.replace(selectedCountry.dialCode, "").trim();
      }
      return value || "";
    });

    const formatPhoneNumber = (input: string, country: Country) => {
      const digits = input.replace(/\D/g, "");
      if (country.code === "BR") {
        if (digits.length <= 11) {
          let masked = digits;
          if (digits.length > 2) masked = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
          if (digits.length > 7) masked = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
          return masked;
        }
        return digits.slice(0, 11);
      }
      return digits;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhoneNumber(e.target.value, selectedCountry);
      setDisplayValue(formatted);
      const cleanDigits = formatted.replace(/\D/g, "");
      onChange(cleanDigits ? `${selectedCountry.dialCode}${cleanDigits}` : "");
    };

    const handleCountrySelect = (country: Country) => {
      setSelectedCountry(country);
      setOpen(false);
      const cleanDigits = displayValue.replace(/\D/g, "");
      onChange(cleanDigits ? `${country.dialCode}${cleanDigits}` : "");
    };

    return (
      <div className={cn("flex gap-2", className)}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[85px] shrink-0 justify-between px-2"
              disabled={disabled}
            >
              <span className="text-subtitle mr-1">{selectedCountry.flag}</span>
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar país..." />
              <CommandList>
                <CommandEmpty>Nenhum país encontrado.</CommandEmpty>
                <CommandGroup>
                  {countries.map((country) => (
                    <CommandItem key={country.code} value={country.name} onSelect={() => handleCountrySelect(country)}>
                      <Check className={cn("mr-2 h-4 w-4", selectedCountry.code === country.code ? "opacity-100" : "opacity-0")} />
                      <span className="mr-2 text-lg">{country.flag}</span>
                      <span className="flex-1 text-sm">{country.name}</span>
                      <span className="text-xs text-muted-foreground">{country.dialCode}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <div className="relative flex-1">
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {selectedCountry.dialCode}
          </div>
          <Input
            ref={ref}
            id={id}
            type="tel"
            value={displayValue}
            onChange={handlePhoneChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className="pl-[45px]"
            style={{ paddingLeft: `${(selectedCountry.dialCode?.length ?? 3) * 9 + 20}px` }}
          />
        </div>
      </div>
    );
  },
);
PhoneInput.displayName = "PhoneInput";
