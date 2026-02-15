export default function Refund() {
  return (
    <div className="py-16">
      <div className="container max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-foreground">Política de Reembolso</h1>
        <p className="mt-2 text-sm text-muted-foreground">Última atualização: Fevereiro de 2026</p>

        <div className="mt-8 space-y-6 text-sm text-foreground/80 leading-relaxed">
          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">1. Prazo de reembolso</h2>
            <p>Você pode solicitar reembolso em até 7 dias após a compra, desde que não tenha gerado o Pacote Final (PDF).</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">2. Condições</h2>
            <p>O reembolso está disponível quando: o Pacote Final não foi gerado, o prazo de 7 dias não foi excedido e o serviço não foi utilizado de forma abusiva.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">3. Como solicitar</h2>
            <p>Para solicitar reembolso, abra um ticket na Central de Ajuda (N1) selecionando a categoria "Como usar o sistema" e mencionando sua solicitação de reembolso.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">4. Processamento</h2>
            <p>O reembolso será processado na mesma forma de pagamento utilizada na compra, em até 10 dias úteis após a aprovação da solicitação.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground">5. Exceções</h2>
            <p>Não oferecemos reembolso após a geração do Pacote Final, após o prazo de 7 dias, ou em casos de uso abusivo da plataforma.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
