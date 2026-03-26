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

    const [currentStep, setCurrentStep] = useState(() => {
        const key = urlServiceId ? `onboarding_step_${urlServiceId}` : "onboarding_step_default";
        const saved = localStorage.getItem(key);
        return saved ? parseInt(saved, 10) : 0;
    });
    const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({});

    const o = t.onboardingPage;
    const ds = t.ds160;

    // Dynamically determine steps based on service
    const steps = serviceSlug === "visto-b1-b2" 
        ? ds.steps[lang] 
        : serviceSlug === "visa-f1f2" 
        ? t.f1f2.steps[lang] 
        : serviceSlug === "changeofstatus"
        ? t.changeOfStatus.steps[lang]
        : o.steps[lang];
    const totalSteps = steps.length;

    const userId = user?.id;

    const stepSlugs = serviceSlug === "visto-b1-b2"
        ? [
            "personal1", "personal2", "travel",
            "companions", "previous-travel", "address-phone",
            "social-media", "passport", "us-contact", "family",
            "work-education", "additional", "documents", "review"
        ]
        : serviceSlug === "visa-f1f2"
        ? [
            "f1f2-personal1", "f1f2-personal2", "f1f2-travel", 
            "f1f2-history", "f1f2-address-phone", "f1f2-social-media", 
            "f1f2-passport", "f1f2-documents", "review"
        ]
        : serviceSlug === "changeofstatus"
        ? ["cos-form", "cos-documents", "cos-review"]
        : ["personal", "history", "process", "documents", "review"];

    useEffect(() => {
        const key = serviceId ? `onboarding_step_${serviceId}` : "onboarding_step_default";
        localStorage.setItem(key, currentStep.toString());
    }, [currentStep, serviceId]);

    // Document Upload State
    const [uploading, setUploading] = useState<string | null>(null);
    const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
    const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form Handling
    const { register, control, handleSubmit, setValue, watch, reset, trigger, formState: { errors } } = useForm<OnboardingData>();
    const formData = watch();

    // Load User Data & Service
    useEffect(() => {
        if (authLoading || !userId) return;

        const loadData = async () => {
            setLoading(true);
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
                    const maxStep = slug === "visto-b1-b2" ? 13 : slug === "visa-f1f2" ? 8 : slug === "changeofstatus" ? 2 : 4;
                    const stepToIndex = Math.min(service.currentStep, maxStep);
                    setCurrentStep(stepToIndex);
                } else {
                    setCurrentStep(0);
                }

                // Load Documents
                const docRepo = getDocumentRepository();
                const getDocsUseCase = new GetServiceDocuments(docRepo);
                const docs = await getDocsUseCase.execute(sId, userId);
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
    }, [userId, user?.email, authLoading, urlServiceId, lang, o.docPhoto, reset]);

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

    const validateCurrentStep = async () => {
        const currentSlug = stepSlugs[currentStep];

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

        const currentSlug = stepSlugs[currentStep];
        if (currentSlug === "documents" || currentSlug === "review" || currentSlug.includes("documents")) return;

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
                "f1f2-passport": ["passportNumberDS", "passportIssuanceCountry", "passportIssuanceDate", "passportExpirationDate"]
            };

            const fieldsToSave = fieldMapping[currentSlug] || Object.keys(formData);
            const scopedData = fieldsToSave.reduce((acc, key) => {
                if (formData[key] !== undefined) acc[key] = formData[key];
                return acc;
            }, {} as Record<string, unknown>);

            await saveUseCase.execute(serviceId, currentSlug, currentStep, scopedData);
        } catch (error) {
            console.error("Error saving step:", error);
            toast.error(o.errorSavingStep[lang]);
        }
    };

    const handleNext = async () => {
        const isValid = await validateCurrentStep();
        if (!isValid) return;

        await saveCurrentStep();
        setCurrentStep((s) => s + 1);
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
        if (!user || !serviceId) return;

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

            const nextStatus = isSignatureSubmit ? "uploadsUnderReview" : "review_pending";
            const finalStep = serviceSlug === "visto-b1-b2" ? 11 : serviceSlug === "visa-f1f2" ? 9 : 4;
            
            await processRepo.updateStatus(serviceId, nextStatus, finalStep);

            toast.success(isSignatureSubmit ? o.docsSubmitted[lang] : o.packageGenerated[lang]);
            window.location.reload();

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
        serviceSlug,
        currentStep,
        setCurrentStep,
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
