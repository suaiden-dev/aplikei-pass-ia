import { supabase } from "@/integrations/supabase/client";
import { IProfileRepository } from "@/application/ports/IProfileRepository";
import { UserProfile } from "@/domain/user/UserEntities";

interface RawProfile {
  id: string;
  full_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  email?: string | null;
}

export class SupabaseProfileRepository implements IProfileRepository {
  async findById(id: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, phone, avatar_url, email")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;

    const profile = data as RawProfile;
    return {
      id: profile.id,
      fullName: profile.full_name || undefined,
      phone: profile.phone || undefined,
      avatarUrl: profile.avatar_url || undefined,
      email: profile.email || undefined
    };
  }

  async save(profile: UserProfile): Promise<void> {
    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: profile.id,
        full_name: profile.fullName,
        phone: profile.phone,
        avatar_url: profile.avatarUrl,
        email: profile.email,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  }
}
