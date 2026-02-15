import { Button } from "@/components/ui/button";
import { FileText, Download, Clock, Shield } from "lucide-react";

const pdfHistory = [
  { version: "v1.0", date: "2026-02-10", status: "Rascunho" },
];

export default function PackagePDF() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground">Pacote Final (PDF)</h1>
      <p className="mt-1 text-muted-foreground">
        Gere seu PDF com checklist final, resumo do caso e instruções dos próximos passos.
      </p>

      {/* Disclaimer */}
      <div className="mt-4 rounded-lg border-2 border-amber-300/50 bg-amber-50/60 p-4">
        <div className="flex items-start gap-2">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs text-foreground/70">
            O Pacote Final é um resumo organizacional. Não constitui aconselhamento jurídico e não garante aprovação.
          </p>
        </div>
      </div>

      {/* Generate button */}
      <div className="mt-6 rounded-xl border border-border bg-card p-8 text-center shadow-card">
        <FileText className="mx-auto h-12 w-12 text-accent" />
        <h2 className="mt-4 font-display text-lg font-semibold text-foreground">Gerar Pacote Final</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Complete o onboarding para gerar seu PDF personalizado.
        </p>
        <Button
          className="mt-6 bg-accent text-accent-foreground shadow-button hover:bg-green-dark"
          disabled
        >
          Gerar PDF (complete o onboarding)
        </Button>
      </div>

      {/* PDF content preview */}
      <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-card">
        <h3 className="font-display font-semibold text-foreground">O que o PDF contém:</h3>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> Checklist final de documentos
          </li>
          <li className="flex items-start gap-2">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> Resumo do caso (dados fornecidos)
          </li>
          <li className="flex items-start gap-2">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> Instruções dos próximos passos
          </li>
          <li className="flex items-start gap-2">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> Modelos de cartas (quando aplicável)
          </li>
        </ul>
      </div>

      {/* History */}
      <div className="mt-6">
        <h3 className="font-display font-semibold text-foreground">Histórico de PDFs</h3>
        <div className="mt-3 space-y-2">
          {pdfHistory.map((pdf, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Pacote Final — {pdf.version}</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{pdf.date}</span>
                    <span className="text-xs text-muted-foreground">• {pdf.status}</span>
                  </div>
                </div>
              </div>
              <Button size="sm" variant="outline" disabled>
                <Download className="mr-1 h-3.5 w-3.5" /> Baixar
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
