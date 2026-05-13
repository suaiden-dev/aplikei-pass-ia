import { useEffect, useState as useLocalState } from "react";
import { Check, Copy, Download, Eye, Monitor, Save, Smartphone } from "lucide-react";
import { RiLayoutGridLine } from "react-icons/ri";
import { toast } from "sonner";
import { Button } from "../../components/atoms/button";
import { usePageBuilder } from "./hooks/usePageBuilder";
import { InspectorPanel } from "./components/InspectorPanel";
import { PreviewModal } from "./components/PreviewModal";
import { LandingPagePreview } from "./components/LandingPagePreview";
import { TemplateCatalog } from "./components/TemplateCatalog";
import { applyTemplateConfig } from "./lib/templateHtml";
import { getLandingTemplateHtml } from "./templates/LandingTemplate";
import { useState } from "react";

type PreviewViewport = "desktop" | "mobile";

export default function PageBuilderPage() {
    const { config, isPreviewOpen, isSaving, isUploadingLogo, isUploadingFavicon, updateConfig, saveConfig, uploadLogo, uploadFavicon, openPreview, closePreview } =
        usePageBuilder();
    const [previewViewport, setPreviewViewport] =
        useState<PreviewViewport>("desktop");
    const [copiedKey, setCopiedKey] = useLocalState<"login" | null>(null);
    const [showCatalog, setShowCatalog] = useState(true);

    const handleCopyUrl = (key: "login", value: string) => {
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
            toast.success("Landing salva com sucesso.");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Erro ao salvar landing.";
            toast.error(message);
        }
    };

    const handleUploadLogo = async (file: File) => {
        try {
            await uploadLogo(file);
            toast.success("Logo enviada com sucesso.");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Erro ao enviar logo.";
            toast.error(message);
        }
    };

    const handleUploadFavicon = async (file: File) => {
        try {
            await uploadFavicon(file);
            toast.success("Favicon enviado com sucesso.");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Erro ao enviar favicon.";
            toast.error(message);
        }
    };

    return (
        <div className="flex h-full min-h-0 flex-col">
            <header className="flex flex-col gap-3 border-b border-border bg-card px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 flex-1 flex-col gap-2 lg:mr-4">
                    <div className="flex items-center gap-2">
                        <h1 className="text-lg font-black text-text">Landing Builder</h1>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 rounded-lg border border-border bg-bg-subtle px-3 py-1.5 max-w-xl">
                        <span className="shrink-0 text-[10px] font-black uppercase tracking-wider text-info">
                            login
                        </span>
                        <span className="truncate text-xs font-mono text-text-muted flex-1">
                            {config.loginUrl}
                        </span>
                        <button
                            type="button"
                            onClick={() => handleCopyUrl("login", config.loginUrl)}
                            title="Copiar URL login"
                            className="shrink-0 rounded p-0.5 text-text-muted transition-colors hover:text-text"
                        >
                            {copiedKey === "login" ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                        </button>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant={showCatalog ? "default" : "outline"}
                        onClick={() => setShowCatalog((v) => !v)}
                    >
                        <RiLayoutGridLine size={16} className="mr-2" />
                        Produtos
                    </Button>
                    <div className="h-5 w-px bg-border" />
                    <Button
                        variant={previewViewport === "desktop" ? "default" : "outline"}
                        onClick={() => setPreviewViewport("desktop")}
                    >
                        <Monitor size={16} className="mr-2" />
                        Desktop
                    </Button>
                    <Button
                        variant={previewViewport === "mobile" ? "default" : "outline"}
                        onClick={() => setPreviewViewport("mobile")}
                    >
                        <Smartphone size={16} className="mr-2" />
                        Mobile
                    </Button>
                    <Button variant="outline" onClick={openPreview}>
                        <Eye size={16} className="mr-2" />
                        Visualizar
                    </Button>
                    <Button variant="outline" onClick={handleDownload}>
                        <Download size={16} className="mr-2" />
                        Download
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        <Save size={16} className="mr-2" />
                        {isSaving ? "Salvando..." : "Salvar"}
                    </Button>
                </div>
            </header>

            <section className="flex min-h-0 flex-col lg:h-[calc(100vh-64px)] lg:flex-row">
                {showCatalog && (
                    <TemplateCatalog config={config} onUpdateConfig={updateConfig} />
                )}
                <main className="min-h-[52vh] flex-1 overflow-hidden bg-[#0f172a] lg:min-h-0">
                    <div className="flex h-full items-start justify-center overflow-y-auto overflow-x-hidden p-2 sm:p-4">
                        {previewViewport === "desktop" ? (
                            <div className="mx-auto w-full max-w-[1280px] overflow-hidden shadow-2xl">
                                <LandingPagePreview config={config} />
                            </div>
                        ) : (
                            <div className="mx-auto w-[390px] overflow-hidden shadow-2xl">
                                <LandingPagePreview config={config} />
                            </div>
                        )}
                    </div>
                </main>
                <InspectorPanel
                    config={config}
                    isUploadingLogo={isUploadingLogo}
                    isUploadingFavicon={isUploadingFavicon}
                    onUploadLogo={handleUploadLogo}
                    onUploadFavicon={handleUploadFavicon}
                    onUpdateConfig={updateConfig}
                />
            </section>

            <PreviewModal
                open={isPreviewOpen}
                config={config}
                onOpenChange={(open) => (open ? openPreview() : closePreview())}
            />
        </div>
    );
}
