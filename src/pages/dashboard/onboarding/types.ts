import { OnboardingData } from "@/domain/onboarding/OnboardingEntities";
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { translations } from "@/i18n/translations";
export type { OnboardingData };

export interface UploadedDocument {
    name: string;
    path: string;
    id?: string;
    bucket_id?: string;
    status?: string | null;
    feedback?: string | null;
}

export interface StepProps {
    formData: OnboardingData;
    register: UseFormRegister<OnboardingData>; 
    errors?: FieldErrors<OnboardingData>;
    setValue?: UseFormSetValue<OnboardingData>;
    watch?: UseFormWatch<OnboardingData>;
    trigger?: (name?: any, options?: any) => Promise<boolean>;
    lang: "pt" | "en" | "es";
    t: typeof translations; 
    o: typeof translations.onboardingPage; 
    serviceSlug?: string;
    serviceStatus?: string | null;
    securityData?: { appId: string | null; dob: string | null; grandma: string | null } | null;
}

export interface DocumentStepProps extends StepProps {
    uploadedDocs: UploadedDocument[];
    handleUpload: (e: React.ChangeEvent<HTMLInputElement>, docName: string) => Promise<void>;
    handleRemove: (docName: string) => Promise<void>;
    uploading: string | null;
    fileInputRef: React.RefObject<HTMLInputElement>;
    setSelectedDoc: (docName: string) => void;
    handleSkip?: () => Promise<void>;
    serviceStatus?: string | null;
}
