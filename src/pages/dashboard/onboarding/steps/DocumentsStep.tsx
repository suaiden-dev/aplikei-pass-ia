
import { Button } from "@/components/ui/button";
import { CheckCircle2, Upload, Loader2, Trash2 } from "lucide-react";
import { DocumentStepProps } from "../types";

export const DocumentsStep = ({ o, lang, uploadedDocs, handleUpload, handleRemove, uploading, fileInputRef, setSelectedDoc, handleSkip, serviceSlug }: DocumentStepProps & { fileInputRef: any, setSelectedDoc: any }) => {
    // For B1/B2, only the photo is mandatory (selfie)
    const docsList = serviceSlug === "visto-b1-b2"
        ? [o.docPhoto[lang]]
        : [o.docPassport[lang], o.docPhoto[lang], o.docFinancial[lang], o.docBond[lang]];

    const isDevelopment = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

    return (
        <div className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-foreground">{o.documentsTitle[lang]}</h2>
            <p className="text-sm text-muted-foreground">{o.documentsDesc[lang]}</p>
            <div className="space-y-3">
                {docsList.map((doc, i) => {
                    const uploaded = uploadedDocs.some(d => d.name === doc);
                    return (
                        <div key={i} className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-foreground">{doc}</span>
                                {uploaded && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant={uploaded ? "ghost" : "outline"}
                                    className="w-full gap-1 sm:w-auto"
                                    onClick={() => {
                                        setSelectedDoc(doc);
                                        fileInputRef.current?.click();
                                    }}
                                    disabled={uploading === doc}
                                >
                                    {uploading === doc ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                                    {uploading === doc ? (lang === 'pt' ? 'Enviando...' : 'Uploading...') : (uploaded ? (lang === 'pt' ? 'Trocar' : 'Replace') : o.upload[lang])}
                                </Button>

                                {uploaded && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="w-full gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive sm:w-auto"
                                        onClick={() => handleRemove(doc)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">{lang === 'pt' ? 'Remover' : 'Remove'}</span>
                                    </Button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {isDevelopment && handleSkip && (
                <div className="mt-4 pt-4 border-t border-dashed border-border flex justify-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground hover:text-accent"
                        onClick={handleSkip}
                    >
                        [DEV] {lang === 'pt' ? 'Pular fase de documentos' : 'Skip documents phase'}
                    </Button>
                </div>
            )}
        </div>
    );
};
