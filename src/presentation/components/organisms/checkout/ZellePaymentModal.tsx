import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/presentation/components/atoms/dialog";
import { Button } from "@/presentation/components/atoms/button";
import { Input } from "@/presentation/components/atoms/input";
import { Label } from "@/presentation/components/atoms/label";
import { Upload, CheckCircle2, AlertCircle, Copy, Check } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { submitZellePayment } from "@/lib/zelle/ZelleService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ZellePaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    serviceSlug: string;
    guestName: string;
    guestEmail: string;
    contractSelfieUrl?: string;
    termsAcceptedAt?: string;
    visaOrderId?: string;
    onSuccess: (data: {
        file: File;
        amount: number;
        serviceSlug: string;
        guestEmail: string;
        guestName: string;
        contractSelfieUrl?: string;
        termsAcceptedAt?: string;
        visaOrderId?: string;
    }) => void;
}

export const ZellePaymentModal = ({
    isOpen,
    onClose,
    amount,
    serviceSlug,
    guestName,
    guestEmail,
    contractSelfieUrl,
    termsAcceptedAt,
    visaOrderId,
    onSuccess
}: ZellePaymentModalProps) => {
    const { lang } = useLanguage();
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleCopyEmail = () => {
        navigator.clipboard.writeText("admin@suaiden.com");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleSubmit = () => {
        if (!file) {
            setError(lang === "pt" ? "Por favor, anexe o comprovante." : "Please attach the proof.");
            return;
        }

        setError(null);

        onSuccess({
            file,
            amount,
            serviceSlug,
            guestEmail,
            guestName,
            contractSelfieUrl,
            termsAcceptedAt,
            visaOrderId,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Pagamento via Zelle</DialogTitle>
                    <DialogDescription>
                        Envie o comprovante do pagamento de <strong>${amount.toFixed(2)}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Instruções de Transferência */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-md border border-dashed border-slate-200 dark:border-slate-700">
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground text-xs uppercase font-bold">E-mail Zelle:</span>
                                <div className="flex items-center gap-2">
                                    <p className="font-medium text-base">admin@suaiden.com</p>
                                    <button
                                        type="button"
                                        onClick={handleCopyEmail}
                                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                                        title="Copiar e-mail"
                                    >
                                        {copied
                                            ? <Check className="h-4 w-4 text-green-500" />
                                            : <Copy className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground text-xs uppercase font-bold">Nome do Beneficiário:</span>
                                <p className="font-medium">SU AI DEN INC</p>
                            </div>
                        </div>
                    </div>

                    {/* Upload do comprovante */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold">{lang === "pt" ? "Anexe o print do comprovante" : "Attach the proof screenshot"}</Label>
                        <label
                            htmlFor="zelle-upload"
                            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6 transition-all duration-300 cursor-pointer relative ${file ? 'border-green-500/50 bg-green-50/30 dark:bg-green-500/5' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-accent/40'
                                }`}
                        >
                            <Input
                                id="zelle-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            {file ? (
                                <div className="flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                                    <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full mb-3">
                                        <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                                    </div>
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{file.name}</span>
                                    <span className="text-xs text-muted-foreground mt-2 px-3 py-1 bg-white dark:bg-slate-800 rounded-full border shadow-sm">
                                        {lang === "pt" ? "Clique para trocar" : "Click to change"}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-center">
                                    <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-full mb-3">
                                        <Upload className="h-8 w-8 text-slate-400" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                        {lang === "pt" ? "Clique aqui para selecionar o print" : "Click here to select the screenshot"}
                                    </span>
                                    <p className="text-xs text-slate-400 mt-2">Formatos aceitos: JPG, PNG</p>
                                </div>
                            )}
                        </label>
                    </div>

                    {error && (
                        <div className="flex items-center gap-3 text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-4 rounded-md border border-red-100 dark:border-red-900/30 animate-in shake-1 duration-300">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <p className="font-medium">{error}</p>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0 border-t pt-4">
                    <Button variant="ghost" onClick={onClose}>
                        {lang === "pt" ? "Cancelar" : "Cancel"}
                    </Button>

                    <Button
                        onClick={handleSubmit}
                        disabled={!file}
                        className="bg-accent hover:bg-accent/90 text-white px-5 h-11 rounded-md shadow-lg shadow-accent/20 transition-all active:scale-95"
                    >
                        {lang === "pt" ? "Confirmar Envio" : "Confirm Sending"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
