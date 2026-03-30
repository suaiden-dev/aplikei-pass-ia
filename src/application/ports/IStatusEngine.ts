import type { ServiceID, VisaServiceStatus } from '@/domain/services/VisaServiceTypes';

export interface StatusTransitionOptions {
  /** Skip domain validation (admin-initiated transitions only). */
  skipValidation?: boolean;
  /** Also update current_step in the same DB write. */
  step?: number;
}

export interface IStatusEngine {
  /**
   * Transitions a user service to a new status.
   *
   * Side-effects (always executed, even on failure):
   *  - Runs service-specific validation unless `skipValidation` is true.
   *  - Persists the new status (and optional step) to Supabase.
   *  - Emits an [APLIKEI_DEBUG] console.log for every transition attempt.
   */
  transition(
    userServiceId: string,
    serviceId: ServiceID,
    action: string,
    nextStatus: VisaServiceStatus,
    metadata?: Record<string, unknown>,
    options?: StatusTransitionOptions,
  ): Promise<void>;
}
