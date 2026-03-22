import type { ServiceID } from './VisaServiceTypes';

// ─── Result type ──────────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// ─── B1/B2 Tourist Visa ───────────────────────────────────────────────────────
// Requirements: travel purpose + valid I-94 date (if already in the US)

export function validateB1B2Service(
  metadata: Record<string, unknown>,
): ValidationResult {
  const errors: string[] = [];

  if (!metadata.travelPurpose) {
    errors.push('Travel purpose is required for a B1/B2 application.');
  }

  if (metadata.i94ExpirationDate) {
    const expiry = new Date(metadata.i94ExpirationDate as string);
    if (isNaN(expiry.getTime())) {
      errors.push('I-94 expiration date is not a valid date.');
    }
  }

  return { valid: errors.length === 0, errors };
}

// ─── F1/F2 Student Visa ───────────────────────────────────────────────────────
// Requirements: SEVIS ID, school name, course start date

export function validateF1F2Service(
  metadata: Record<string, unknown>,
): ValidationResult {
  const errors: string[] = [];

  if (!metadata.sevisId || String(metadata.sevisId).trim() === '') {
    errors.push('SEVIS ID (from the I-20) is required for an F1/F2 application.');
  }

  if (!metadata.schoolName || String(metadata.schoolName).trim() === '') {
    errors.push('School name is required for an F1/F2 application.');
  }

  if (!metadata.courseStartDate) {
    errors.push('Course start date is required for an F1/F2 application.');
  }

  return { valid: errors.length === 0, errors };
}

// ─── I-539 Status Extension ───────────────────────────────────────────────────
// Requirements: I-94 expiration date + bank balance ≥ $6,000

export function validateExtensionService(
  metadata: Record<string, unknown>,
): ValidationResult {
  const MINIMUM_BALANCE = 6_000;
  const errors: string[] = [];

  if (!metadata.i94ExpirationDate) {
    errors.push('I-94 expiration date is required for a status extension.');
  }

  if (metadata.bankBalance === undefined || metadata.bankBalance === null) {
    errors.push(
      `Bank statement proof is required. Minimum balance: $${MINIMUM_BALANCE.toLocaleString()}.`,
    );
  } else {
    const balance = Number(metadata.bankBalance);
    if (isNaN(balance) || balance < MINIMUM_BALANCE) {
      errors.push(
        `Bank balance must be at least $${MINIMUM_BALANCE.toLocaleString()} for I-539 Extension. Provided: $${balance.toLocaleString()}.`,
      );
    }
  }

  return { valid: errors.length === 0, errors };
}

// ─── Change of Status ────────────────────────────────────────────────────────
// Requirements: source visa, target visa, I-94 date,
//               bank balance ≥ $22,000 + ($5,000 × dependents)

export function validateCOSService(
  metadata: Record<string, unknown>,
): ValidationResult {
  const BASE = 22_000;
  const PER_DEP = 5_000;
  const errors: string[] = [];

  if (!metadata.visaOrigin) {
    errors.push('Source visa type (visaOrigin) is required for Change of Status.');
  }

  if (!metadata.visaDestination) {
    errors.push('Target visa type (visaDestination) is required for Change of Status.');
  }

  if (!metadata.i94ExpirationDate) {
    errors.push('I-94 expiration date is required for Change of Status.');
  }

  const deps = Number(metadata.dependentCount ?? 0);
  const required = BASE + deps * PER_DEP;

  if (metadata.bankBalance === undefined || metadata.bankBalance === null) {
    errors.push(
      `Financial proof is required. Minimum: $${required.toLocaleString()} (base $${BASE.toLocaleString()} + $${PER_DEP.toLocaleString()} × ${deps} dependents).`,
    );
  } else {
    const balance = Number(metadata.bankBalance);
    if (isNaN(balance) || balance < required) {
      errors.push(
        `Bank balance must be at least $${required.toLocaleString()}. Provided: $${balance.toLocaleString()}.`,
      );
    }
  }

  return { valid: errors.length === 0, errors };
}

// ─── Strategy dispatcher ──────────────────────────────────────────────────────

export function validateService(
  serviceId: ServiceID,
  metadata: Record<string, unknown>,
): ValidationResult {
  switch (serviceId) {
    case 'B1B2_TOURIST':    return validateB1B2Service(metadata);
    case 'F1F2_STUDENT':    return validateF1F2Service(metadata);
    case 'I539_EXTENSION':  return validateExtensionService(metadata);
    case 'CHANGE_OF_STATUS': return validateCOSService(metadata);
  }
}
