import { supabase } from "@/integrations/supabase/client";
import { IStorageService } from "@/application/ports/IStorageService";

export class SupabaseStorageService implements IStorageService {
  async uploadFile(bucket: string, path: string, file: File): Promise<{ path: string; error: string | null }> {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file);
    return {
      path: data?.path || "",
      error: error ? error.message : null
    };
  }

  getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data?.publicUrl || "";
  }

  async createSignedUrl(bucket: string, path: string, expiresIn: number): Promise<string | null> {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
    if (error) throw error;
    return data?.signedUrl || null;
  }
}
