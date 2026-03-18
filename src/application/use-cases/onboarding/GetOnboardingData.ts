import { IOnboardingRepository } from "@/application/ports/IOnboardingRepository";
import { IProfileRepository } from "@/application/ports/IProfileRepository";
import { IUserProcessRepository } from "@/application/ports/IUserProcessRepository";
import { OnboardingData } from "@/pages/dashboard/onboarding/types";

export class GetOnboardingData {
  constructor(
    private onboardingRepo: IOnboardingRepository,
    private profileRepo: IProfileRepository,
    private processRepo: IUserProcessRepository
  ) {}

  async execute(userId: string, userServiceId: string): Promise<{
    formData: Partial<OnboardingData>;
    service: Record<string, unknown> | null;
  }> {
    const [profile, service, responses] = await Promise.all([
      this.profileRepo.findById(userId),
      this.processRepo.findById(userServiceId),
      this.onboardingRepo.getAllResponses(userServiceId)
    ]);

    const combinedData: Partial<OnboardingData> = { ...responses };

    if (profile) {
      if (!combinedData.email && profile.email) {
        combinedData.email = profile.email;
      }
      if (profile.fullName && (!combinedData.firstName || !combinedData.lastName)) {
        const nameParts = profile.fullName.trim().split(" ");
        if (nameParts.length > 1) {
          if (!combinedData.firstName) combinedData.firstName = nameParts.slice(0, -1).join(" ");
          if (!combinedData.lastName) combinedData.lastName = nameParts[nameParts.length - 1];
        } else if (nameParts.length === 1 && !combinedData.firstName) {
          combinedData.firstName = nameParts[0];
        }
      }
    }

    return {
      formData: combinedData,
      service: service as unknown as Record<string, unknown> | null
    };
  }
}
