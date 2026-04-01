import { toast } from "sonner";
import { useOnboardingBase } from "./useOnboardingBase";
import { F1F2_FIELD_MAPPING, F1F2_STEP_SLUGS } from "./OnboardingConfig";
import { getOnboardingRepository } from "@/infrastructure/factories/onboardingFactory";
import { getUserProcessRepository } from "@/infrastructure/factories/processFactory";
import { SaveOnboardingStep } from "@/application/use-cases/onboarding/SaveOnboardingStep";

export const useF1F2Flow = (base: ReturnType<typeof useOnboardingBase>) => {
    const { 
        serviceId, formData, currentStep, setCurrentStep, 
        formMethods: { trigger }, lang, o, t 
    } = base;

    const steps = (t as any).f1f2.steps[lang];
    const stepSlugs = F1F2_STEP_SLUGS;

    const validateStep = async () => {
        const currentSlug = stepSlugs[currentStep];
        if (!currentSlug) return false;

        switch (currentSlug) {
            case "f1f2-personal1": return await trigger(["email", "firstName", "lastName", "fullName", "birthDate", "gender", "maritalStatus", "birthCity", "birthCountry", "interviewLocation"]);
            case "f1f2-personal2": return await trigger(["ssn", "taxpayerID", "nationality", "nationalID"]);
            case "f1f2-travel": return await trigger(["travelPurpose", "sevisId", "schoolName", "courseStartDate", "courseEndDate", "arrivalDate", "intendedLengthOfStay", "travelPayer"]);
            case "f1f2-history": return await trigger(["hasBeenToUS", "hasHadUSVisa", "hasBeenDeniedVisa", "hasImmigrationPetition"]);
            case "f1f2-address-phone": return await trigger(["homeAddress", "homeCity", "homeState", "homeZip", "homeCountry", "primaryPhone", "socialMediaPlatforms"]);
            case "f1f2-passport": return await trigger(["passportNumberDS", "passportIssuanceCountry", "passportIssuanceDate", "passportExpirationDate"]);
            default: return true;
        }
    };

    const saveStep = async () => {
        if (!serviceId) return;
        const currentSlug = stepSlugs[currentStep];
        if (!currentSlug || currentSlug === "f1f2-documents" || currentSlug === "review") return;

        try {
            const onboardingRepo = getOnboardingRepository();
            const processRepo = getUserProcessRepository();
            const saveUseCase = new SaveOnboardingStep(onboardingRepo, processRepo);
            
            const fieldsToSave = F1F2_FIELD_MAPPING[currentSlug] || Object.keys(formData);
            const scopedData = fieldsToSave.reduce((acc, key) => {
                if (formData[key as keyof typeof formData] !== undefined) acc[key] = formData[key as keyof typeof formData];
                return acc;
            }, {} as Record<string, unknown>);

            await saveUseCase.execute(serviceId, currentSlug, currentStep, scopedData);
        } catch (error) {
            console.error("Error saving F1F2 step:", error);
            toast.error(o.errorSavingStep[lang]);
        }
    };

    const handleNext = async () => {
        if (await validateStep()) {
            await saveStep();
            setCurrentStep(currentStep + 1);
        }
    };

    return { steps, stepSlugs, handleNext, validateStep, saveStep };
};
