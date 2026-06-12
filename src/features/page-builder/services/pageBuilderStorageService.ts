import { supabase } from "@shared/lib/supabase";

const MAX_PAGE_BUILDER_ASSET_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

function validatePageBuilderAsset(file: File) {
  if (file.size > MAX_PAGE_BUILDER_ASSET_SIZE) {
    throw new Error("PAGE_BUILDER_ASSET_TOO_LARGE");
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const expectedExt = ALLOWED_IMAGE_TYPES.get(file.type);
  const normalizedExt = ext === "jpeg" ? "jpg" : ext;

  if (!expectedExt || normalizedExt !== expectedExt) {
    throw new Error("PAGE_BUILDER_ASSET_INVALID_TYPE");
  }

  return expectedExt;
}

export async function uploadPageBuilderAsset(params: {
  file: File;
  userId: string;
  folder: "landing-logos" | "landing-favicons" | "landing-testimonials";
}): Promise<string> {
  const ext = validatePageBuilderAsset(params.file);
  const baseName = params.file.name.replace(/\.[^/.]+$/, "");
  const safeBaseName = baseName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase() || "asset";
  const path = `${params.folder}/${params.userId}/${Date.now()}-${safeBaseName}.${ext}`;

  const { error } = await supabase.storage
    .from("profiles")
    .upload(path, params.file, { contentType: params.file.type, upsert: false });

  if (error) throw Error(error.message);
  return supabase.storage.from("profiles").getPublicUrl(path).data.publicUrl;
}
