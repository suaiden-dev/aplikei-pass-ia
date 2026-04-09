import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/Accordion";
import { Button } from "../components/Button";
import { ServiceCTA } from "../components/ServiceCTA";
import type { IconType } from "react-icons";
import {
  MdVerified, MdGroupAdd, MdCheckCircle, MdCheck, MdCancel, MdClose, MdInfo,
  MdDescription, MdEditNote, MdPayments, MdRecordVoiceOver, MdFactCheck, MdHistory,
  MdAssignment, MdBadge, MdAccountBalance, MdReceiptLong, MdSchool, MdFlight, MdAccountBalanceWallet, MdArticle,
} from "react-icons/md";
import { FiArrowRight } from "react-icons/fi";
import { FaPassport } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import { processService } from "../services/process.service";

export interface StepConfig {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'form' | 'upload' | 'review' | 'admin_action';
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
  service: ServiceData | null;
  heroImage: string;
  successRate?: string;
  processType: string;
  HeroIcon?: IconType;
}

const includedIcons: IconType[] = [
  MdDescription, MdEditNote, MdPayments, MdRecordVoiceOver, MdFactCheck, MdHistory,
];

const requirementIcons: IconType[] = [
  FaPassport, MdAssignment, MdBadge, MdAccountBalance, MdDescription,
  MdReceiptLong, MdSchool, MdFlight, MdAccountBalanceWallet,
];

const labels = {
  perDependent: "por dependente",
  dependentsDesc: "Adicione dependentes ao seu processo",
  getStarted: "Começar agora",
  successRate: "Taxa de Sucesso",
  overview: "Visão Geral",
  forWhom: "Para quem é este guia?",
  notForWhom: "Para quem NÃO é?",
  included: "O que está incluído",
  requirements: "Documentos Necessários",
  prepareDocs: "Prepare sua documentação com antecedência.",
  steps: "Passo a Passo do Processo",
  guidedJourney: "Uma jornada guiada do início ao fim.",
  faq: "Perguntas Frequentes",
  legalDisclaimer: "Aviso Legal Importante",
  disclaimer:
    "A Aplikei não é um escritório de advocacia e não oferece assessoria jurídica. Nossos guias são informativos. A decisão final sobre vistos é exclusiva das autoridades consulares e do USCIS.",
};

