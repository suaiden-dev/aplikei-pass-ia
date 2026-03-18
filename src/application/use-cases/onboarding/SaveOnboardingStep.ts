import { IOnboardingRepository } from "@/application/ports/IOnboardingRepository";
import { IUserProcessRepository } from "@/application/ports/IUserProcessRepository";
import { OnboardingData } from "@/pages/dashboard/onboarding/types";

export class SaveOnboardingStep {
  constructor(
    private onboardingRepo: IOnboardingRepository,
    private processRepo: IUserProcessRepository
  ) {}

  async execute(
    userServiceId: string,
    stepSlug: string,
    stepIndex: number,
    data: Partial<OnboardingData>
  ): Promise<void> {
    // Only save if there's data and it's not a special step (documents/review are handled separately usually, but we check slug)
    if (stepSlug !== "documents" && stepSlug !== "review") {
      await this.onboardingRepo.saveResponses(userServiceId, stepSlug, data);
    }

    // Update current step in the service
    await this.processRepo.updateStep(userServiceId, stepIndex + 1);
  }
}
