import { UserProcess } from "@/domain/user/UserEntities";

export interface IUserProcessRepository {
  findByUserId(userId: string): Promise<UserProcess[]>;
  findById(id: string): Promise<UserProcess | null>;
  create(userId: string, serviceSlug: string, status: string): Promise<UserProcess>;
  updateStep(id: string, step: number): Promise<void>;
  updateStatus(id: string, status: string, step?: number): Promise<void>;
  /**
   * Called exclusively by StatusEngine. Persists a legacy status string,
   * merges service-specific metadata into service_metadata JSONB, and
   * optionally advances current_step — all in one atomic write.
   */
  updateServiceStatus(
    id: string,
    legacyStatus: string,
    metadata?: Record<string, unknown>,
    step?: number,
  ): Promise<void>;
}
