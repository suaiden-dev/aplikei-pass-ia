import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, Shield, Send } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const operationalFAQ = [
  { q: "Como faço upload de documentos?", a: "Vá em Documentos no menu lateral, clique no botão Upload ao lado de cada documento e selecione o arquivo (PDF, JPG ou PNG, máx. 10MB)." },
  { q: "Como pago as taxas consulares/USCIS?", a: "O guia inclui instruções detalhadas sobre como pagar as taxas. Geralmente é feito no site oficial do consulado ou USCIS. A Aplikei não processa essas taxas." },
  { q: "Como agendar a entrevista no consulado?", a: "Após pagar a taxa MRV, acesse o site do CASV para agendar. O guia explica o passo a passo." },
  { q: "Como acompanho o status do meu processo?", a: "Se aplicável, você pode verificar o status no site do USCIS com seu receipt number. O guia explica como." },
  { q: "Como usar o chat da IA?", a: "Clique em 'Chat IA' no menu lateral. A IA responde perguntas sobre organização de dados e documentos. Ela não oferece aconselhamento jurídico." },
];

const categories = [
  "Como usar o sistema",
  "Onde subir documentos",
  "Como pagar taxas",
  "Como agendar",
  "Como acompanhar status",
];

export default function HelpCenter() {
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground">Central de Ajuda (N1)</h1>
      <p className="mt-1 text-muted-foreground">
        Suporte humano apenas operacional: uso da plataforma e passos básicos.
      </p>

      {/* Warning */}
      <div className="mt-4 rounded-lg border-2 border-amber-300/50 bg-amber-50/60 p-4">
        <div className="flex items-start gap-2">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs text-foreground/70">
            <strong>Importante:</strong> Não respondemos dúvidas de estratégia, elegibilidade, chances ou aconselhamento jurídico. Apenas questões operacionais sobre uso da plataforma.
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold text-foreground">Perguntas frequentes</h2>
        <Accordion type="single" collapsible className="mt-4">
          {operationalFAQ.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-sm font-medium text-foreground">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Ticket form */}
      <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-card">
        <h2 className="font-display text-lg font-semibold text-foreground">Abrir ticket de ajuda</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Selecione a categoria e descreva sua dúvida operacional.
        </p>
        <form className="mt-4 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <Label>Categoria (obrigatória)</Label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Selecione...</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Sua dúvida</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Descreva sua dúvida operacional..."
              className="mt-1"
              rows={4}
            />
          </div>
          <Button
            type="submit"
            disabled={!category || !message.trim()}
            className="bg-accent text-accent-foreground hover:bg-green-dark disabled:opacity-50"
          >
            <Send className="mr-1 h-4 w-4" /> Enviar ticket
          </Button>
        </form>
      </div>
    </div>
  );
}
