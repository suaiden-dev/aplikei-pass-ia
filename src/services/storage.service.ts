import { supabase } from "../lib/supabase";

export const storageService = {
  async uploadProfilePhoto(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    // Path must start with userId/ to match Storage RLS policy
    const filePath = `${userId}/avatar.${fileExt}`;

    // Upload to 'profiles' bucket
    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(filePath, file, {
        upsert: true,
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
