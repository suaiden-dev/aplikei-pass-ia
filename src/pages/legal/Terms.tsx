import { Shield } from "lucide-react";

export default function Terms() {
  return (
    <div className="py-16">
      <div className="container max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-foreground">Termos de Uso</h1>
        <p className="mt-2 text-sm text-muted-foreground">Última atualização: Fevereiro de 2026</p>

        <div className="mt-8 space-y-6 text-sm text-foreground/80 leading-relaxed">
          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">1. Sobre a Aplikei</h2>
            <p>A Aplikei é uma plataforma digital que oferece guias passo a passo com auxílio de inteligência artificial para processos imigratórios simples. A Aplikei <strong>não é escritório de advocacia</strong>, não oferece aconselhamento jurídico e não garante aprovação de vistos ou petições.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">2. Serviços oferecidos</h2>
            <p>Ao adquirir um guia, o usuário recebe: guia digital passo a passo, acesso à IA durante o processo (bônus), suporte humano N1 operacional (bônus) e geração de pacote final em PDF. O suporte humano é <strong>estritamente operacional</strong> e limitado a: uso do sistema, upload de documentos, pagamento de taxas, agendamentos e acompanhamento de status.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">3. Limitações</h2>
            <p>A Aplikei não: analisa elegibilidade, oferece estratégia, avalia chances de aprovação, preenche formulários oficiais, representa o cliente perante consulado ou USCIS, ou fornece qualquer tipo de aconselhamento jurídico.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">4. Responsabilidade do usuário</h2>
            <p>O usuário é responsável pela veracidade das informações fornecidas, pelo preenchimento dos formulários oficiais, pela submissão da aplicação e pelo comparecimento a entrevistas. A Aplikei não se responsabiliza por decisões tomadas com base no conteúdo educacional fornecido.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">5. Privacidade e dados</h2>
            <p>Os dados fornecidos são protegidos conforme nossa Política de Privacidade. A Aplikei utiliza criptografia e boas práticas de segurança para proteger informações pessoais.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">6. Reembolso</h2>
            <p>Consulte nossa Política de Reembolso para informações detalhadas sobre cancelamentos e devoluções.</p>
          </section>

          <div className="rounded-lg border-2 border-amber-300/50 bg-amber-50/60 p-4">
            <div className="flex items-start gap-2">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-xs text-foreground/70">
                Ao utilizar a Aplikei, você declara ter lido e concordado com estes Termos de Uso, a Política de Privacidade e os Disclaimers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
