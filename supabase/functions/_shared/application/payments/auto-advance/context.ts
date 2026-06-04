export type AutoAdvanceContext = {
  service_slug: string;
  paid_amount?: number | null;
  current_step: number | null;
  step_data: Record<string, unknown>;
  negativa: Record<string, unknown>;
  now: string;
};

export type AutoAdvanceResult = {
  next_step: number | null;
  extra_metadata: Record<string, unknown>;
  next_negativa: Record<string, unknown>;
};
