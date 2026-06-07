import { createLogger } from "../../core/logger.ts";
import { supabaseAdmin } from "../../core/supabase.ts";
import { generateAcceptancePdf } from "./pdf.ts";
import { sendTermsAcceptanceEmail } from "./email.ts";

const log = createLogger("accept-terms");

export interface AcceptTermsInput {
  userId: string;
  role: "lawyer" | "customer";
  name: string;
  email: string;
}

export async function handleAcceptTerms(req: Request, input: AcceptTermsInput) {
  const db = supabaseAdmin;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? req.headers.get("cf-connecting-ip")
    ?? "unknown";
  const userAgent = req.headers.get("user-agent") ?? "unknown";
  const acceptedAt = new Date().toISOString();
  const docId = crypto.randomUUID();

  const categories = [`${input.role}_terms`, `${input.role}_privacy`];
  const { data: terms, error: termsErr } = await db
    .from("legal_terms")
    .select("title, content, category, version")
    .eq("is_active", true)
    .in("category", categories)
    .order("created_at", { ascending: true });

  if (termsErr) throw new Error(`Failed to fetch terms: ${termsErr.message}`);

  const pdfBytes = await generateAcceptancePdf({
    docId,
    name: input.name,
    email: input.email,
    role: input.role,
    acceptedAt,
    ip,
    userAgent,
    terms: terms ?? [],
  });

  const storagePath = `terms-acceptance/${input.userId}/${docId}.pdf`;
  const { error: uploadErr } = await db.storage
    .from("aplikei-profiles")
    .upload(storagePath, pdfBytes, { contentType: "application/pdf", upsert: true });

  if (uploadErr) throw new Error(`Storage upload failed: ${uploadErr.message}`);

  const { data: { publicUrl } } = db.storage
    .from("aplikei-profiles")
    .getPublicUrl(storagePath);

  await db
    .from("user_accounts")
    .update({
      terms_pdf_url: publicUrl,
      terms_accepted_at: acceptedAt,
      terms_accepted_ip: ip,
      terms_accepted_ua: userAgent.slice(0, 255),
    })
    .eq("id", input.userId);

  await sendTermsAcceptanceEmail({
    to: input.email,
    name: input.name,
    role: input.role,
    acceptedAt,
    ip,
    pdfBytes,
    docId,
  });

  log.info("terms acceptance recorded", { userId: input.userId, role: input.role, docId });

  return { success: true, pdfUrl: publicUrl, docId };
}