export default function ServiceDetailTemplate({
  service,
  heroImage,
  successRate = "98.4%",
  processType,
  HeroIcon = MdVerified,
}: ServiceDetailTemplateProps) {
  const { user } = useAuth();
  const [hasActiveProcess, setHasActiveProcess] = useState(false);

  useEffect(() => {
    if (user) {
      processService.hasAnyActiveProcess(user.id).then(({ hasActive }) => {
        setHasActiveProcess(hasActive);
      });
    }
  }, [user]);

  if (!service) return <Navigate to="/servicos" replace />;

  return (
    <div className="bg-white text-slate-900 antialiased overflow-x-hidden">
      {/* Hero Section */}
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
              <p className="text-slate-600 text-lg lg:text-2xl font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {service.subtitle}
              </p>
            </div>

            <div className="flex flex-col items-center lg:items-start gap-6">
              <div className="flex items-baseline gap-4 justify-center lg:justify-start">
                <span className="text-4xl sm:text-5xl font-black text-primary">{service.price}</span>
                <span className="text-xl text-slate-400 line-through font-bold">{service.originalPrice}</span>
              </div>
              <div className="flex items-center gap-4 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm max-w-sm text-left">
                <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center shrink-0">
                  <MdGroupAdd className="text-primary text-2xl" />
                </div>
                <div>
                  <p className="text-primary font-bold text-sm">+{service.dependentPrice} {labels.perDependent}</p>
                  <p className="text-slate-500 text-xs font-medium">{labels.dependentsDesc}</p>
                </div>
              </div>
            </div>

            {hasActiveProcess ? (
              <Button size="lg" disabled className="w-full sm:px-12 py-8 bg-slate-200 text-slate-500 rounded-xl text-xl font-black transition-all border-none flex items-center justify-center gap-2 cursor-not-allowed">
                Conclua seu processo atual primeiro
              </Button>
            ) : (
              <Link to={`/checkout/${service.slug}`} className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:px-12 py-8 bg-highlight text-white rounded-xl text-xl font-black hover:shadow-2xl hover:shadow-highlight/40 hover:translate-y-[-4px] transition-all border-none flex items-center justify-center gap-2">
                  {labels.getStarted}
                  <FiArrowRight size={22} />
                </Button>
              </Link>
            )}
          </motion.div>

          {/* Right side Image & Badge */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[4/5] md:aspect-square bg-slate-100 rounded-[2.5rem] overflow-hidden shadow-2xl relative border border-slate-100/50">
              <img
                src={heroImage}
                alt={service.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-primary/5"></div>
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 lg:left-[-24px] lg:translate-x-0 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 min-w-[200px] lg:min-w-0">
              <div className="flex items-center gap-4 text-left">
                <div className="bg-green-100 p-2 rounded-full shrink-0">
                  <HeroIcon className="text-green-600 text-3xl" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{labels.successRate}</p>
                  <p className="text-2xl font-black text-primary">{successRate}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="bg-slate-50/50 py-24 px-6 lg:px-20 border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 bg-white p-8 lg:p-14 rounded-[2.5rem] shadow-sm border border-slate-100 text-center lg:text-left"
          >
            <h2 className="text-3xl lg:text-4xl font-black text-primary mb-8">{labels.overview}</h2>
            <p className="text-slate-600 text-lg lg:text-xl leading-relaxed max-w-4xl mx-auto lg:mx-0 font-medium italic">
              {service.description}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-10 text-left">
            <div className="bg-primary/5 p-10 rounded-[2.5rem] border border-primary/10">
              <h3 className="text-2xl font-bold text-primary mb-8 flex items-center gap-3">
                <MdCheckCircle className="text-green-600 text-3xl" />
                {labels.forWhom}
              </h3>
              <ul className="space-y-5">
                {service.forWhom.map((item, i) => (
                  <li key={i} className="flex gap-4 text-slate-700 text-base font-bold">
                    <MdCheck className="text-green-600 shrink-0 text-xl mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-red-50/50 p-10 rounded-[2.5rem] border border-red-100">
              <h3 className="text-2xl font-bold text-red-900 mb-8 flex items-center gap-3">
                <MdCancel className="text-red-500 text-3xl" />
                {labels.notForWhom}
              </h3>
              <ul className="space-y-5">
                {service.notForWhom.map((item, i) => (
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

      {/* What's Included */}
      <section className="max-w-7xl mx-auto px-6 lg:px-20 py-24">
        <div className="text-center mb-20 text-balance">
          <h2 className="text-4xl lg:text-5xl font-black text-primary mb-6">{labels.included}</h2>
          <div className="w-24 h-2 bg-primary mx-auto rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
          {service.included.slice(0, 4).map((item, i) => {
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
                className="p-6 sm:p-8 lg:p-10 bg-white rounded-[2rem] border border-slate-100 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 flex flex-col items-start group"
              >
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-8 mx-auto lg:mx-0 group-hover:bg-primary group-hover:text-white transition-all">
                  <Icon className="text-3xl" />
                </div>
                {parts.length > 1 ? (
                  <>
                    <h4 className="font-bold text-xl mb-4 text-slate-900 leading-tight">{parts[0]}</h4>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">{parts[1]}</p>
                  </>
                ) : (
                  <h4 className="font-bold text-xl mb-4 text-slate-900 leading-tight">{item}</h4>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>


      {/* Step Journey Process */}
      <section className="max-w-7xl mx-auto px-6 lg:px-20 py-32 text-left">
        <div className="text-center mb-24">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-primary mb-6">
            {labels.steps}
          </h2>
          <p className="text-slate-600 text-lg lg:text-xl font-medium">{labels.guidedJourney}</p>
        </div>

        <div className="relative space-y-14 max-w-4xl mx-auto">
          <div className="absolute left-[24px] top-4 bottom-4 w-1.5 bg-slate-100 rounded-full"></div>
          {service.steps.map((step, i) => {
            return (
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
                  <h4 className="font-black text-2xl mb-2 text-slate-900 leading-tight">{step.title}</h4>
                  <p className="text-slate-500 text-lg leading-relaxed italic font-medium">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Conversion CTA */}
      <ServiceCTA 
        visaType={service.title} 
        checkoutUrl={hasActiveProcess ? "#" : `/checkout/${service.slug}`} 
      />

      {/* FAQ Section */}
      <section className="bg-slate-50 py-32 px-6 lg:px-20 text-left border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-black text-primary mb-16 text-center"
          >
            {labels.faq}
          </motion.h2>
          <Accordion type="single" collapsible className="space-y-6">
            {service.faq.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-white border border-slate-200 rounded-[1.5rem] px-3 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <AccordionTrigger className="w-full flex items-center justify-between p-8 text-left font-black text-xl text-slate-800 hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="p-8 pt-0 text-slate-600 text-lg leading-relaxed border-t border-slate-50 font-medium italic">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Legal Disclaimer Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-24 p-10 bg-amber-50 border-l-[6px] border-amber-400 rounded-r-[2.5rem] text-left shadow-sm"
          >
            <div className="flex gap-6">
              <MdInfo className="text-amber-600 text-3xl shrink-0 mt-1" />
              <div className="text-base text-slate-700">
                <p className="font-black text-xl mb-4 text-amber-900 uppercase tracking-tighter">{labels.legalDisclaimer}</p>
                <p className="leading-relaxed italic font-medium opacity-80">{labels.disclaimer}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 md:hidden z-50">
        {hasActiveProcess ? (
           <Button disabled className="w-full bg-slate-200 text-slate-500 font-bold py-6 rounded-xl border-none">
             Conclua processo atual
           </Button>
        ) : (
          <Link to={`/checkout/${service.slug}`}>
            <Button className="w-full bg-primary text-white font-bold py-6 rounded-xl shadow-lg shadow-primary/20 border-none">
              {labels.getStarted}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
