import { useEffect, useRef, useState } from "react";
import { useFormikContext, Field, ErrorMessage } from "formik";
import type { DS160FormValues } from "@features/onboarding/b1b2/schemas/ds160.schema";
import { lookupBrazilCep, lookupUsZip } from "@features/onboarding/services/addressLookupService";
import { useT, useLocale } from "@app/app/i18n";
import { masks } from "@shared/lib/form/masks";
import { maskCPF } from "@shared/utils/cpf";
import { masks } from "@shared/lib/form/masks";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shared/components/atoms/tooltip";

type VisasOnboardingFormText = {
  onboardingPage: {
    form: Record<string, string>;
    tooltips?: Record<string, string>;
  };
};

const getTooltipText = (lang: string, label: string, explicitTooltip?: string) => {
  if (explicitTooltip) return explicitTooltip;
  if (!label) return undefined;
  
  const hasQuestion = label.includes("?");
  const cleanLabel = label.replace(/[?:*]/g, "").trim();
  const lowerLabel = cleanLabel.toLowerCase();
  
  if (lang === "en") {
    if (hasQuestion) {
      return `Inform if ${lowerLabel}`;
    }
    return `Enter your ${lowerLabel}`;
  }
  if (lang === "es") {
    if (hasQuestion) {
      return `Informe si ${lowerLabel}`;
    }
    return `Ingrese su ${lowerLabel}`;
  }
  
  // Português (Default)
  if (hasQuestion) {
    const questionWords = ["qual", "quem", "como", "quando", "onde", "por que", "porquê", "o que", "quais", "quanto", "quanta", "quantos", "quantas"];
    const startsWithQuestionWord = questionWords.some(word => lowerLabel.startsWith(word));
    if (startsWithQuestionWord) {
      return `Informe ${lowerLabel}`;
    }
    return `Informe se ${lowerLabel}`;
  } else {
    if (lowerLabel.includes("explique") || lowerLabel.includes("descreva") || lowerLabel.includes("detalhe")) {
      return `Explique brevemente`;
    }
    if (lowerLabel.startsWith("nome")) {
      return `Insira o ${lowerLabel}`;
    }
    const feminineWords = ["data", "cidade", "viagem", "estadia", "profissão", "empresa", "rua", "mídia", "avó", "mãe", "relação", "identificação", "nacionalidade", "origem", "autoridade", "expiração", "emissão", "habilitação", "petição", "filiada", "escola"];
    const isFeminine = feminineWords.some(word => lowerLabel.includes(word));
    const pronoun = isFeminine ? "sua" : "seu";
    return `Insira ${pronoun} ${lowerLabel}`;
  }
};

const US_STATE_CODES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
];

// DS-160 tooltips are dynamically loaded from visas translation files (t.onboardingPage.tooltips)

// ─── Sub-components ───────────────────────────────────────────────────────────

const FieldTooltip = ({ content }: { content: string }) => {
  return (
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
        {content}
      </TooltipContent>
    </Tooltip>
  );
};

const FieldError = ({ name }: { name: string }) => (
  <ErrorMessage name={name}>
    {(msg) => (
      <p className="mt-1.5 text-[11px] font-semibold text-red-500 flex items-center gap-1">
        <span className="inline-block w-1 h-1 rounded-full bg-red-500 shrink-0" />
        {msg}
      </p>
    )}
  </ErrorMessage>
);

const FormInput = ({
  name,
  label,
  type = "text",
  placeholder = "",
  required = false,
  disabled = false,
  datalistOptions,
  onChange,
  tooltip,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  datalistOptions?: string[];
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  tooltip?: string;
}) => {
  const { errors, touched } = useFormikContext<Record<string, unknown>>();
  const hasError = !!(errors[name] && touched[name]);
  const { lang } = useLocale();
  const activeTooltip = getTooltipText(lang, label, tooltip);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <label htmlFor={name} className="block text-xs font-bold text-text-muted uppercase tracking-wider">
          {label} {required && <span className="text-primary">*</span>}
        </label>
        {tooltip && <FieldTooltip content={tooltip} />}
      </div>
      <Field name={name}>
        {({ field }: any) => (
          <input
            {...field}
            id={name}
            type={type}
            disabled={disabled}
            list={datalistOptions?.length ? `${name}-list` : undefined}
            placeholder={placeholder}
            value={field.value || ""}
            onChange={(e) => {
              if (onChange) {
                onChange(e);
              } else {
                field.onChange(e);
              }
            }}
            className={`w-full px-4 py-3 rounded-xl border text-sm font-medium text-text placeholder:text-text-muted/50 transition-all outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 disabled:cursor-not-allowed ${hasError
              ? "border-red-300 bg-red-50/50 focus:border-red-400"
              : "border-border bg-card focus:border-primary"
              }`}
          />
        )}
      </Field>
      {datalistOptions?.length ? (
        <datalist id={`${name}-list`}>
          {datalistOptions.map((opt) => (
            <option key={opt} value={opt} />
          ))}
        </datalist>
      ) : null}
      <FieldError name={name} />
    </div>
  );
};

function detectCountry(value: string): "US" | "BR" | "OTHER" {
  if (!value) return "US";
  const clean = value.replace(/\D/g, "");
  if (value.startsWith("+55") || (clean.startsWith("55") && clean.length >= 12)) {
    return "BR";
  }
  if (value.startsWith("+1") || value.startsWith("(") || (clean.length === 10 && !value.startsWith("+"))) {
    return "US";
  }
  if (value.startsWith("+")) {
    return "OTHER";
  }
  return "US";
}

