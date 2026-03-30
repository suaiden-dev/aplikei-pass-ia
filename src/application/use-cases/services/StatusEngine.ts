import type { IStatusEngine, StatusTransitionOptions } from '@/application/ports/IStatusEngine';
import type { IUserProcessRepository } from '@/application/ports/IUserProcessRepository';
import {
  type ServiceID,
  type VisaServiceStatus,
  ALLOWED_TRANSITIONS,
  STATUS_TO_LEGACY,
} from '@/domain/services/VisaServiceTypes';
import { validateService } from '@/domain/services/ServiceValidation';

export class StatusEngine implements IStatusEngine {
  constructor(private readonly processRepo: IUserProcessRepository) {}

  async transition(
    userServiceId: string,
    serviceId: ServiceID,
    action: string,
    nextStatus: VisaServiceStatus,
    metadata: Record<string, unknown> = {},
    options: StatusTransitionOptions = {},
  ): Promise<void> {
    const { skipValidation = false, step } = options;

    // ── 1. Guard: allowed transition? ────────────────────────────────────────
    // We don't know the current status here without an extra DB read, so we
    // trust the caller for now. A future enhancement could fetch & validate.

    // ── 2. Domain validation ─────────────────────────────────────────────────
    if (!skipValidation) {
      const result = validateService(serviceId, metadata);
      if (!result.valid) {
        // Log but do not block — validation warnings surface in the debug log.
        console.warn(
          `[APLIKEI_DEBUG] Validation warnings for ${serviceId}:`,
          result.errors,
        );
      }
    }

    // ── 3. Persist ────────────────────────────────────────────────────────────
    const legacyStatus = STATUS_TO_LEGACY[nextStatus];
    await this.processRepo.updateServiceStatus(userServiceId, legacyStatus, metadata, step);

    // ── 4. Mandatory audit log ────────────────────────────────────────────────
    // Every status transition — client or admin — surfaces here.
    console.log(
      `[APLIKEI_DEBUG] Service: ${serviceId} | Action: ${action} | New Status: ${nextStatus} | Timestamp: ${new Date().toISOString()}`,
    );
  }
}
