import { toast } from "sonner";
import { useOnboardingBase } from "./useOnboardingBase";
import { B1B2_FIELD_MAPPING, B1B2_STEP_SLUGS } from "./OnboardingConfig";
import { getOnboardingRepository } from "@/infrastructure/factories/onboardingFactory";
import { getUserProcessRepository } from "@/infrastructure/factories/processFactory";
import { SaveOnboardingStep } from "@/application/use-cases/onboarding/SaveOnboardingStep";

export const useB1B2Flow = (base: ReturnType<typeof useOnboardingBase>) => {
    const { 
        serviceId, formData, currentStep, setCurrentStep, 
        formMethods: { trigger }, lang, o, t 
    } = base;

    const steps = t.ds160.steps[lang];
    const stepSlugs = B1B2_STEP_SLUGS;

    const validateStep = async () => {
        const currentSlug = stepSlugs[currentStep];
        if (!currentSlug) return false;

        switch (currentSlug) {
            case "personal1":
                return await trigger(["email", "firstName", "lastName", "gender", "maritalStatus", "birthDate", "birthCity", "birthCountry"]);
            case "personal2":
                return await trigger(["nationalityInfo", "nationalID"]);
            case "travel":
                return await trigger(["hasSpecificTravelPlan", "arrivalDate", "travelPayer"]);
            case "companions":
                return await trigger(["hasTravelCompanions", "isTravelingWithGroup"]);
            case "previous-travel":
                return await trigger(["hasBeenToUS", "hasUSDriverLicense", "hasHadUSVisa", "hasBeenDeniedVisa", "hasImmigrationPetition"]);
            case "address-phone":
                return await trigger(["homeAddress", "homeCity", "mobilePhone", "hasOtherPhoneLast5Years", "hasOtherEmailLast5Years"]);
            case "social-media":
                return await trigger(["socialMedia1", "socialMediaPlatforms"]);
            case "passport":
                return await trigger(["passportType", "passportNumberDS", "passportIssuanceCountry", "passportIssuanceDate", "passportExpirationDate", "hasPassportBeenLostStolen"]);
            case "us-contact":
                return await trigger(["hasUSContact", "contactName", "contactRelationship", "contactPhone"]);
            case "family":
                return await trigger([
                    "fatherLastName", "fatherFirstName", "isFatherInUS", "fatherUSStatus",
                    "motherLastName", "motherFirstName", "isMotherInUS", "motherUSStatus",
                    "maternalGrandmotherName", "hasImmediateRelativesInUS", 
                    "immediateRelativeName", "immediateRelativeRelationship", "immediateRelativeStatus",
                    "hasOtherRelativesInUS"
                ]);
            case "work-education":
                return await trigger([
                    "primaryOccupation", "employerName", "employerPhone", "employerAddress", 
                    "employerCity", "employerCountry", "jobStartDate", "monthlyIncome", "jobDescription",
                    "wasPreviouslyEmployed", "prevEmployerName", "prevJobTitle", "prevJobPeriod", 
                    "prevEmployerSupervisor", "prevJobReasonLeft", "hasSecondaryEducation", 
                    "educationInstitutionName", "educationCompletionDate", "educationDegree"
                ]);
            case "additional":
                return await trigger(["belongsToClan", "clanName", "languagesSpoken", "hasVisitedOtherCountries", "countriesVisitedDetails"]);
            case "documents": {
                const hasPhoto = base.uploadedDocs.some(d => 
                    d.name === o.docPhoto['en'] || d.name === o.docPhoto['pt'] || d.name === o.docPhoto['es']
                );
                if (!hasPhoto) {
                    toast.error(o.missingPhoto[lang] || "Missing photo");
                    return false;
                }
                return true;
            }
            default: return true;
        }
    };

    const saveStep = async () => {
        if (!serviceId) return;
        const currentSlug = stepSlugs[currentStep];
        if (!currentSlug || currentSlug === "documents" || currentSlug === "review") return;

        try {
            const onboardingRepo = getOnboardingRepository();
            const processRepo = getUserProcessRepository();
            const saveUseCase = new SaveOnboardingStep(onboardingRepo, processRepo);
            
            const fieldsToSave = B1B2_FIELD_MAPPING[currentSlug] || Object.keys(formData);
            const scopedData = fieldsToSave.reduce((acc, key) => {
                if (formData[key as keyof typeof formData] !== undefined) acc[key] = formData[key as keyof typeof formData];
                return acc;
            }, {} as Record<string, unknown>);

            await saveUseCase.execute(serviceId, currentSlug, currentStep, scopedData);
        } catch (error) {
            console.error("Error saving B1B2 step:", error);
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
