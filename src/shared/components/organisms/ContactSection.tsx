import { motion } from "framer-motion";
import { useState, type FormEvent } from "react";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { useLocale, useT } from "@app/app/i18n";
import { supabase } from "@shared/lib/supabase";
import { PublicButton } from "@shared/components/atoms/PublicButton";
import { toast } from "sonner";

const formCopy = {
  pt: {
    kicker: "Canais",
    title: "Fale com a Aplikei",
    description: "Envie uma mensagem com o contexto da sua operação. Nossa equipe retorna com o melhor próximo passo.",
    fields: {
      name: "Nome",
      email: "Email",
      subject: "Assunto",
      message: "Mensagem",
      namePlaceholder: "Seu nome",
      emailPlaceholder: "seu@email.com",
      subjectPlaceholder: "Como podemos ajudar?",
      messagePlaceholder: "Descreva sua operação ou dúvida",
    },
    button: "Enviar mensagem",
    sending: "Enviando...",
    required: "Preencha todos os campos.",
    success: "Mensagem enviada com sucesso.",
    error: "Não foi possível enviar sua mensagem agora.",
    channels: [
      { label: "Email", value: "contato@aplikei.com.br" },
      { label: "Telefone", value: "+55 (11) 99999-9999" },
      { label: "Localização", value: "São Paulo, SP - Brasil" },
    ],
  },
  en: {
    kicker: "Channels",
    title: "Talk to Aplikei",
    description: "Send a message with the context of your operation. Our team will return with the best next step.",
    fields: {
      name: "Name",
      email: "Email",
      subject: "Subject",
      message: "Message",
      namePlaceholder: "Your name",
      emailPlaceholder: "you@email.com",
      subjectPlaceholder: "How can we help?",
      messagePlaceholder: "Describe your operation or question",
    },
    button: "Send message",
    sending: "Sending...",
    required: "Fill in all fields.",
    success: "Message sent successfully.",
    error: "We could not send your message right now.",
    channels: [
      { label: "Email", value: "contato@aplikei.com.br" },
      { label: "Phone", value: "+55 (11) 99999-9999" },
      { label: "Location", value: "Sao Paulo, SP - Brazil" },
    ],
  },
  es: {
    kicker: "Canales",
    title: "Hable con Aplikei",
    description: "Envíe un mensaje con el contexto de su operación. Nuestro equipo responderá con el mejor próximo paso.",
    fields: {
      name: "Nombre",
      email: "Email",
      subject: "Asunto",
      message: "Mensaje",
      namePlaceholder: "Su nombre",
      emailPlaceholder: "usted@email.com",
      subjectPlaceholder: "¿Cómo podemos ayudar?",
      messagePlaceholder: "Describa su operación o duda",
    },
    button: "Enviar mensaje",
    sending: "Enviando...",
    required: "Complete todos los campos.",
    success: "Mensaje enviado con éxito.",
    error: "No fue posible enviar su mensaje ahora.",
    channels: [
      { label: "Email", value: "contato@aplikei.com.br" },
      { label: "Teléfono", value: "+55 (11) 99999-9999" },
      { label: "Ubicación", value: "Sao Paulo, SP - Brasil" },
    ],
  },
} as const;

const channelIcons = [Mail, Phone, MapPin];

type LandingContactCopy = {
  lex?: {
    cta?: {
      title?: string;
      description?: string;
      button?: string;
    };
  };
};

const inputClass =
  "w-full rounded-[14px] border border-border bg-bg-subtle px-4 py-3 text-[15px] text-text outline-none transition placeholder:text-text-muted focus:border-primary/45 focus:bg-card focus:ring-4 focus:ring-primary/10";
const labelClass = "flex flex-col gap-2";
const labelTextClass = "text-xs font-black uppercase tracking-[0.14em] text-text-muted";

export function ContactSection() {
  const landing = useT("landing") as LandingContactCopy;
  const { lang } = useLocale();
  const copy = formCopy[lang as keyof typeof formCopy] ?? formCopy.pt;
  const legacyCta = landing?.lex?.cta;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      toast.error(copy.required);
      return;
    }

    setIsSending(true);
    try {
      const { error } = await supabase.functions.invoke("contact-form", {
        body: {
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
        },
      });

      if (error) throw error;
      toast.success(copy.success);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {
      toast.error(copy.error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section id="contato" className="public-section bg-bg-subtle">
      <div className="public-container grid items-start gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">{copy.kicker}</p>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-text lg:text-5xl">{legacyCta?.title ?? copy.title}</h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-text-muted">{legacyCta?.description ?? copy.description}</p>

          <div id="canais" className="mt-8 grid gap-3">
            {copy.channels.map((channel, index) => {
              const Icon = channelIcons[index] ?? Mail;
              return (
                <article key={channel.label} className="grid grid-cols-[auto_1fr] items-center gap-4 rounded-[20px] border border-border bg-card p-4 shadow-sm">
                  <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <strong className="block text-xs font-black uppercase tracking-[0.14em] text-text-muted">{channel.label}</strong>
                    <p className="mt-1 break-words font-bold text-text">{channel.value}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.45 }}
          className="rounded-[26px] border border-border bg-card p-6 shadow-xl lg:p-9"
        >
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                <span className={labelTextClass}>{copy.fields.name}</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={copy.fields.namePlaceholder}
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                <span className={labelTextClass}>{copy.fields.email}</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={copy.fields.emailPlaceholder}
                  className={inputClass}
                />
              </label>
            </div>
            <label className={labelClass}>
              <span className={labelTextClass}>{copy.fields.subject}</span>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={copy.fields.subjectPlaceholder}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              <span className={labelTextClass}>{copy.fields.message}</span>
              <textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={copy.fields.messagePlaceholder}
                className={`${inputClass} min-h-40 resize-y`}
              />
            </label>
            <PublicButton
              asChild={false}
              type="submit"
              tone="solid"
              size="lg"
              className="mt-1 w-full disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSending}
            >
              {isSending ? copy.sending : legacyCta?.button ?? copy.button}
              <ArrowRight className="h-4 w-4" />
            </PublicButton>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
