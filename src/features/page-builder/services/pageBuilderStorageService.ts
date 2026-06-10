import { supabase } from "@shared/lib/supabase";

export async function uploadPageBuilderAsset(params: {
  file: File;
  userId: string;
  folder: "landing-logos" | "landing-favicons";
}): Promise<string> {
  const ext = params.file.name.split(".").pop() ?? "png";
  const baseName = params.file.name.replace(/\.[^/.]+$/, "");
  const safeBaseName = baseName.replace(/\s+/g, "-").toLowerCase();
  const path = `${params.folder}/${params.userId}/${Date.now()}-${safeBaseName}.${ext}`;

  const { error } = await supabase.storage
    .from("profiles")
    .upload(path, params.file, { contentType: params.file.type, upsert: true });

  if (error) throw Error(error.message);
  return supabase.storage.from("profiles").getPublicUrl(path).data.publicUrl;
}