function formatPhoneNumber(value: string, country: "US" | "BR" | "OTHER"): string {
  let digits = value.replace(/\D/g, "");
  
  if (country === "US") {
    if (digits.length === 11 && digits.startsWith("1")) {
      digits = digits.slice(1);
    }
    digits = digits.slice(0, 10);
    if (digits.length === 0) return "";
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }
  
  if (country === "BR") {
    if (digits.length === 0) return "";
    if ((value.trim().startsWith("+55") || digits.length > 11) && digits.startsWith("55")) {
      digits = digits.slice(2);
    }
    digits = digits.slice(0, 11);
    if (digits.length <= 2) return `+55 (${digits}`;
    if (digits.length <= 6) return `+55 (${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) {
      return `+55 (${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return `+55 (${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  }
  
  if (!digits.startsWith("+") && value.startsWith("+")) {
    return "+" + digits;
  }
  return digits ? "+" + digits : "";
}

const FormPhoneInput = ({
  name,
  label,
  required = false,
  disabled = false,
  tooltip,
}: {
  name: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  tooltip?: string;
}) => {
  const { errors, touched, values, setFieldValue } = useFormikContext<Record<string, any>>();
  const hasError = !!(errors[name] && touched[name]);
  const displayValue = String(values[name] || "");
  const [country, setCountry] = useState<"US" | "BR" | "OTHER">(() => detectCountry(displayValue));
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setCountry(detectCountry(displayValue));
  }, [displayValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = formatPhoneNumber(e.target.value, country);
    setFieldValue(name, val);
  };

  const handleCountryChange = (c: "US" | "BR" | "OTHER") => {
    setCountry(c);
    setIsOpen(false);
    const val = formatPhoneNumber(displayValue, c);
    setFieldValue(name, val);
  };

  const flagEmoji = {
    US: "🇺🇸",
    BR: "🇧🇷",
    OTHER: "🌐"
  };

  const countryLabels = {
    US: "US (+1)",
    BR: "BR (+55)",
    OTHER: "Other (+)"
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <label htmlFor={name} className="block text-xs font-bold text-text-muted uppercase tracking-wider">
          {label} {required && <span className="text-primary">*</span>}
        </label>
        {tooltip && <FieldTooltip content={tooltip} />}
      </div>
      <div className="relative flex items-center w-full">
        <div className="relative shrink-0">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-1.5 px-3 py-3 text-sm font-semibold bg-card border border-border border-r-0 rounded-l-xl hover:bg-slate-50 transition-all ${disabled ? "cursor-default opacity-70" : "cursor-pointer"}`}
            style={{ height: "46px" }}
          >
            <span className="text-lg leading-none">{flagEmoji[country]}</span>
            <span className="text-[11px] font-bold text-text-muted">
              {country === "US" ? "+1" : country === "BR" ? "+55" : "+"}
            </span>
            <span className="text-[9px] text-text-muted/60 font-bold">▼</span>
          </button>

          {isOpen && (
            <div className="absolute left-0 mt-1 bg-card border border-border rounded-xl shadow-xl z-50 py-1 w-32 animate-in fade-in slide-in-from-top-1">
              {(["US", "BR", "OTHER"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleCountryChange(c)}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-text hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <span className="text-base">{flagEmoji[c]}</span>
                  <span>{countryLabels[c]}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <Field name={name}>
          {({ field }: any) => (
            <input
              {...field}
              id={name}
              value={displayValue}
              onChange={handleChange}
              type="text"
              inputMode="tel"
              disabled={disabled}
              placeholder={country === "US" ? "(201) 555-0123" : country === "BR" ? "+55 (11) 98765-4321" : "+1..."}
              className={`w-full bg-card border ${hasError ? 'border-red-300 bg-red-50/50 focus:border-red-400' : 'border-border focus:border-primary'} rounded-r-xl px-4 py-3 text-sm font-semibold text-text outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed placeholder:text-text-muted/50`}
              style={{ height: "46px" }}
            />
          )}
        </Field>
      </div>
      <FieldError name={name} />
    </div>
  );
};

const FormNumericInput = ({
  name,
  label,
  placeholder = "",
  required = false,
  allowDecimals = false,
  isCurrency = false,
  onChange,
  tooltip,
}: {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  allowDecimals?: boolean;
  isCurrency?: boolean;
  onChange?: (value: string) => void;
  tooltip?: string;
}) => {
  const { errors, touched, setFieldValue, values } = useFormikContext<Record<string, unknown>>();
  const hasError = !!(errors[name] && touched[name]);
  const { lang } = useLocale();
  const activeTooltip = getTooltipText(lang, label, tooltip);

  // Lógica local para moeda (Padrão: R$ se não houver indicador de dólar)
  const isUsdName = `${name}_currency`;
  const selectedCurrency = (values[isUsdName] as string) || "BRL";
  const currencyMask = selectedCurrency === "USD" ? masks.currencyUSD : masks.currencyBRL;
  const lastCurrencyRef = useRef(selectedCurrency);

  useEffect(() => {
    if (!isCurrency) return;
    if (lastCurrencyRef.current === selectedCurrency) return;

    const currentValue = String(values[name] || "");
    if (currentValue) {
      setFieldValue(name, currencyMask(currentValue), false);
    }
    lastCurrencyRef.current = selectedCurrency;
  }, [currencyMask, isCurrency, name, selectedCurrency, setFieldValue, values]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <label htmlFor={name} className="block text-xs font-bold text-text-muted uppercase tracking-wider">
          {label} {required && <span className="text-primary">*</span>}
        </label>
        {tooltip && <FieldTooltip content={tooltip} />}
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          {isCurrency && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-text-muted/60 select-none">
              {selectedCurrency === "USD" ? "US$" : "R$"}
            </span>
          )}
          <Field name={name}>
            {({ field, form }: any) => (
              <input
                {...field}
                id={name}
                type="text"
                inputMode={isCurrency || !allowDecimals ? "numeric" : "decimal"}
                placeholder={placeholder}
                value={field.value || ""}
                onChange={(e) => {
                  let val = e.target.value;
                  if (isCurrency) {
                    val = currencyMask(val);
                  } else if (allowDecimals) {
                    // Allow digits and single dot or comma
                    val = val.replace(/[^0-9.,]/g, "");
                    const firstSeparatorIndex = val.search(/[.,]/);
                    if (firstSeparatorIndex !== -1) {
                      const before = val.substring(0, firstSeparatorIndex);
                      const after = val.substring(firstSeparatorIndex + 1).replace(/[.,]/g, "");
                      val = before + val[firstSeparatorIndex] + after;
                    }
                  } else {
                    val = val.replace(/\D/g, "");
                  }
                  form.setFieldValue(name, val);
                  if (onChange) {
                    onChange(val);
                  }
                }}
                className={`w-full ${isCurrency ? "pl-12" : "px-4"} pr-4 py-3 rounded-xl border text-sm font-medium text-text placeholder:text-slate-400 transition-all outline-none focus:ring-2 focus:ring-primary/20 ${hasError
                  ? "border-red-300 bg-red-50/50 focus:border-red-400"
                  : "border-border bg-card focus:border-primary"
                  }`}
              />
            )}
          </Field>
        </div>

        {/* Botão de Toggle de Moeda R$ ou US$ */}
        {isCurrency && (
          <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/50 shrink-0">
            <button
              type="button"
              onClick={() => setFieldValue(isUsdName, "BRL")}
              className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                selectedCurrency === "BRL"
                  ? "bg-white text-primary shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              R$
            </button>
            <button
              type="button"
              onClick={() => setFieldValue(isUsdName, "USD")}
              className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                selectedCurrency === "USD"
                  ? "bg-white text-primary shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              US$
            </button>
          </div>
        )}
      </div>
      <FieldError name={name} />
    </div>
  );
};

const FormUSZipLookupInput = ({
  name,
  label,
  placeholder = "",
  required = false,
  onLookupStateChange,
  onZipPlacesResolved,
  tooltip,
}: {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  onLookupStateChange?: (state: "idle" | "searching" | "found" | "not_found" | "error") => void;
  onZipPlacesResolved?: (places: Array<{ city: string; state: string }>) => void;
  tooltip?: string;
}) => {
  const { errors, touched, values, setFieldValue } = useFormikContext<Record<string, unknown>>();
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupMessage, setLookupMessage] = useState("");
  const lastLookupZipRef = useRef("");
  const hasError = !!(errors[name] && touched[name]);
  const zip = String(values[name] || "").replace(/\D/g, "").slice(0, 5);
  const { lang } = useLocale();
  const activeTooltip = getTooltipText(lang, label, tooltip);

  useEffect(() => {
    if (zip.length !== 5 || zip === lastLookupZipRef.current) return;

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setIsLookingUp(true);
      setLookupMessage("");
      onLookupStateChange?.("searching");
      try {
        const result = await lookupUsZip(zip, controller.signal);
        if (!result) {
          setLookupMessage("ZIP code not found.");
          onZipPlacesResolved?.([]);
          onLookupStateChange?.("not_found");
          return;
        }

        const normalizedPlaces = result.places
          .map((place) => ({
            city: String(place.city || "").trim(),
            state: String(place.state || place.stateName || "").trim(),
          }))
          .filter((p) => p.city || p.state);
        onZipPlacesResolved?.(normalizedPlaces);

        const city = String(result.city || "").trim();
        const state = String(result.state || "").trim();
        if (city) setFieldValue("usStayCity", city);
        if (state) setFieldValue("usStayState", state);
        setLookupMessage(`Address detected: ${city}${state ? `, ${state}` : ""}`);
        lastLookupZipRef.current = zip;
        onLookupStateChange?.("found");
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setLookupMessage("Could not fetch address for this ZIP code.");
          onZipPlacesResolved?.([]);
          onLookupStateChange?.("error");
        }
      } finally {
        setIsLookingUp(false);
      }
    }, 450);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [zip, setFieldValue, onLookupStateChange]);

  useEffect(() => {
    if (zip.length < 5) onLookupStateChange?.("idle");
  }, [zip, onLookupStateChange]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <label htmlFor={name} className="block text-xs font-bold text-text-muted uppercase tracking-wider">
          {label} {required && <span className="text-primary">*</span>}
        </label>
        {tooltip && <FieldTooltip content={tooltip} />}
      </div>
      <Field name={name}>
        {({ field, form }: any) => (
          <input
            {...field}
            id={name}
            type="text"
            inputMode="numeric"
            maxLength={5}
            placeholder={placeholder}
            value={field.value || ""}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 5);
              form.setFieldValue(name, val);
              if (val.length < 5) {
                setLookupMessage("");
                lastLookupZipRef.current = "";
                onZipPlacesResolved?.([]);
                onLookupStateChange?.("idle");
              }
            }}
            className={`w-full px-4 py-3 rounded-xl border text-sm font-medium text-text placeholder:text-text-muted/50 transition-all outline-none focus:ring-2 focus:ring-primary/20 ${hasError
              ? "border-red-300 bg-red-50/50 focus:border-red-400"
              : "border-border bg-card focus:border-primary"
              }`}
          />
        )}
      </Field>
      <FieldError name={name} />
      {isLookingUp && <p className="text-[11px] font-semibold text-text-muted">Searching ZIP code...</p>}
      {!isLookingUp && lookupMessage && (
        <p className="text-[11px] font-semibold text-text-muted">{lookupMessage}</p>
      )}
    </div>
  );
};

