import { getSupabaseClient } from "@shared/lib/supabase/client";

const BUCKET = "aplikei-profiles";

export async function uploadCaseDocument(path: string, file: File): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw Error("Supabase client unavailable");

  const { error } = await supabase.storage.from(BUCKET).upload(path, file);
  if (error) throw Error(error.message);
}

export function getCaseDocumentUrl(path: string): string {
  const supabase = getSupabaseClient();
  if (!supabase) return path;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function fetchCaseWorkflowReview(caseId: string): Promise<{
  steps: any[];
  reviews: any[];
} | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data: stepsData, error: stepsError } = await supabase
    .schema("aplikei")
    .from("user_steps")
    .select("*, product_step:product_steps(*)")
    .eq("user_product_id", caseId)
    .order("product_step(order)", { ascending: true });

  if (stepsError || !stepsData || stepsData.length < 3) {
    return null;
  }

  const orderedStepsData = [...stepsData].sort(
    (a, b) =>
      ((a as { product_step?: { order?: number | null } }).product_step?.order ?? Number.MAX_SAFE_INTEGER) -
      ((b as { product_step?: { order?: number | null } }).product_step?.order ?? Number.MAX_SAFE_INTEGER),
  );

  const firstTwoIds = (orderedStepsData as { id: string }[]).slice(0, 2).map((step) => step.id);
  const { data: reviewsData } = await supabase
    .schema("aplikei")
    .from("step_reviews")
    .select("*")
    .in("user_step_id", firstTwoIds)
    .order("created_at", { ascending: false });

  return {
    steps: orderedStepsData,
    reviews: reviewsData ?? [],
  };
}
