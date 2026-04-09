import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./Accordion";

export const FAQSection = () => {
  const faqItems = [
    {
      q: "Quanto tempo tenho acesso à ferramenta de IA?",
      a: "Você tem acesso por 90 dias a partir da compra — tempo suficiente para reunir seus documentos e montar seu pacote."
    },
    {
      q: "Quais tipos de visto vocês cobrem atualmente?",
      a: "Atualmente temos guias para vistos americanos de Turismo (B1/B2), Estudante (F-1) e Visitante de Intercâmbio (J-1). Estamos trabalhando para adicionar mais!"
    },
    {
      q: "Eu ainda preciso de um advogado?",
      a: "Nós não somos um escritório de advocacia e não podemos oferecer assessoria jurídica. Nosso serviço é de organização e orientação. Se seu caso é complexo (ex: negativas anteriores, questões legais), sempre recomendamos consultar um advogado de imigração qualificado."
    },
    {
      q: "A Aplikei garante a aprovação do visto?",
      a: "Não. A decisão final cabe exclusivamente ao consulado americano ou USCIS. Nossa plataforma garante que sua documentação esteja organizada e completa de acordo com as exigências oficiais, aumentando suas chances de sucesso pela clareza do pedido."
    }
  ];

  return (
    <section className="py-40 px-8 lg:px-16 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl lg:text-5xl font-extrabold text-center mb-24 text-primary leading-tight">Perguntas frequentes</h2>
        <Accordion className="space-y-6" type="single" collapsible>
          {faqItems.map((item, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`} className="bg-white px-8 py-4 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <AccordionTrigger className="text-xl font-bold text-slate-700 hover:text-primary transition-colors text-left">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-lg text-slate-500 leading-relaxed font-medium pt-4">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
