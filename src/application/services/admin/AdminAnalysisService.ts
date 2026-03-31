import { supabase } from "@/integrations/supabase/client";

export interface RecoveryCase {
  id: string;
  user_service_id: string;
  user_id: string;
  explanation: string | null;
  document_urls: string[];
  submitted_at: string;
  admin_analysis: string | null;
  proposal_value_usd: number | null;
  proposal_sent_at: string | null;
  admin_notes: string | null;
  status: string;
  admin_final_message?: string | null;
  final_document_urls?: string[] | null;
}

export class AdminAnalysisService {
  static async fetchCase(userServiceId: string): Promise<{ recoveryCase: RecoveryCase | null, userService: any }> {
    // 1. Fetch recovery case details
    const { data: rc, error: rcError } = await (supabase as any)
      .from("cos_recovery_cases")
      .select("*")
      .eq("user_service_id", userServiceId)
      .maybeSingle();

    if (rcError) throw rcError;

    // 2. Fetch user_service details
    const { data: us, error: usError } = await (supabase as any)
      .from("user_services")
      .select("status, data, service_slug")
      .eq("id", userServiceId)
      .single();

    if (usError) throw usError;

    return {
      recoveryCase: rc as RecoveryCase,
      userService: us
    };
  }

  static async saveAnalysis(
    caseId: string | undefined, 
    userServiceId: string, 
    userId: string | undefined,
    data: Partial<RecoveryCase>
  ) {
    if (!caseId) {
      // Create new case if it doesn't exist
      const { data: newCase, error } = await (supabase as any)
        .from("cos_recovery_cases")
        .insert({
          user_service_id: userServiceId,
          user_id: userId,
          ...data
        })
        .select()
        .single();
      if (error) throw error;
      return newCase;
    } else {
      // Update existing case
      const { data: updatedCase, error } = await (supabase as any)
        .from("cos_recovery_cases")
        .update(data)
        .eq("id", caseId)
        .select()
        .single();
      if (error) throw error;
      return updatedCase;
    }
  }

  static async updateUserServiceStatus(userServiceId: string, status: string) {
    const { error } = await (supabase as any)
      .from("user_services")
      .update({ status })
      .eq("id", userServiceId);
    
    if (error) throw error;
  }

  static async sendProposal(caseId: string, value: number) {
    const { error } = await (supabase as any)
      .from("cos_recovery_cases")
      .update({
        proposal_value_usd: value,
        proposal_sent_at: new Date().toISOString(),
        status: "proposal_sent"
      })
      .eq("id", caseId);

    if (error) throw error;
  }

  static async completeRecovery(
    caseId: string,
    userServiceId: string,
    finalMessage: string,
    documentUrls: string[],
    statusPrefix: string
  ) {
    // 1. Update recovery case status
    const { error: rcError } = await (supabase as any)
      .from("cos_recovery_cases")
      .update({
        status: "completed",
        admin_final_message: finalMessage,
        final_document_urls: documentUrls,
        updated_at: new Date().toISOString()
      })
      .eq("id", caseId);

    if (rcError) throw rcError;

    // 2. Update user_service status
    const { error: usError } = await (supabase as any)
      .from("user_services")
      .update({ status: `${statusPrefix}PACKAGE_READY` })
      .eq("id", userServiceId);

    if (usError) throw usError;
  }

  static async uploadFile(caseId: string, file: File): Promise<string> {
    const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `recovery_fulfillment/${caseId}/${Date.now()}_${safeFilename}`;
    
    const { error: uploadError } = await (supabase as any).storage
      .from('process-documents')
      .upload(filePath, file);
      
    if (uploadError) throw uploadError;
    
    const { data: signedData, error: signError } = await (supabase as any).storage
      .from('process-documents')
      .createSignedUrl(filePath, 31536000); // 1 year expiry
      
    if (signError) throw signError;
    return signedData.signedUrl;
  }
}
