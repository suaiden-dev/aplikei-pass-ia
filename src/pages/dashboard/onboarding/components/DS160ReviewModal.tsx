import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, AlertCircle, Shield } from "lucide-react";

interface DS160ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  lang: string;
}

export function DS160ReviewModal({
  isOpen,
  onClose,
  serviceId,
  lang,
}: DS160ReviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (isOpen && serviceId) {
      fetchDS160Data();
    }
  }, [isOpen, serviceId]);

  const fetchDS160Data = async () => {
    setLoading(true);
    try {
      const { data: responses, error } = await supabase
        .from("onboarding_responses")
        .select("data")
        .eq("user_service_id", serviceId);

      if (error) throw error;

      if (responses && responses.length > 0) {
        const combined = responses.reduce(
          (acc, curr) => ({ ...acc, ...(curr.data as any) }),
          {},
        );
        setFormData(combined);
      }
    } catch (err) {
      console.error("Error fetching DS-160 data:", err);
    } finally {
      setLoading(false);
    }
  };

  const translateYesNo = (val?: string) => {
    if (val === "yes") return lang === "pt" ? "Sim" : "Yes";
    if (val === "no") return lang === "pt" ? "Não" : "No";
    return val || "—";
  };

  // Simplified sections for user review
  const sections = formData
    ? [
        {
          title: "Informações Pessoais",
          fields: [
            { label: "Nomes Próprios", value: formData.firstName },
            { label: "Sobrenome", value: formData.lastName },
            { label: "Nome no Passaporte", value: formData.fullNamePassport },
            { label: "Data de Nascimento", value: formData.birthDate },
            { label: "Cidade de Nascimento", value: formData.birthCity },
            { label: "País de Nascimento", value: formData.birthCountry },
          ],
        },
        {
          title: "Passaporte",
          fields: [
            { label: "Número do Passaporte", value: formData.passportNumberDS },
            {
              label: "País de Emissão",
              value: formData.passportIssuanceCountry,
            },
            {
              label: "Data de Validade",
              value: formData.passportExpirationDate,
            },
          ],
        },
        {
          title: "Viagem",
          fields: [
            {
              label: "Data Prevista",
              value: formData.arrivalDate || formData.expectedDate,
            },
            {
              label: "Duração",
              value: formData.stayDurationValue
                ? `${formData.stayDurationValue} ${formData.stayDurationUnit}`
                : formData.expectedDuration,
            },
            { label: "Quem pagará a viagem?", value: formData.travelPayer },
          ],
        },
      ]
        .map((s) => ({
          ...s,
          fields: s.fields.filter((f) => f.value && f.value !== "—"),
        }))
        .filter((s) => s.fields.length > 0)
    : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <FileText className="w-5 h-5 text-accent" />
            {lang === "pt" ? "Suas Respostas DS-160" : "Your DS-160 Responses"}
          </DialogTitle>
          <DialogDescription>
            {lang === "pt"
              ? "Confira os dados enviados para a geração do seu formulário oficial."
              : "Review the data submitted for generating your official form."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : !formData ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p>
                {lang === "pt" ? "Nenhum dado encontrado." : "No data found."}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {sections.map((section, idx) => (
                <div key={idx} className="space-y-4">
                  <h3 className="font-bold text-lg text-primary border-b pb-2">
                    {section.title}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {section.fields.map((field, i) => (
                      <div
                        key={i}
                        className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-border"
                      >
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                          {field.label}
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {field.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="p-4 bg-accent/5 border border-accent/20 rounded-2xl flex items-start gap-3">
                <Shield className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {lang === "pt"
                    ? "Estas informações foram coletadas durante seu onboarding e serão utilizadas no formulário oficial da embaixada."
                    : "This information was collected during your onboarding and will be used in the official embassy form."}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
