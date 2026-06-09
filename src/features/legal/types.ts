export type LegalRole = "lawyer" | "customer";

export type LegalContentType = "terms" | "privacy";

export type LegalTermCategory =
  | "lawyer_terms"
  | "lawyer_privacy"
  | "customer_terms"
  | "customer_privacy";

export interface LegalTerm {
  id: string;
  title: string;
  content: string;
}

export interface LegalTermRecord extends LegalTerm {
  category: LegalTermCategory;
}

export interface SaveLegalTermInput {
  id?: string;
  title: string;
  content: string;
  category: LegalTermCategory;
  createdBy?: string | null;
}
