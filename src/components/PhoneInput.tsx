import { useState } from "react";
import { Input } from "./Input";

interface Country {
  flag: string;
  code: string;
  dial: string;
  mask: string;
}

const countries: Country[] = [
  { flag: "🇧🇷", code: "BR", dial: "+55", mask: "(XX) XXXXX-XXXX" },
  { flag: "🇺🇸", code: "US", dial: "+1",  mask: "(XXX) XXX-XXXX" },
  { flag: "🇵🇹", code: "PT", dial: "+351", mask: "XXX XXX XXX" },
];

function applyMask(digits: string, mask: string): string {
  let i = 0;
  return mask.replace(/X/g, () => digits[i++] ?? "").trimEnd();
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function maxDigits(mask: string): number {
  return (mask.match(/X/g) ?? []).length;
}

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
}

export default function PhoneInput({ value, onChange, onBlur, error }: PhoneInputProps) {
  const [country, setCountry] = useState<Country>(countries[0]);
  const [open, setOpen] = useState(false);

  const handlePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = digitsOnly(e.target.value).slice(0, maxDigits(country.mask));
    const formatted = applyMask(digits, country.mask);
    onChange(`${country.dial} ${formatted}`);
  };

  const selectCountry = (c: Country) => {
    setCountry(c);
    setOpen(false);
    onChange("");
  };

  const displayValue = value.startsWith(country.dial)
    ? value.slice(country.dial.length + 1)
    : value;

  return (
    <div className="relative">
      <div className="flex gap-2">
        {/* Seletor de país */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 px-3 h-10 bg-slate-50 border border-slate-200 rounded-md text-sm font-medium hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap"
        >
          <span className="text-lg">{country.flag}</span>
          <span className="text-slate-600">{country.dial}</span>
          <span className="text-slate-400 text-xs">▾</span>
        </button>

        {/* Input */}
        <Input
          type="tel"
          placeholder={country.mask.replace(/X/g, "0")}
          value={displayValue}
          onChange={handlePhone}
          onBlur={onBlur}
          className="flex-1"
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-12 z-20 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden w-44">
          {countries.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => selectCountry(c)}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <span className="text-lg">{c.flag}</span>
              <span className="text-slate-700 font-medium">{c.dial}</span>
              <span className="text-slate-400">{c.code}</span>
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
