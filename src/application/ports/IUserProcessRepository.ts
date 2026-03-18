import { UserProcess } from "@/domain/user/UserEntities";

export interface IUserProcessRepository {
  findByUserId(userId: string): Promise<UserProcess[]>;
  findById(id: string): Promise<UserProcess | null>;
  create(userId: string, serviceSlug: string, status: string): Promise<UserProcess>;
  updateStep(id: string, step: number): Promise<void>;
  updateStatus(id: string, status: string, step?: number): Promise<void>;
}
