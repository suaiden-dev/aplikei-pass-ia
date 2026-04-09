import type { UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors } from "react-hook-form";
import type { translations } from "../../../i18n/translations";

export interface StepProps {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  lang: "en" | "pt" | "es";
  t: typeof translations;
  securityData?: any;
  errors?: FieldErrors<any>;
}

export interface UploadedDocument {
  name: string;
  url: string;
  id?: string;
}
