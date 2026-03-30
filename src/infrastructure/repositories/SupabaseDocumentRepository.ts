import { supabase } from "@/integrations/supabase/client";
import { IDocumentRepository } from "@/application/ports/IDocumentRepository";
import { UploadedDocument } from "@/pages/dashboard/onboarding/types";

export class SupabaseDocumentRepository implements IDocumentRepository {
  async countByProcessId(processId: string): Promise<number> {
    const { count, error } = await supabase
      .from("documents")
      .select("*", { count: "exact", head: true })
      .eq("user_service_id", processId);

    if (error) throw error;
    return count || 0;
  }

  async findByServiceId(serviceId: string, userId: string): Promise<UploadedDocument[]> {
    const { data, error } = await supabase
      .from("documents")
      .select("name, storage_path, bucket_id, status, feedback")
      .eq("user_id", userId)
      .eq("user_service_id", serviceId);

    if (error) throw error;

    return (data || []).map(d => ({
      name: d.name,
      path: d.storage_path,
      bucket_id: d.bucket_id,
      status: d.status,
      feedback: d.feedback
    }));
  }

  async save(userId: string, serviceId: string, doc: UploadedDocument): Promise<void> {
    const { error } = await supabase
      .from("documents")
      .upsert({
        user_id: userId,
        user_service_id: serviceId,
        name: doc.name,
        storage_path: doc.path,
        bucket_id: doc.bucket_id,
        status: "pending",
        created_at: new Date().toISOString()
      }, { onConflict: "user_id,name" });

    if (error) throw error;
  }

  async delete(serviceId: string, docName: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from("documents")
      .delete()
      .match({ name: docName, user_service_id: serviceId, user_id: userId });

    if (error) throw error;
  }
}
