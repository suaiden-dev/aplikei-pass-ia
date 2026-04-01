import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingData, UploadedDocument } from "../types";
import { getOnboardingRepository, getProfileRepository } from "@/infrastructure/factories/onboardingFactory";
import { getUserProcessRepository } from "@/infrastructure/factories/processFactory";
import { getDocumentRepository, getStorageService } from "@/infrastructure/factories/documentFactory";
import { getVisaOrderRepository } from "@/infrastructure/factories/paymentFactory";
import { GetOnboardingData } from "@/application/use-cases/onboarding/GetOnboardingData";
import { GetServiceDocuments } from "@/application/use-cases/onboarding/GetServiceDocuments";
import { toast } from "sonner";

export const useOnboardingBase = () => {
    const [searchParams] = useSearchParams();
    const urlServiceId = searchParams.get("service_id");
    const { lang, t } = useLanguage();
    const { session, loading: authLoading } = useAuth();
    const user = session?.user;
    const userId = user?.id;

    const [serviceSlug, setServiceSlug] = useState<string>("visto-b1-b2");
    const [loading, setLoading] = useState(true);
    const [serviceId, setServiceId] = useState<string | null>(null);
    const [serviceStatus, setServiceStatus] = useState<string | null>(null);
    const [orderNumber, setOrderNumber] = useState<string | null>(null);
    const [securityData, setSecurityData] = useState<{ appId: string; dob: string; grandma: string } | null>(null);
    const [hasConsularCredentials, setHasConsularCredentials] = useState<boolean>(false);
    const [isFinishing, setIsFinishing] = useState<boolean>(false);
    
    // Identity Verification (Selfie)
    const [requiresSelfie, setRequiresSelfie] = useState<boolean>(false);
    const [uploadingSelfie, setUploadingSelfie] = useState<boolean>(false);
    const [selfieFile, setSelfieFile] = useState<File | null>(null);
    const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

    // Document Upload State
    const [uploading, setUploading] = useState<string | null>(null);
    const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
    const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const formMethods = useForm<OnboardingData>();
    const { watch, reset, trigger } = formMethods;
    const formData = watch();

    const [currentStep, setCurrentStep] = useState(0);

    const o = t.onboardingPage;

    // Load User Data & Service
    useEffect(() => {
        if (authLoading || !userId || !loading) return;
        const loadData = async () => {
            try {
                const onboardingRepo = getOnboardingRepository();
                const profileRepo = getProfileRepository();
                const processRepo = getUserProcessRepository();
                const visaOrderRepo = getVisaOrderRepository();

                const onboardingUseCase = new GetOnboardingData(onboardingRepo, profileRepo, processRepo);
                const services = await processRepo.findByUserId(userId);
                
                let service = urlServiceId 
                    ? services.find(s => s.id === urlServiceId)
                    : (services.find(s => s.serviceSlug === "visto-b1-b2") || services[0]);

                if (!service) {
                    service = await processRepo.create(userId, "visto-b1-b2", "ds160InProgress");
                }

                const sId = service.id;
                setServiceId(sId);
                setServiceStatus(service.status || "active");
                
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
                    setCurrentStep(service.currentStep);
                }

                const docRepo = getDocumentRepository();
                const getDocsUseCase = new GetServiceDocuments(docRepo);
                const docs = await getDocsUseCase.execute(sId, userId);
                setUploadedDocs(docs);

                const order = await visaOrderRepo.findLatestByProductAndUser(slug, userId, user?.email || "");
                if (order) {
                    if (order.id) setPendingOrderId(order.id);
                    if (order.order_number) setOrderNumber(order.order_number);
                    
                    const hasSelfie = !!order.contract_selfie_url;
                    const hasVisaPhoto = docs.some(d => d.name === o.docPhoto[lang]);
                    if (!hasSelfie || !hasVisaPhoto) setRequiresSelfie(true);
                }

                const { formData: combinedData } = await onboardingUseCase.execute(userId, sId);
                reset(combinedData);

            } catch (err) {
                console.error("Error loading onboarding base data:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [userId, authLoading, urlServiceId, reset, loading, lang, o.docPhoto]);

    const handleOpenDoc = async (doc: UploadedDocument) => {
        if (!doc.path || doc.path === "pending...") return;
        try {
            const storageService = getStorageService();
            const bucket = doc.bucket_id || (doc.path.startsWith("contracts/") ? "visa-documents" : "process-documents");
            const signedUrl = await storageService.createSignedUrl(bucket, doc.path, 3600);
            if (signedUrl) window.open(signedUrl, "_blank");
        } catch (error) {
            console.error("Error opening document:", error);
            toast.error(o.errorOpeningDoc[lang]);
        }
    };

    const handleSelfieUpload = async () => {
        if (!userId || !serviceId || !selfieFile || !pendingOrderId) return;
        setUploadingSelfie(true);
        try {
            const storage = getStorageService();
            const visaOrderRepo = getVisaOrderRepository();
            const docRepo = getDocumentRepository();

            const selfiePath = `selfies/${userId}/${Date.now()}_selfie.jpg`;
            await storage.uploadFile("process-documents", selfiePath, selfieFile);
            await visaOrderRepo.updateOrder(pendingOrderId, { contract_selfie_url: selfiePath });
            
            // Also save as visa photo
            const docName = o.docPhoto[lang];
            await docRepo.save(userId, serviceId, { name: docName, path: selfiePath, bucket_id: "process-documents" });

            toast.success(t.dashboard.selfieModal.success[lang]);
            setRequiresSelfie(false);
            setSelfieFile(null);
            
            const docs = await docRepo.findByServiceId(serviceId, userId);
            setUploadedDocs(docs);
        } catch (error) {
            toast.error(lang === "pt" ? "Erro ao enviar foto" : "Error uploading photo");
        } finally {
            setUploadingSelfie(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, docName: string) => {
        const file = e.target.files?.[0];
        if (!file || !user || !serviceId) return;

        setUploading(docName);
        try {
            const storageService = getStorageService();
            const bucketName = "process-documents";
            const fileExt = file.name.split(".").pop();
            const filePath = `${serviceId}/${docName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.${fileExt}`;

            await storageService.uploadFile(bucketName, filePath, file);
            const docRepo = getDocumentRepository();
            await docRepo.save(userId!, serviceId, { name: docName, path: filePath, bucket_id: bucketName });

            toast.success(o.docUploaded[lang]);
            const docs = await docRepo.findByServiceId(serviceId, userId!);
            setUploadedDocs(docs);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setUploading(null);
        }
    };

    const handleRemoveDoc = async (docName: string) => {
        if (!user || !serviceId) return;
        setUploading(docName);
        try {
            const docRepo = getDocumentRepository();
            const doc = uploadedDocs.find(d => d.name === docName);
            if (doc) {
                // Simplified delete for now
                await docRepo.delete(serviceId, docName, user.id);
                setUploadedDocs(prev => prev.filter(d => d.name !== docName));
                toast.success(o.removed[lang]);
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setUploading(null);
        }
    };

    return {
        userId, lang, t, o,
        serviceSlug, serviceId, serviceStatus, orderNumber, securityData, hasConsularCredentials,
        loading, setLoading, isFinishing, setIsFinishing,
        requiresSelfie, setRequiresSelfie, uploadingSelfie, selfieFile, setSelfieFile, handleSelfieUpload,
        uploading, setUploading, selectedDoc, setSelectedDoc, uploadedDocs, setUploadedDocs, fileInputRef,
        formMethods, formData, currentStep, setCurrentStep, handleOpenDoc, handleUpload, handleRemoveDoc, trigger
    };
};
