import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../atoms/accordion";
import { Card } from "../atoms/card";
import { SectionHeader } from "../molecules/SectionHeader";
import { useT } from "@app/app/i18n";

export function LandingFAQ() {
  const t = useT("landing");

  if (!t.faq || !t.faq.items) return null;

  const faqItems = t.faq.items;

  return (
    <section className="bg-surface-container-lowest px-8 py-24 lg:px-16 lg:py-32">
      <div className="mx-auto max-w-4xl">
        <div className="mb-16 text-center flex flex-col items-center">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">FAQ</p>
          <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-text lg:text-5xl text-center">
            {t.faq.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-text-muted lg:text-base text-center">
            Respostas objetivas para reduzir atrito antes da conversão.
          </p>
        </div>

        <Accordion className="space-y-4" type="single" collapsible>
          {faqItems.map((item: { q: string; a: string }, idx: number) => (
            <AccordionItem key={`${item.q}-${idx}`} value={`item-${idx}`} className="border-0">
              <Card className="overflow-hidden p-0">
                <AccordionTrigger className="px-6 py-5 text-left text-lg font-bold text-text">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-0 text-base leading-relaxed text-text-muted">
                  {item.a}
                </AccordionContent>
              </Card>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

export const FAQSection = LandingFAQ;
