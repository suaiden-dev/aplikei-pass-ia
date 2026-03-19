import { IAuthService } from "@/application/ports/IAuthService";
import { SupabaseAuthService } from "@/infrastructure/services/SupabaseAuthService";

let instance: IAuthService | null = null;

export function getAuthService(): IAuthService {
  if (!instance) instance = new SupabaseAuthService();
  return instance;
}
