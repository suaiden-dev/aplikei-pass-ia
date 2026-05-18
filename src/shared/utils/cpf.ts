/** 
 * Applies a mask to a string for CPF (000.000.000-00).
 */
export function maskCPF(value: string): string {
  return value
    .replace(/\D/g, "") // Remove non-numbers
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1"); // Cap at 11 digits + formatting
}

/** 
 * Validates a CPF number.
 */
export function validateCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, "");

  if (cleanCPF.length !== 11) return false;

  // Check for common invalid CPFs (all digits equal)
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  const digits = cleanCPF.split("").map(Number);

  // Validate first digit
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += digits[i] * (10 - i);
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== digits[9]) return false;

  // Validate second digit
  sum = 0;
  for (let i = 0; i < 10; i++) sum += digits[i] * (11 - i);
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== digits[10]) return false;

  return true;
}
