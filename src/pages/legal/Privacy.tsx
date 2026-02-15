export default function Privacy() {
  return (
    <div className="py-16">
      <div className="container max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-foreground">Política de Privacidade</h1>
        <p className="mt-2 text-sm text-muted-foreground">Última atualização: Fevereiro de 2026</p>

        <div className="mt-8 space-y-6 text-sm text-foreground/80 leading-relaxed">
          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">1. Dados coletados</h2>
            <p>Coletamos: dados de cadastro (nome, e-mail), dados do processo imigratório (informações pessoais, documentos), dados de uso da plataforma e dados de pagamento (processados por terceiros seguros).</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">2. Uso dos dados</h2>
            <p>Seus dados são utilizados para: fornecer o serviço contratado, personalizar o guia e o pacote final, processar pagamentos, fornecer suporte operacional e melhorar a plataforma.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">3. Compartilhamento</h2>
            <p>Não vendemos dados pessoais. Compartilhamos apenas com: processadores de pagamento, serviços de infraestrutura (hospedagem, banco de dados) e quando exigido por lei.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">4. Segurança</h2>
            <p>Utilizamos criptografia em trânsito e em repouso, controles de acesso e boas práticas de segurança da informação para proteger seus dados.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">5. Seus direitos</h2>
            <p>Você pode solicitar acesso, correção ou exclusão dos seus dados pessoais a qualquer momento através do canal de contato da plataforma.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">6. Cookies</h2>
            <p>Utilizamos cookies essenciais para o funcionamento da plataforma e cookies de análise para melhorar a experiência do usuário.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
