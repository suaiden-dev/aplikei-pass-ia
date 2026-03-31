import { supabase } from "@/integrations/supabase/client";
import { IUserProcessRepository } from "@/application/ports/IUserProcessRepository";
import { UserProcess } from "@/domain/user/UserEntities";

interface RawUserProcess {
  id: string;
  user_id: string;
  service_slug: string;
  status: string;
  current_step?: number | null;
  created_at: string;
  application_id?: string | null;
  date_of_birth?: string | null;
  grandmother_name?: string | null;
  is_second_attempt?: boolean | null;
  consular_login?: string | null;
  service_metadata?: any;
}

export class SupabaseUserProcessRepository implements IUserProcessRepository {
  async findByUserId(userId: string): Promise<UserProcess[]> {
    const { data, error } = await supabase
      .from("user_services")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data as any[] || []).map((raw) => this.mapToDomain(raw as RawUserProcess));
  }

  async findById(id: string): Promise<UserProcess | null> {
    const { data, error } = await supabase
      .from("user_services")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;
    return this.mapToDomain(data as RawUserProcess);
  }

  async create(userId: string, serviceSlug: string, status: string): Promise<UserProcess> {
    const { data, error } = await supabase
      .from("user_services")
      .insert({ user_id: userId, service_slug: serviceSlug, status })
      .select()
      .single();

    if (error || !data) throw error || new Error("Failed to create user service");
    return this.mapToDomain(data as RawUserProcess);
  }

  async updateStep(id: string, step: number): Promise<void> {
    const { error } = await supabase
      .from("user_services")
      .update({ current_step: step })
      .eq("id", id);

    if (error) throw error;
  }

  async updateStatus(id: string, status: string, step?: number): Promise<void> {
    const updateData: { status: string; current_step?: number } = { status };
    if (step !== undefined) updateData.current_step = step;

    const { error } = await supabase
      .from("user_services")
      .update(updateData)
      .eq("id", id);

    if (error) throw error;
  }

  async updateServiceStatus(
    id: string,
    legacyStatus: string,
    metadata?: Record<string, unknown>,
    step?: number,
  ): Promise<void> {
    const updateData: {
      status: string;
      service_metadata?: Record<string, unknown>;
      current_step?: number;
    } = { status: legacyStatus };

    if (metadata && Object.keys(metadata).length > 0) {
      updateData.service_metadata = metadata;
    }
    if (step !== undefined) {
      updateData.current_step = step;
    }

    const { error } = await supabase
      .from("user_services")
      .update(updateData)
      .eq("id", id);

    if (error) throw error;
  }

  async updateData(id: string, data: Record<string, any>): Promise<void> {
    // 1. Fetch current metadata to avoid overwriting everything
    const { data: current, error: fetchError } = await supabase
      .from("user_services")
      .select("service_metadata")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) throw fetchError;

    // 2. Merge and update
    const mergedMetadata = { ...((current as any)?.service_metadata || {}), ...data };
    
    const updateObj = {
      service_metadata: mergedMetadata
    };

    const { error } = await supabase
      .from("user_services")
      .update(updateObj as any)
      .eq("id", id);

    if (error) throw error;
  }

  async getRecoveryCase(userServiceId: string): Promise<any | null> {
    const { data, error } = await supabase
      .from("cos_recovery_cases")
      .select("*")
      .eq("user_service_id", userServiceId)
      .maybeSingle();
 
    if (error) throw error;
    return data;
  }
 
  async saveRecoveryCase(userServiceId: string, data: any): Promise<void> {
    const { error } = await supabase
      .from("cos_recovery_cases")
      .upsert({ user_service_id: userServiceId, ...data }, { onConflict: "user_service_id" });
 
    if (error) throw error;
  }

  private mapToDomain(raw: RawUserProcess): UserProcess {
    return {
      id: raw.id,
      userId: raw.user_id,
      serviceSlug: raw.service_slug,
      status: raw.status,
      currentStep: raw.current_step || undefined,
      createdAt: raw.created_at,
      applicationId: raw.application_id || undefined,
      dateOfBirth: raw.date_of_birth || undefined,
      grandmotherName: raw.grandmother_name || undefined,
      isSecondAttempt: raw.is_second_attempt || undefined,
      consularLogin: raw.consular_login || undefined,
      data: raw.service_metadata || undefined
    };
  }
}
