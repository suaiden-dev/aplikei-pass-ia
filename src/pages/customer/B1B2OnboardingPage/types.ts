import type { UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors } from "react-hook-form";

export interface StepProps {
  register: UseFormRegister<Record<string, unknown>>;
  watch: UseFormWatch<Record<string, unknown>>;
  setValue: UseFormSetValue<Record<string, unknown>>;
  lang: "en" | "pt" | "es";
  securityData?: Record<string, unknown>;
  errors?: FieldErrors<Record<string, unknown>>;
  formData?: Record<string, unknown>;
  trigger?: (name?: string) => Promise<boolean>;
  onComplete?: () => Promise<void>;
}

export interface UploadedDocument {
  name: string;
  url: string;
  id?: string;
}
