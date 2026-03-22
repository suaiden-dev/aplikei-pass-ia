// ─── Service Identity ─────────────────────────────────────────────────────────

export type ServiceID =
  | 'B1B2_TOURIST'
  | 'F1F2_STUDENT'
  | 'I539_EXTENSION'
  | 'CHANGE_OF_STATUS';

// ─── Status Lifecycle ─────────────────────────────────────────────────────────

export type VisaServiceStatus =
  | 'IDLE'
  | 'IN_PROGRESS'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'ACTION_REQUIRED';

// ─── Core Entity ──────────────────────────────────────────────────────────────

export interface VisaService {
  id: ServiceID;
  userServiceId: string;       // FK → user_services.id
  status: VisaServiceStatus;
  metadata: Record<string, unknown>;
  last_update: string;
}

// ─── Allowed status transitions ───────────────────────────────────────────────

export const ALLOWED_TRANSITIONS: Record<VisaServiceStatus, VisaServiceStatus[]> = {
  IDLE:            ['IN_PROGRESS'],
  IN_PROGRESS:     ['UNDER_REVIEW', 'IDLE'],
  UNDER_REVIEW:    ['APPROVED', 'REJECTED', 'ACTION_REQUIRED'],
  ACTION_REQUIRED: ['UNDER_REVIEW', 'REJECTED'],
  APPROVED:        [],
  REJECTED:        [],
};

// ─── Slug → ServiceID mapping ─────────────────────────────────────────────────

const SLUG_MAP: Record<string, ServiceID> = {
  'visto-b1-b2':     'B1B2_TOURIST',
  'visa-f1f2':       'F1F2_STUDENT',
  'visto-f1':        'F1F2_STUDENT',
  'extensao-status': 'I539_EXTENSION',
  'changeofstatus':  'CHANGE_OF_STATUS',
  'troca-status':    'CHANGE_OF_STATUS',
};

export function slugToServiceId(slug: string): ServiceID {
  return SLUG_MAP[slug] ?? 'B1B2_TOURIST';
}

// ─── Legacy ↔ canonical status bridges ───────────────────────────────────────
// Supabase `user_services.status` stores legacy strings due to a CHECK constraint.
// These maps let the StatusEngine write/read from the DB without changing the schema.

export function legacyToVisaStatus(raw: string): VisaServiceStatus {
  switch (raw) {
    case 'active':
    case 'ds160InProgress':
      return 'IN_PROGRESS';
    case 'review_pending':
    case 'ds160Processing':
    case 'ds160upload_documents':
    case 'uploadsUnderReview':
    case 'ds160AwaitingReviewAndSignature':
    case 'review_assign':
      return 'UNDER_REVIEW';
    case 'Waiting Signature':
    case 'approved':
    case 'completed':
      return 'APPROVED';
    case 'rejected':
    case 'canceled':
      return 'REJECTED';
    case 'Action Required':
      return 'ACTION_REQUIRED';
    default:
      return 'IDLE';
  }
}

export const STATUS_TO_LEGACY: Record<VisaServiceStatus, string> = {
  IDLE:            'active',
  IN_PROGRESS:     'ds160InProgress',
  UNDER_REVIEW:    'uploadsUnderReview',
  APPROVED:        'approved',
  REJECTED:        'rejected',
  ACTION_REQUIRED: 'Action Required',
};
