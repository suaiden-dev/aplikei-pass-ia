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
    const [requiresSelfie, setRequiresSelfie] = useState<boolean>(false);
    const [uploadingSelfie, setUploadingSelfie] = useState<boolean>(false);
    const [selfieFile, setSelfieFile] = useState<File | null>(null);
    const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(() => {
        const saved = localStorage.getItem("onboarding_step");
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
        localStorage.setItem("onboarding_step", currentStep.toString());
    }, [currentStep]);

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
                    const maxStep = slug === "visto-b1-b2" ? 11 : slug === "visa-f1f2" ? 9 : 4;
                    const stepToIndex = Math.min(service.currentStep, maxStep);
                    setCurrentStep(stepToIndex);
                }

                // Load Order Data
                const order = await visaOrderRepo.findLatestByProductAndUser(slug, userId, user.email || "");
                if (order) {
                    if (order.id) setPendingOrderId(order.id);
                    if (order.order_number) setOrderNumber(order.order_number);
                    if (!order.contract_selfie_url) setRequiresSelfie(true);
                }

                // Load Onboarding Responses (Combined with Profile)
                const { formData: combinedData } = await onboardingUseCase.execute(userId, sId);
                reset(combinedData);

                // Load Documents
                const docRepo = new SupabaseDocumentRepository();
                const getDocsUseCase = new GetServiceDocuments(docRepo);
                const docs = await getDocsUseCase.execute(sId, userId);
                setUploadedDocs(docs);

            } catch (err) {
                console.error("Error loading onboarding data:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [userId, user?.email, authLoading, reset, urlServiceId]);

    const normalizeFileName = (str: string) => {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9.-]/g, "_")
            .toLowerCase();
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, docName: string) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        const isProcessSpecialDoc = docName === "ds160_assinada" || docName === "ds160_comprovante" || docName === "ds160_comprovante_sevis";

        if (isProcessSpecialDoc) {
            setPendingFiles(prev => ({ ...prev, [docName]: file }));
            setUploadedDocs(prev => {
                if (prev.some(d => d.name === docName)) return prev;
                return [...prev, { name: docName, path: "pending..." }];
            });
            return;
        }

        setUploading(docName);
        try {
            const processRepo = new SupabaseUserProcessRepository();
            const storageService = new SupabaseStorageService();
            
            const services = await processRepo.findByUserId(user.id);
            const service = services.find(s => 
                ["active", "review_pending", "review_assign", "ds160InProgress", "ds160Processing", "ds160upload_documents", "ds160AwaitingReviewAndSignature", "uploadsUnderReview"].includes(s.status)
            );

            if (!service) throw new Error("No active service");

            const isProcessSpecialDoc = docName === "ds160_assinada" || docName === "ds160_comprovante";
            const bucketName = isProcessSpecialDoc ? "process-documents" : "documents";
            const folderPath = isProcessSpecialDoc ? service.id : user.id;
            const fileExt = file.name.split(".").pop();
            const safeDocName = normalizeFileName(docName);
            const filePath = `${folderPath}/${safeDocName}_${Date.now()}.${fileExt}`;

            await storageService.uploadFile(bucketName, filePath, file);

            const docRepo = new SupabaseDocumentRepository();
            const saveDocUseCase = new SaveDocument(docRepo);
            
            await saveDocUseCase.execute(user.id, service.id, {
                name: docName,
                path: filePath,
                bucket_id: bucketName
            });

            toast.success(o.docUploaded[lang]);

            const { data: docs } = await supabase.from("documents").select("name, storage_path, bucket_id").eq("user_id", user.id).eq("user_service_id", service.id);
            if (docs) {
                setUploadedDocs(docs.map(d => ({ name: d.name, path: d.storage_path, bucket_id: d.bucket_id })));
            }

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
        const isProcessSpecialDoc = docName === "ds160_assinada" || docName === "ds160_comprovante";
        
        if (isProcessSpecialDoc && pendingFiles[docName]) {
            setPendingFiles(prev => {
                const next = { ...prev };
                delete next[docName];
                return next;
            });
            setUploadedDocs(prev => prev.filter(d => d.name !== docName));
            return;
        }

        if (!user || !serviceId) return;

        try {
            const docRepo = new SupabaseDocumentRepository();
            const deleteDocUseCase = new DeleteDocument(docRepo);
            
            await deleteDocUseCase.execute(serviceId, docName, user.id);
            
            toast.success(o.removed[lang]);
            setUploadedDocs(prev => prev.filter(d => d.name !== docName));
        } catch (error: unknown) {
            console.error("Error removing doc:", error);
            toast.error(o.errorRemovingDoc[lang]);
        }
    };

    const saveCurrentStep = async () => {
        if (!serviceId) return;

        const currentSlug = stepSlugs[currentStep];
        if (currentSlug === "documents" || currentSlug === "review") return;

        let stepData: Record<string, unknown> = {};

        if (serviceSlug === "visto-b1-b2" || serviceSlug === "visa-f1f2" || serviceSlug === "changeofstatus") {
            stepData = { ...formData };
        } else {
            if (currentStep === 0) {
                stepData = {
                    fullName: formData.fullName,
                    dob: formData.dob,
                    passportNumber: formData.passportNumber,
                    nationality: formData.nationality,
                    currentAddress: formData.currentAddress
                };
            } else if (currentStep === 1) {
                stepData = {
                    travelledBefore: formData.travelledBefore,
                    hadVisa: formData.hadVisa,
                    countriesVisited: formData.countriesVisited
                };
            } else if (currentStep === 2) {
                stepData = {
                    travelPurpose: formData.travelPurpose,
                    expectedDate: formData.expectedDate,
                    expectedDuration: formData.expectedDuration,
                    consulateCity: formData.consulateCity
                };
            }
        }

        if (Object.keys(stepData).length > 0) {
            try {
                const onboardingRepo = new SupabaseOnboardingRepository();
                const processRepo = new SupabaseUserProcessRepository();
                const saveUseCase = new SaveOnboardingStep(onboardingRepo, processRepo);
                
                await saveUseCase.execute(serviceId, currentSlug, currentStep, stepData);
            } catch (error) {
                console.error("Error saving step:", error);
                toast.error(o.errorSavingStep[lang]);
            }
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
                    return await trigger(["socialMedia1"]);
                case "passport":
                    return await trigger(["passportType", "passportNumberDS", "passportIssuanceCountry", "passportIssuanceDate", "passportExpirationDate", "hasPassportBeenLostStolen"]);
                case "us-contact":
                    return await trigger(["hasUSContact", "contactName", "contactRelationship", "contactPhone"]);
                case "family":
                    return await trigger(["fatherLastName", "fatherFirstName", "motherLastName", "motherFirstName"]);
                case "work-education":
                    return await trigger(["primaryOccupation", "employerName", "jobStartDate"]);
                case "additional":
                    return true;
                case "documents": {
                    const requiredDocs = [o.docPhoto[lang]]; 
                    const uploadedNames = uploadedDocs.map(d => d.name);
                    const missing = requiredDocs.filter(req => !uploadedNames.includes(req));

                    if (missing.length > 0) {
                        toast.error(`${o.missingDocs[lang]} ${missing.join(", ")}`);
                        return false;
                    }
                    return true;
                }
                default:
                    return true;
            }
        }

        if (serviceSlug === "visa-f1f2") {
            switch (currentSlug) {
                case "f1f2-personal1":
                    return await trigger(["email", "firstName", "lastName", "gender", "maritalStatus", "birthDate", "birthCity", "birthCountry", "interviewLocation"]);
                case "f1f2-personal2":
                    return await trigger(["nationalityInfo", "nationalID"]);
                case "f1f2-travel":
                    return await trigger(["hasSpecificTravelPlan", "arrivalDate", "travelPayer"]);
                case "f1f2-history":
                    return await trigger(["hasBeenToUS", "hasHadUSVisa"]);
                case "f1f2-address-phone":
                    return await trigger(["homeAddress", "homeCity", "mobilePhone"]);
                case "f1f2-social-media":
                    return await trigger(["socialMedia1"]);
                case "f1f2-passport":
                    return await trigger(["passportNumberDS", "passportExpirationDate"]);
                case "f1f2-documents": {
                    const requiredDocs = ["i20_document", o.docPassport[lang]]; 
                    const uploadedNames = uploadedDocs.map(d => d.name);
                    const missing = requiredDocs.filter(req => !uploadedNames.includes(req));

                    if (missing.length > 0) {
                        toast.error(`${o.missingDocs[lang]} ${missing.join(", ")}`);
                        return false;
                    }
                    return true;
                }
                default:
                    return true;
            }
        }

        if (serviceSlug === "changeofstatus") {
            if (currentStep === 0) {
                const isValid = await trigger([
                    "firstName", "lastName", "email", "mobilePhone", "birthDate", 
                    "courseApplyingIn", "paidFormI531", "hasSponsor", 
                    "agreedVisaExtension", "agreedSevisFees", "agreedMailingAddress", "agreedAcknowledgement"
                ]);
                
                // Ensure the required terms are checked
                const formData = watch();
                if (!formData.agreedVisaExtension || !formData.agreedSevisFees || !formData.agreedMailingAddress || !formData.agreedAcknowledgement) {
                    toast.error(lang === "pt" ? "Você deve aceitar todos os termos." : "You must agree to all terms.");
                    return false;
                }

                if (!isValid) {
                    toast.error(lang === "pt" ? "Preencha todos os campos obrigatórios." : "Fill in all required fields.");
                    return false;
                }
                return true;
            } else if (currentStep === 1) {
                // Documents step for changeofstatus (Not rigidly enforcing all documents right now as it might vary, but we can return true)
                return true;
            }
            return true;
        }

        if (currentStep === 0) {
            return await trigger(["fullName", "dob", "passportNumber", "nationality", "currentAddress"]);
        } else if (currentStep === 1) {
            return await trigger(["travelledBefore", "hadVisa", "countriesVisited"]);
        } else if (currentStep === 2) {
            return await trigger(["travelPurpose", "expectedDate", "expectedDuration", "consulateCity"]);
        } else if (currentStep === 3) {
            const requiredDocs = [o.docPassport[lang], o.docPhoto[lang]];
            const uploadedNames = uploadedDocs.map(d => d.name);
            const missing = requiredDocs.filter(req => !uploadedNames.includes(req));

            if (missing.length > 0) {
                toast.error(`${o.missingDocs[lang]} ${missing.join(", ")}`);
                return false;
            }
            return true;
        }
        return true;
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
        if (!selfieFile || !pendingOrderId || !user) return;

        setUploadingSelfie(true);
        try {
            const fileExt = selfieFile.name.split(".").pop();
            const fileName = `selfie_${Date.now()}.${fileExt}`;
            const filePath = `contracts/${fileName}`;

            const storageService = new SupabaseStorageService();
            const visaOrderRepo = new SupabaseVisaOrderRepository();

            await storageService.uploadFile("visa-documents", filePath, selfieFile);
            const publicUrl = storageService.getPublicUrl("visa-documents", filePath);

            await visaOrderRepo.updateOrder(pendingOrderId, {
                contract_selfie_url: publicUrl,
                user_id: user.id
            });

            setRequiresSelfie(false);
            setSelfieFile(null);
            toast.success(o.selfieUploaded[lang]);
        } catch (err) {
            console.error("Error uploading selfie:", err);
            toast.error(o.errorUploadingSelfie[lang]);
        } finally {
            setUploadingSelfie(false);
        }
    };

    const handleFinish = async () => {
        if (!user || !serviceId) return;
        await saveCurrentStep();

        try {
            const isSignatureSubmit = 
                serviceStatus === "ds160upload_documents" || 
                serviceStatus === "ds160AwaitingReviewAndSignature" || 
                serviceStatus === "review_assign" ||
                serviceStatus === "uploadsUnderReview";
            
            if (isSignatureSubmit) {
                const hasAssinada = pendingFiles["ds160_assinada"] || uploadedDocs.some(d => d.name === "ds160_assinada");
                const comprovanteKey = serviceSlug === "visa-f1f2" ? "ds160_comprovante_sevis" : "ds160_comprovante";
                const hasComprovante = pendingFiles[comprovanteKey] || uploadedDocs.some(d => d.name === comprovanteKey);

                if (!hasAssinada || !hasComprovante) {
                    toast.error(o.selectBothDocs[lang]);
                    return;
                }

                setLoading(true);
                const storageService = new SupabaseStorageService();
                const processRepo = new SupabaseUserProcessRepository();

                for (const [docName, file] of Object.entries(pendingFiles)) {
                    const bucketName = "process-documents";
                    const folderPath = serviceId;
                    const fileExt = file.name.split(".").pop();
                    const safeDocName = normalizeFileName(docName);
                    const filePath = `${folderPath}/${safeDocName}_${Date.now()}.${fileExt}`;

                    await storageService.uploadFile(bucketName, filePath, file);

                    const docRepo = new SupabaseDocumentRepository();
                    const saveDocUseCase = new SaveDocument(docRepo);
                    
                    await saveDocUseCase.execute(user.id, serviceId, {
                        name: docName,
                        path: filePath,
                        bucket_id: bucketName
                    });
                }
                setPendingFiles({});
            }

            const nextStatus = isSignatureSubmit ? "uploadsUnderReview" : "review_pending";
            const processRepo = new SupabaseUserProcessRepository();
            const finalStep = serviceSlug === "visto-b1-b2" ? 11 : serviceSlug === "visa-f1f2" ? 9 : 4;
            
            await processRepo.updateStatus(serviceId, nextStatus, finalStep);

        } catch (err: unknown) {
            console.error("Unexpected error:", err);
            toast.error((err as Error).message || o.unexpectedError[lang]);
            setLoading(false);
            return;
        } finally {
            setLoading(false);
        }
        
        const isSignatureSubmit = 
            serviceStatus === "ds160upload_documents" || 
            serviceStatus === "ds160AwaitingReviewAndSignature" || 
            serviceStatus === "review_assign" ||
            serviceStatus === "uploadsUnderReview";
            
        toast.success(
            isSignatureSubmit ? o.docsSubmitted[lang] : o.packageGenerated[lang]
        );
        window.location.reload();
    };

    return {
        lang, t, o, steps, serviceSlug,
        currentStep, setCurrentStep,
        loading,
        serviceStatus,
        serviceId,
        orderNumber,
        securityData,
        hasConsularCredentials,
        uploading, uploadedDocs, fileInputRef, selectedDoc, setSelectedDoc,
        pendingFiles, setPendingFiles,
        register, handleSubmit, watch, errors, setValue, formData,
        handleUpload, handleRemoveDoc,
        handleNext, handleFinish, handleSkip,
        requiresSelfie, setRequiresSelfie, uploadingSelfie, selfieFile, setSelfieFile, handleSelfieUpload
    };
};
