import { supabase } from "../lib/supabase";

export const storageService = {
  async uploadProfilePhoto(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    // Path must start with userId/ to match Storage RLS policy.
    // Use unique filename to avoid stale CDN/browser cache on repeated uploads.
    const filePath = `${userId}/avatar_${Date.now()}.${fileExt}`;

    const { data: existingFiles } = await supabase.storage
      .from("profiles")
      .list(userId, { limit: 100 });

    if (existingFiles?.length) {
      const oldPaths = existingFiles.map((entry) => `${userId}/${entry.name}`);
      await supabase.storage.from("profiles").remove(oldPaths);
    }

    // Upload to 'profiles' bucket
    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(filePath, file, {
        upsert: false,
        contentType: file.type
      });

    if (uploadError) throw new Error(uploadError.message);

    // Get Public URL
    const { data } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
};
