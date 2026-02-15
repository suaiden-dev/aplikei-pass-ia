import { Shield, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function Disclaimers() {
  return (
    <div className="py-16">
      <div className="container max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-foreground">Disclaimers</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Leia atentamente antes de utilizar a plataforma.
        </p>

        <div className="mt-8 space-y-6">
          <div className="rounded-xl border-2 border-amber-300/50 bg-amber-50/60 p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
              <Shield className="h-5 w-5 text-amber-600" />
              Natureza do serviço
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-foreground/80">
              <li className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <strong>Aplikei não é escritório de advocacia</strong> e não possui advogados em seu quadro prestando serviços jurídicos aos usuários.
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <strong>Não oferecemos aconselhamento jurídico</strong>, análise de elegibilidade, avaliação de chances ou estratégia imigratória.
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <strong>Não garantimos aprovação</strong> de vistos, extensões, trocas de status ou qualquer petição imigratória.
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <strong>Não representamos o cliente</strong> perante consulados americanos, USCIS ou qualquer órgão governamental.
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-lg font-bold text-foreground">O que a Aplikei oferece</h2>
            <ul className="mt-4 space-y-2 text-sm text-foreground/80">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                Guias digitais educacionais passo a passo para processos imigratórios simples.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                IA para organização de dados e documentos (não para análise jurídica).
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                Suporte humano exclusivamente operacional (N1): uso do sistema, upload, taxas, agendamento e status.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                Geração de pacote final (PDF) com checklist, resumo e instruções.
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-lg font-bold text-foreground">Suporte Humano — Limitações</h2>
            <p className="mt-3 text-sm text-foreground/80">
              O suporte humano é <strong>apenas operacional (N1)</strong> e se limita a:
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-foreground/80">
              <li>• Como usar o sistema</li>
              <li>• Onde subir documentos</li>
              <li>• Como pagar taxas</li>
              <li>• Como agendar</li>
              <li>• Como acompanhar status</li>
            </ul>
            <p className="mt-4 text-sm font-medium text-destructive">
              Não respondemos dúvidas de estratégia, elegibilidade, chances ou aconselhamento jurídico.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-lg font-bold text-foreground">Recomendação</h2>
            <p className="mt-3 text-sm text-foreground/80">
              Se o seu caso envolve complexidades (negativas anteriores, overstay, mudanças de empregador, situações legais específicas), recomendamos fortemente que você consulte um <strong>advogado de imigração licenciado</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