const FormTextarea = ({
  name,
  label,
  placeholder = "",
  required = false,
  rows = 3,
  tooltip,
}: {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  tooltip?: string;
}) => {
  const { errors, touched } = useFormikContext<Record<string, unknown>>();
  const hasError = !!(errors[name] && touched[name]);
  const { lang } = useLocale();
  const activeTooltip = getTooltipText(lang, label, tooltip);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <label htmlFor={name} className="block text-xs font-bold text-text-muted uppercase tracking-wider">
          {label} {required && <span className="text-primary">*</span>}
        </label>
        {tooltip && <FieldTooltip content={tooltip} />}
      </div>
      <Field
        as="textarea"
        id={name}
        name={name}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-4 py-3 rounded-xl border text-sm font-medium text-text placeholder:text-slate-400 transition-all outline-none focus:ring-2 focus:ring-primary/20 resize-none ${hasError
          ? "border-red-300 bg-red-50/50 focus:border-red-400"
          : "border-border bg-card focus:border-primary"
          }`}
      />
      <FieldError name={name} />
    </div>
  );
};

const FormSelect = ({
  name,
  label,
  options,
  required = false,
  tooltip,
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  required?: boolean;
  tooltip?: string;
}) => {
  const { errors, touched } = useFormikContext<Record<string, unknown>>();
  const hasError = !!(errors[name] && touched[name]);
  const t = useT("visas") as VisasOnboardingFormText;
  const { lang } = useLocale();
  const activeTooltip = getTooltipText(lang, label, tooltip);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <label htmlFor={name} className="block text-xs font-bold text-text-muted uppercase tracking-wider">
          {label} {required && <span className="text-primary">*</span>}
        </label>
        {tooltip && <FieldTooltip content={tooltip} />}
      </div>
      <Field
        as="select"
        id={name}
        name={name}
        className={`w-full px-4 py-3 rounded-xl border text-sm font-medium text-text transition-all outline-none focus:ring-2 focus:ring-primary/20 appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23888'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")] bg-[length:18px] bg-no-repeat bg-[right_12px_center] pr-10 ${hasError
          ? "border-red-300 bg-red-50/50 focus:border-red-400"
          : "border-border bg-card focus:border-primary"
          }`}
      >
        <option value="">{t.onboardingPage.form.selectPlaceholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Field>
      <FieldError name={name} />
    </div>
  );
};

const YesNo = ({
  name,
  label,
  required = false,
  tooltip,
}: {
  name: string;
  label: string;
  required?: boolean;
  tooltip?: string;
}) => {
  const { errors, touched } = useFormikContext<Record<string, unknown>>();
  const hasError = !!(errors[name] && touched[name]);
  const t = useT("visas") as VisasOnboardingFormText;
  const { lang } = useLocale();
  const activeTooltip = getTooltipText(lang, label, tooltip);

  return (
    <div className="space-y-2">
      {(label || tooltip) && (
        <div className="flex items-center gap-1.5">
          {label && (
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
              {label} {required && <span className="text-primary">*</span>}
            </p>
          )}
          {tooltip && <FieldTooltip content={tooltip} />}
        </div>
      )}
      <div role="group" className="flex gap-3">
        <label className="flex-1 cursor-pointer">
          <Field type="radio" name={name} value="sim" className="sr-only peer" />
          <span className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-bold transition-all border-border text-text-muted hover:border-text-muted/50 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white peer-checked:shadow-lg peer-checked:shadow-primary/30">
            <span className="w-2 h-2 rounded-full border border-current" />
            {t.onboardingPage.form.yes}
          </span>
        </label>
        <label className="flex-1 cursor-pointer">
          <Field type="radio" name={name} value="nao" className="sr-only peer" />
          <span className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-bold transition-all border-border text-text-muted hover:border-text-muted/50 peer-checked:border-text peer-checked:bg-text peer-checked:text-bg peer-checked:shadow-lg peer-checked:shadow-black/20">
            <span className="w-2 h-2 rounded-full border border-current" />
            {t.onboardingPage.form.no}
          </span>
        </label>
      </div>
      {hasError && <FieldError name={name} />}
    </div>
  );
};

// Generic radio group for any set of options
const RadioGroup = ({
  name,
  label,
  options,
  required = false,
  tooltip,
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  required?: boolean;
  tooltip?: string;
}) => {
  const { errors, touched } = useFormikContext<Record<string, unknown>>();
  const hasError = !!(errors[name] && touched[name]);
  const { lang } = useLocale();
  const activeTooltip = getTooltipText(lang, label, tooltip);

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
            {label} {required && <span className="text-primary">*</span>}
          </p>
          {tooltip && <FieldTooltip content={tooltip} />}
        </div>
      )}
      <div role="group" className="flex flex-wrap gap-3">
        {options.map((opt) => (
          <label key={opt.value} className="flex-1 min-w-[100px] cursor-pointer">
            <Field type="radio" name={name} value={opt.value} className="sr-only peer" />
            <span className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-bold transition-all peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary border-border text-text-muted hover:border-text-muted/50">
              <span className="w-2 h-2 rounded-full border border-current" />
              {opt.label}
            </span>
          </label>
        ))}
      </div>
      {hasError && <FieldError name={name} />}
    </div>
  );
};

const Section = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <div className="relative pb-8">
    <div className="mb-6">
      <h3 className="text-base font-black text-text uppercase tracking-wide">{title}</h3>
      {subtitle && <p className="text-xs text-text-muted font-medium mt-1">{subtitle}</p>}
    </div>
    <div className="space-y-5">{children}</div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const DS160SingleFormStep = ({
  currentSection = 0,
  readOnly = false,
}: {
  currentSection?: number
  readOnly?: boolean
}) => {
  const { values, setFieldValue } = useFormikContext<DS160FormValues>()
  const { lang } = useLocale();
  const [usZipLookupState, setUsZipLookupState] = useState<"idle" | "searching" | "found" | "not_found" | "error">("idle");
  const [usZipPlaces, setUsZipPlaces] = useState<Array<{ city: string; state: string }>>([]);
  const t = useT('visas') as VisasOnboardingFormText
  const DS160_FIELD_TOOLTIPS = t.onboardingPage.tooltips || {};
  const usZipDigits = String(values.usStayZip || "").replace(/\D/g, "");
  const shouldDisableUsAddressFields = usZipDigits.length < 5;
  const usCitySuggestions = Array.from(new Set(usZipPlaces.map((p) => p.city).filter(Boolean)));
  const usStateSuggestions = Array.from(new Set([...usZipPlaces.map((p) => p.state).filter(Boolean), ...US_STATE_CODES]));

  const sections = [
    <Section key="interview" title={`📍 ${t.onboardingPage.form.interviewLocationTitle}`} subtitle={t.onboardingPage.form.interviewLocationSubtitle}>
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
            {t.onboardingPage.form.interviewLocationLabel} <span className="text-primary">*</span>
          </p>
          <FieldTooltip content={DS160_FIELD_TOOLTIPS.interviewLocation || "Local onde você fará a entrevista presencial no Consulado Americano."} />
        </div>
        <div role="group" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {["Brasilia", "Rio de Janeiro", "São Paulo", "Recife", "Porto Alegre"].map((city) => (
            <label key={city} className="cursor-pointer">
              <Field type="radio" name="interviewLocation" value={city} className="sr-only peer" />
              <span className="flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold text-center transition-all peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary border-border text-text-muted hover:border-text-muted/50 h-full">
                {city}
              </span>
            </label>
          ))}
        </div>
        <FieldError name="interviewLocation" />
      </div>
    </Section>,

    <Section key="personal" title={t.onboardingPage.form.personalInfoTitle} subtitle={t.onboardingPage.form.personalInfoSubtitle}>
      <YesNo name="isBrazilian" label={t.onboardingPage.form.isBrazilian} required tooltip={DS160_FIELD_TOOLTIPS.isBrazilian} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormInput
          name="surname"
          label={t.onboardingPage.form.surnameLabel}
          placeholder="Ex: Silva"
          required
          tooltip={DS160_FIELD_TOOLTIPS.surname}
        />
        <FormInput
          name="givenName"
          label={t.onboardingPage.form.givenNameLabel}
          placeholder="Ex: João"
          required
          tooltip={DS160_FIELD_TOOLTIPS.givenName}
        />
      </div>

      <FormInput
        name="fullNameNativeAlphabet"
        label={t.onboardingPage.form.fullNameNativeAlphabetLabel}
        placeholder="Nome completo no alfabeto nativo"
        tooltip={DS160_FIELD_TOOLTIPS.fullNameNativeAlphabet}
      />

      <YesNo
        name="hasTelecodeForName"
        label={t.onboardingPage.form.hasTelecodeForNameLabel}
        required
        tooltip={DS160_FIELD_TOOLTIPS.hasTelecodeForName}
      />

      <FormInput
        name="maternalGrandmotherName"
        label={t.onboardingPage.form.maternalGrandmotherNameLabel}
        placeholder="Ex: Maria Silva"
        required
        tooltip={DS160_FIELD_TOOLTIPS.maternalGrandmotherName}
      />

      <FormInput name="fullName" label={t.onboardingPage.form.fullNameLabel} placeholder="Ex: João da Silva" required tooltip={DS160_FIELD_TOOLTIPS.fullName} />

      <YesNo name="hasOtherNames" label={t.onboardingPage.form.hasOtherNames} required tooltip={DS160_FIELD_TOOLTIPS.hasOtherNames} />
      {values.hasOtherNames === "sim" && (
        <FormInput name="otherNames" label={t.onboardingPage.form.whatName} required tooltip={DS160_FIELD_TOOLTIPS.otherNames} />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <RadioGroup
          name="gender"
          label={t.onboardingPage.form.genderLabel}
          required
          tooltip={DS160_FIELD_TOOLTIPS.gender}
          options={[
            { value: "masculino", label: t.onboardingPage.form.genderMale },
            { value: "feminino", label: t.onboardingPage.form.genderFemale },
          ]}
        />
        <FormSelect
          name="maritalStatus"
          label={t.onboardingPage.form.maritalStatusLabel}
          required
          tooltip={DS160_FIELD_TOOLTIPS.maritalStatus}
          options={[
            { value: "solteiro", label: t.onboardingPage.form.maritalSingle },
            { value: "casado", label: t.onboardingPage.form.maritalMarried },
            { value: "divorciado", label: t.onboardingPage.form.maritalDivorced },
            { value: "viuvo", label: t.onboardingPage.form.maritalWidowed },
            { value: "uniao_estavel", label: t.onboardingPage.form.maritalCommonLaw },
            { value: "separado", label: t.onboardingPage.form.maritalSeparated },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <FormInput name="birthDate" label={t.onboardingPage.form.birthDateLabel} type="date" required tooltip={DS160_FIELD_TOOLTIPS.birthDate} />
        <FormInput name="birthCity" label={t.onboardingPage.form.birthCityLabel} placeholder={t.onboardingPage.form.birthCityPlaceholder} required tooltip={DS160_FIELD_TOOLTIPS.birthCity} />
        <FormInput name="birthState" label={t.onboardingPage.form.birthStateLabel} placeholder={t.onboardingPage.form.birthStatePlaceholder} required tooltip={DS160_FIELD_TOOLTIPS.birthState} />
        <FormInput name="birthCountry" label={t.onboardingPage.form.birthCountryLabel} placeholder={t.onboardingPage.form.birthCountryPlaceholder} required tooltip={DS160_FIELD_TOOLTIPS.birthCountry} />
      </div>
    </Section>,

    <Section key="nationality" title={t.onboardingPage.form.nationalityIdentificationTitle}>
      <YesNo name="hasOtherNationality" label={t.onboardingPage.form.hasOtherNationality} required tooltip={DS160_FIELD_TOOLTIPS.hasOtherNationality} />
      {values.hasOtherNationality === "sim" && (
        <FormInput name="otherNationalityDetails" label={t.onboardingPage.form.otherNationalityDetailsLabel} placeholder={t.onboardingPage.form.otherNationalityDetailsPlaceholder} tooltip={DS160_FIELD_TOOLTIPS.otherNationalityDetails} />
      )}

      <YesNo name="hasOtherResidence" label={t.onboardingPage.form.hasOtherResidence} required tooltip={DS160_FIELD_TOOLTIPS.hasOtherResidence} />
      {values.hasOtherResidence === "sim" && (
        <FormInput name="otherResidenceCountry" label={t.onboardingPage.form.whatCountry} required tooltip={DS160_FIELD_TOOLTIPS.otherResidenceCountry} />
      )}

      <div className="max-w-xs">
        <FormInput
          name="cpf"
          label={t.onboardingPage.form.cpfLabel}
          placeholder={t.onboardingPage.form.cpfPlaceholder}
          tooltip={DS160_FIELD_TOOLTIPS.cpf || (lang === "pt" ? "Insira seu CPF (Apenas se brasileiro)" : lang === "es" ? "Ingrese su CPF (Solo si es brasileño)" : "Enter your CPF (Only if Brazilian)")}
          onChange={(e) => setFieldValue("cpf", maskCPF(e.target.value))}
        />
      </div>
    </Section>,

    <Section key="passport" title={`🛂 ${t.onboardingPage.form.passportDataTitle}`}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <FormInput name="passportNumber" label={t.onboardingPage.form.passportNumberLabel} required tooltip={DS160_FIELD_TOOLTIPS.passportNumber} />
        <FormInput name="passportIssueDate" label={t.onboardingPage.form.passportIssueDateLabel} type="date" required tooltip={DS160_FIELD_TOOLTIPS.passportIssueDate} />
        <FormInput name="passportExpDate" label={t.onboardingPage.form.passportExpDateLabel} type="date" required tooltip={DS160_FIELD_TOOLTIPS.passportExpDate} />
      </div>

      <YesNo name="lostPassport" label={t.onboardingPage.form.lostPassport} required tooltip={DS160_FIELD_TOOLTIPS.lostPassport} />
      {values.lostPassport === "sim" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
          <FormInput name="lostPassportNumber" label={t.onboardingPage.form.lostPassportNumberLabel} required tooltip={DS160_FIELD_TOOLTIPS.lostPassportNumber} />
          <FormInput name="lostPassportExpanation" label={t.onboardingPage.form.briefExplanationLabel} placeholder={t.onboardingPage.form.briefExplanationPlaceholder} required tooltip={DS160_FIELD_TOOLTIPS.lostPassportExpanation} />
        </div>
      )}
    </Section>,

    <Section key="travel" title={`✈️ ${t.onboardingPage.form.travelDetailsTitle}`}>
      <FormSelect
        name="travelPurpose"
        label={t.onboardingPage.form.travelPurposeLabel}
        required
        tooltip={DS160_FIELD_TOOLTIPS.travelPurpose}
        options={[
          { value: "b2", label: t.onboardingPage.form.purposeTourism },
          { value: "b1", label: t.onboardingPage.form.purposeBusiness },
          { value: "b1b2", label: t.onboardingPage.form.purposeBoth },
          { value: "medico", label: t.onboardingPage.form.purposeMedical },
        ]}
      />

      <YesNo name="specificTravelPlan" label={t.onboardingPage.form.specificTravelPlan} required tooltip={DS160_FIELD_TOOLTIPS.specificTravelPlan} />

      {values.specificTravelPlan === "sim" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-bg-subtle rounded-2xl border border-border">
          <FormInput name="arrivalDate" label={t.onboardingPage.form.arrivalDateLabel} type="date" required tooltip={DS160_FIELD_TOOLTIPS.arrivalDate} />
          <FormInput name="arrivalFlight" label={t.onboardingPage.form.arrivalFlightLabel} placeholder={t.onboardingPage.form.arrivalFlightPlaceholder} tooltip={DS160_FIELD_TOOLTIPS.arrivalFlight} />
          <FormInput name="arrivalCity" label={t.onboardingPage.form.arrivalCityLabel} required tooltip={DS160_FIELD_TOOLTIPS.arrivalCity} />
          <FormInput name="placesToVisit" label={t.onboardingPage.form.placesToVisitLabel} placeholder={t.onboardingPage.form.placesToVisitPlaceholder} tooltip={DS160_FIELD_TOOLTIPS.placesToVisit} />
          <FormInput name="departureDate" label={t.onboardingPage.form.departureDateLabel} type="date" tooltip={DS160_FIELD_TOOLTIPS.departureDate} />
          <FormInput name="departureFlight" label={t.onboardingPage.form.departureFlightLabel} tooltip={DS160_FIELD_TOOLTIPS.departureFlight} />
          <FormInput name="departureCity" label={t.onboardingPage.form.departureCityLabel} tooltip={DS160_FIELD_TOOLTIPS.departureCity} />
        </div>
      )}

      {values.specificTravelPlan === "nao" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-bg-subtle rounded-2xl border border-border">
          <FormInput name="estArrivalDate" label={t.onboardingPage.form.estArrivalDateLabel} type="date" required tooltip={DS160_FIELD_TOOLTIPS.estArrivalDate} />
          <FormInput name="estStayLength" label={t.onboardingPage.form.estStayLengthLabel} placeholder={t.onboardingPage.form.estStayLengthPlaceholder} tooltip={DS160_FIELD_TOOLTIPS.estStayLength} />
        </div>
      )}

      <div>
        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">{t.onboardingPage.form.usStayAddressLabel}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-bg-subtle rounded-2xl border border-border">
          <FormUSZipLookupInput
            name="usStayZip"
            label={t.onboardingPage.form.zipCodeLabel}
            placeholder={t.onboardingPage.form.zipCodePlaceholder}
            onLookupStateChange={setUsZipLookupState}
            onZipPlacesResolved={setUsZipPlaces}
            tooltip={DS160_FIELD_TOOLTIPS.usStayZip}
          />
          <div className="sm:col-span-2">
            <FormInput
              name="usStayName"
              label={t.onboardingPage.form.usStayNameLabel}
              placeholder={t.onboardingPage.form.usStayNamePlaceholder}
              required
              disabled={shouldDisableUsAddressFields}
              tooltip={DS160_FIELD_TOOLTIPS.usStayName}
            />
          </div>
          <div className="sm:col-span-2">
            <FormInput
              name="usStayStreet"
              label={t.onboardingPage.form.streetNumberLabel}
              required
              disabled={shouldDisableUsAddressFields}
              tooltip={DS160_FIELD_TOOLTIPS.usStayStreet}
            />
          </div>
          <FormInput
            name="usStayCity"
            label={t.onboardingPage.form.cityLabel}
            required
            disabled={shouldDisableUsAddressFields}
            datalistOptions={usCitySuggestions}
            tooltip={DS160_FIELD_TOOLTIPS.usStayCity}
          />
          <FormInput
            name="usStayState"
            label={t.onboardingPage.form.stateLabelShort}
            placeholder={t.onboardingPage.form.statePlaceholderShort}
            required
            disabled={shouldDisableUsAddressFields}
            datalistOptions={usStateSuggestions}
            tooltip={DS160_FIELD_TOOLTIPS.usStayState}
          />
          {usZipDigits.length < 5 && (
            <p className="sm:col-span-2 text-[11px] font-semibold text-text-muted">
              Enter ZIP code first to unlock the remaining address fields.
            </p>
          )}
          {(usZipLookupState === "not_found" || usZipLookupState === "error") && (
            <p className="sm:col-span-2 text-[11px] font-semibold text-text-muted">
              ZIP not found. You can fill the address manually.
            </p>
          )}
        </div>
      </div>

      <FormSelect
        name="payingTrip"
        label={t.onboardingPage.form.payingTripLabel}
        required
        tooltip={DS160_FIELD_TOOLTIPS.payingTrip || (t as any).ds160?.travel?.payerHelper}
        options={[
          { value: "eu", label: t.onboardingPage.form.payingMe },
          { value: "outra_pessoa", label: t.onboardingPage.form.payingOther },
          { value: "empresa", label: t.onboardingPage.form.payingCompany },
        ]}
      />

      {values.payingTrip && values.payingTrip !== "eu" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-bg-subtle rounded-2xl border border-border">
          <FormInput name="payerName" label={t.onboardingPage.form.payerNameLabel} required tooltip={DS160_FIELD_TOOLTIPS.payerName} />
          <FormInput name="payerRelation" label={t.onboardingPage.form.payerRelationLabel} placeholder={t.onboardingPage.form.payerRelationPlaceholder} required tooltip={DS160_FIELD_TOOLTIPS.payerRelation} />
          <FormPhoneInput
            name="payerPhone"
            label={t.onboardingPage.form.phoneLabel}
            tooltip={DS160_FIELD_TOOLTIPS.payerPhone}
          />
          <FormInput name="payerEmail" label={t.onboardingPage.form.emailLabel} type="email" tooltip={DS160_FIELD_TOOLTIPS.payerEmail} />
        </div>
      )}
    </Section>,

    <Section key="companions" title={t.onboardingPage.form.companionsTitle}>
      <YesNo name="travelingWithOthers" label={t.onboardingPage.form.travelingWithOthers} required tooltip={DS160_FIELD_TOOLTIPS.travelingWithOthers} />

      {values.travelingWithOthers === "sim" && (
        <div className="space-y-5 p-5 bg-bg-subtle rounded-2xl border border-border">
          <YesNo name="travelGroup" label={t.onboardingPage.form.travelGroup} tooltip={DS160_FIELD_TOOLTIPS.travelGroup} />
          <FormTextarea
            name="companionsDetails"
            label={t.onboardingPage.form.companionsDetailsLabel}
            placeholder={t.onboardingPage.form.companionsDetailsPlaceholder}
            tooltip={DS160_FIELD_TOOLTIPS.companionsDetails}
            rows={3}
          />
        </div>
      )}
    </Section>,

    <Section key="travel-history" title={t.onboardingPage.form.previousTravelTitle}>
      <YesNo name="beenToUS" label={t.onboardingPage.form.beenToUS} required tooltip={DS160_FIELD_TOOLTIPS.beenToUS} />
      {values.beenToUS === "sim" && (
        <div className="space-y-5 p-5 bg-bg-subtle rounded-2xl border border-border">
          <FormTextarea
            name="previousVisitsDetails"
            label={t.onboardingPage.form.previousVisitsDetailsLabel}
            placeholder={t.onboardingPage.form.previousVisitsDetailsPlaceholder}
            required
            tooltip={DS160_FIELD_TOOLTIPS.previousVisitsDetails}
          />
          <YesNo name="hadUSDriverLicense" label={t.onboardingPage.form.hadUSDriverLicense} tooltip={DS160_FIELD_TOOLTIPS.hadUSDriverLicense} />
        </div>
      )}

      <YesNo name="hadUSVisa" label={t.onboardingPage.form.hadUSVisa} required tooltip={DS160_FIELD_TOOLTIPS.hadUSVisa} />
      {values.hadUSVisa === "sim" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-bg-subtle rounded-2xl border border-border">
          <FormInput name="lastVisaDate" label={t.onboardingPage.form.lastVisaDateLabel} type="date" required tooltip={DS160_FIELD_TOOLTIPS.lastVisaDate} />
          <FormInput name="lastVisaNumber" label={t.onboardingPage.form.lastVisaNumberLabel} placeholder={t.onboardingPage.form.lastVisaNumberPlaceholder} tooltip={DS160_FIELD_TOOLTIPS.lastVisaNumber} />
          <FormSelect name="sameVisaType" label={t.onboardingPage.form.sameVisaType} tooltip={DS160_FIELD_TOOLTIPS.sameVisaType} options={[{ value: "sim", label: t.onboardingPage.form.yes }, { value: "nao", label: t.onboardingPage.form.no }]} />
          <FormSelect name="sameVisaCountry" label={t.onboardingPage.form.sameVisaCountry} tooltip={DS160_FIELD_TOOLTIPS.sameVisaCountry} options={[{ value: "sim", label: t.onboardingPage.form.yes }, { value: "nao", label: t.onboardingPage.form.no }]} />
          <FormSelect name="tenPrinted" label={t.onboardingPage.form.tenPrinted} tooltip={DS160_FIELD_TOOLTIPS.tenPrinted} options={[{ value: "sim", label: t.onboardingPage.form.yes }, { value: "nao", label: t.onboardingPage.form.no }]} />
          <FormSelect name="visaLost" label={t.onboardingPage.form.visaLost} tooltip={DS160_FIELD_TOOLTIPS.visaLost} options={[{ value: "sim", label: t.onboardingPage.form.yes }, { value: "nao", label: t.onboardingPage.form.no }]} />
          <FormSelect name="visaCancelled" label={t.onboardingPage.form.visaCancelled} tooltip={DS160_FIELD_TOOLTIPS.visaCancelled} options={[{ value: "sim", label: t.onboardingPage.form.yes }, { value: "nao", label: t.onboardingPage.form.no }]} />
        </div>
      )}

      <YesNo name="refusedUSVisa" label={t.onboardingPage.form.refusedUSVisa} required tooltip={DS160_FIELD_TOOLTIPS.refusedUSVisa} />
      {values.refusedUSVisa === "sim" && (
        <FormTextarea name="refusedExpanation" label={t.onboardingPage.form.explainDetailLabel} required tooltip={DS160_FIELD_TOOLTIPS.refusedExpanation} />
      )}

      <YesNo name="immigrationPetition" label={t.onboardingPage.form.immigrationPetition} required tooltip={DS160_FIELD_TOOLTIPS.immigrationPetition} />
      {values.immigrationPetition === "sim" && (
        <FormInput name="petitionExpanation" label={t.onboardingPage.form.explainLabel} required tooltip={DS160_FIELD_TOOLTIPS.petitionExpanation} />
      )}
    </Section>,

    <Section key="contact" title={`🏠 ${t.onboardingPage.form.contactAddressTitle}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="sm:col-span-2">
          <FormInput name="homeStreet" label={t.onboardingPage.form.homeStreetLabel} required tooltip={DS160_FIELD_TOOLTIPS.homeStreet} />
        </div>
        <FormInput name="homeCity" label={t.onboardingPage.form.homeCityLabel || t.onboardingPage.form.cityLabel} required tooltip={DS160_FIELD_TOOLTIPS.homeCity} />
        <FormInput name="homeState" label={t.onboardingPage.form.stateProvinceLabel} required tooltip={DS160_FIELD_TOOLTIPS.homeState} />
        <FormNumericInput
          name="homeZip"
          label={t.onboardingPage.form.zipCodeLabel}
          required
          tooltip={DS160_FIELD_TOOLTIPS.homeZip}
          onChange={async (val) => {
            const cleanCep = val.replace(/\D/g, "");
            if (cleanCep.length === 8) {
              try {
                const data = await lookupBrazilCep(cleanCep);
                if (data) {
                  setFieldValue("homeStreet", data.street);
                  setFieldValue("homeCity", data.city);
                  setFieldValue("homeState", data.state);
                  setFieldValue("homeCountry", data.country);
                }
              } catch (err) {
                console.error("ViaCEP autofill failed:", err);
              }
            } else if (cleanCep.length === 5) {
              try {
                const data = await lookupUsZip(cleanCep);
                if (data) {
                  setFieldValue("homeCity", data.city);
                  setFieldValue("homeState", data.state);
                  setFieldValue("homeCountry", data.country);
                }
              } catch (err) {
                console.error("Zippopotam US homeZip failed:", err);
              }
            }
          }}
        />
        <FormInput name="homeCountry" label={t.onboardingPage.form.countryLabel} required tooltip={DS160_FIELD_TOOLTIPS.homeCountry} />
      </div>

      <YesNo name="differentMailingAddress" label={t.onboardingPage.form.differentMailingAddress} required tooltip={DS160_FIELD_TOOLTIPS.differentMailingAddress} />
      {values.differentMailingAddress === "sim" && (
        <FormTextarea name="mailingAddressFull" label={t.onboardingPage.form.mailingAddressFullLabel} tooltip={DS160_FIELD_TOOLTIPS.mailingAddressFull} />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <FormPhoneInput
          name="primaryPhone"
          label={t.onboardingPage.form.primaryPhoneLabel}
          required
          tooltip={DS160_FIELD_TOOLTIPS.primaryPhone}
        />
        <FormPhoneInput
          name="secondaryPhone"
          label={t.onboardingPage.form.secondaryPhoneLabel}
          tooltip={DS160_FIELD_TOOLTIPS.secondaryPhone}
        />
        <FormPhoneInput
          name="cellPhone"
          label={t.onboardingPage.form.cellPhoneLabel}
          tooltip={DS160_FIELD_TOOLTIPS.cellPhone}
        />
      </div>

      <YesNo name="otherPhones5Y" label={t.onboardingPage.form.otherPhones5Y} required tooltip={DS160_FIELD_TOOLTIPS.otherPhones5Y} />
      {values.otherPhones5Y === "sim" && (
        <FormInput name="otherPhonesList" label={t.onboardingPage.form.otherPhonesListLabel} tooltip={DS160_FIELD_TOOLTIPS.otherPhonesList} />
      )}

      <div className="max-w-sm">
        <FormInput name="primaryEmail" label={t.onboardingPage.form.primaryEmailLabel} type="email" required tooltip={DS160_FIELD_TOOLTIPS.primaryEmail} />
      </div>

      <YesNo name="otherEmails5Y" label={t.onboardingPage.form.otherEmails5Y} required tooltip={DS160_FIELD_TOOLTIPS.otherEmails5Y} />
      {values.otherEmails5Y === "sim" && (
        <FormInput name="otherEmailList" label={t.onboardingPage.form.otherEmailListLabel} tooltip={DS160_FIELD_TOOLTIPS.otherEmailList} />
      )}

      <FormTextarea
        name="socialMediaAccounts"
        label={t.onboardingPage.form.socialMediaAccountsLabel}
        placeholder={t.onboardingPage.form.socialMediaAccountsPlaceholder}
        required
        tooltip={DS160_FIELD_TOOLTIPS.socialMediaAccounts}
        rows={3}
      />
    </Section>,

    <Section key="family" title={`👨‍👩‍👧‍👦 ${t.onboardingPage.form.familyInfoTitle}`}>
      <div>
        <p className="text-[11px] font-black text-text-muted uppercase tracking-widest mb-4">{t.onboardingPage.form.fatherLabel}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-bg-subtle rounded-2xl border border-border">
          <FormInput name="fatherName" label={t.onboardingPage.form.fatherNameLabel} tooltip={DS160_FIELD_TOOLTIPS.fatherName} />
          <FormInput name="fatherBirth" label={t.onboardingPage.form.birthDateLabel} type="date" tooltip={DS160_FIELD_TOOLTIPS.fatherBirth} />
          <div className="sm:col-span-2">
            <YesNo name="fatherInUS" label={t.onboardingPage.form.fatherInUS} tooltip={DS160_FIELD_TOOLTIPS.fatherInUS} />
          </div>
          {values.fatherInUS === "sim" && (
            <div className="sm:col-span-2">
              <FormInput name="fatherUSStatus" label={t.onboardingPage.form.fatherUSStatusLabel} placeholder={t.onboardingPage.form.usStatusPlaceholder} tooltip={DS160_FIELD_TOOLTIPS.fatherUSStatus} />
            </div>
          )}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-black text-text-muted uppercase tracking-widest mb-4">{t.onboardingPage.form.motherLabel}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-bg-subtle rounded-2xl border border-border">
          <FormInput name="motherName" label={t.onboardingPage.form.motherNameLabel} tooltip={DS160_FIELD_TOOLTIPS.motherName} />
          <FormInput name="motherBirth" label={t.onboardingPage.form.birthDateLabel} type="date" tooltip={DS160_FIELD_TOOLTIPS.motherBirth} />
          <div className="sm:col-span-2">
            <YesNo name="motherInUS" label={t.onboardingPage.form.motherInUS} tooltip={DS160_FIELD_TOOLTIPS.motherInUS} />
          </div>
          {values.motherInUS === "sim" && (
            <div className="sm:col-span-2">
              <FormInput name="motherUSStatus" label={t.onboardingPage.form.motherUSStatusLabel} placeholder={t.onboardingPage.form.usStatusPlaceholder} tooltip={DS160_FIELD_TOOLTIPS.motherUSStatus} />
            </div>
          )}
        </div>
      </div>

      <YesNo name="otherRelInUS" label={t.onboardingPage.form.otherRelInUS} tooltip={DS160_FIELD_TOOLTIPS.otherRelInUS} />

      {values.otherRelInUS === "sim" && (
        <div className="space-y-6">
          {(() => {
            const relatives = Array.isArray(values.otherRelativesList) && values.otherRelativesList.length > 0
              ? values.otherRelativesList
              : [{ name: "", relation: "", status: "" }];

            return (
              <>
                {relatives.map((rel, idx) => {
                  return (
                    <div key={idx} className="relative p-5 bg-bg-subtle rounded-2xl border border-border space-y-4">
                      {relatives.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newList = relatives.filter((_, rIdx) => rIdx !== idx);
                            setFieldValue("otherRelativesList", newList);
                          }}
                          className="absolute top-4 right-4 text-xs font-bold text-red-500 hover:text-red-750 hover:underline uppercase tracking-widest"
                        >
                          {t.onboardingPage.form.removeBtn || "Remover"}
                        </button>
                      )}
                      <p className="text-[11px] font-black text-text-muted uppercase tracking-widest">
                        {(t.onboardingPage.form.relativeHeader || "Parente")} {idx + 1}
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">
                              {t.onboardingPage.form.relativeNameLabel || "Nome Completo"}
                            </label>
                            <FieldTooltip content={DS160_FIELD_TOOLTIPS.relativeName || "Nome completo do seu parente nos EUA."} />
                          </div>
                          <input
                            type="text"
                            value={rel.name || ""}
                            onChange={(e) => {
                              const newList = [...relatives];
                              newList[idx] = { ...newList[idx], name: e.target.value };
                              setFieldValue("otherRelativesList", newList);
                            }}
                            className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm font-medium text-text placeholder:text-slate-400 transition-all outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            placeholder="Ex: Pedro da Silva"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">
                              {t.onboardingPage.form.relativeRelationLabel || "Grau de Parentesco"}
                            </label>
                            <FieldTooltip content={DS160_FIELD_TOOLTIPS.relativeRelation || "Qual a relação de parentesco com esta pessoa."} />
                          </div>
                          <select
                            value={rel.relation || ""}
                            onChange={(e) => {
                              const newList = [...relatives];
                              newList[idx] = { ...newList[idx], relation: e.target.value };
                              setFieldValue("otherRelativesList", newList);
                            }}
                            className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm font-medium text-text transition-all outline-none focus:ring-2 focus:ring-primary/20 appearance-none bg-[url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23888\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E')] bg-[length:18px] bg-no-repeat bg-[right_12px_center] pr-10 focus:border-primary"
                          >
                            <option value="">{t.onboardingPage.form.selectPlaceholder || "Selecione..."}</option>
                            <option value="irmao">{t.onboardingPage.form.relationBrotherSister || "Irmão/Irmã"}</option>
                            <option value="filho">{t.onboardingPage.form.relationChild || "Filho/Filha"}</option>
                            <option value="noivo">{t.onboardingPage.form.relationFiance || "Noivo/Noiva"}</option>
                            <option value="outro">{t.onboardingPage.form.relationOther || "Outro Parente"}</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2 space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">
                              {t.onboardingPage.form.relativeStatusLabel || "Status Imigratório nos EUA"}
                            </label>
                            <FieldTooltip content={DS160_FIELD_TOOLTIPS.relativeStatus || "O status legal de permanência dele(a) nos EUA."} />
                          </div>
                          <select
                            value={rel.status || ""}
                            onChange={(e) => {
                              const newList = [...relatives];
                              newList[idx] = { ...newList[idx], status: e.target.value };
                              setFieldValue("otherRelativesList", newList);
                            }}
                            className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm font-medium text-text transition-all outline-none focus:ring-2 focus:ring-primary/20 appearance-none bg-[url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23888\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E')] bg-[length:18px] bg-no-repeat bg-[right_12px_center] pr-10 focus:border-primary"
                          >
                            <option value="">{t.onboardingPage.form.selectPlaceholder || "Selecione..."}</option>
                            <option value="citizen">{t.onboardingPage.form.statusCitizen || "Cidadão Americano"}</option>
                            <option value="lpr">{t.onboardingPage.form.statusLpr || "Residente Permanente Legal (Green Card)"}</option>
                            <option value="nonImmigrant">{t.onboardingPage.form.statusNonImmigrant || "Não Imigrante (Visto de Turismo/Trabalho)"}</option>
                            <option value="student">{t.onboardingPage.form.statusStudent || "Estudante / Intercâmbio (F/J)"}</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={() => {
                    const newList = [...relatives, { name: "", relation: "", status: "" }];
                    setFieldValue("otherRelativesList", newList);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary hover:text-primary transition-all text-xs font-black uppercase tracking-widest text-text-muted w-full"
                >
                  {t.onboardingPage.form.addRelativeBtn || "+ Adicionar Parente nos EUA"}
                </button>
              </>
            );
          })()}
        </div>
      )}

      <div>
        <p className="text-[11px] font-black text-text-muted uppercase tracking-widest mb-4">{t.onboardingPage.form.spouseLabel}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-bg-subtle rounded-2xl border border-border">
          <FormInput name="spouseName" label={t.onboardingPage.form.fullNameLabel} tooltip={DS160_FIELD_TOOLTIPS.spouseName} />
          <FormInput name="spouseBirth" label={t.onboardingPage.form.birthDateLabel} type="date" tooltip={DS160_FIELD_TOOLTIPS.spouseBirth} />
          <FormInput name="spouseCity" label={t.onboardingPage.form.birthCityLabel} tooltip={DS160_FIELD_TOOLTIPS.spouseCity} />
          <FormInput name="spouseCountry" label={t.onboardingPage.form.birthCountryLabel} tooltip={DS160_FIELD_TOOLTIPS.spouseCountry} />
          <div className="sm:col-span-2">
            <YesNo name="spouseSameAddress" label={t.onboardingPage.form.spouseSameAddress} tooltip={DS160_FIELD_TOOLTIPS.spouseSameAddress} />
          </div>
        </div>
      </div>
    </Section>,

    <Section key="work" title={`💼 ${t.onboardingPage.form.workEducationTitle}`}>
      <div>
        <p className="text-[11px] font-black text-text-muted uppercase tracking-widest mb-4">{t.onboardingPage.form.currentJobLabel}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-bg-subtle rounded-2xl border border-border">
          <FormInput name="primaryJobSector" label={t.onboardingPage.form.jobSectorLabel} placeholder={t.onboardingPage.form.jobSectorPlaceholder} required tooltip={DS160_FIELD_TOOLTIPS.primaryJobSector} />
          <FormInput name="primaryJobEntity" label={t.onboardingPage.form.jobEntityLabel} required tooltip={DS160_FIELD_TOOLTIPS.primaryJobEntity} />
          <div className="sm:col-span-2">
            <FormInput name="primaryJobAddress" label={t.onboardingPage.form.fullAddressLabel} tooltip={DS160_FIELD_TOOLTIPS.primaryJobAddress} />
          </div>
          <FormPhoneInput
            name="primaryJobPhone"
            label={t.onboardingPage.form.phoneLabel}
            tooltip={DS160_FIELD_TOOLTIPS.primaryJobPhone}
          />
          <FormNumericInput name="primaryJobSalary" label={t.onboardingPage.form.monthlySalaryLabel} placeholder={t.onboardingPage.form.monthlySalaryPlaceholder} allowDecimals={true} isCurrency={true} tooltip={DS160_FIELD_TOOLTIPS.primaryJobSalary} />
          <div className="sm:col-span-2">
            <FormTextarea name="primaryJobDuties" label={t.onboardingPage.form.jobDutiesLabel} rows={2} tooltip={DS160_FIELD_TOOLTIPS.primaryJobDuties} />
          </div>
        </div>
      </div>

      <YesNo name="employedLast5Y" label={t.onboardingPage.form.employedLast5Y} required tooltip={DS160_FIELD_TOOLTIPS.employedLast5Y} />
      {values.employedLast5Y === "sim" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-bg-subtle rounded-2xl border border-border">
          <FormInput name="prevEmployerName" label={t.onboardingPage.form.prevEmployerNameLabel} required tooltip={DS160_FIELD_TOOLTIPS.prevEmployerName} />
          <FormInput name="prevEmployerTitle" label={t.onboardingPage.form.prevEmployerTitleLabel} tooltip={DS160_FIELD_TOOLTIPS.prevEmployerTitle} />
          <FormInput name="prevEmployerStart" label={t.onboardingPage.form.startDateLabel} type="date" tooltip={DS160_FIELD_TOOLTIPS.prevEmployerStart} />
          <FormInput name="prevEmployerEnd" label={t.onboardingPage.form.endDateLabel} type="date" tooltip={DS160_FIELD_TOOLTIPS.prevEmployerEnd} />
          <div className="sm:col-span-2">
            <FormInput name="prevEmployerDuties" label={t.onboardingPage.form.jobDutiesLabel} tooltip={DS160_FIELD_TOOLTIPS.prevEmployerDuties} />
          </div>
        </div>
      )}

      <YesNo name="higherEducation" label={t.onboardingPage.form.higherEducation} required tooltip={DS160_FIELD_TOOLTIPS.higherEducation} />
      {values.higherEducation === "sim" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-bg-subtle rounded-2xl border border-border">
          <div className="sm:col-span-2">
            <FormInput name="eduName" label={t.onboardingPage.form.eduNameLabel} required tooltip={DS160_FIELD_TOOLTIPS.eduName} />
          </div>
          <div className="sm:col-span-2">
            <FormInput name="eduCourse" label={t.onboardingPage.form.eduCourseLabel} tooltip={DS160_FIELD_TOOLTIPS.eduCourse} />
          </div>
          <FormInput name="eduStart" label={t.onboardingPage.form.startDateLabel} type="date" tooltip={DS160_FIELD_TOOLTIPS.eduStart} />
          <FormInput name="eduEnd" label={t.onboardingPage.form.endDateLabel} type="date" tooltip={DS160_FIELD_TOOLTIPS.eduEnd} />
        </div>
      )}

      <YesNo name="belongsToTribe" label={t.onboardingPage.form.belongsToTribe} required tooltip={DS160_FIELD_TOOLTIPS.belongsToTribe} />
      <FormInput name="fluentLanguages" label={t.onboardingPage.form.fluentLanguagesLabel} placeholder={t.onboardingPage.form.fluentLanguagesPlaceholder} required tooltip={DS160_FIELD_TOOLTIPS.fluentLanguages} />
      <FormTextarea name="countriesVisited5Y" label={t.onboardingPage.form.countriesVisited5YLabel} placeholder={t.onboardingPage.form.countriesVisited5YPlaceholder} rows={2} tooltip={DS160_FIELD_TOOLTIPS.countriesVisited5Y} />

      <YesNo name="servedMilitary" label={t.onboardingPage.form.servedMilitary} required tooltip={DS160_FIELD_TOOLTIPS.servedMilitary} />
      {values.servedMilitary === "sim" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-bg-subtle rounded-2xl border border-border">
          <FormInput name="militaryBranch" label={t.onboardingPage.form.militaryBranchLabel} placeholder={t.onboardingPage.form.militaryBranchPlaceholder} tooltip={DS160_FIELD_TOOLTIPS.militaryBranch} />
          <FormInput name="militarySpecialty" label={t.onboardingPage.form.militarySpecialtyLabel} tooltip={DS160_FIELD_TOOLTIPS.militarySpecialty} />
        </div>
      )}
    </Section>,

    <Section
      key="security"
      title={`🛡️ ${t.onboardingPage.form.securityQuestionsTitle}`}
      subtitle={t.onboardingPage.form.securityQuestionsSubtitle}
    >
      <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl space-y-4">
        <p className="text-sm font-medium text-amber-800 leading-relaxed">
          {t.onboardingPage.form.securityExceptionsPrompt}
        </p>
        <YesNo name="securityExceptions" label="" tooltip={DS160_FIELD_TOOLTIPS.securityExceptions} />
        {values.securityExceptions === "sim" && (
          <FormInput
            name="securityExceptionsDetails"
            label={t.onboardingPage.form.securityExceptionsLabel}
            placeholder={t.onboardingPage.form.securityExceptionsPlaceholder}
            required
            tooltip={DS160_FIELD_TOOLTIPS.securityExceptionsDetails}
          />
        )}
      </div>
    </Section>,
  ];

  return (
    <TooltipProvider delayDuration={200}>
      <fieldset disabled={readOnly} className='space-y-8 disabled:opacity-90'>
        {sections[currentSection] ?? sections[0]}
      </fieldset>
    </TooltipProvider>
  )
}

