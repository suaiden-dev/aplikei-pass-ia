import { OnboardingData } from "@/pages/dashboard/onboarding/types";

export interface IOnboardingRepository {
  saveResponses(userServiceId: string, stepSlug: string, data: Partial<OnboardingData>): Promise<void>;
  getAllResponses(userServiceId: string): Promise<Partial<OnboardingData>>;
}
