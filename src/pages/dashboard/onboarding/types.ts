export interface OnboardingData {
    // Personal Info
    fullName: string;
    dob: string;
    passportNumber: string;
    nationality: string;
    currentAddress: string;

    // History Info
    travelledBefore: string;
    hadVisa: string;
    countriesVisited: string;

    // Process Info
    travelPurpose: string;
    expectedDate: string;
    expectedDuration: string;
    consulateCity: string;
}

export interface UploadedDocument {
    name: string;
    path: string;
    id?: string;
}

export interface StepProps {
    formData: OnboardingData;
    register: any; // React Hook Form register
    errors?: any; // React Hook Form errors
    setValue?: any; // React Hook Form setValue for custom inputs
    watch?: any;  // React Hook Form watch
    lang: "pt" | "en" | "es";
    t: any; // Translation object
}

export interface DocumentStepProps extends StepProps {
    uploadedDocs: UploadedDocument[];
    handleUpload: (e: React.ChangeEvent<HTMLInputElement>, docName: string) => Promise<void>;
    handleRemove: (docName: string) => Promise<void>;
    uploading: string | null;
}
