import { IOnboardingRepository } from "@/application/ports/IOnboardingRepository";
import { IProfileRepository } from "@/application/ports/IProfileRepository";
import { SupabaseOnboardingRepository } from "@/infrastructure/repositories/SupabaseOnboardingRepository";
import { SupabaseProfileRepository } from "@/infrastructure/repositories/SupabaseProfileRepository";

let onboardingInstance: IOnboardingRepository | null = null;
let profileInstance: IProfileRepository | null = null;

export function getOnboardingRepository(): IOnboardingRepository {
  if (!onboardingInstance) onboardingInstance = new SupabaseOnboardingRepository();
  return onboardingInstance;
}

export function getProfileRepository(): IProfileRepository {
  if (!profileInstance) profileInstance = new SupabaseProfileRepository();
  return profileInstance;
}
