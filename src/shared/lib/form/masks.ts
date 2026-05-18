import type { MaskFn } from "./types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const digits = (v: string) => v.replace(/\D/g, "");

// ─── Telefone ─────────────────────────────────────────────────────────────────

/** (11) 99999-9999  ou  (11) 9999-9999 */
export const phone: MaskFn = (raw) => {
  const d = digits(raw).slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
};

/** +55 (11) 99999-9999 — com DDI */
export const phoneIntl: MaskFn = (raw) => {
  const d = digits(raw).slice(0, 13);
  return d
    .replace(/(\d{2})(\d{2})(\d{5})(\d{0,4})/, "+$1 ($2) $3-$4")
    .replace(/-$/, "");
};

// ─── Documentos ──────────────────────────────────────────────────────────────

/** 000.000.000-00 */
export const cpf: MaskFn = (raw) => {
  const d = digits(raw).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

/** 00.000.000/0000-00 */
export const cnpj: MaskFn = (raw) => {
  const d = digits(raw).slice(0, 14);
  return d
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
};

/** RG: 00.000.000-0 */
export const rg: MaskFn = (raw) => {
  const d = digits(raw).slice(0, 9);
  return d
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1})$/, "$1-$2");
};

// ─── Endereço ─────────────────────────────────────────────────────────────────

/** 00000-000 */
export const cep: MaskFn = (raw) => {
  const d = digits(raw).slice(0, 8);
  return d.replace(/(\d{5})(\d{0,3})/, "$1-$2").replace(/-$/, "");
};

// ─── Datas ────────────────────────────────────────────────────────────────────

/** DD/MM/AAAA */
export const date: MaskFn = (raw) => {
  const d = digits(raw).slice(0, 8);
  return d
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\d{2})(\d)/, "$1/$2");
};

/** MM/AAAA (validade de cartão estilo boleto) */
export const monthYear: MaskFn = (raw) => {
  const d = digits(raw).slice(0, 6);
  return d.replace(/(\d{2})(\d{0,4})/, "$1/$2").replace(/\/$/, "");
};

/** MM/AA (validade de cartão padrão) */
export const cardExpiry: MaskFn = (raw) => {
  const d = digits(raw).slice(0, 4);
  return d.replace(/(\d{2})(\d{0,2})/, "$1/$2").replace(/\/$/, "");
};

// ─── Cartão de crédito ────────────────────────────────────────────────────────

/** 0000 0000 0000 0000 */
export const creditCard: MaskFn = (raw) => {
  const d = digits(raw).slice(0, 16);
  return d.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
};

/** CVV — 3 ou 4 dígitos */
export const cvv: MaskFn = (raw) => digits(raw).slice(0, 4);

// ─── Moeda ────────────────────────────────────────────────────────────────────

/** R$ 1.000,00 */
export const currencyBRL: MaskFn = (raw) => {
  const d = digits(raw).slice(0, 13);
  if (!d) return "";
  const num = (parseInt(d, 10) / 100).toFixed(2);
  const [int, dec] = num.split(".");
  const intFormatted = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `R$ ${intFormatted},${dec}`;
};

/** $ 1,000.00 */
export const currencyUSD: MaskFn = (raw) => {
  const d = digits(raw).slice(0, 13);
  if (!d) return "";
  const num = (parseInt(d, 10) / 100).toFixed(2);
  const [int, dec] = num.split(".");
  const intFormatted = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `$ ${intFormatted}.${dec}`;
};

// ─── Outros ───────────────────────────────────────────────────────────────────

/** Apenas dígitos — sem formatação */
export const numbersOnly: MaskFn = (raw) => digits(raw);

/** Apenas letras e espaços */
export const lettersOnly: MaskFn = (raw) => raw.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");

/** Uppercase */
export const uppercase: MaskFn = (raw) => raw.toUpperCase();

/** Lowercase */
export const lowercase: MaskFn = (raw) => raw.toLowerCase();

/** Limita o total de caracteres (combine com outros masks) */
export const maxChars =
  (n: number): MaskFn =>
  (raw) =>
    raw.slice(0, n);

/** Hora HH:MM */
export const time: MaskFn = (raw) => {
  const d = digits(raw).slice(0, 4);
  return d.replace(/(\d{2})(\d{0,2})/, "$1:$2").replace(/:$/, "");
};

/** Código de processo USCIS — XXX-XXX-XXXXX */
export const uscisReceiptNumber: MaskFn = (raw) => {
  const clean = raw.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 13);
  return clean
    .replace(/([A-Z]{3})(\w)/, "$1-$2")
    .replace(/([A-Z]{3}-\d{3})(\w)/, "$1-$2");
};

// ─── Compose ──────────────────────────────────────────────────────────────────

/** Aplica múltiplos masks em sequência. */
export const compose =
  (...fns: MaskFn[]): MaskFn =>
  (raw) =>
    fns.reduce((v, fn) => fn(v), raw);

export const masks = {
  phone,
  phoneIntl,
  cpf,
  cnpj,
  rg,
  cep,
  date,
  monthYear,
  cardExpiry,
  creditCard,
  cvv,
  currencyBRL,
  currencyUSD,
  numbersOnly,
  lettersOnly,
  uppercase,
  lowercase,
  maxChars,
  time,
  uscisReceiptNumber,
  compose,
};
