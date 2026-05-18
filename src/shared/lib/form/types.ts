import type React from "react";

// ─── Validator ────────────────────────────────────────────────────────────────

/** Returns an error message string, or undefined if valid. */
export type ValidatorFn<T extends FieldValues = FieldValues> = (
  value: string,
  allValues: T,
) => string | undefined;

// ─── Mask ─────────────────────────────────────────────────────────────────────

/** Receives raw input, returns formatted string. */
export type MaskFn = (raw: string) => string;

// ─── Field values ─────────────────────────────────────────────────────────────

export type FieldValues = Record<string, unknown>;

export type FieldErrors<T extends FieldValues> = Partial<Record<keyof T, string>>;
export type FieldTouched<T extends FieldValues> = Partial<Record<keyof T, boolean>>;

// ─── Config ───────────────────────────────────────────────────────────────────

export interface UseFormConfig<T extends FieldValues> {
  /** Initial field values. */
  initialValues: T;
  /**
   * Per-field validators. Each field can have a single validator
   * or an array that runs in order — first error wins.
   */
  validators?: {
    [K in keyof T]?: ValidatorFn<T> | ValidatorFn<T>[];
  };
  /**
   * Cross-field validation run after per-field validators.
   * Return an object with field keys → error strings.
   */
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  /** Called only when all validations pass. */
  onSubmit: (values: T) => void | Promise<void>;
}

// ─── Field props returned by register() ───────────────────────────────────────

export interface TextFieldProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur: () => void;
  error?: string;
}

export interface CheckboxFieldProps {
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  error?: string;
}

export interface SelectFieldProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur: () => void;
  error?: string;
}

// ─── Return value of useForm ───────────────────────────────────────────────────

export interface FormReturn<T extends FieldValues> {
  values: T;
  errors: FieldErrors<T>;
  touched: FieldTouched<T>;
  isSubmitting: boolean;
  /** True when all validations pass (computed on every render). */
  isValid: boolean;
  /** True when values differ from initialValues. */
  isDirty: boolean;

  /** Bind a text / number input. Pass a mask to auto-format on input. */
  register: (name: keyof T, mask?: MaskFn) => TextFieldProps;
  /** Bind a checkbox input. */
  registerCheckbox: (name: keyof T) => CheckboxFieldProps;
  /** Bind a select element. */
  registerSelect: (name: keyof T) => SelectFieldProps;

  /** Programmatically set a field value. */
  setValue: (name: keyof T, value: unknown) => void;
  /** Programmatically set a field error (e.g. from server response). */
  setError: (name: keyof T, error: string) => void;
  /** Mark a field as touched and validate it. */
  touch: (name: keyof T) => void;
  /** onSubmit handler — attach to <form onSubmit={handleSubmit}>. */
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  /** Reset form to initialValues. */
  reset: () => void;
}
