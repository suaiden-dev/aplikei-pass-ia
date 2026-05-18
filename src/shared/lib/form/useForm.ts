import { useState, useCallback, useRef, useMemo } from "react";
import type {
  FieldValues,
  FieldErrors,
  FieldTouched,
  FormReturn,
  MaskFn,
  UseFormConfig,
  ValidatorFn,
} from "./types";

export function useForm<T extends FieldValues>(
  config: UseFormConfig<T>,
): FormReturn<T> {
  const { initialValues, validators = {}, validate, onSubmit } = config;

  const [values, setValues] = useState<T>(() => ({ ...initialValues }));
  const [errors, setErrors] = useState<FieldErrors<T>>({});
  const [touched, setTouched] = useState<FieldTouched<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keep initial values stable across renders
  const initialRef = useRef(initialValues);

  // ── Validate a single field ──────────────────────────────────────────────────
  const validateField = useCallback(
    (name: keyof T, value: unknown, currentValues: T): string | undefined => {
      const rules = (validators as Partial<Record<keyof T, ValidatorFn<T> | ValidatorFn<T>[]>>)[name];
      if (!rules) return undefined;
      const list: ValidatorFn<T>[] = Array.isArray(rules) ? rules : [rules];
      for (const rule of list) {
        const err = rule(value as string, currentValues);
        if (err) return err;
      }
      return undefined;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [validators],
  );

  // ── Validate all fields ──────────────────────────────────────────────────────
  const validateAll = useCallback(
    (currentValues: T): FieldErrors<T> => {
      const errs: FieldErrors<T> = {};

      // Per-field
      for (const key in validators) {
        const err = validateField(key as keyof T, currentValues[key], currentValues);
        if (err) (errs as Record<string, string>)[key] = err;
      }

      // Cross-field
      if (validate) {
        const crossErrs = validate(currentValues);
        for (const key in crossErrs) {
          if (!errs[key as keyof T]) {
            (errs as Record<string, string>)[key] =
              crossErrs[key as keyof T] as string;
          }
        }
      }

      return errs;
    },
    [validateField, validate, validators],
  );

  // ── isValid (derived) ────────────────────────────────────────────────────────
  const isValid = useMemo(
    () => Object.keys(validateAll(values)).length === 0,
    [validateAll, values],
  );

  // ── isDirty (derived) ────────────────────────────────────────────────────────
  const isDirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(initialRef.current),
    [values],
  );

  // ── setValue ─────────────────────────────────────────────────────────────────
  const setValue = useCallback(
    (name: keyof T, value: unknown) => {
      setValues((prev) => {
        const next = { ...prev, [name]: value };
        // Re-validate field if already touched
        if (touched[name]) {
          const err = validateField(name, value, next);
          setErrors((e) => ({ ...e, [name]: err }));
        }
        return next;
      });
    },
    [touched, validateField],
  );

  // ── touch ────────────────────────────────────────────────────────────────────
  const touch = useCallback(
    (name: keyof T) => {
      setTouched((prev) => ({ ...prev, [name]: true }));
      setValues((currentValues) => {
        const err = validateField(name, currentValues[name], currentValues);
        setErrors((e) => ({ ...e, [name]: err }));
        return currentValues;
      });
    },
    [validateField],
  );

  // ── setError ─────────────────────────────────────────────────────────────────
  const setError = useCallback((name: keyof T, error: string) => {
    setErrors((e) => ({ ...e, [name]: error }));
    setTouched((t) => ({ ...t, [name]: true }));
  }, []);

  // ── register (text / number) ─────────────────────────────────────────────────
  const register = useCallback(
    (name: keyof T, mask?: MaskFn) => ({
      name: name as string,
      value: (values[name] ?? "") as string,
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => {
        const raw = e.target.value;
        const formatted = mask ? mask(raw) : raw;
        setValue(name, formatted);
      },
      onBlur: () => touch(name),
      error: touched[name] ? (errors[name] as string | undefined) : undefined,
    }),
    [values, errors, touched, setValue, touch],
  );

  // ── registerCheckbox ─────────────────────────────────────────────────────────
  const registerCheckbox = useCallback(
    (name: keyof T) => ({
      name: name as string,
      checked: Boolean(values[name]),
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(name, e.target.checked);
      },
      onBlur: () => touch(name),
      error: touched[name] ? (errors[name] as string | undefined) : undefined,
    }),
    [values, errors, touched, setValue, touch],
  );

  // ── registerSelect ───────────────────────────────────────────────────────────
  const registerSelect = useCallback(
    (name: keyof T) => ({
      name: name as string,
      value: (values[name] ?? "") as string,
      onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
        setValue(name, e.target.value);
      },
      onBlur: () => touch(name),
      error: touched[name] ? (errors[name] as string | undefined) : undefined,
    }),
    [values, errors, touched, setValue, touch],
  );

  // ── handleSubmit ─────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      // Touch all registered fields
      const allTouched = Object.keys(validators).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as FieldTouched<T>,
      );
      setTouched(allTouched);

      const errs = validateAll(values);
      setErrors(errs);

      if (Object.keys(errs).length > 0) return;

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [validators, validateAll, onSubmit, values],
  );

  // ── reset ────────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    setValues({ ...initialRef.current });
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    register,
    registerCheckbox,
    registerSelect,
    setValue,
    setError,
    touch,
    handleSubmit,
    reset,
  };
}
