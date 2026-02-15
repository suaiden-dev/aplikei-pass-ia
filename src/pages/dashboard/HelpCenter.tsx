import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Send } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanguage } from "@/i18n/LanguageContext";

export default function HelpCenter() {
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const { lang, t } = useLanguage();
  const h = t.helpCenter;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground">{h.title[lang]}</h1>
      <p className="mt-1 text-muted-foreground">{h.subtitle[lang]}</p>

      <div className="mt-4 rounded-lg border-2 border-amber-300/50 bg-amber-50/60 p-4">
        <div className="flex items-start gap-2">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs text-foreground/70"><strong>{lang === "en" ? "Important:" : lang === "pt" ? "Importante:" : "Importante:"}</strong> {h.warning[lang]}</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-foreground">{h.faqTitle[lang]}</h2>
        <Accordion type="single" collapsible className="mt-4">
          {h.faqItems.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-sm font-medium text-foreground">{item.q[lang]}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{item.a[lang]}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-card">
        <h2 className="font-display text-lg font-semibold text-foreground">{h.ticketTitle[lang]}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{h.ticketSubtitle[lang]}</p>
        <form className="mt-4 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <Label>{h.category[lang]}</Label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">{h.selectCategory[lang]}</option>
              {h.categories[lang].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <Label>{h.yourQuestion[lang]}</Label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={h.questionPlaceholder[lang]} className="mt-1" rows={4} />
          </div>
          <Button type="submit" disabled={!category || !message.trim()} className="bg-accent text-accent-foreground hover:bg-green-dark disabled:opacity-50">
            <Send className="mr-1 h-4 w-4" /> {h.submit[lang]}
          </Button>
        </form>
      </div>
    </div>
  );
}
