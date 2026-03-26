import { supabase } from "@/integrations/supabase/client";
import { COSProductFlow } from "../flows/strategies/COSProductFlow";

/**
 * Service to handle Cover Letter generation and refinement for COS products.
 * Integrates with n8n webhooks for AI-powered content generation.
 */
export class CoverLetterService {
  private static readonly N8N_WEBHOOK_URL = "https://your-n8n-instance.com/webhook/generate-cover-letter";

  /**
   * Triggers the n8n webhook to generate a Cover Letter PDF from questionnaire responses.
   */
  static async triggerGeneration(userServiceId: string, responses: Record<string, any>) {
    try {
      // 1. Update status to generating
      const { error: statusError } = await supabase
        .from("user_services")
        .update({ status: COSProductFlow.STATUSS.COS_COVER_LETTER_WEBHOOK })
        .eq("id", userServiceId);

      if (statusError) throw statusError;

      // 2. Fetch user/profile data for the webhook context
      const { data: service } = await supabase
        .from("user_services")
        .select("user_id, product_slug, profiles(full_name, email)")
        .eq("id", userServiceId)
        .single();

      // 3. Call n8n Webhook
      const payload = {
        userServiceId,
        userData: service?.profiles,
        product: service?.product_slug,
        responses,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(this.N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to trigger n8n webhook");

      const result = await response.json();

      // 4. Process the returned PDF/HTML (Example assumes n8n returns a storage path or signed URL)
      // Note: In a real scenario, n8n might call a Supabase Edge Function back 
      // or return the data directly if synchronous.
      
      return result;
    } catch (error) {
      console.error("Error in CoverLetterService.triggerGeneration:", error);
      throw error;
    }
  }

  /**
   * Updates the Cover Letter content after Admin manual review.
   */
  static async updateContent(userServiceId: string, htmlContent: string) {
    const { error } = await supabase
      .from("user_services")
      .update({ 
        service_metadata: { 
          cover_letter_html: htmlContent,
          last_edited_at: new Date().toISOString()
        } 
      })
      .eq("id", userServiceId);

    if (error) throw error;
  }
}

/**
 * EXAMPLE: Edge Function or Webhook Listener to process n8n return
 * 
 * n8n would call this after generating the PDF:
 * 
 * POST /functions/v1/process-cover-letter
 * Body: { userServiceId: "...", pdfUrl: "...", status: "success" }
 */
export const processN8nReturn = async (payload: { userServiceId: string, pdfUrl: string }) => {
  // 1. Update document record
  const { error: docError } = await supabase.from("documents").insert({
    user_service_id: payload.userServiceId,
    name: "cover_letter_official",
    storage_path: payload.pdfUrl,
    status: "approved", // Wait for final admin review if needed
  });

  // 2. Move to Admin Review state
  await supabase
    .from("user_services")
    .update({ status: COSProductFlow.STATUSS.COS_COVER_LETTER_ADMIN_REVIEW })
    .eq("id", payload.userServiceId);
};
