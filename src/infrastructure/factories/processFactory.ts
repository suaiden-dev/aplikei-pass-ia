import { IUserProcessRepository } from "@/application/ports/IUserProcessRepository";
import { SupabaseUserProcessRepository } from "@/infrastructure/repositories/SupabaseUserProcessRepository";

let instance: IUserProcessRepository | null = null;

export function getUserProcessRepository(): IUserProcessRepository {
  if (!instance) instance = new SupabaseUserProcessRepository();
  return instance;
}
