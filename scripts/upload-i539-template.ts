/**
 * Run once locally to upload the decrypted I-539 template to Supabase Storage.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_KEY=... npx ts-node --esm scripts/upload-i539-template.ts
 *
 * After running, the template will be at:
 *   Supabase Storage → bucket: "documents" → path: "templates/i539_template.pdf"
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // service_role key (bypasses RLS)

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_KEY env vars before running.");
  process.exit(1);
}

const DECRYPTED_PATH = path.join(__dirname, "i539_decrypted.pdf");

if (!fs.existsSync(DECRYPTED_PATH)) {
  console.error(`File not found: ${DECRYPTED_PATH}`);
  console.error("Run `npx ts-node --esm scripts/scrapingi539.ts list` first to generate it.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const bytes = fs.readFileSync(DECRYPTED_PATH);

const { error } = await supabase.storage
  .from("documents")
  .upload("templates/i539_template.pdf", bytes, {
    contentType: "application/pdf",
    upsert: true,
  });

if (error) {
  console.error("Upload failed:", error.message);
  process.exit(1);
}

const { data } = supabase.storage
  .from("documents")
  .getPublicUrl("templates/i539_template.pdf");

console.log("✓ Template uploaded successfully!");
console.log("Public URL:", data.publicUrl);
console.log('\nAdd to your .env:\nVITE_I539_TEMPLATE_URL=' + data.publicUrl);
