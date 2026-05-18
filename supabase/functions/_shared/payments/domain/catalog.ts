export const DEPENDENT_SERVICE_MAP: Record<string, string> = {
  "visto-b1-b2": "dependente-b1-b2",
  "visa-b1b2": "dependente-b1-b2",
  "visto-f1": "dependente-estudante",
  "visa-f1": "dependente-estudante",
  "visa-f1f2": "dependente-estudante",
  "extensao-status": "dependente-estudante",
  "visa-eos": "dependente-estudante",
  "troca-status": "dependente-estudante",
  "visa-cos": "dependente-estudante",
};

export const SLUG_ALIASES: Record<string, string> = {
  "visa-b1b2": "visto-b1-b2",
  "visa-f1": "visto-f1",
  "visa-eos": "extensao-status",
  "visa-cos": "troca-status",
  "visto-b1-b2": "visa-b1b2",
  "visto-f1": "visa-f1",
  "extensao-status": "visa-eos",
  "troca-status": "visa-cos",
  "consultancy-negative-f1": "consultoria-f1-negativa",
  "consultoria-f1-negativa": "consultancy-negative-f1",
};

export const FALLBACK_PRICES: Record<string, { name: string; price: number }> = {
  "analise-especialista-cos": { name: "Análise de Especialista (COS)", price: 50 },
  "analise-especialista-eos": { name: "Análise de Especialista (EOS)", price: 50 },
  "motion-reconsideracao-cos": { name: "Motion para Reconsideração (COS)", price: 150 },
  "motion-reconsideracao-eos": { name: "Motion para Reconsideração (EOS)", price: 150 },
  "rfe-support": { name: "Apoio Técnico ao RFE", price: 497 },
  "suporte-rfe-eos": { name: "Suporte ao RFE (EOS)", price: 497 },
  "suporte-rfe-cos": { name: "Apoio ao RFE (Troca de Status)", price: 497 },
  "recovery-eos": { name: "Recuperação de Caso - Motion (EOS)", price: 897 },
  "recovery-cos": { name: "Recuperação de Caso - Motion (Troca de Status)", price: 897 },
  "motion-support": { name: "Motion de Reconsideração", price: 897 },
  "apoio-rfe-motion-inicio": { name: "Análise Inicial de Motion", price: 50 },
  "proposta-rfe-motion": { name: "Proposta de Motion (Customizada)", price: 0 },
  "mentoria-individual": { name: "Mentoria Individual - 1 Simulado", price: 197 },
  "mentoria-bronze": { name: "Mentoria Bronze - 2 Simulados", price: 397 },
  "mentoria-gold": { name: "Mentoria Gold - 3 Simulados", price: 697 },
  "mentoria-negativa-consular": { name: "Consultoria Especializada (Pós-Negativa)", price: 97 },
  "consultoria-f1-negativa": { name: "Consultoria Especializada (Pós-Negativa F1)", price: 97 },
  "consultancy-negative-f1": { name: "Consultoria Especializada (Pós-Negativa F1)", price: 97 },
  "slot-dependente-cos": { name: "Dependente Adicional (COS/EOS)", price: 100 },
};

export function getSlugCandidates(slug: string): string[] {
  const normalizedSlug = slug.toLowerCase();
  const alias = SLUG_ALIASES[normalizedSlug];
  return Array.from(new Set([normalizedSlug, alias].filter(Boolean)));
}

export function getDependentServiceId(slug: string): string {
  return DEPENDENT_SERVICE_MAP[slug] || "dependente-b1-b2";
}
