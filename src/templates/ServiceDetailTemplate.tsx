import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/Accordion";
import { Button } from "../components/Button";
import { ServiceCTA } from "../components/ServiceCTA";
import type { IconType } from "react-icons";
import {
  MdVerified, MdGroupAdd, MdCheckCircle, MdCheck, MdCancel, MdClose, MdInfo,
  MdDescription, MdEditNote, MdPayments, MdRecordVoiceOver, MdFactCheck, MdHistory, MdArticle,
} from "react-icons/md";
import { FiArrowRight } from "react-icons/fi";
import { useT } from "../i18n";
import type { ServiceMeta } from "../data/services";
import { getCustomerProcessStartPath } from "../utils/customer-process-start";

const includedIcons: IconType[] = [MdDescription, MdEditNote, MdPayments, MdRecordVoiceOver, MdFactCheck, MdHistory];

export interface StepConfig {
  id: string;
  title: string;
  description: string;
  type: "info" | "form" | "upload" | "review" | "admin_action";
  actionLabel?: string;
}

export interface ServiceData {
  slug: string;
  title: string;
  subtitle: string;
  price: string;
  originalPrice: string;
  dependentPrice: string;
  description: string;
  forWhom: string[];
  notForWhom: string[];
  included: string[];
  requirements: string[];
  steps: StepConfig[];
  faq: { q: string; a: string }[];
}

interface ServiceDetailTemplateProps {
  service: ServiceMeta | null;
  heroImage: string;
  successRate?: string;
  processType: string;
  HeroIcon?: IconType;
}

