import { supabase } from "@shared/lib/supabase";
import type { LegalTerm, LegalTermCategory, LegalTermRecord, SaveLegalTermInput } from "../types";

export const LEGAL_TERM_CATEGORIES: LegalTermCategory[] = [
  "lawyer_terms",
  "lawyer_privacy",
  "customer_terms",
  "customer_privacy",
];

export async function fetchPublishedLegalTerms(category: LegalTermCategory): Promise<LegalTerm[]> {
  const { data, error } = await supabase
    .from("legal_terms")
    .select("id, title, content")
    .eq("category", category)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) throw Error(error.message);
  return (data ?? []) as LegalTerm[];
}

export async function fetchActiveLegalTermRecords(): Promise<LegalTermRecord[]> {
  const { data, error } = await supabase
    .from("legal_terms")
    .select("id, title, content, category")
    .eq("is_active", true)
    .in("category", LEGAL_TERM_CATEGORIES)
    .order("created_at", { ascending: false });

  if (error) throw Error(error.message);
  return (data ?? []) as LegalTermRecord[];
}

export async function saveLegalTerm(input: SaveLegalTermInput): Promise<void> {
  const payload = {
    title: input.title,
    content: input.content,
    category: input.category,
    is_active: true,
  };

  if (input.id) {
    const { error } = await supabase.from("legal_terms").update(payload).eq("id", input.id);
    if (error) throw Error(error.message);
    return;
  }

  const { error } = await supabase.from("legal_terms").insert({
    ...payload,
    created_by: input.createdBy ?? null,
  });
  if (error) throw Error(error.message);
}
