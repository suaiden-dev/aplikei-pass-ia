import { supabase } from "../../../../shared/lib/supabase";

export interface OfficeRow {
  id: string;
  name: string;
  slug: string;
  landing_page_config?: Record<string, unknown> | null;
  address: string | null;
  phone: string | null;
  cnpj?: string | null;
  email?: string | null;
  website?: string | null;
  instagram_url?: string | null;
  linkedin_url?: string | null;
  facebook_url?: string | null;
  owner_id: string;
  owner_name?: string | null;
  owner_email?: string | null;
}

export interface UpsertOfficePayload {
  name: string;
  slug?: string | null;
  address?: string | null;
  phone?: string | null;
  cnpj?: string | null;
  email?: string | null;
  website?: string | null;
  instagram_url?: string | null;
  linkedin_url?: string | null;
  facebook_url?: string | null;
  owner_id: string;
}

export function normalizeOfficeName(name: string) {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

export function generateSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function fetchOfficeByOwner(ownerId: string): Promise<OfficeRow | null> {
  const { data, error } = await supabase
    .from("offices")
    .select("id, name, slug, landing_page_config, address, phone, cnpj, email, website, instagram_url, linkedin_url, facebook_url, owner_id")
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) throw Error(error.message);
  return data as OfficeRow | null;
}

export async function listOffices(): Promise<OfficeRow[]> {
  const { data, error } = await supabase
    .from("offices")
    .select("id, name, slug, landing_page_config, address, phone, cnpj, email, website, instagram_url, linkedin_url, facebook_url, owner_id, user_accounts:owner_id(full_name, name, email)")
    .order("name", { ascending: true });

  if (error) throw Error(error.message);
  const rows = (data as Array<{
    id: string;
    name: string;
    address: string | null;
    phone: string | null;
    cnpj: string | null;
    email: string | null;
    website: string | null;
    instagram_url: string | null;
    linkedin_url: string | null;
    facebook_url: string | null;
    owner_id: string;
    user_accounts?: { full_name?: string | null; name?: string | null; email?: string | null } | null;
  }> | null) || [];

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: (row as any).slug,
    address: row.address,
    phone: row.phone,
    cnpj: row.cnpj,
    email: row.email,
    website: row.website,
    instagram_url: row.instagram_url,
    linkedin_url: row.linkedin_url,
    facebook_url: row.facebook_url,
    owner_id: row.owner_id,
    owner_name: row.user_accounts?.full_name || row.user_accounts?.name || null,
    owner_email: row.user_accounts?.email || null,
  }));
}

export async function findOfficeByName(name: string): Promise<OfficeRow | null> {
  const normalizedName = normalizeOfficeName(name);
  if (!normalizedName) return null;

  const { data, error } = await supabase
    .from("offices")
    .select("id, name, slug, landing_page_config, address, phone, cnpj, email, website, instagram_url, linkedin_url, facebook_url, owner_id")
    .ilike("name", normalizedName)
    .maybeSingle();

  if (error) throw Error(error.message);
  return data as OfficeRow | null;
}

export async function upsertOffice(payload: UpsertOfficePayload): Promise<OfficeRow> {
  const trimmedName = payload.name.trim().replace(/\s+/g, " ");
  const slug = payload.slug || generateSlug(trimmedName);
  const existingOffice = await findOfficeByName(trimmedName);

  if (existingOffice && existingOffice.owner_id !== payload.owner_id) {
    const err = new Error("OFFICE_NAME_ALREADY_EXISTS");
    err.name = "OFFICE_NAME_ALREADY_EXISTS";
    throw err;
  }

  const { data, error } = await supabase
    .from("offices")
    .upsert({ ...payload, name: trimmedName, slug }, { onConflict: "owner_id" })
    .select("id, name, slug, landing_page_config, address, phone, cnpj, email, website, instagram_url, linkedin_url, facebook_url, owner_id")
    .single();

  if (error) throw Error(error.message);
  return data as OfficeRow;
}

export async function fetchOfficeForUser(userId: string): Promise<OfficeRow | null> {
  const { data, error } = await supabase
    .from("user_accounts")
    .select("office_id, offices!office_id(id, name, slug, landing_page_config, address, phone, cnpj, email, website, instagram_url, linkedin_url, facebook_url, owner_id)")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw Error(error.message);
  if (!data?.offices) return null;
  return data.offices as unknown as OfficeRow;
}

export async function setUserOffice(userId: string, officeId: string | null): Promise<void> {
  const { error } = await supabase
    .from("user_accounts")
    .update({ office_id: officeId })
    .eq("id", userId);
  if (error) throw Error(error.message);
}

export async function unassignOfficeOwner(officeId: string, userId: string): Promise<void> {
  await Promise.all([
    supabase.from("offices").update({ owner_id: null }).eq("id", officeId),
    supabase.from("user_accounts").update({ office_id: null }).eq("id", userId),
  ]);
}

export async function assignOfficeOwner(params: {
  officeId: string;
  ownerId: string;
  forceReplace: boolean;
}): Promise<OfficeRow> {
  const { data: office, error: fetchError } = await supabase
    .from("offices")
    .select("id, name, slug, landing_page_config, address, phone, cnpj, email, website, instagram_url, linkedin_url, facebook_url, owner_id")
    .eq("id", params.officeId)
    .single();

  if (fetchError) throw Error(fetchError.message);
  const current = office as OfficeRow;

  if (current.owner_id && current.owner_id !== params.ownerId && !params.forceReplace) {
    const err = new Error("OFFICE_ALREADY_ASSIGNED");
    err.name = "OFFICE_ALREADY_ASSIGNED";
    throw err;
  }

  const { data, error } = await supabase
    .from("offices")
    .update({ owner_id: params.ownerId })
    .eq("id", params.officeId)
    .select("id, name, slug, landing_page_config, address, phone, cnpj, email, website, instagram_url, linkedin_url, facebook_url, owner_id")
    .single();

  if (error) throw Error(error.message);
  return data as OfficeRow;
}

export async function saveOfficeLandingConfig(ownerId: string, config: Record<string, unknown>): Promise<void> {
  const { error } = await supabase
    .from("offices")
    .update({ landing_page_config: config })
    .eq("owner_id", ownerId);

  if (error) throw Error(error.message);
}
