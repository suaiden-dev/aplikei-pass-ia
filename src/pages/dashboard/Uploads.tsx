import { Button } from "@/components/ui/button";
import { Upload as UploadIcon, File, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

const documents = [
  { name: "Passaporte (página principal)", status: "received", file: "passaporte.pdf" },
  { name: "Foto 5x5cm", status: "pending", file: null },
  { name: "Comprovante financeiro (3 meses)", status: "received", file: "extrato_bank.pdf" },
  { name: "Comprovante de vínculo", status: "resubmit", file: "vinculo_v1.jpg" },
];

const statusConfig = {
  received: { label: "Recebido", icon: <CheckCircle2 className="h-4 w-4 text-accent" />, color: "text-accent" },
  pending: { label: "Pendente", icon: <Clock className="h-4 w-4 text-muted-foreground" />, color: "text-muted-foreground" },
  resubmit: { label: "Reenviar", icon: <AlertTriangle className="h-4 w-4 text-amber-500" />, color: "text-amber-500" },
};

export default function Uploads() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground">Documentos</h1>
      <p className="mt-1 text-muted-foreground">
        Envie seus documentos por categoria. Aceitos: PDF, JPG, PNG (máx. 10MB).
      </p>

      <div className="mt-4 rounded-lg border border-border bg-card p-4 shadow-card">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Dica:</strong> Documentos devem estar legíveis, sem cortes e em boa resolução. Escaneamentos são preferíveis a fotos.
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {documents.map((doc, i) => {
          const st = statusConfig[doc.status as keyof typeof statusConfig];
          return (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-card"
            >
              <div className="flex items-center gap-3">
                <File className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">{doc.name}</p>
                  <div className="flex items-center gap-1.5">
                    {st.icon}
                    <span className={`text-xs font-medium ${st.color}`}>{st.label}</span>
                    {doc.file && (
                      <span className="text-xs text-muted-foreground">— {doc.file}</span>
                    )}
                  </div>
                </div>
              </div>
              <Button size="sm" variant={doc.status === "resubmit" ? "default" : "outline"} className={doc.status === "resubmit" ? "bg-accent text-accent-foreground hover:bg-green-dark" : ""}>
                <UploadIcon className="mr-1 h-3.5 w-3.5" />
                {doc.status === "resubmit" ? "Reenviar" : "Upload"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
