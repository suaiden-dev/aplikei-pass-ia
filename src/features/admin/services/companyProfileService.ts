import { supabase } from "@shared/lib/supabase";

const PROFILE_BUCKET = "profiles";

export interface OfficeData {
  id?: string;
  slug?: string | null;
  name: string;
  cnpj: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  facebook_url: string | null;
  logo_url?: string | null;
  landing_page_config?: Record<string, unknown> | null;
}

export async function findOfficeByOwner(ownerId: string): Promise<OfficeData | null> {
  const { data, error } = await supabase
    .from("offices")
    .select("id, slug, name, cnpj, address, phone, email, website, instagram_url, linkedin_url, facebook_url, logo_url, landing_page_config")
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) throw Error(error.message);
  return (data as OfficeData | null) ?? null;
}

export async function officeSlugExists(slug: string, currentOfficeId?: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("offices")
    .select("id")
    .eq("slug", slug)
    .limit(1);

  if (error) throw Error(error.message);
  return (data ?? []).some((row) => row.id !== currentOfficeId);
}

export async function uploadOfficeLogo(path: string, file: File): Promise<string> {
  const { error } = await supabase.storage
    .from(PROFILE_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: true });

  if (error) throw Error(error.message);
  return supabase.storage.from(PROFILE_BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function updateOfficeLogo(
  officeId: string,
  logoUrl: string,
  landingPageConfig: Record<string, unknown> | null | undefined,
): Promise<void> {
  const { error } = await supabase
    .from("offices")
    .update({
      logo_url: logoUrl,
      landing_page_config: {
        ...(landingPageConfig || {}),
        logoUrl,
      },
    })
    .eq("id", officeId);

  if (error) throw Error(error.message);
}

export async function saveOfficeProfile(params: {
  office: OfficeData;
  ownerId: string;
  slug: string;
}): Promise<{ officeId: string; slug: string | null; created: boolean }> {
  const payload = {
    name: params.office.name,
    cnpj: params.office.cnpj,
    address: params.office.address,
    phone: params.office.phone,
    email: params.office.email,
    website: params.office.website,
    instagram_url: params.office.instagram_url,
    linkedin_url: params.office.linkedin_url,
    facebook_url: params.office.facebook_url,
    landing_page_config: params.office.landing_page_config,
  };

  if (params.office.id) {
    const { error } = await supabase
      .from("offices")
      .update({ ...payload, slug: params.slug })
      .eq("id", params.office.id);

    if (error) throw Error(error.message);
    return { officeId: params.office.id, slug: params.slug, created: false };
  }

  const { data: created, error } = await supabase
    .from("offices")
    .insert({
      ...payload,
      slug: params.slug,
      owner_id: params.ownerId,
    })
    .select("id, slug")
    .single();

  if (error) throw Error(error.message);

  const { error: userOfficeError } = await supabase
    .from("user_accounts")
    .update({ office_id: created.id })
    .eq("id", params.ownerId);

  if (userOfficeError) throw Error(userOfficeError.message);

  const { error: disableProductsError } = await supabase
    .from("user_service_prices")
    .update({ is_active: false })
    .eq("office_id", created.id);

  if (disableProductsError) throw Error(disableProductsError.message);

  return { officeId: created.id, slug: created.slug ?? null, created: true };
}