export default function ServiceDetailTemplate({
  service,
  heroImage,
  successRate = "98.4%",
  processType,
  HeroIcon = MdVerified,
}: ServiceDetailTemplateProps) {
  const tServices = useT("services");
  const labels = tServices.serviceDetail as Record<string, unknown>;

  if (!service) return <Navigate to="/" replace />;

  const str = (key: string, fallback = "") => (labels?.[key] as string) ?? fallback;
  const arr = (key: string): { title: string; desc: string }[] =>
    (labels?.[key] as { title: string; desc: string }[]) ?? [];
  const startPath = getCustomerProcessStartPath(service.slug);

  return (
    <div className="bg-card text-text antialiased overflow-x-hidden">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 lg:px-20 py-12 lg:py-24">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 lg:gap-20 items-center text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center lg:items-start gap-8"
          >
            <div className="space-y-6">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs font-extrabold uppercase tracking-widest rounded-full">
                {processType}
              </span>
              <h1 className="text-primary text-4xl sm:text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight">
                {service.title}
              </h1>
              <p className="text-text-muted text-lg lg:text-2xl font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {service.subtitle}
              </p>
            </div>
            <div className="flex flex-col items-center lg:items-start gap-6">
              <div className="flex items-baseline gap-4 justify-center lg:justify-start">
                <span className="text-4xl sm:text-5xl font-black text-primary">{service.price}</span>
                <span className="text-xl text-text-muted line-through font-bold">{service.originalPrice}</span>
              </div>
              <div className="flex items-center gap-4 p-5 bg-card border border-border rounded-2xl shadow-sm max-w-sm text-left">
                <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center shrink-0">
                  <MdGroupAdd className="text-primary text-2xl" />
                </div>
                <div>
                  <p className="text-primary font-bold text-sm">+{service.dependentPrice} {str("perDependent", "por dependente")}</p>
                  <p className="text-text-muted text-xs font-medium">{str("dependentsDesc")}</p>
                </div>
              </div>
            </div>
            <Link to={startPath} className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:px-12 py-8 bg-highlight text-white rounded-xl text-xl font-black hover:shadow-2xl hover:-translate-y-1 transition-all border-none flex items-center justify-center gap-2">
                {str("getStarted", "Começar Agora")}
                <FiArrowRight size={22} />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[4/5] md:aspect-square bg-bg-subtle rounded-[2.5rem] overflow-hidden shadow-2xl relative border border-border/50">
              <img src={heroImage} alt={service.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-primary/5"></div>
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 lg:left-[-24px] lg:translate-x-0 bg-card p-6 rounded-3xl shadow-2xl border border-border min-w-[200px] lg:min-w-0">
              <div className="flex items-center gap-4 text-left">
                <div className="bg-green-100 p-2 rounded-full shrink-0">
                  <HeroIcon className="text-green-600 text-3xl" />
                </div>
                <div>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider">{str("successRate", "Taxa de Sucesso")}</p>
                  <p className="text-2xl font-black text-primary">{successRate}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Overview */}
      <section className="bg-bg-subtle py-24 px-6 lg:px-20 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 bg-card p-8 lg:p-14 rounded-[2.5rem] shadow-sm border border-border text-center lg:text-left"
          >
            <h2 className="text-3xl lg:text-4xl font-black text-primary mb-8">{str("overview", "Visão Geral")}</h2>
            <p className="text-text-muted text-lg lg:text-xl leading-relaxed max-w-4xl mx-auto lg:mx-0 font-medium italic">
              {service.description}
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-10 text-left">
            <div className="bg-primary/5 p-10 rounded-[2.5rem] border border-primary/10">
              <h3 className="text-2xl font-bold text-primary mb-8 flex items-center gap-3">
                <MdCheckCircle className="text-green-600 text-3xl" />
                {str("forWhom", "Para quem é")}
              </h3>
              <ul className="space-y-5">
                {service.forWhom.map((item: string, i: number) => (
                  <li key={i} className="flex gap-4 text-text text-base font-bold">
                    <MdCheck className="text-green-600 shrink-0 text-xl mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-red-50/50 p-10 rounded-[2.5rem] border border-red-100">
              <h3 className="text-2xl font-bold text-red-900 mb-8 flex items-center gap-3">
                <MdCancel className="text-red-500 text-3xl" />
                {str("notForWhom", "Para quem não é")}
              </h3>
              <ul className="space-y-5">
                {service.notForWhom.map((item: string, i: number) => (
                  <li key={i} className="flex gap-4 text-red-800/80 text-base font-medium">
                    <MdClose className="text-red-500 shrink-0 text-xl mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Included */}
      <section className="max-w-7xl mx-auto px-6 lg:px-20 py-24">
        <div className="text-center mb-20 text-balance">
          <h2 className="text-4xl lg:text-5xl font-black text-primary mb-6">{str("included", "O que está incluído")}</h2>
          <div className="w-24 h-2 bg-primary mx-auto rounded-full"></div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
          {service.included.slice(0, 4).map((item: string, i: number) => {
            const parts = item.split(": ");
            const Icon = includedIcons[i] ?? MdArticle;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className="p-6 sm:p-8 lg:p-10 bg-card rounded-[2rem] border border-border hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 flex flex-col items-start group"
              >
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-8 mx-auto lg:mx-0 group-hover:bg-primary group-hover:text-white transition-all">
                  <Icon className="text-3xl" />
                </div>
                {parts.length > 1 ? (
                  <>
                    <h4 className="font-bold text-xl mb-4 text-text leading-tight">{parts[0]}</h4>
                    <p className="text-sm text-text-muted leading-relaxed font-medium">{parts[1]}</p>
                  </>
                ) : (
                  <h4 className="font-bold text-xl mb-4 text-text leading-tight">{item}</h4>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Journey steps */}
      <section className="max-w-7xl mx-auto px-6 lg:px-20 py-32 text-left">
        <div className="text-center mb-24">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-primary mb-6">
            {str("steps", "Sua jornada em 6 passos simples")}
          </h2>
          <p className="text-text-muted text-lg lg:text-xl font-medium">Do cadastro ao pacote final, cuidamos de cada detalhe para você.</p>
        </div>
        <div className="relative space-y-14 max-w-4xl mx-auto">
          <div className="absolute left-[24px] top-4 bottom-4 w-1.5 bg-border rounded-full"></div>
          {arr("journeySteps").map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative flex gap-10 group"
            >
              <div className="z-10 w-12 h-12 shrink-0 rounded-2xl bg-primary flex items-center justify-center text-white font-extrabold shadow-xl shadow-primary/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                {i + 1}
              </div>
              <div className="pt-1.5">
                <h4 className="font-black text-2xl mb-2 text-text leading-tight">{step.title}</h4>
                <p className="text-text-muted text-lg leading-relaxed italic font-medium">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <ServiceCTA visaType={service.title} checkoutUrl={startPath} slug={service.slug} />

      {/* FAQ */}
      <section className="bg-bg-subtle py-32 px-6 lg:px-20 text-left border-t border-border">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-black text-primary mb-16 text-center"
          >
            {str("faq", "Perguntas Frequentes")}
          </motion.h2>
          <Accordion type="single" collapsible className="space-y-6">
            {service.faq.map((item: { q: string; a: string }, i: number) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-card border border-border rounded-[1.5rem] px-3 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <AccordionTrigger className="w-full flex items-center justify-between p-8 text-left font-black text-xl text-text hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="p-8 pt-0 text-text-muted text-lg leading-relaxed border-t border-border font-medium italic">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-24 p-10 bg-amber-50 border-l-[6px] border-amber-400 rounded-r-[2.5rem] text-left shadow-sm"
          >
            <div className="flex gap-6">
              <MdInfo className="text-amber-600 text-3xl shrink-0 mt-1" />
              <div className="text-base text-slate-700">
                <p className="font-black text-xl mb-4 text-amber-900 uppercase tracking-tighter">{str("legalDisclaimer", "Aviso Legal")}</p>
                <p className="leading-relaxed italic font-medium opacity-80">{str("disclaimer")}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-card/80 backdrop-blur-md border-t border-border md:hidden z-50">
        <Link to={startPath}>
          <Button className="w-full bg-primary text-white font-bold py-6 rounded-xl shadow-lg shadow-primary/20 border-none">
            {str("getStarted", "Começar Agora")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
