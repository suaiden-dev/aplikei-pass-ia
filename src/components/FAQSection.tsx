import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./Accordion";
import { useT } from "../i18n";

export const FAQSection = () => {
  const t = useT("landing");
  const faqItems = t.faq?.items || [];

  return (
    <section className="py-40 px-8 lg:px-16 bg-bg-subtle">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl lg:text-5xl font-extrabold text-center mb-24 text-primary leading-tight">
          {t.faq?.title}
        </h2>
        <Accordion className="space-y-6" type="single" collapsible>
          {faqItems.map((item: { q: string; a: string }, idx: number) => (
            <AccordionItem
              key={idx}
              value={`item-${idx}`}
              className="bg-card px-8 py-4 rounded-3xl border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              <AccordionTrigger className="text-xl font-bold text-text hover:text-primary transition-colors text-left">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-lg text-text-muted leading-relaxed font-medium pt-4">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
