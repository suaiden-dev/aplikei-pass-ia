import { useEffect, useState as useLocalState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Copy, Download, Eye, Globe2, Monitor, Power, Save, Smartphone, Tablet } from "lucide-react";
import { RiLayoutGridLine } from "react-icons/ri";
import { toast } from "sonner";
import { Button } from "@shared/components/atoms/button";
import { useIsMobile } from "@shared/hooks/useIsMobile";
import { usePageBuilder } from "./hooks/usePageBuilder";
import { BuilderSidebar } from "./components/BuilderSidebar";
import { PreviewModal } from "./components/PreviewModal";
import { LandingPagePreview } from "./components/LandingPagePreview";
import { MobilePreviewNotice } from "./components/MobilePreviewNotice";
import { TemplateCatalog } from "./components/TemplateCatalog";
import { applyTemplateConfig } from "./lib/templateHtml";
import { getLandingTemplateHtml } from "./templates/LandingTemplate";
import { useState } from "react";

type PreviewViewport = "desktop" | "tablet" | "mobile";

export default function PageBuilderPage() {
    const navigate = useNavigate();
    const { config, isPreviewOpen, isSaving, isUploadingLogo, isUploadingFavicon, uploadingTestimonialPhoto, updateConfig, saveConfig, uploadLogo, uploadFavicon, uploadTestimonialPhoto, openPreview, closePreview } =
        usePageBuilder();
    const [previewViewport, setPreviewViewport] =
        useState<PreviewViewport>("desktop");
    const [copiedKey, setCopiedKey] = useLocalState<"login" | "public" | null>(null);
    const isMobileDevice = useIsMobile();
    const publicUrl = config.officeSlug && typeof window !== "undefined"
        ? `${window.location.origin}/${config.officeSlug}`
        : "";

    const handleCopyUrl = (key: "login" | "public", value: string) => {
        if (!value) return;
        void navigator.clipboard.writeText(value).then(() => {
            setCopiedKey(key);
            setTimeout(() => setCopiedKey(null), 2000);
        });
    };

    useEffect(() => {
        document.title = config.pageTitle;
        const link = document.querySelector(
            "link[rel='icon']",
        ) as HTMLLinkElement | null;
        if (link && config.faviconUrl) {
            link.href = config.faviconUrl;
        }
    }, [config.pageTitle, config.faviconUrl]);

    const handleDownload = async () => {
        try {
            const baseTemplate = getLandingTemplateHtml();
            const html = applyTemplateConfig(baseTemplate, config);

            const blob = new Blob([html], { type: "text/html;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "index.html";
            link.click();
            URL.revokeObjectURL(url);
        } catch {
            // noop: evita quebrar a tela caso o template falhe.
        }
    };

    const handleSave = async () => {
        try {
            await saveConfig();
            toast.success("Landing page saved successfully.");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to save landing page.";
            toast.error(message);
        }
    };

    const handleToggleDeploy = async () => {
        try {
            if (!config.officeSlug) {
                toast.error("Create or assign an office before publishing this landing page.");
                return;
            }

            const nextConfig = { ...config, isLandingLive: !config.isLandingLive };
            updateConfig("isLandingLive", nextConfig.isLandingLive);
            await saveConfig(nextConfig);
            toast.success(nextConfig.isLandingLive ? "Landing page is live." : "Landing page is offline.");
        } catch (error) {
            updateConfig("isLandingLive", config.isLandingLive);
            const message = error instanceof Error ? error.message : "Failed to update deploy status.";
            toast.error(message);
        }
    };

    const handleUploadLogo = async (file: File) => {
        try {
            await uploadLogo(file);
            toast.success("Logo uploaded successfully.");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to upload logo.";
            toast.error(message);
        }
    };

    const handleUploadFavicon = async (file: File) => {
        try {
            await uploadFavicon(file);
            toast.success("Favicon uploaded successfully.");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to upload favicon.";
            toast.error(message);
        }
    };

    const handleUploadTestimonialPhoto = async (index: 1 | 2 | 3, file: File) => {
        try {
            await uploadTestimonialPhoto(index, file);
            toast.success("Testimonial photo uploaded successfully.");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to upload testimonial photo.";
            toast.error(message);
        }
    };

    return (
        <div className="flex h-full min-h-0 flex-col">
            <header className="flex flex-col gap-3 border-b border-border bg-card px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 flex-1 flex-col gap-2 lg:mr-4">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-1.5 text-sm font-semibold text-text-muted hover:text-text transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Back
                        </button>
                        <span className="text-border">·</span>
                        <h1 className="text-lg font-black text-text">Landing Builder</h1>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant={config.isLandingLive ? "default" : "outline"}
                        onClick={handleToggleDeploy}
                        disabled={isSaving || !config.officeSlug}
                    >
                        <Power size={16} className="mr-2" />
                        {config.isLandingLive ? "Set Off" : "Deploy Live"}
                    </Button>
                    <div className="h-5 w-px bg-border" />
                    <Button
                        variant={previewViewport === "desktop" ? "default" : "outline"}
                        onClick={() => setPreviewViewport("desktop")}
                        className="px-3"
                        title="Desktop view"
                    >
                        <Monitor size={18} />
                    </Button>
                    <Button
                        variant={previewViewport === "tablet" ? "default" : "outline"}
                        onClick={() => setPreviewViewport("tablet")}
                        className="px-3"
                        title="Tablet view"
                    >
                        <Tablet size={18} />
                    </Button>
                    <Button
                        variant={previewViewport === "mobile" ? "default" : "outline"}
                        onClick={() => setPreviewViewport("mobile")}
                        className="px-3"
                        title="Mobile view"
                    >
                        <Smartphone size={18} />
                    </Button>
                    <div className="h-5 w-px bg-border mx-1" />
                    <Button variant="outline" onClick={openPreview} className="px-3" title="Fullscreen Preview">
                        <Eye size={18} />
                    </Button>
                    <Button variant="outline" onClick={handleDownload} className="px-3" title="Download Source">
                        <Download size={18} />
                    </Button>
                    <div className="h-5 w-px bg-border mx-1" />
                    <Button onClick={handleSave} disabled={isSaving}>
                        <Save size={16} className="mr-2" />
                        {isSaving ? "Saving..." : "Save"}
                    </Button>
                </div>
            </header>

            <section className="flex flex-row flex-1 h-full min-h-0">
                <BuilderSidebar
                    config={config}
                    isUploadingLogo={isUploadingLogo}
                    isUploadingFavicon={isUploadingFavicon}
                    uploadingTestimonialPhoto={uploadingTestimonialPhoto}
                    onUploadLogo={handleUploadLogo}
                    onUploadFavicon={handleUploadFavicon}
                    onUploadTestimonialPhoto={handleUploadTestimonialPhoto}
                    onUpdateConfig={updateConfig}
                />
                <main className="min-h-[52vh] flex-1 overflow-hidden bg-[#0f172a] lg:min-h-0">
                    <div className="flex h-full min-h-0 items-stretch justify-center overflow-y-auto overflow-x-hidden p-2 sm:p-4">
                        {isMobileDevice ? (
                            <div className="flex min-h-[40vh] w-full items-center justify-center p-4 sm:p-6">
                                <MobilePreviewNotice />
                            </div>
                        ) : previewViewport === "desktop" ? (
                            <div className="h-full min-h-0 w-full overflow-hidden bg-white shadow-2xl" style={{ zoom: 0.7 }}>
                                <LandingPagePreview config={config} />
                            </div>
                        ) : previewViewport === "tablet" ? (
                            <div className="mx-auto h-full min-h-0 w-[768px] max-w-full overflow-hidden bg-white shadow-2xl" style={{ zoom: 0.7 }}>
                                <LandingPagePreview config={config} />
                            </div>
                        ) : (
                            <div className="mx-auto h-full min-h-0 w-[390px] max-w-full overflow-hidden bg-white shadow-2xl" style={{ zoom: 0.7 }}>
                                <LandingPagePreview config={config} />
                            </div>
                        )}
                    </div>
                </main>
            </section>

            <PreviewModal
                open={isPreviewOpen}
                config={config}
                onOpenChange={(open) => (open ? openPreview() : closePreview())}
            />
        </div>
    );
}
