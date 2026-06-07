import { useEffect, useRef, useState } from "react";
import { useFormikContext, Field, ErrorMessage } from "formik";
import type { DS160FormValues } from "@features/onboarding/b1b2/schemas/ds160.schema";
import { useT, useLocale } from "@app/app/i18n";
import { maskCPF } from "@shared/utils/cpf";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shared/components/atoms/tooltip";
import { RiInformationLine } from "react-icons/ri";

type VisasOnboardingFormText = {
  onboardingPage: {
    form: Record<string, string>;
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

// ─── Sub-components ───────────────────────────────────────────────────────────

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
      <label htmlFor={name} className="flex items-center gap-1.5 block text-xs font-bold text-text-muted uppercase tracking-wider">
        <span>{label} {required && <span className="text-primary">*</span>}</span>
        {activeTooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="text-text-muted/40 hover:text-primary transition-colors cursor-help">
                  <RiInformationLine className="text-sm" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-[250px] text-xs font-medium py-2 px-3 bg-slate-800 text-white border-none shadow-xl transform-none !slide-in-from-top-0 !zoom-in-100">
                <p>{activeTooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </label>
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

  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="flex items-center gap-1.5 block text-xs font-bold text-text-muted uppercase tracking-wider">
        <span>{label} {required && <span className="text-primary">*</span>}</span>
        {activeTooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="text-text-muted/40 hover:text-primary transition-colors cursor-help">
                  <RiInformationLine className="text-sm" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-[250px] text-xs font-medium py-2 px-3 bg-slate-800 text-white border-none shadow-xl transform-none !slide-in-from-top-0 !zoom-in-100">
                <p>{activeTooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </label>
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
                inputMode={allowDecimals ? "decimal" : "numeric"}
                placeholder={placeholder}
                value={field.value || ""}
                onChange={(e) => {
                  let val = e.target.value;
                  if (allowDecimals) {
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
        const response = await fetch(`https://api.zippopotam.us/us/${zip}`, { signal: controller.signal });
        if (!response.ok) {
          setLookupMessage("ZIP code not found.");
          onZipPlacesResolved?.([]);
          onLookupStateChange?.("not_found");
          return;
        }
        const data = (await response.json()) as {
          places?: Array<{ "place name"?: string; "state abbreviation"?: string; state?: string }>;
        };
        const place = data.places?.[0];
        if (!place) {
          setLookupMessage("ZIP code not found.");
          onZipPlacesResolved?.([]);
          onLookupStateChange?.("not_found");
          return;
        }

        const normalizedPlaces = (data.places || [])
          .map((p) => ({
            city: String(p["place name"] || "").trim(),
            state: String(p["state abbreviation"] || p.state || "").trim(),
          }))
          .filter((p) => p.city || p.state);
        onZipPlacesResolved?.(normalizedPlaces);

        const city = String(place["place name"] || "").trim();
        const state = String(place["state abbreviation"] || place.state || "").trim();
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
      <label htmlFor={name} className="flex items-center gap-1.5 block text-xs font-bold text-text-muted uppercase tracking-wider">
        <span>{label} {required && <span className="text-primary">*</span>}</span>
        {activeTooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="text-text-muted/40 hover:text-primary transition-colors cursor-help">
                  <RiInformationLine className="text-sm" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-[250px] text-xs font-medium py-2 px-3 bg-slate-800 text-white border-none shadow-xl transform-none !slide-in-from-top-0 !zoom-in-100">
                <p>{activeTooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </label>
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
      <label htmlFor={name} className="flex items-center gap-1.5 block text-xs font-bold text-text-muted uppercase tracking-wider">
        <span>{label} {required && <span className="text-primary">*</span>}</span>
        {activeTooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="text-text-muted/40 hover:text-primary transition-colors cursor-help">
                  <RiInformationLine className="text-sm" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-[250px] text-xs font-medium py-2 px-3 bg-slate-800 text-white border-none shadow-xl transform-none !slide-in-from-top-0 !zoom-in-100">
                <p>{activeTooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </label>
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
      <label htmlFor={name} className="flex items-center gap-1.5 block text-xs font-bold text-text-muted uppercase tracking-wider">
        <span>{label} {required && <span className="text-primary">*</span>}</span>
        {activeTooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="text-text-muted/40 hover:text-primary transition-colors cursor-help">
                  <RiInformationLine className="text-sm" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-[250px] text-xs font-medium py-2 px-3 bg-slate-800 text-white border-none shadow-xl transform-none !slide-in-from-top-0 !zoom-in-100">
                <p>{activeTooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </label>
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
      <div className="flex items-center gap-1.5">
        <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
          {label} {required && <span className="text-primary">*</span>}
        </p>
        {activeTooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="text-text-muted/40 hover:text-primary transition-colors cursor-help">
                  <RiInformationLine className="text-sm" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-[250px] text-xs font-medium py-2 px-3 bg-slate-800 text-white border-none shadow-xl transform-none !slide-in-from-top-0 !zoom-in-100">
                <p>{activeTooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
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
          {activeTooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="text-text-muted/40 hover:text-primary transition-colors cursor-help">
                    <RiInformationLine className="text-sm" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[250px] text-xs font-medium py-2 px-3 bg-slate-800 text-white border-none shadow-xl transform-none !slide-in-from-top-0 !zoom-in-100">
                  <p>{activeTooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
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
  const usZipDigits = String(values.usStayZip || "").replace(/\D/g, "");
  const shouldDisableUsAddressFields = usZipDigits.length < 5;
  const usCitySuggestions = Array.from(new Set(usZipPlaces.map((p) => p.city).filter(Boolean)));
  const usStateSuggestions = Array.from(new Set([...usZipPlaces.map((p) => p.state).filter(Boolean), ...US_STATE_CODES]));

  const sections = [
    <Section key="interview" title={`📍 ${t.onboardingPage.form.interviewLocationTitle}`} subtitle={t.onboardingPage.form.interviewLocationSubtitle}>
      <div className="space-y-2">
        <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
          {t.onboardingPage.form.interviewLocationLabel} <span className="text-primary">*</span>
        </p>
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

    <Section key="personal" title={`👤 ${t.onboardingPage.form.personalInfoTitle}`} subtitle={t.onboardingPage.form.personalInfoSubtitle}>
      <YesNo name="isBrazilian" label={t.onboardingPage.form.isBrazilian} required />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormInput
          name="surname"
          label={t.onboardingPage.form.surnameLabel}
          placeholder="Ex: Silva"
          required
        />
        <FormInput
          name="givenName"
          label={t.onboardingPage.form.givenNameLabel}
          placeholder="Ex: João"
          required
        />
      </div>

      <FormInput
        name="fullNameNativeAlphabet"
        label={t.onboardingPage.form.fullNameNativeAlphabetLabel}
        placeholder="Nome completo no alfabeto nativo"
      />

      <YesNo
        name="hasTelecodeForName"
        label={t.onboardingPage.form.hasTelecodeForNameLabel}
        required
      />

      <FormInput
        name="maternalGrandmotherName"
        label={t.onboardingPage.form.maternalGrandmotherNameLabel}
        placeholder="Ex: Maria Silva"
        required
      />

      <FormInput name="fullName" label={t.onboardingPage.form.fullNameLabel} placeholder="Ex: João da Silva" required tooltip={(t as any).ds160?.personal1?.fullNameHelper} />

      <YesNo name="hasOtherNames" label={t.onboardingPage.form.hasOtherNames} required />
      {values.hasOtherNames === "sim" && (
        <FormInput name="otherNames" label={t.onboardingPage.form.whatName} required />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <RadioGroup
          name="gender"
          label={t.onboardingPage.form.genderLabel}
          required
          options={[
            { value: "masculino", label: t.onboardingPage.form.genderMale },
            { value: "feminino", label: t.onboardingPage.form.genderFemale },
          ]}
        />
        <FormSelect
          name="maritalStatus"
          label={t.onboardingPage.form.maritalStatusLabel}
          required
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
        <FormInput name="birthDate" label={t.onboardingPage.form.birthDateLabel} type="date" required />
        <FormInput name="birthCity" label={t.onboardingPage.form.birthCityLabel} placeholder={t.onboardingPage.form.birthCityPlaceholder} required />
        <FormInput name="birthState" label={t.onboardingPage.form.birthStateLabel} placeholder={t.onboardingPage.form.birthStatePlaceholder} required />
        <FormInput name="birthCountry" label={t.onboardingPage.form.birthCountryLabel} placeholder={t.onboardingPage.form.birthCountryPlaceholder} required />
      </div>
    </Section>,

    <Section key="nationality" title={`🪪 ${t.onboardingPage.form.nationalityIdentificationTitle}`}>
      <YesNo name="hasOtherNationality" label={t.onboardingPage.form.hasOtherNationality} required />
      {values.hasOtherNationality === "sim" && (
        <FormInput name="otherNationalityDetails" label={t.onboardingPage.form.otherNationalityDetailsLabel} placeholder={t.onboardingPage.form.otherNationalityDetailsPlaceholder} />
      )}

      <YesNo name="hasOtherResidence" label={t.onboardingPage.form.hasOtherResidence} required />
      {values.hasOtherResidence === "sim" && (
        <FormInput name="otherResidenceCountry" label={t.onboardingPage.form.whatCountry} required />
      )}

      <div className="max-w-xs">
        <FormInput
          name="cpf"
          label={t.onboardingPage.form.cpfLabel}
          placeholder={t.onboardingPage.form.cpfPlaceholder}
          onChange={(e) => setFieldValue("cpf", maskCPF(e.target.value))}
          tooltip={lang === "pt" ? "Insira seu CPF (Apenas se brasileiro)" : lang === "es" ? "Ingrese su CPF (Solo si es brasileño)" : "Enter your CPF (Only if Brazilian)"}
        />
      </div>
    </Section>,

    <Section key="passport" title={`🛂 ${t.onboardingPage.form.passportDataTitle}`}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <FormInput name="passportNumber" label={t.onboardingPage.form.passportNumberLabel} required tooltip={(t as any).ds160?.passport?.numberHelper} />
        <FormInput name="passportIssueDate" label={t.onboardingPage.form.passportIssueDateLabel} type="date" required />
        <FormInput name="passportExpDate" label={t.onboardingPage.form.passportExpDateLabel} type="date" required />
      </div>

      <YesNo name="lostPassport" label={t.onboardingPage.form.lostPassport} required />
      {values.lostPassport === "sim" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
          <FormInput name="lostPassportNumber" label={t.onboardingPage.form.lostPassportNumberLabel} required />
          <FormInput name="lostPassportExpanation" label={t.onboardingPage.form.briefExplanationLabel} placeholder={t.onboardingPage.form.briefExplanationPlaceholder} required />
        </div>
      )}
    </Section>,

    <Section key="travel" title={`✈️ ${t.onboardingPage.form.travelDetailsTitle}`}>
      <FormSelect
        name="travelPurpose"
        label={t.onboardingPage.form.travelPurposeLabel}
        required
        options={[
          { value: "b2", label: t.onboardingPage.form.purposeTourism },
          { value: "b1", label: t.onboardingPage.form.purposeBusiness },
          { value: "b1b2", label: t.onboardingPage.form.purposeBoth },
          { value: "medico", label: t.onboardingPage.form.purposeMedical },
        ]}
      />

      <YesNo name="specificTravelPlan" label={t.onboardingPage.form.specificTravelPlan} required />

      {values.specificTravelPlan === "sim" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-bg-subtle rounded-2xl border border-border">
          <FormInput name="arrivalDate" label={t.onboardingPage.form.arrivalDateLabel} type="date" required tooltip={(t as any).ds160?.travel?.arrivalHelper} />
          <FormInput name="arrivalFlight" label={t.onboardingPage.form.arrivalFlightLabel} placeholder={t.onboardingPage.form.arrivalFlightPlaceholder} />
          <FormInput name="arrivalCity" label={t.onboardingPage.form.arrivalCityLabel} required />
          <FormInput name="placesToVisit" label={t.onboardingPage.form.placesToVisitLabel} placeholder={t.onboardingPage.form.placesToVisitPlaceholder} tooltip={(t as any).ds160?.travel?.visitHelper} />
          <FormInput name="departureDate" label={t.onboardingPage.form.departureDateLabel} type="date" />
          <FormInput name="departureFlight" label={t.onboardingPage.form.departureFlightLabel} />
          <FormInput name="departureCity" label={t.onboardingPage.form.departureCityLabel} />
        </div>
      )}

      {values.specificTravelPlan === "nao" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-bg-subtle rounded-2xl border border-border">
          <FormInput name="estArrivalDate" label={t.onboardingPage.form.estArrivalDateLabel} type="date" required tooltip={(t as any).ds160?.travel?.arrivalHelper} />
          <FormInput name="estStayLength" label={t.onboardingPage.form.estStayLengthLabel} placeholder={t.onboardingPage.form.estStayLengthPlaceholder} />
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
          />
          <div className="sm:col-span-2">
            <FormInput
              name="usStayName"
              label={t.onboardingPage.form.usStayNameLabel}
              placeholder={t.onboardingPage.form.usStayNamePlaceholder}
              required
              disabled={shouldDisableUsAddressFields}
              tooltip={(t as any).ds160?.travel?.stayHelper}
            />
          </div>
          <div className="sm:col-span-2">
            <FormInput
              name="usStayStreet"
              label={t.onboardingPage.form.streetNumberLabel}
              required
              disabled={shouldDisableUsAddressFields}
            />
          </div>
          <FormInput
            name="usStayCity"
            label={t.onboardingPage.form.cityLabel}
            required
            disabled={shouldDisableUsAddressFields}
            datalistOptions={usCitySuggestions}
          />
          <FormInput
            name="usStayState"
            label={t.onboardingPage.form.stateLabelShort}
            placeholder={t.onboardingPage.form.statePlaceholderShort}
            required
            disabled={shouldDisableUsAddressFields}
            datalistOptions={usStateSuggestions}
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
        options={[
          { value: "eu", label: t.onboardingPage.form.payingMe },
          { value: "outra_pessoa", label: t.onboardingPage.form.payingOther },
          { value: "empresa", label: t.onboardingPage.form.payingCompany },
        ]}
        tooltip={(t as any).ds160?.travel?.payerHelper}
      />

      {values.payingTrip && values.payingTrip !== "eu" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-bg-subtle rounded-2xl border border-border">
          <FormInput name="payerName" label={t.onboardingPage.form.payerNameLabel} required />
          <FormInput name="payerRelation" label={t.onboardingPage.form.payerRelationLabel} placeholder={t.onboardingPage.form.payerRelationPlaceholder} required />
          <FormInput name="payerPhone" label={t.onboardingPage.form.phoneLabel} />
          <FormInput name="payerEmail" label={t.onboardingPage.form.emailLabel} type="email" />
        </div>
      )}
    </Section>,

    <Section key="companions" title={`👥 ${t.onboardingPage.form.companionsTitle}`}>
      <YesNo name="travelingWithOthers" label={t.onboardingPage.form.travelingWithOthers} required tooltip={(t as any).ds160?.companions?.companionHelper} />

      {values.travelingWithOthers === "sim" && (
        <div className="space-y-5 p-5 bg-bg-subtle rounded-2xl border border-border">
          <YesNo name="travelGroup" label={t.onboardingPage.form.travelGroup} />
          <FormTextarea
            name="companionsDetails"
            label={t.onboardingPage.form.companionsDetailsLabel}
            placeholder={t.onboardingPage.form.companionsDetailsPlaceholder}
            rows={3}
          />
        </div>
      )}
    </Section>,

    <Section key="travel-history" title={`🔙 ${t.onboardingPage.form.previousTravelTitle}`}>
      <YesNo name="beenToUS" label={t.onboardingPage.form.beenToUS} required />
      {values.beenToUS === "sim" && (
        <div className="space-y-5 p-5 bg-bg-subtle rounded-2xl border border-border">
          <FormTextarea
            name="previousVisitsDetails"
            label={t.onboardingPage.form.previousVisitsDetailsLabel}
            placeholder={t.onboardingPage.form.previousVisitsDetailsPlaceholder}
            required
          />
          <YesNo name="hadUSDriverLicense" label={t.onboardingPage.form.hadUSDriverLicense} />
        </div>
      )}

      <YesNo name="hadUSVisa" label={t.onboardingPage.form.hadUSVisa} required />
      {values.hadUSVisa === "sim" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-bg-subtle rounded-2xl border border-border">
          <FormInput name="lastVisaDate" label={t.onboardingPage.form.lastVisaDateLabel} type="date" required />
          <FormInput name="lastVisaNumber" label={t.onboardingPage.form.lastVisaNumberLabel} placeholder={t.onboardingPage.form.lastVisaNumberPlaceholder} />
          <FormSelect name="sameVisaType" label={t.onboardingPage.form.sameVisaType} options={[{ value: "sim", label: t.onboardingPage.form.yes }, { value: "nao", label: t.onboardingPage.form.no }]} />
          <FormSelect name="sameVisaCountry" label={t.onboardingPage.form.sameVisaCountry} options={[{ value: "sim", label: t.onboardingPage.form.yes }, { value: "nao", label: t.onboardingPage.form.no }]} />
          <FormSelect name="tenPrinted" label={t.onboardingPage.form.tenPrinted} options={[{ value: "sim", label: t.onboardingPage.form.yes }, { value: "nao", label: t.onboardingPage.form.no }]} />
          <FormSelect name="visaLost" label={t.onboardingPage.form.visaLost} options={[{ value: "sim", label: t.onboardingPage.form.yes }, { value: "nao", label: t.onboardingPage.form.no }]} />
          <FormSelect name="visaCancelled" label={t.onboardingPage.form.visaCancelled} options={[{ value: "sim", label: t.onboardingPage.form.yes }, { value: "nao", label: t.onboardingPage.form.no }]} />
        </div>
      )}

      <YesNo name="refusedUSVisa" label={t.onboardingPage.form.refusedUSVisa} required />
      {values.refusedUSVisa === "sim" && (
        <FormTextarea name="refusedExpanation" label={t.onboardingPage.form.explainDetailLabel} required />
      )}

      <YesNo name="immigrationPetition" label={t.onboardingPage.form.immigrationPetition} required tooltip={(t as any).ds160?.previousTravel?.petitionHelper} />
      {values.immigrationPetition === "sim" && (
        <FormInput name="petitionExpanation" label={t.onboardingPage.form.explainLabel} required />
      )}
    </Section>,

    <Section key="contact" title={`🏠 ${t.onboardingPage.form.contactAddressTitle}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="sm:col-span-2">
          <FormInput name="homeStreet" label={t.onboardingPage.form.homeStreetLabel} required />
        </div>
        <FormInput name="homeCity" label={t.onboardingPage.form.homeCityLabel || t.onboardingPage.form.cityLabel} required />
        <FormInput name="homeState" label={t.onboardingPage.form.stateProvinceLabel} required />
        <FormNumericInput
          name="homeZip"
          label={t.onboardingPage.form.zipCodeLabel}
          required
          onChange={async (val) => {
            const cleanCep = val.replace(/\D/g, "");
            if (cleanCep.length === 8) {
              try {
                const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
                if (res.ok) {
                  const data = await res.json();
                  if (!data.erro) {
                    const streetValue = data.logradouro 
                      ? `${data.logradouro}${data.bairro ? `, ${data.bairro}` : ""}`
                      : "";
                    setFieldValue("homeStreet", streetValue);
                    setFieldValue("homeCity", data.localidade || "");
                    setFieldValue("homeState", data.uf || "");
                    setFieldValue("homeCountry", "Brasil");
                  }
                }
              } catch (err) {
                console.error("ViaCEP autofill failed:", err);
              }
            } else if (cleanCep.length === 5) {
              try {
                const res = await fetch(`https://api.zippopotam.us/us/${cleanCep}`);
                if (res.ok) {
                  const data = await res.json();
                  const place = data.places?.[0];
                  if (place) {
                    setFieldValue("homeCity", place["place name"] || "");
                    setFieldValue("homeState", place["state abbreviation"] || "");
                    setFieldValue("homeCountry", "United States");
                  }
                }
              } catch (err) {
                console.error("Zippopotam US homeZip failed:", err);
              }
            }
          }}
        />
        <FormInput name="homeCountry" label={t.onboardingPage.form.countryLabel} required />
      </div>

      <YesNo name="differentMailingAddress" label={t.onboardingPage.form.differentMailingAddress} required />
      {values.differentMailingAddress === "sim" && (
        <FormTextarea name="mailingAddressFull" label={t.onboardingPage.form.mailingAddressFullLabel} />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <FormInput name="primaryPhone" label={t.onboardingPage.form.primaryPhoneLabel} placeholder={t.onboardingPage.form.phonePlaceholder} required />
        <FormInput name="secondaryPhone" label={t.onboardingPage.form.secondaryPhoneLabel} />
        <FormInput name="cellPhone" label={t.onboardingPage.form.cellPhoneLabel} />
      </div>

      <YesNo name="otherPhones5Y" label={t.onboardingPage.form.otherPhones5Y} required />
      {values.otherPhones5Y === "sim" && (
        <FormInput name="otherPhonesList" label={t.onboardingPage.form.otherPhonesListLabel} />
      )}

      <div className="max-w-sm">
        <FormInput name="primaryEmail" label={t.onboardingPage.form.primaryEmailLabel} type="email" required />
      </div>

      <YesNo name="otherEmails5Y" label={t.onboardingPage.form.otherEmails5Y} required />
      {values.otherEmails5Y === "sim" && (
        <FormInput name="otherEmailList" label={t.onboardingPage.form.otherEmailListLabel} />
      )}

      <FormTextarea
        name="socialMediaAccounts"
        label={t.onboardingPage.form.socialMediaAccountsLabel}
        placeholder={t.onboardingPage.form.socialMediaAccountsPlaceholder}
        required
        rows={3}
      />
    </Section>,

    <Section key="family" title={`👨‍👩‍👧‍👦 ${t.onboardingPage.form.familyInfoTitle}`}>
      <div>
        <p className="text-[11px] font-black text-text-muted uppercase tracking-widest mb-4">{t.onboardingPage.form.fatherLabel}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-bg-subtle rounded-2xl border border-border">
          <FormInput name="fatherName" label={t.onboardingPage.form.fatherNameLabel} />
          <FormInput name="fatherBirth" label={t.onboardingPage.form.birthDateLabel} type="date" />
          <div className="sm:col-span-2">
            <YesNo name="fatherInUS" label={t.onboardingPage.form.fatherInUS} />
          </div>
          {values.fatherInUS === "sim" && (
            <div className="sm:col-span-2">
              <FormInput name="fatherUSStatus" label={t.onboardingPage.form.fatherUSStatusLabel} placeholder={t.onboardingPage.form.usStatusPlaceholder} />
            </div>
          )}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-black text-text-muted uppercase tracking-widest mb-4">{t.onboardingPage.form.motherLabel}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-bg-subtle rounded-2xl border border-border">
          <FormInput name="motherName" label={t.onboardingPage.form.motherNameLabel} />
          <FormInput name="motherBirth" label={t.onboardingPage.form.birthDateLabel} type="date" />
          <div className="sm:col-span-2">
            <YesNo name="motherInUS" label={t.onboardingPage.form.motherInUS} />
          </div>
          {values.motherInUS === "sim" && (
            <div className="sm:col-span-2">
              <FormInput name="motherUSStatus" label={t.onboardingPage.form.motherUSStatusLabel} placeholder={t.onboardingPage.form.usStatusPlaceholder} />
            </div>
          )}
        </div>
      </div>

      <YesNo name="otherRelInUS" label={t.onboardingPage.form.otherRelInUS} />

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
                          Remover
                        </button>
                      )}
                      <p className="text-[11px] font-black text-text-muted uppercase tracking-widest">
                        Parente {idx + 1}
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">
                            Nome Completo
                          </label>
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
                          <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">
                            Grau de Parentesco
                          </label>
                          <select
                            value={rel.relation || ""}
                            onChange={(e) => {
                              const newList = [...relatives];
                              newList[idx] = { ...newList[idx], relation: e.target.value };
                              setFieldValue("otherRelativesList", newList);
                            }}
                            className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm font-medium text-text transition-all outline-none focus:ring-2 focus:ring-primary/20 appearance-none bg-[url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23888\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E')] bg-[length:18px] bg-no-repeat bg-[right_12px_center] pr-10 focus:border-primary"
                          >
                            <option value="">Selecione...</option>
                            <option value="irmao">Irmão/Irmã</option>
                            <option value="filho">Filho/Filha</option>
                            <option value="noivo">Noivo/Noiva</option>
                            <option value="outro">Outro Parente</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2 space-y-1.5">
                          <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">
                            Status Imigratório nos EUA
                          </label>
                          <select
                            value={rel.status || ""}
                            onChange={(e) => {
                              const newList = [...relatives];
                              newList[idx] = { ...newList[idx], status: e.target.value };
                              setFieldValue("otherRelativesList", newList);
                            }}
                            className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm font-medium text-text transition-all outline-none focus:ring-2 focus:ring-primary/20 appearance-none bg-[url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23888\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E')] bg-[length:18px] bg-no-repeat bg-[right_12px_center] pr-10 focus:border-primary"
                          >
                            <option value="">Selecione...</option>
                            <option value="citizen">Cidadão Americano</option>
                            <option value="lpr">Residente Permanente Legal (Green Card)</option>
                            <option value="nonImmigrant">Não Imigrante (Visto de Turismo/Trabalho)</option>
                            <option value="student">Estudante / Intercâmbio (F/J)</option>
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
                  + Adicionar Parente nos EUA
                </button>
              </>
            );
          })()}
        </div>
      )}

      <div>
        <p className="text-[11px] font-black text-text-muted uppercase tracking-widest mb-4">{t.onboardingPage.form.spouseLabel}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-bg-subtle rounded-2xl border border-border">
          <FormInput name="spouseName" label={t.onboardingPage.form.fullNameLabel} />
          <FormInput name="spouseBirth" label={t.onboardingPage.form.birthDateLabel} type="date" />
          <FormInput name="spouseCity" label={t.onboardingPage.form.birthCityLabel} />
          <FormInput name="spouseCountry" label={t.onboardingPage.form.birthCountryLabel} />
          <div className="sm:col-span-2">
            <YesNo name="spouseSameAddress" label={t.onboardingPage.form.spouseSameAddress} />
          </div>
        </div>
      </div>
    </Section>,

    <Section key="work" title={`💼 ${t.onboardingPage.form.workEducationTitle}`}>
      <div>
        <p className="text-[11px] font-black text-text-muted uppercase tracking-widest mb-4">{t.onboardingPage.form.currentJobLabel}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-bg-subtle rounded-2xl border border-border">
          <FormInput name="primaryJobSector" label={t.onboardingPage.form.jobSectorLabel} placeholder={t.onboardingPage.form.jobSectorPlaceholder} required tooltip={(t as any).ds160?.workEducation?.occHelper} />
          <FormInput name="primaryJobEntity" label={t.onboardingPage.form.jobEntityLabel} required tooltip={(t as any).ds160?.workEducation?.employerHelper} />
          <div className="sm:col-span-2">
            <FormInput name="primaryJobAddress" label={t.onboardingPage.form.fullAddressLabel} tooltip={(t as any).ds160?.workEducation?.addressHelper} />
          </div>
          <FormInput name="primaryJobPhone" label={t.onboardingPage.form.phoneLabel} />
          <FormNumericInput name="primaryJobSalary" label={t.onboardingPage.form.monthlySalaryLabel} placeholder={t.onboardingPage.form.monthlySalaryPlaceholder} allowDecimals={true} isCurrency={true} tooltip={(t as any).ds160?.workEducation?.incomeHelper} />
          <div className="sm:col-span-2">
            <FormTextarea name="primaryJobDuties" label={t.onboardingPage.form.jobDutiesLabel} rows={2} />
          </div>
        </div>
      </div>

      <YesNo name="employedLast5Y" label={t.onboardingPage.form.employedLast5Y} required />
      {values.employedLast5Y === "sim" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-bg-subtle rounded-2xl border border-border">
          <FormInput name="prevEmployerName" label={t.onboardingPage.form.prevEmployerNameLabel} required />
          <FormInput name="prevEmployerTitle" label={t.onboardingPage.form.prevEmployerTitleLabel} />
          <FormInput name="prevEmployerStart" label={t.onboardingPage.form.startDateLabel} type="date" />
          <FormInput name="prevEmployerEnd" label={t.onboardingPage.form.endDateLabel} type="date" />
          <div className="sm:col-span-2">
            <FormInput name="prevEmployerDuties" label={t.onboardingPage.form.jobDutiesLabel} />
          </div>
        </div>
      )}

      <YesNo name="higherEducation" label={t.onboardingPage.form.higherEducation} required />
      {values.higherEducation === "sim" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-bg-subtle rounded-2xl border border-border">
          <div className="sm:col-span-2">
            <FormInput name="eduName" label={t.onboardingPage.form.eduNameLabel} required />
          </div>
          <div className="sm:col-span-2">
            <FormInput name="eduCourse" label={t.onboardingPage.form.eduCourseLabel} />
          </div>
          <FormInput name="eduStart" label={t.onboardingPage.form.startDateLabel} type="date" />
          <FormInput name="eduEnd" label={t.onboardingPage.form.endDateLabel} type="date" />
        </div>
      )}

      <YesNo name="belongsToTribe" label={t.onboardingPage.form.belongsToTribe} required />
      <FormInput name="fluentLanguages" label={t.onboardingPage.form.fluentLanguagesLabel} placeholder={t.onboardingPage.form.fluentLanguagesPlaceholder} required />
      <FormTextarea name="countriesVisited5Y" label={t.onboardingPage.form.countriesVisited5YLabel} placeholder={t.onboardingPage.form.countriesVisited5YPlaceholder} rows={2} />

      <YesNo name="servedMilitary" label={t.onboardingPage.form.servedMilitary} required />
      {values.servedMilitary === "sim" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 bg-bg-subtle rounded-2xl border border-border">
          <FormInput name="militaryBranch" label={t.onboardingPage.form.militaryBranchLabel} placeholder={t.onboardingPage.form.militaryBranchPlaceholder} />
          <FormInput name="militarySpecialty" label={t.onboardingPage.form.militarySpecialtyLabel} />
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
        <YesNo name="securityExceptions" label="" />
        {values.securityExceptions === "sim" && (
          <FormInput
            name="securityExceptionsDetails"
            label={t.onboardingPage.form.securityExceptionsLabel}
            placeholder={t.onboardingPage.form.securityExceptionsPlaceholder}
            required
          />
        )}
      </div>
    </Section>,
  ];

  return (
    <fieldset disabled={readOnly} className='space-y-8 disabled:opacity-90'>
      {sections[currentSection] ?? sections[0]}
    </fieldset>
  )
}
