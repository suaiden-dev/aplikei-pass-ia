import { useT } from "@/i18n/LanguageContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/presentation/components/atoms/accordion";

interface FAQSectionProps {}

export const FAQSection = ({}: FAQSectionProps) => {
  const t = useT("landing");

  return (
    <section className="py-40 px-8 lg:px-16 bg-cloud-grey">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-extrabold text-center mb-32 text-primary">
          {t.faq.title}
        </h2>
        <Accordion type="single" collapsible className="space-y-8">
          {t.faq.items.map((item: any, idx: number) => (
            <AccordionItem 
              key={`faq-${idx}`} 
              value={`faq-${idx}`} 
              className={`bg-white rounded-2xl border ${idx === 2 ? 'border-2 border-primary/20 shadow-md' : 'border-slate-200 shadow-sm'} overflow-hidden hover:shadow-md transition-shadow`}
            >
              <AccordionTrigger className={`w-full flex items-center justify-between p-10 text-left ${idx === 2 ? 'bg-slate-50' : ''} hover:bg-slate-50 transition-colors font-bold text-xl text-primary hover:no-underline group`}>
                <span>{item.q}</span>
              </AccordionTrigger>
              <AccordionContent className={`px-10 pb-10 text-slate-600 leading-relaxed text-lg font-medium ${idx === 2 ? 'bg-slate-50' : ''}`}>
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
