import { supabase } from "@/integrations/supabase/client";
import { IOnboardingRepository } from "@/application/ports/IOnboardingRepository";
import { OnboardingData } from "@/pages/dashboard/onboarding/types";
import { Json } from "@/integrations/supabase/types";

export class SupabaseOnboardingRepository implements IOnboardingRepository {
  async saveResponses(userServiceId: string, stepSlug: string, data: Partial<OnboardingData>): Promise<void> {
    const { error } = await supabase
      .from("onboarding_responses")
      .upsert({
        user_service_id: userServiceId,
        step_slug: stepSlug,
        data: data as unknown as Json,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_service_id,step_slug" });

    if (error) throw error;
  }

  async getAllResponses(userServiceId: string): Promise<Partial<OnboardingData>> {
    const { data, error } = await supabase
      .from("onboarding_responses")
      .select("data")
      .eq("user_service_id", userServiceId);

    if (error) throw error;

    const responses = (data || []) as unknown as { data: Partial<OnboardingData> }[];
    
    return responses.reduce((acc: Partial<OnboardingData>, curr) => ({
      ...acc,
      ...curr.data
    }), {});
  }
}
