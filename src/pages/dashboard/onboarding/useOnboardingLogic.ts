import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { OnboardingData, UploadedDocument } from "./types";
import { useAuth } from "@/contexts/AuthContext";
import { GetOnboardingData } from "@/application/use-cases/onboarding/GetOnboardingData";
import { SaveOnboardingStep } from "@/application/use-cases/onboarding/SaveOnboardingStep";
import { GetServiceDocuments } from "@/application/use-cases/onboarding/GetServiceDocuments";
import { SaveDocument } from "@/application/use-cases/onboarding/SaveDocument";
import { DeleteDocument } from "@/application/use-cases/onboarding/DeleteDocument";
import { getOnboardingRepository, getProfileRepository } from "@/infrastructure/factories/onboardingFactory";
import { getUserProcessRepository } from "@/infrastructure/factories/processFactory";
import { getDocumentRepository, getStorageService } from "@/infrastructure/factories/documentFactory";
import { getVisaOrderRepository } from "@/infrastructure/factories/paymentFactory";
import { translations as translationsObj } from "@/i18n/translations";

export const useOnboardingLogic = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const urlServiceId = searchParams.get("service_id");
    const { lang, t } = useLanguage();
    const { session, loading: authLoading } = useAuth();
    const user = session?.user;
    const [serviceSlug, setServiceSlug] = useState<string>("visto-b1-b2"); // Default to b1/b2
    const [loading, setLoading] = useState(true);
    const [serviceId, setServiceId] = useState<string | null>(null);
    const [serviceStatus, setServiceStatus] = useState<string | null>(null);
    const [orderNumber, setOrderNumber] = useState<string | null>(null);
    const [securityData, setSecurityData] = useState<{ appId: string; dob: string; grandma: string } | null>(null);
    const [hasConsularCredentials, setHasConsularCredentials] = useState<boolean>(false);
    
    // Multi-step initial verification state
    const [requiresSelfie, setRequiresSelfie] = useState<boolean>(false);
    const [selfieStep, setSelfieStep] = useState<1 | 2>(1);
    const [uploadingSelfie, setUploadingSelfie] = useState<boolean>(false);
    const [selfieFile, setSelfieFile] = useState<File | null>(null);
    const [visaPhotoFile, setVisaPhotoFile] = useState<File | null>(null);
    const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
    const [isFinishing, setIsFinishing] = useState<boolean>(false);
    
    // Form Handling - Moved up to avoid ReferenceError in getSteps/getStepSlugs
    const { register, control, handleSubmit, setValue, watch, reset, trigger, formState: { errors } } = useForm<OnboardingData>();
    const formData = watch();

    const [currentStep, setCurrentStep] = useState(() => {
        const key = urlServiceId ? `onboarding_step_${urlServiceId}` : "onboarding_step_default";
        const saved = localStorage.getItem(key);
        return saved ? parseInt(saved, 10) : 0;
    });
    const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({});

    const o = t.onboardingPage;
    const ds = t.ds160;

    // Dynamically determine steps based on service
    const getSteps = () => {
        if (serviceSlug === "visto-b1-b2") return ds.steps[lang];
        if (serviceSlug === "visa-f1f2") return (t as any).f1f2.steps[lang];
        if (serviceSlug === "changeofstatus") {
            const allSteps = (t.changeOfStatus as any).steps[lang];
            // Only filter if we know for sure it's NOT F1/F2. Default to full list during load.
            if (formData?.targetVisa && formData.targetVisa !== "f1/f2") {
                // Remove I-20 (4) and SEVIS Fee (5) — only needed for F1/F2
                return allSteps.filter((_: any, i: number) => i !== 4 && i !== 5);
            }
            return allSteps;
        }
        return o.steps[lang];
    };

    const steps = getSteps();
    const totalSteps = steps.length;

    const userId = user?.id;

    const getStepSlugs = () => {
        if (serviceSlug === "visto-b1-b2") return [
            "personal1", "personal2", "travel",
            "companions", "previous-travel", "address-phone",
            "social-media", "passport", "us-contact", "family",
            "work-education", "additional", "documents", "review"
        ];
        if (serviceSlug === "visa-f1f2") return [
            "f1f2-personal1", "f1f2-personal2", "f1f2-travel", 
            "f1f2-history", "f1f2-address-phone", "f1f2-social-media", 
            "f1f2-passport", "f1f2-documents", "review"
        ];
        if (serviceSlug === "changeofstatus") {
            const allSlugs = ["cos-form", "cos-documents", "cos-official-forms", "cos-cover-letter-form", "cos-i20", "cos-sevis", "cos-final-forms", "cos-review", "cos-tracking"];
            // Only filter if we know for sure it's NOT F1/F2. Default to full list during load.
            if (formData?.targetVisa && formData.targetVisa !== "f1/f2") {
                // Remove I-20 (4) and SEVIS Fee (5) — only needed for F1/F2
                return allSlugs.filter((_: any, i: number) => i !== 4 && i !== 5);
            }
            return allSlugs;
        }
        return ["personal", "history", "process", "documents", "review"];
    };

    const stepSlugs = getStepSlugs();

    useEffect(() => {
        const key = serviceId ? `onboarding_step_${serviceId}` : "onboarding_step_default";
        localStorage.setItem(key, currentStep.toString());
    }, [currentStep, serviceId]);

    // Document Upload State
    const [uploading, setUploading] = useState<string | null>(null);
    const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
    const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);


    // Real-time status sync
    useEffect(() => {
        if (!serviceId || isFinishing) return;
        
        const channel = supabase
            .channel(`service_status_${serviceId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'user_services',
                    filter: `id=eq.${serviceId}`
                },
                (payload) => {
                    const newStatus = payload.new.status;
                    const newStep = payload.new.current_step;
                    if (newStatus !== serviceStatus || newStep !== currentStep) {
                        setServiceStatus(newStatus);
                        if (newStep !== undefined && newStep !== null) setCurrentStep(newStep);
                        // Refresh data (including documents) when status/step changes
                        setLoading(true);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [serviceId, serviceStatus, currentStep, isFinishing]);

    // Load User Data & Service
    useEffect(() => {
        if (authLoading || !userId || !loading) return;
        const loadData = async () => {
            // ... loadData logic stays same
            try {
                const onboardingRepo = getOnboardingRepository();
                const profileRepo = getProfileRepository();
                const processRepo = getUserProcessRepository();
                const visaOrderRepo = getVisaOrderRepository();

                const onboardingUseCase = new GetOnboardingData(onboardingRepo, profileRepo, processRepo);
                
                // Fetch all user services to find the correct one
                const services = await processRepo.findByUserId(userId);
                
                let service = urlServiceId 
                    ? services.find(s => s.id === urlServiceId)
                    : (services.find(s => s.serviceSlug === "visto-b1-b2") || services[0]);

                if (!service) {
                    service = await processRepo.create(userId, "visto-b1-b2", "ds160InProgress");
                }

                const sId = service.id;
                setServiceId(sId);
                const status = service.status || "active";
                setServiceStatus(status);
                let slug = service.serviceSlug || "visto-b1-b2";
                if (slug === "visto-f1") slug = "visa-f1f2";
                if (slug === "troca-status" || slug === "extensao-status") slug = "changeofstatus";
                setServiceSlug(slug);

                if (service.applicationId) {
                    setSecurityData({
                        appId: service.applicationId,
                        dob: service.dateOfBirth || "",
                        grandma: service.grandmotherName || ""
                    });
                }

                setHasConsularCredentials(!!(service.consularLogin && service.consularLogin.trim()));

                if (service.currentStep !== undefined && service.currentStep !== null) {
                    const maxStep = stepSlugs.length - 1;
                    const stepToIndex = Math.min(service.currentStep, maxStep);
                    setCurrentStep(stepToIndex);
                } else {
                    setCurrentStep(0);
                }

                // Load Documents
                const docRepo = getDocumentRepository();
                const getDocsUseCase = new GetServiceDocuments(docRepo);
                const docs = await getDocsUseCase.execute(sId, userId);
                console.log("DEBUG: Documents fetched on Client:", docs);
                setUploadedDocs(docs);

                // Load Order Data
                const order = await visaOrderRepo.findLatestByProductAndUser(slug, userId, user.email || "");
                if (order) {
                    if (order.id) setPendingOrderId(order.id);
                    if (order.order_number) setOrderNumber(order.order_number);
                    
                    const hasSelfie = !!order.contract_selfie_url;
                    // Check if photo exists in any translated name to avoid language mismatch issues
                    const hasVisaPhoto = docs.some(d => 
                        d.name === o.docPhoto['en'] || 
                        d.name === o.docPhoto['pt'] || 
                        d.name === o.docPhoto['es']
                    );
                    
                    if (!hasSelfie || !hasVisaPhoto) {
                        setRequiresSelfie(true);
                        setSelfieStep(!hasSelfie ? 1 : 2);
                    }
                }

                // Load Onboarding Responses (Combined with Profile)
                const { formData: combinedData } = await onboardingUseCase.execute(userId, sId);
                reset(combinedData);

            } catch (err) {
                console.error("Error loading onboarding data:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [userId, user?.email, authLoading, urlServiceId, lang, o.docPhoto, reset, loading]);

    const normalizeFileName = (str: string) => {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9.-]/g, "_")
            .toLowerCase();
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, docName: string) => {
        const file = e.target.files?.[0];
        if (!file || !user || !serviceId) return;

        setUploading(docName);
        try {
            const storageService = getStorageService();
            const bucketName = "process-documents";
            const folderPath = serviceId;
            const fileExt = file.name.split(".").pop();
            const safeDocName = normalizeFileName(docName);
            const filePath = `${folderPath}/${safeDocName}_${Date.now()}.${fileExt}`;

            await storageService.uploadFile(bucketName, filePath, file);

            const docRepo = getDocumentRepository();
            await docRepo.save(userId!, serviceId, {
                name: docName,
                path: filePath,
                bucket_id: bucketName
            });

            toast.success(o.docUploaded[lang]);

            const docs = await docRepo.findByServiceId(serviceId, userId!);
            setUploadedDocs(docs);

        } catch (error: unknown) {
            toast.error((error as Error).message);
        } finally {
            setUploading(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleRemoveDoc = async (docName: string) => {
        if (!user || !serviceId) return;

        setUploading(docName);
        try {
            const docRepo = getDocumentRepository();
            const deleteDocUseCase = new DeleteDocument(docRepo);
            
            await deleteDocUseCase.execute(serviceId, docName, user.id);
            setUploadedDocs(prev => prev.filter(d => d.name !== docName));
            toast.success(o.removed[lang]);
        } catch (error: unknown) {
            toast.error((error as Error).message);
        } finally {
            setUploading(null);
        }
    };

    const getEffectiveStep = () => {
        const rejectedDocNames = uploadedDocs.filter((d) => d.status === "resubmit").map((d) => d.name);
        const hasRejections = rejectedDocNames.length > 0;
        
        if (serviceSlug === "changeofstatus") {
            const slugs = stepSlugs;
            
            // PRIORITY 1: Explicit Rejections (Fix first)
            const phase1DocPrefixes = ["cos_i94", "cos_passport", "cos_visa", "cos_proof", "cos_bank", "cos_marriage", "cos_birth"];
            if (rejectedDocNames.some((name) => phase1DocPrefixes.some((prefix) => name.startsWith(prefix)))) {
                return slugs.indexOf("cos-documents");
            }
            if (rejectedDocNames.some((name) => name.includes("i539"))) return slugs.indexOf("cos-official-forms");
            if (rejectedDocNames.some((name) => name.includes("i20"))) return slugs.indexOf("cos-i20");
            if (rejectedDocNames.some((name) => name.includes("sevis"))) return slugs.indexOf("cos-sevis");
            if (rejectedDocNames.some((name) => name.includes("g1145") || name.includes("g1450"))) return slugs.indexOf("cos-final-forms");

            // PRIORITY 2: Active client-action statuses (navigate to correct step)
            if (serviceStatus === "COS_F1_I20") return slugs.indexOf("cos-i20");
            if (serviceStatus === "COS_F1_SEVIS") return slugs.indexOf("cos-sevis");
            if (serviceStatus === "COS_FINAL_FORMS") return slugs.indexOf("cos-final-forms");

            // PRIORITY 3: Admin Review Status (Show what's being reviewed)
            if (serviceStatus === "COS_ADMIN_SCREENING") return slugs.indexOf("cos-documents");
            if (serviceStatus === "COS_OFFICIAL_FORMS_REVIEW") return slugs.indexOf("cos-official-forms");
            if (serviceStatus === "COS_COVER_LETTER_ADMIN_REVIEW") return slugs.indexOf("cos-cover-letter-form");
            if (serviceStatus === "COS_F1_I20_REVIEW") return slugs.indexOf("cos-i20");
            if (serviceStatus === "COS_SEVIS_FEE_REVIEW") return slugs.indexOf("cos-sevis");
            if (serviceStatus === "COS_FINAL_FORMS_REVIEW") return slugs.indexOf("cos-final-forms");
        }
        
        if (!hasRejections) return currentStep;
        return currentStep;
    };

    const effectiveStep = getEffectiveStep();

    const validateCurrentStep = async () => {
        const currentSlug = stepSlugs[effectiveStep];
        if (!currentSlug) return false;

        if (serviceSlug === "visto-b1-b2") {
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
                    // Photo was collected at the start, so we check using language-agnostic names
                    const hasPhoto = uploadedDocs.some(d => 
                        d.name === o.docPhoto['en'] || 
                        d.name === o.docPhoto['pt'] || 
                        d.name === o.docPhoto['es']
                    );
                    if (!hasPhoto) {
                        toast.error(o.missingPhoto[lang] || "Missing photo");
                        return false;
                    }
                    return true;
                }
                default:
                    return true;
            }
        }
        return true;
    };

    const saveCurrentStep = async () => {
        if (!serviceId) return;

        const currentSlug = stepSlugs[effectiveStep];
        if (!currentSlug || currentSlug === "documents" || currentSlug === "review" || (currentSlug && currentSlug.includes("documents"))) return;

        try {
            const onboardingRepo = getOnboardingRepository();
            const processRepo = getUserProcessRepository();
            const saveUseCase = new SaveOnboardingStep(onboardingRepo, processRepo);
            
            // Map of fields to save for each step slug to avoid data pollution
            const fieldMapping: Record<string, string[]> = {
                // DS-160 B1/B2 steps
                "personal1": ["email", "firstName", "lastName", "gender", "maritalStatus", "birthDate", "birthCity", "birthState", "birthCountry", "fullName", "fullNamePassport", "hasOtherNames", "otherNamesDetails", "hasTelecode", "telecodeValue", "interviewLocation"],
                "personal2": ["nationality", "hasOtherNationality", "otherNationalities", "hasPassportOtherCountry", "otherPassportNumber", "isPermanentResidentOtherCountry", "permanentResidentDetails", "nationalID", "ssn", "taxpayerID"],
                "travel": ["travelPurpose", "hasSpecificTravelPlan", "arrivalDate", "arrivalCity", "intendedLengthOfStay", "travelPayer", "travelPayerDetails", "consulateCity"],
                "companions": ["hasTravelCompanions", "isTravelingWithGroup", "travelCompanionsList"],
                "previous-travel": ["hasBeenToUS", "previousTravelList", "hasUSDriverLicense", "driverLicenseList", "hasHadUSVisa", "lastVisaDate", "lastVisaNumber", "isSameVisaType", "hasBeenTenPrinted", "hasBeenLostStolen", "hasBeenCancelledRevoked", "hasBeenDeniedVisa", "denialDetails", "hasImmigrationPetition", "petitionDetails"],
                "address-phone": ["homeAddress", "homeCity", "homeState", "homeZip", "homeCountry", "isMailingSameAsHome", "mailingAddress", "mailingCity", "mailingState", "mailingZip", "mailingCountry", "primaryPhone", "secondaryPhone", "workPhone", "hasOtherPhoneLast5Years", "otherPhoneDetails", "hasOtherEmailLast5Years", "otherEmailDetails"],
                "social-media": ["socialMediaPlatforms"],
                "passport": ["passportType", "passportNumberDS", "passportBookNumber", "passportIssuanceCountry", "passportIssuanceCity", "passportIssuanceState", "passportIssuanceDate", "passportExpirationDate", "hasPassportBeenLostStolen", "lostStolenDetails"],
                "us-contact": ["contactName", "contactOrganization", "contactRelationship", "contactAddress", "contactCity", "contactState", "contactZip", "contactPhone", "contactEmail"],
                "family": ["fatherLastName", "fatherFirstName", "fatherBirthDate", "isFatherInUS", "fatherUSStatus", "motherLastName", "motherFirstName", "motherBirthDate", "isMotherInUS", "motherUSStatus", "hasImmediateRelativesInUS", "immediateRelativesList", "hasOtherRelativesInUS", "maternalGrandmotherName"],
                "work-education": ["primaryOccupation", "employerName", "employerAddress", "employerCity", "employerState", "employerZip", "employerCountry", "employerPhone", "jobStartDate", "monthlyIncome", "jobDescription", "wasPreviouslyEmployed", "previousEmployersList", "hasSecondaryEducation", "secondaryEducationList"],
                "additional": ["belongsToClan", "clanName", "languagesSpoken", "hasVisitedOtherCountries", "countriesVisitedDetails", "hasWorkContract", "contractDetails", "hasServedInMilitary", "militaryDetails", "hasBeenToWarZone", "warZoneDetails", "hasSpecialSkills", "skillsDetails"],
                
                // F1/F2 Student steps
                "f1f2-personal1": ["email", "firstName", "lastName", "fullName", "birthDate", "gender", "maritalStatus", "birthCity", "birthCountry", "interviewLocation"],
                "f1f2-personal2": ["ssn", "taxpayerID", "nationality", "nationalID"],
                "f1f2-travel": ["travelPurpose", "sevisId", "schoolName", "courseStartDate", "courseEndDate", "arrivalDate", "intendedLengthOfStay", "travelPayer"],
                "f1f2-history": ["hasBeenToUS", "hasHadUSVisa", "hasBeenDeniedVisa", "hasImmigrationPetition"],
                "f1f2-address-phone": ["homeAddress", "homeCity", "homeState", "homeZip", "homeCountry", "primaryPhone", "socialMediaPlatforms"],
                "f1f2-passport": ["passportNumberDS", "passportIssuanceCountry", "passportIssuanceDate", "passportExpirationDate"],
                
                // Change of Status pieces
                "cos-form": ["currentVisa", "currentVisaOther", "targetVisa", "i94AuthorizedStayDate", "dependents", "appliedBy"],
                "cos-cover-letter-form": ["coverLetterData"],
                "cos-tracking": ["trackingCode"]
            };

            const fieldsToSave = fieldMapping[currentSlug] || Object.keys(formData);
            const scopedData = fieldsToSave.reduce((acc, key) => {
                if (formData[key] !== undefined) acc[key] = formData[key];
                return acc;
            }, {} as Record<string, unknown>);

            await saveUseCase.execute(serviceId, currentSlug, effectiveStep, scopedData);
        } catch (error) {
            console.error("Error saving step:", error);
            toast.error(o.errorSavingStep[lang]);
        }
    };

    const handleNext = async () => {
        console.log("DEBUG: handleNext started", { effectiveStep, serviceSlug, serviceStatus });
        // Prevent proceeding if a manual review is pending
        const reviewStatuses = [
            "COS_ADMIN_SCREENING", 
            "COS_OFFICIAL_FORMS_REVIEW", 
            "COS_COVER_LETTER_ADMIN_REVIEW", 
            "COS_F1_I20_REVIEW", 
            "COS_SEVIS_FEE_REVIEW", 
            "COS_FINAL_FORMS_REVIEW"
        ];
        if (reviewStatuses.includes(serviceStatus || "")) {
            toast.error(lang === "pt" ? "Aguarde a revisão do administrador." : "Please wait for administrator review.");
            return;
        }

        const isValid = await validateCurrentStep();
        if (!isValid) return;

        await saveCurrentStep();

        // Custom transition for COS after documents are submitted
        if (serviceSlug === "changeofstatus" && stepSlugs[effectiveStep] === "cos-documents") {
            try {
                const processRepo = getUserProcessRepository();
                await processRepo.updateStatus(serviceId!, "COS_ADMIN_SCREENING", effectiveStep + 1);
                toast.success(lang === "pt" ? "Documentos enviados para triagem!" : "Documents sent for screening!");
                window.location.reload(); 
                return;
            } catch (error) {
                console.error("Error transitioning to COS screening:", error);
            }
        }
        if (serviceSlug === "changeofstatus" && stepSlugs[effectiveStep] === "cos-i20") {
            try {
                const processRepo = getUserProcessRepository();
                await processRepo.updateStatus(serviceId!, "COS_F1_I20_REVIEW", effectiveStep + 1);
                toast.success(lang === "pt" ? "Documento I-20 enviado para triagem!" : "I-20 document sent for screening!");
                window.location.reload(); 
                return;
            } catch (error) {
                console.error("Error transitioning to I-20 review:", error);
            }
        }

        if (serviceSlug === "changeofstatus" && stepSlugs[effectiveStep] === "cos-cover-letter-form") {
            try {
                const processRepo = getUserProcessRepository();
                // When submitting cover letter data, we move to review status but stay on same step visually
                // The step component will then show "Under Review" based on this status
                await processRepo.updateStatus(serviceId!, "COS_COVER_LETTER_ADMIN_REVIEW", effectiveStep); 
                toast.success(lang === "pt" ? "Respostas enviadas para revisão do especialista!" : "Responses sent for specialist review!");
                window.location.reload(); 
                return;
            } catch (error) {
                console.error("Error transitioning to cover letter review:", error);
            }
        }

        if (serviceSlug === "changeofstatus" && stepSlugs[effectiveStep] === "cos-sevis") {
            try {
                const processRepo = getUserProcessRepository();
                await processRepo.updateStatus(serviceId!, "COS_SEVIS_FEE_REVIEW", effectiveStep + 1);
                toast.success(lang === "pt" ? "Comprovante SEVIS enviado para triagem!" : "SEVIS proof sent for screening!");
                window.location.reload(); 
                return;
            } catch (error) {
                console.error("Error transitioning to SEVIS review:", error);
            }
        }

        if (serviceSlug === "changeofstatus" && stepSlugs[effectiveStep] === "cos-final-forms") {
            try {
                const processRepo = getUserProcessRepository();
                await processRepo.updateStatus(serviceId!, "COS_FINAL_FORMS_REVIEW", effectiveStep + 1);
                toast.success(lang === "pt" ? "Formulários finais enviados para revisão!" : "Final forms sent for review!");
                window.location.reload(); 
                return;
            } catch (error) {
                console.error("Error transitioning to final forms review:", error);
            }
        }

        setCurrentStep(effectiveStep + 1);
    };

    const handleSkip = async () => {
        await saveCurrentStep();
        if (serviceId) {
            try {
                const processRepo = getUserProcessRepository();
                await processRepo.updateStep(serviceId, currentStep + 1);
            } catch (error) {
                console.error("Error updating step:", error);
            }
        }
        setCurrentStep((s) => s + 1);
    };

    const handleStepClick = async (index: number) => {
        if (!serviceId) return;
        
        // Prevent going forward via click (only backward or current)
        if (index > currentStep) return;
        
        try {
            const processRepo = getUserProcessRepository();
            
            // Revert status to allow editing when clicking back
            let revertStatus = serviceStatus;
            if (serviceSlug === "changeofstatus") {
                revertStatus = "active";
            } else if (serviceSlug === "visto-b1-b2" || serviceSlug === "visa-f1f2") {
                revertStatus = "ds160InProgress";
            }
            
            await processRepo.updateStatus(serviceId, revertStatus!, index);
            setCurrentStep(index);
            setServiceStatus(revertStatus);
            
            // If it's a significant status change, a reload might be needed to refresh UI components 
            // that depend on the specific status (like review screens)
            if (revertStatus !== serviceStatus) {
                window.location.reload();
            }
        } catch (error) {
            console.error("Error updating step via timeline:", error);
            toast.error(lang === "pt" ? "Erro ao navegar entre os passos." : "Error navigating between steps.");
        }
    };

    const handleSelfieUpload = async () => {
        if (!userId || !serviceId) return;

        setUploadingSelfie(true);
        try {
            const storage = getStorageService();
            const visaOrderRepo = getVisaOrderRepository();
            const docRepo = getDocumentRepository();
            const saveDocUseCase = new SaveDocument(docRepo);

            if (selfieFile && pendingOrderId) {
                const selfiePath = `selfies/${userId}/${Date.now()}_selfie.jpg`;
                const { path: uploadedPath, error: uploadError } = await storage.uploadFile("process-documents", selfiePath, selfieFile);
                
                if (uploadError) throw new Error(uploadError);

                // Update order with selfie
                await visaOrderRepo.updateOrder(pendingOrderId, { contract_selfie_url: uploadedPath });
                
                // Also save as visa photo if needed
                if (!visaPhotoFile) {
                    const docName = o.docPhoto[lang as keyof typeof o.docPhoto];
                    await docRepo.save(userId, serviceId, {
                        name: docName,
                        path: uploadedPath,
                        bucket_id: "process-documents"
                    });
                }

                const selfieModalSuccess = t.dashboard.selfieModal.success;
                toast.success(selfieModalSuccess[lang as keyof typeof selfieModalSuccess]);
            }

            if (visaPhotoFile) {
                const fileExt = visaPhotoFile.name.split(".").pop();
                const docName = o.docPhoto[lang as keyof typeof o.docPhoto];
                const safeDocName = docName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                const filePath = `${userId}/${safeDocName}_${Date.now()}.${fileExt}`;
                
                const { path: uploadedPath, error: uploadError } = await storage.uploadFile("process-documents", filePath, visaPhotoFile);
                if (uploadError) throw new Error(uploadError);

                await docRepo.save(userId, serviceId, {
                    name: docName,
                    path: uploadedPath,
                    bucket_id: "process-documents"
                });
            }

            const successMsg = t.dashboard.selfieModal.success;
            toast.success(successMsg[lang as keyof typeof successMsg]);
            setRequiresSelfie(false);
            setSelfieFile(null);
            setVisaPhotoFile(null);
            setSelfieStep(1);

            // Reload documents
            const docs = await docRepo.findByServiceId(serviceId, userId);
            setUploadedDocs(docs);

        } catch (error: unknown) {
            toast.error(lang === "pt" ? "Erro ao enviar fotos" : "Error uploading photos");
            console.error(error);
        } finally {
            setUploadingSelfie(false);
        }
    };

    const handleFinish = async () => {
        setIsFinishing(true);
        console.log("DEBUG: handleFinish started", { effectiveStep, serviceSlug, serviceStatus, formData });
        if (!user || !serviceId) {
            console.warn("DEBUG: handleFinish aborted - missing user or serviceId", { userId, serviceId });
            return;
        }

        await saveCurrentStep();

        try {
            setLoading(true);
            const storageService = getStorageService();
            const processRepo = getUserProcessRepository();
            const docRepo = getDocumentRepository();

            setPendingFiles({});

            const isSignatureSubmit = 
                serviceStatus === "ds160upload_documents" || 
                serviceStatus === "ds160AwaitingReviewAndSignature" || 
                serviceStatus === "review_assign" ||
                serviceStatus === "uploadsUnderReview";

            let nextStatus = isSignatureSubmit ? "uploadsUnderReview" : "review_pending";

            if (serviceSlug === "changeofstatus") {
                const currentSlug = stepSlugs[effectiveStep];
                if (currentSlug === "cos-tracking") {
                    nextStatus = "COS_TRACKING";
                    // Save tracking code if present in formData
                    if (formData.trackingCode) {
                        try {
                            const repo = getUserProcessRepository();
                            await repo.updateData(serviceId, { trackingCode: String(formData.trackingCode).toUpperCase() });
                        } catch (e) {
                            console.error("Error saving tracking code on finish:", e);
                        }
                    }
                } else if (serviceStatus === "COS_OFFICIAL_FORMS") {
                    nextStatus = "COS_OFFICIAL_FORMS_REVIEW";
                } else if (serviceStatus === "COS_COVER_LETTER_FORM") {
                    nextStatus = "COS_COVER_LETTER_ADMIN_REVIEW";
                } else if (serviceStatus && serviceStatus.startsWith("COS_")) {
                    // Keep existing COS status if not finishing forms
                    nextStatus = serviceStatus;
                } else {
                    nextStatus = "COS_ADMIN_SCREENING";
                }
            }

            const finalStep = steps.length - 1;
            
            console.log("DEBUG: Updating status to", nextStatus, "at step", finalStep);
            await processRepo.updateStatus(serviceId, nextStatus, finalStep);

            if (serviceSlug === "changeofstatus" && stepSlugs[effectiveStep] === "cos-tracking") {
                toast.success(lang === "pt" ? "Código de rastreio registrado! Acompanhe agora." : "Tracking code registered! Track it now.");
                navigate("/dashboard/acompanhamento");
            } else {
                toast.success(isSignatureSubmit ? o.docsSubmitted[lang] : o.packageGenerated[lang]);
                window.location.reload();
            }

        } catch (error: unknown) {
            console.error("Error finishing:", error);
            toast.error((error as Error).message || o.unexpectedError[lang]);
        } finally {
            setLoading(false);
        }
    };

    return {
        userId,
        lang,
        t,
        o,
        steps,
        stepSlugs: getStepSlugs(),
        serviceSlug,
        currentStep,
        setCurrentStep,
        effectiveStep,
        loading,
        serviceStatus,
        orderNumber,
        register,
        control,
        formData,
        setValue,
        watch,
        trigger,
        errors,
        handleNext,
        handleFinish,
        handleSkip,
        handleStepClick,
        uploading,
        uploadedDocs,
        fileInputRef,
        handleUpload,
        handleRemoveDoc,
        selectedDoc,
        setSelectedDoc,
        pendingFiles,
        serviceId,
        securityData,
        hasConsularCredentials,
        requiresSelfie,
        setRequiresSelfie,
        selfieStep,
        setSelfieStep,
        uploadingSelfie,
        selfieFile,
        setSelfieFile,
        visaPhotoFile,
        setVisaPhotoFile,
        handleSelfieUpload,
    };
};
