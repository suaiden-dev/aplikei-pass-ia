// Dados salvos em user_steps.data para o step "Formulário Inicial" (COS/EOS)

export const CURRENT_VISA_OPTIONS = [
  "B1/B2",
  "F1/F2",
  "J1/J2",
  "L1/L2",
  "R1/R2",
  "Other",
] as const;

export const TARGET_VISA_OPTIONS = ["B1/B2", "F1", "J1"] as const;

export const DEPENDENT_RELATIONS = ["spouse", "child", "other"] as const;

export type CurrentVisaOption = (typeof CURRENT_VISA_OPTIONS)[number];
export type TargetVisaOption  = (typeof TARGET_VISA_OPTIONS)[number];
export type DependentRelation = (typeof DEPENDENT_RELATIONS)[number];

export interface StepDependent {
  id:            string;
  name:          string;
  relation:      DependentRelation | "";
  birthDate:     string;   // ISO date YYYY-MM-DD
  i94Date:       string;   // ISO date — expiry of I-94
  marriageDate:  string;   // ISO date — required when relation = "spouse"
}

/** Shape armazenado em user_steps.data (jsonb) para o step "initial_info". */
export interface StepInitialInfoData {
  currentVisa:  CurrentVisaOption | null;
  targetVisa:   TargetVisaOption  | null;
  i94Date:      string;            // expiry date of the main applicant's I-94
  dependents:   StepDependent[];
}

export const EMPTY_INITIAL_INFO: StepInitialInfoData = {
  currentVisa: null,
  targetVisa:  null,
  i94Date:     "",
  dependents:  [],
};

export function isInitialInfoComplete(data: StepInitialInfoData): boolean {
  return (
    !!data.currentVisa &&
    !!data.targetVisa &&
    !!data.i94Date &&
    data.dependents.every(
      (d) => !!d.name && !!d.relation && !!d.birthDate && !!d.i94Date,
    )
  );
}
