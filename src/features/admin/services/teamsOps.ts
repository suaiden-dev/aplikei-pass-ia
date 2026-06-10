import { supabase } from "@shared/lib/supabase";

export type TeamRole = "seller" | "manager";

export interface TeamMember {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  is_active: boolean | null;
  created_at: string;
}

export interface InviteLink {
  id: string;
  token: string;
  role: TeamRole;
  used_at: string | null;
  expires_at: string;
  created_at: string;
}

export async function fetchTeamMembers(officeId: string): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from("user_accounts")
    .select("id, full_name, email, role, is_active, created_at")
    .eq("office_id", officeId)
    .in("role", ["seller", "manager", "admin"])
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as TeamMember[];
}

export async function fetchPendingRequests(officeId: string): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from("user_accounts")
    .select("id, full_name, email, role, is_active, created_at")
    .eq("office_id", officeId)
    .in("role", ["seller", "manager", "admin"])
    .or("is_active.eq.false,is_active.is.null")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as TeamMember[];
}

export async function createInviteLink(officeId: string, role: TeamRole, createdBy: string): Promise<InviteLink> {
  const { data, error } = await supabase
    .from("team_invite_links")
    .insert({ office_id: officeId, role, created_by: createdBy })
    .select("id, token, role, used_at, expires_at, created_at")
    .single();

  if (error) throw error;
  return data as InviteLink;
}

export async function fetchInviteLinks(officeId: string): Promise<InviteLink[]> {
  try {
    const { data, error } = await supabase
      .from("team_invite_links")
      .select("id, token, role, used_at, expires_at, created_at")
      .eq("office_id", officeId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      // Handle missing table: 404 status or specific error codes
      if (
        (error as { status?: number }).status === 404 ||
        error.code === "PGRST116" ||
        error.code === "PGRST205" ||
        error.code === "42P01"
      ) {
        return [];
      }
      throw error;
    }
    return (data ?? []) as InviteLink[];
  } catch (err) {
    console.warn("Invite links table not found or inaccessible:", err);
    return [];
  }
}

export async function activateTeamMember(userId: string): Promise<void> {
  const { error } = await supabase
    .from("user_accounts")
    .update({ is_active: true })
    .eq("id", userId);

  if (error) throw error;
}

export async function rejectTeamMember(userId: string): Promise<void> {
  const { error } = await supabase
    .from("user_accounts")
    .delete()
    .eq("id", userId);

  if (error) throw error;
}

export async function updateTeamMemberRole(userId: string, role: TeamRole): Promise<void> {
  const { error } = await supabase
    .from("user_accounts")
    .update({ role })
    .eq("id", userId);

  if (error) throw error;
}

export interface InviteInfo {
  valid: boolean;
  error?: string;
  role?: TeamRole;
  office_id?: string;
  office_name?: string;
}

export async function getInviteInfo(token: string): Promise<InviteInfo> {
  const { data, error } = await supabase.rpc("get_invite_info", { p_token: token });
  if (error) throw error;
  return data as InviteInfo;
}

export async function redeemInvite(token: string, userId: string): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.rpc("redeem_invite", { p_token: token, p_user_id: userId });
  if (error) throw error;
  return data as { success: boolean; error?: string };
}
