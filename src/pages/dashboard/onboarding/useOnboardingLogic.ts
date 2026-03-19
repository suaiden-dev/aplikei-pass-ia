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
import { SupabaseOnboardingRepository } from "@/infrastructure/repositories/SupabaseOnboardingRepository";
import { SupabaseProfileRepository } from "@/infrastructure/repositories/SupabaseProfileRepository";
import { SupabaseUserProcessRepository } from "@/infrastructure/repositories/SupabaseUserProcessRepository";
import { SupabaseVisaOrderRepository } from "@/infrastructure/repositories/SupabaseVisaOrderRepository";
import { SupabaseDocumentRepository } from "@/infrastructure/repositories/SupabaseDocumentRepository";
import { SupabaseStorageService } from "@/infrastructure/services/SupabaseStorageService";

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

    const o = (t as any).onboardingPage;
    const ds = (t as any).ds160;

    // Dynamically determine steps based on service
    const steps = serviceSlug === "visto-b1-b2" 
        ? ds.steps[lang] 
        : serviceSlug === "visa-f1f2" 
        ? (t as any).f1f2.steps[lang] 
        : serviceSlug === "changeofstatus"
        ? (t as any).changeOfStatus.steps[lang]
        : o.steps[lang];
    const totalSteps = steps.length;

    const userId = user?.id;

    const stepSlugs = serviceSlug === "visto-b1-b2"
        ? [
            "personal1", "personal2", "travel",
            "companions", "previous-travel", "address-phone",
            "social-media", "passport", "us-contact", "family",
            "work-education", "additional"
        ]
        : serviceSlug === "visa-f1f2"
        ? [
            "f1f2-personal1", "f1f2-personal2", "f1f2-travel", 
            "f1f2-history", "f1f2-address-phone", "f1f2-social-media", 
            "f1f2-passport", "f1f2-documents"
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
    const { register, handleSubmit, setValue, watch, reset, trigger, formState: { errors } } = useForm<OnboardingData>();
    const formData = watch();

    // Load User Data & Service
    useEffect(() => {
        if (authLoading || !userId) return;

        const loadData = async () => {
            setLoading(true);
            try {
                const onboardingRepo = new SupabaseOnboardingRepository();
                const profileRepo = new SupabaseProfileRepository();
                const processRepo = new SupabaseUserProcessRepository();
                const visaOrderRepo = new SupabaseVisaOrderRepository();

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
                    const maxStep = slug === "visto-b1-b2" ? 11 : slug === "visa-f1f2" ? 7 : slug === "changeofstatus" ? 2 : 4;
                    const stepToIndex = Math.min(service.currentStep, maxStep);
                    setCurrentStep(stepToIndex);
                } else {
                    setCurrentStep(0);
                }

                // Load Documents
                const docRepo = new SupabaseDocumentRepository();
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
            const storageService = new SupabaseStorageService();
            const bucketName = "process-documents";
            const folderPath = serviceId;
            const fileExt = file.name.split(".").pop();
            const safeDocName = normalizeFileName(docName);
            const filePath = `${folderPath}/${safeDocName}_${Date.now()}.${fileExt}`;

            await storageService.uploadFile(bucketName, filePath, file);

            const docRepo = new SupabaseDocumentRepository();
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
            const docRepo = new SupabaseDocumentRepository();
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
                    // Photo was collected at the start, so we only check if it exists in uploadedDocs
                    const hasPhoto = uploadedDocs.some(d => d.name === o.docPhoto[lang]);
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
            const onboardingRepo = new SupabaseOnboardingRepository();
            const processRepo = new SupabaseUserProcessRepository();
            const saveUseCase = new SaveOnboardingStep(onboardingRepo, processRepo);
            
            await saveUseCase.execute(serviceId, currentSlug, currentStep, formData);
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
                const processRepo = new SupabaseUserProcessRepository();
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
            const storageService = new SupabaseStorageService();
            const visaOrderRepo = new SupabaseVisaOrderRepository();
            const docRepo = new SupabaseDocumentRepository();

            if (selfieFile && pendingOrderId) {
                const fileExt = selfieFile.name.split(".").pop();
                const fileName = `selfie_${Date.now()}.${fileExt}`;
                const filePath = `${userId}/${fileName}`;
                await storageService.uploadFile("process-documents", filePath, selfieFile);
                await visaOrderRepo.updateOrder(pendingOrderId, { contract_selfie_url: filePath });

                // Also save as "Photo (Selfie)" in documents if no visa photo is provided
                if (!visaPhotoFile) {
                    const docName = o.docPhoto[lang];
                    await docRepo.save(userId, serviceId, {
                        name: docName,
                        path: filePath,
                        bucket_id: "process-documents"
                    });
                }
            }

            if (visaPhotoFile) {
                const fileExt = visaPhotoFile.name.split(".").pop();
                const docName = o.docPhoto[lang];
                const safeDocName = normalizeFileName(docName);
                const filePath = `${userId}/${safeDocName}_${Date.now()}.${fileExt}`;
                
                await storageService.uploadFile("process-documents", filePath, visaPhotoFile);
                await docRepo.save(userId, serviceId, {
                    name: docName,
                    path: filePath,
                    bucket_id: "process-documents"
                });
            }

            toast.success((t as any).dashboard.selfieModal.success[lang]);
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
            const storageService = new SupabaseStorageService();
            const processRepo = new SupabaseUserProcessRepository();
            const docRepo = new SupabaseDocumentRepository();

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
