import type { ValidatorFn, FieldValues } from "./types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const digits = (v: string) => v.replace(/\D/g, "");
const isEmpty = (v: unknown) =>
  v === undefined || v === null || String(v).trim() === "";

// ─── Básicos ──────────────────────────────────────────────────────────────────

export const required =
  (msg = "Campo obrigatório"): ValidatorFn =>
  (v) =>
    isEmpty(v) ? msg : undefined;

export const minLength =
  (min: number, msg?: string): ValidatorFn =>
  (v) => {
    if (isEmpty(v)) return undefined;
    return String(v).length < min
      ? (msg ?? `Mínimo ${min} caracteres`)
      : undefined;
  };

export const maxLength =
  (max: number, msg?: string): ValidatorFn =>
  (v) => {
    if (isEmpty(v)) return undefined;
    return String(v).length > max
      ? (msg ?? `Máximo ${max} caracteres`)
      : undefined;
  };

export const exactLength =
  (len: number, msg?: string): ValidatorFn =>
  (v) => {
    if (isEmpty(v)) return undefined;
    return digits(String(v)).length !== len
      ? (msg ?? `Deve ter exatamente ${len} caracteres`)
      : undefined;
  };

// ─── Formato ──────────────────────────────────────────────────────────────────

export const email =
  (msg = "E-mail inválido"): ValidatorFn =>
  (v) => {
    if (isEmpty(v)) return undefined;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v)) ? undefined : msg;
  };

export const url =
  (msg = "URL inválida"): ValidatorFn =>
  (v) => {
    if (isEmpty(v)) return undefined;
    try {
      new URL(String(v));
      return undefined;
    } catch {
      return msg;
    }
  };

export const pattern =
  (regex: RegExp, msg = "Formato inválido"): ValidatorFn =>
  (v) => {
    if (isEmpty(v)) return undefined;
    return regex.test(String(v)) ? undefined : msg;
  };

// ─── Números ──────────────────────────────────────────────────────────────────

export const numeric =
  (msg = "Apenas números"): ValidatorFn =>
  (v) => {
    if (isEmpty(v)) return undefined;
    return /^\d+$/.test(digits(String(v))) ? undefined : msg;
  };

export const min =
  (minVal: number, msg?: string): ValidatorFn =>
  (v) => {
    if (isEmpty(v)) return undefined;
    const num = parseFloat(String(v).replace(",", "."));
    return isNaN(num) || num < minVal
      ? (msg ?? `Valor mínimo: ${minVal}`)
      : undefined;
  };

export const max =
  (maxVal: number, msg?: string): ValidatorFn =>
  (v) => {
    if (isEmpty(v)) return undefined;
    const num = parseFloat(String(v).replace(",", "."));
    return isNaN(num) || num > maxVal
      ? (msg ?? `Valor máximo: ${maxVal}`)
      : undefined;
  };

export const integer =
  (msg = "Deve ser um número inteiro"): ValidatorFn =>
  (v) => {
    if (isEmpty(v)) return undefined;
    return /^-?\d+$/.test(String(v).trim()) ? undefined : msg;
  };

// ─── Documentos BR ───────────────────────────────────────────────────────────

function cpfDigitsValid(cpfStr: string): boolean {
  const d = digits(cpfStr);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const calc = (slice: number) => {
    let sum = 0;
    const weight = slice + 1;
    for (let i = 0; i < slice; i++) sum += parseInt(d[i]) * (weight - i);
    const rem = (sum * 10) % 11;
    return rem === 10 || rem === 11 ? 0 : rem;
  };
  return calc(9) === parseInt(d[9]) && calc(10) === parseInt(d[10]);
}

export const cpf =
  (msg = "CPF inválido"): ValidatorFn =>
  (v) => {
    if (isEmpty(v)) return undefined;
    return cpfDigitsValid(String(v)) ? undefined : msg;
  };

function cnpjDigitsValid(cnpjStr: string): boolean {
  const d = digits(cnpjStr);
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;
  const calc = (slice: number, weights: number[]) => {
    let sum = 0;
    for (let i = 0; i < slice; i++) sum += parseInt(d[i]) * weights[i];
    const rem = sum % 11;
    return rem < 2 ? 0 : 11 - rem;
  };
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  return calc(12, w1) === parseInt(d[12]) && calc(13, w2) === parseInt(d[13]);
}

export const cnpj =
  (msg = "CNPJ inválido"): ValidatorFn =>
  (v) => {
    if (isEmpty(v)) return undefined;
    return cnpjDigitsValid(String(v)) ? undefined : msg;
  };

export const phone =
  (msg = "Telefone inválido"): ValidatorFn =>
  (v) => {
    if (isEmpty(v)) return undefined;
    const d = digits(String(v));
    return d.length >= 10 && d.length <= 11 ? undefined : msg;
  };

export const cep =
  (msg = "CEP inválido"): ValidatorFn =>
  (v) => {
    if (isEmpty(v)) return undefined;
    return digits(String(v)).length === 8 ? undefined : msg;
  };

// ─── Lógica ───────────────────────────────────────────────────────────────────

/** O valor deve ser igual ao valor de outro campo. */
export const matches =
  <T extends FieldValues>(
    fieldName: keyof T,
    msg = "Os valores não coincidem",
  ): ValidatorFn<T> =>
  (v, allValues) => {
    if (isEmpty(v)) return undefined;
    return String(v) === String(allValues[fieldName]) ? undefined : msg;
  };

/** Aceita apenas valores da lista. */
export const oneOf =
  (options: string[], msg = "Opção inválida"): ValidatorFn =>
  (v) => {
    if (isEmpty(v)) return undefined;
    return options.includes(String(v)) ? undefined : msg;
  };

/** Valida que o campo é `true` (checkboxes de aceite). */
export const mustBeTrue =
  (msg = "Campo obrigatório"): ValidatorFn =>
  (v) => {
    const raw = v as unknown;
    return raw === true || String(raw) === "true" ? undefined : msg;
  };

/** Valida data no formato DD/MM/AAAA. */
export const date =
  (msg = "Data inválida"): ValidatorFn =>
  (v) => {
    if (isEmpty(v)) return undefined;
    const match = String(v).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return msg;
    const [, day, month, year] = match.map(Number);
    const d = new Date(year, month - 1, day);
    return d.getFullYear() === year &&
      d.getMonth() === month - 1 &&
      d.getDate() === day
      ? undefined
      : msg;
  };

/** Função personalizada — inline sem precisar criar um validador separado. */
export const custom =
  (fn: (v: string) => string | undefined): ValidatorFn =>
  (v) =>
    fn(v);

// ─── Compose ──────────────────────────────────────────────────────────────────

/**
 * Compõe vários validators: para na primeira mensagem de erro.
 * Útil quando você não quer usar arrays no config.
 */
export const compose =
  <T extends FieldValues>(
    ...fns: ValidatorFn<T>[]
  ): ValidatorFn<T> =>
  (v, all) => {
    for (const fn of fns) {
      const err = fn(v, all);
      if (err) return err;
    }
    return undefined;
  };

export const v = {
  required,
  minLength,
  maxLength,
  exactLength,
  email,
  url,
  pattern,
  numeric,
  min,
  max,
  integer,
  cpf,
  cnpj,
  phone,
  cep,
  matches,
  oneOf,
  mustBeTrue,
  date,
  custom,
  compose,
};
