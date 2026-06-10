import { supabase } from "@shared/lib/supabase";

const ONBOARDING_BUCKET = "aplikei-profiles";

export async function uploadOnboardingDocument(
  filePath: string,
  file: File,
  options?: { upsert?: boolean; contentType?: string },
): Promise<void> {
  const { error } = await supabase.storage
    .from(ONBOARDING_BUCKET)
    .upload(filePath, file, options);

  if (error) throw Error(error.message);
}

export function getOnboardingDocumentUrl(filePath: string): string {
  return supabase.storage.from(ONBOARDING_BUCKET).getPublicUrl(filePath).data.publicUrl;
}
