import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/presentation/components/atoms/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/presentation/components/atoms/accordion";
import { useLanguage } from "@/i18n/LanguageContext";
import { translations } from "@/i18n/translations";
import { ServiceCTA } from "@/presentation/components/organisms/ServiceCTA";

interface ServiceDetailTemplateProps {
  slug: string;
  heroImage: string;
  successRate?: string;
  processType: {
    en: string;
    pt: string;
    es: string;
  };
  heroIcon?: string;
}

export default function ServiceDetailTemplate({ 
  slug, 
  heroImage, 
  successRate = "98.4%", 
  processType,
  heroIcon = "verified"
}: ServiceDetailTemplateProps) {
  const { lang, t } = useLanguage();
  const p = t.serviceDetail;

  const service = t.servicesData.find((s) => s.slug === slug);
  
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
                {processType[lang]}
              </span>
              <h1 className="text-primary text-4xl sm:text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight">
                {service.title[lang]}
              </h1>
              <p className="text-slate-600 text-lg lg:text-2xl font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {service.subtitle[lang]}
              </p>
            </div>
            
            <div className="flex flex-col items-center lg:items-start gap-6">
              <div className="flex items-baseline gap-4 justify-center lg:justify-start">
                <span className="text-4xl sm:text-5xl font-black text-primary">{service.price[lang]}</span>
                <span className="text-xl text-slate-400 line-through font-bold">{service.originalPrice[lang]}</span>
              </div>
              <div className="flex items-center gap-4 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm max-w-sm text-left">
                <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-2xl font-bold">group_add</span>
                </div>
                <div>
                  <p className="text-primary font-bold text-sm">+{service.dependentPrice[lang]} {p.perDependent[lang]}</p>
                  <p className="text-slate-500 text-xs font-medium">{p.dependentsDesc[lang]}</p>
                </div>
              </div>
            </div>

            <Link to={`/checkout/${service.slug}`} className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:px-12 py-8 bg-highlight text-white rounded-xl text-xl font-black hover:shadow-2xl hover:shadow-highlight/40 hover:translate-y-[-4px] transition-all border-none">
                {p.getStarted[lang]}
                <span className="material-symbols-outlined ml-2">arrow_forward</span>
              </Button>
            </Link>
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
                alt={service.title[lang]}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-primary/5"></div>
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 lg:left-[-24px] lg:translate-x-0 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 min-w-[200px] lg:min-w-0">
              <div className="flex items-center gap-4 text-left">
                <div className="bg-green-100 p-2 rounded-full shrink-0">
                  <span className="material-symbols-outlined text-green-600 text-3xl font-bold">{heroIcon}</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{p.successRate[lang]}</p>
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
            <h2 className="text-3xl lg:text-4xl font-black text-primary mb-8">{p.overview[lang]}</h2>
            <p className="text-slate-600 text-lg lg:text-xl leading-relaxed max-w-4xl mx-auto lg:mx-0 font-medium italic">
              {service.description[lang]}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-10 text-left">
            <div className="bg-primary/5 p-10 rounded-[2.5rem] border border-primary/10">
              <h3 className="text-2xl font-bold text-primary mb-8 flex items-center gap-3">
                <span className="material-symbols-outlined text-green-600 text-3xl font-bold">check_circle</span>
                {p.forWhom[lang].replace("✅ ", "")}
              </h3>
              <ul className="space-y-5">
                {service.forWhom[lang].map((item, i) => (
                  <li key={i} className="flex gap-4 text-slate-700 text-base font-bold">
                    <span className="material-symbols-outlined text-green-600 shrink-0 font-bold">check</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-red-50/50 p-10 rounded-[2.5rem] border border-red-100">
              <h3 className="text-2xl font-bold text-red-900 mb-8 flex items-center gap-3">
                <span className="material-symbols-outlined text-3xl font-bold">cancel</span>
                {p.notForWhom[lang].replace("❌ ", "")}
              </h3>
              <ul className="space-y-5">
                {service.notForWhom[lang].map((item, i) => (
                  <li key={i} className="flex gap-4 text-red-800/80 text-base font-medium">
                    <span className="material-symbols-outlined text-red-500 shrink-0 font-bold">close</span>
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
          <h2 className="text-4xl lg:text-5xl font-black text-primary mb-6">{p.included[lang]}</h2>
          <div className="w-24 h-2 bg-primary mx-auto rounded-full"></div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
          {service.included[lang].slice(0, 4).map((item, i) => {
            const parts = item.split(": ");
            const icons = ["description", "edit_document", "payments", "record_voice_over", "fact_check", "history"];
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
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-8 mx-auto lg:mx-0 text-3xl group-hover:bg-primary group-hover:text-white transition-all">
                  <span className="material-symbols-outlined font-bold">{icons[i] || "verified"}</span>
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

      {/* Requirements Section */}
      <section className="bg-primary py-32 text-white px-6 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-black mb-6">{p.requirements[lang]}</h2>
            <p className="text-slate-300 text-xl font-medium">{p.prepareDocs[lang]}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
            {service.requirements[lang].map((item, i) => {
              const icons = ["passport", "assignment", "badge", "account_balance", "description", "receipt_long", "school", "travel", "account_balance_wallet"];
              return (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex flex-col items-center text-center p-6 sm:p-8 lg:p-10 bg-white/5 rounded-[2rem] lg:rounded-[2.5rem] hover:bg-white/10 transition-colors border border-white/5 group"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-3xl sm:text-4xl text-blue-300 font-bold">{icons[i] || "article"}</span>
                  </div>
                  <span className="font-bold text-sm sm:text-base tracking-tight leading-tight">{item}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Step Journey Process */}
      <section className="max-w-7xl mx-auto px-6 lg:px-20 py-32 text-left">
        <div className="text-center mb-24">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-primary mb-6">
            {p.steps[lang]}
          </h2>
          <p className="text-slate-600 text-lg lg:text-xl font-medium">{p.guidedJourney[lang]}</p>
        </div>
        
        <div className="relative space-y-14 max-w-4xl mx-auto">
          <div className="absolute left-[24px] top-4 bottom-4 w-1.5 bg-slate-100 rounded-full"></div>
          {service.steps[lang].map((step, i) => {
            const parts = step.split(": ");
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
                  {parts.length > 1 ? (
                    <>
                      <h4 className="font-black text-2xl mb-2 text-slate-900 leading-tight">{parts[0]}</h4>
                      <p className="text-slate-500 text-lg leading-relaxed italic font-medium">{parts[1]}</p>
                    </>
                  ) : (
                    <h4 className="font-black text-2xl mb-2 text-slate-900 leading-tight">{step}</h4>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Conversion CTA */}
      <ServiceCTA visaType={service.title[lang]} checkoutUrl={`/checkout/${service.slug}`} />

      {/* FAQ Section */}
      <section className="bg-slate-50 py-32 px-6 lg:px-20 text-left border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-black text-primary mb-16 text-center"
          >
            {p.faq[lang]}
          </motion.h2>
          <Accordion type="single" collapsible className="space-y-6">
            {service.faq.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-white border border-slate-200 rounded-[1.5rem] px-3 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <AccordionTrigger className="w-full flex items-center justify-between p-8 text-left font-black text-xl text-slate-800 hover:no-underline group">
                  {item.q[lang]}
                </AccordionTrigger>
                <AccordionContent className="p-8 pt-0 text-slate-600 text-lg leading-relaxed border-t border-slate-50 font-medium italic">
                  {item.a[lang]}
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
              <span className="material-symbols-outlined text-amber-600 text-3xl font-bold">info</span>
              <div className="text-base text-slate-700">
                <p className="font-black text-xl mb-4 text-amber-900 uppercase tracking-tighter">{p.legalDisclaimer[lang]}</p>
                <p className="leading-relaxed italic font-medium opacity-80">{p.disclaimer[lang]}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 md:hidden z-50">
        <Link to={`/checkout/${service.slug}`}>
          <Button className="w-full bg-primary text-white font-bold py-6 rounded-xl shadow-lg shadow-primary/20 border-none">
            {p.getStarted[lang]}
          </Button>
        </Link>
      </div>
    </div>
  );
}
