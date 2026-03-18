import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/presentation/components/atoms/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/presentation/components/atoms/accordion";
import { useLanguage } from "@/i18n/LanguageContext";

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, t } = useLanguage();
  const p = t.serviceDetail;
  const h = t.howItWorksPage;

  const serviceIndex = t.servicesData.findIndex((s) => s.slug === slug);
  const service = t.servicesData[serviceIndex];
  if (!service) return <Navigate to="/servicos" replace />;

  const journeySteps = service.steps[lang].map((step, i) => {
    const icons = ["person_add", "account_balance_wallet", "smart_toy", "description", "verified", "event"];
    return {
      title: step,
      icon: icons[i] || "check_circle"
    };
  });

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-24 lg:py-32 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 rounded-l-[10rem] -mr-20 hidden lg:block" />
        <div className="container max-w-7xl px-6 lg:px-12 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-bold mb-8">
              <span className="material-symbols-outlined text-lg">verified_user</span>
              {service.shortTitle[lang]}
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-dark-grey tracking-tight mb-8 leading-[1.1]">
              {service.title[lang]}
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed font-medium max-w-2xl mb-12">
              {service.subtitle[lang]}
            </p>

            <div className="flex flex-wrap items-end gap-6 mb-12">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">{t.catalogPage.priceLabel[lang]}</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-dark-grey">{service.price[lang]}</span>
                  <span className="text-lg text-slate-300 line-through font-bold">{service.originalPrice[lang]}</span>
                </div>
              </div>
              <div className="bg-highlight/10 p-6 rounded-3xl border border-highlight/20">
                <p className="text-highlight text-sm font-bold uppercase tracking-wider mb-2">{t.servicesSection.discount[lang]}</p>
                <p className="text-2xl font-black text-highlight">50% OFF</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Dependents Highlight */}
      <section className="py-12 -mt-12 relative z-20">
        <div className="container max-w-7xl px-6 lg:px-12">
          <div className="bg-dark-grey text-white p-8 lg:p-12 rounded-[3rem] shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8 border border-white/10">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-3xl">group_add</span>
              </div>
              <div>
                <h3 className="text-2xl font-extrabold mb-2">{p.dependents[lang]}</h3>
                <p className="text-slate-400 font-medium max-w-md">{p.dependentsDesc[lang]}</p>
              </div>
            </div>
            <div className="text-center lg:text-right">
              <p className="text-3xl font-black text-primary">+{service.dependentPrice[lang]}</p>
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">{p.perDependent[lang]}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Overview & For Whom */}
      <section className="py-24 lg:py-40">
        <div className="container max-w-7xl px-6 lg:px-12">
          <div className="max-w-4xl mb-16 lg:mb-24">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-dark-grey mb-8">{p.overview[lang]}</h2>
            <p className="text-xl text-slate-500 leading-relaxed font-medium">
              {service.description[lang]}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 lg:p-12 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <span className="material-symbols-outlined text-green-500 text-3xl font-bold">check_circle</span>
                <h3 className="text-2xl font-extrabold text-dark-grey">{p.forWhom[lang]}</h3>
              </div>
              <ul className="grid gap-6">
                {service.forWhom[lang].map((item, i) => (
                  <li key={i} className="flex gap-4 text-slate-600 font-medium leading-relaxed">
                    <span className="material-symbols-outlined text-primary font-bold">check</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 lg:p-12 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <span className="material-symbols-outlined text-highlight text-3xl font-bold">cancel</span>
                <h3 className="text-2xl font-extrabold text-dark-grey">{p.notForWhom[lang]}</h3>
              </div>
              <ul className="grid gap-6">
                {service.notForWhom[lang].map((item, i) => (
                  <li key={i} className="flex gap-4 text-slate-400 font-medium leading-relaxed">
                    <span className="material-symbols-outlined text-highlight font-bold">close</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Deliverables: Included & NOT Included */}
      <section className="py-24 lg:py-40 bg-slate-50/50">
        <div className="container max-w-7xl px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
            <div className="bg-white border border-slate-200 rounded-[3rem] p-8 lg:p-12 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
              <h3 className="text-2xl font-black text-dark-grey mb-10 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-3xl">verified</span>
                {lang === "en" ? "What's Included" : lang === "pt" ? "O que está incluso" : "Qué está incluido"}
              </h3>
              <ul className="grid gap-6">
                {service.included[lang].map((item, i) => (
                  <li key={i} className="flex gap-4 text-slate-600 font-medium leading-relaxed">
                    <span className="material-symbols-outlined text-primary text-xl font-bold">check</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-[3rem] p-8 lg:p-12 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-highlight/5 rounded-full -mr-16 -mt-16" />
              <h3 className="text-2xl font-black text-dark-grey mb-10 flex items-center gap-3">
                <span className="material-symbols-outlined text-highlight text-3xl">block</span>
                {lang === "en" ? "What's NOT included" : lang === "pt" ? "O que NÃO está incluso" : "Lo que NO está incluido"}
              </h3>
              <ul className="grid gap-6">
                {service.notIncluded[lang].map((item, i) => (
                  <li key={i} className="flex gap-4 text-slate-400 font-medium leading-relaxed">
                    <span className="material-symbols-outlined text-highlight text-xl font-bold">close</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="py-24 lg:py-40">
        <div className="container max-w-7xl px-6 lg:px-12 text-center mb-24">
          <h2 className="text-4xl lg:text-6xl font-extrabold text-dark-grey mb-8">{p.steps[lang]}</h2>
        </div>
        <div className="container max-w-5xl px-6 lg:px-12">
          <div className="grid gap-16 relative">
            <div className="absolute left-8 top-12 bottom-12 w-1 bg-slate-100 hidden lg:block" />
            
            {journeySteps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative flex flex-col lg:flex-row gap-12 lg:items-center"
              >
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-16 h-16 bg-white border-[6px] border-slate-50 rounded-2xl flex items-center justify-center shadow-xl">
                    <span className="material-symbols-outlined text-primary text-3xl font-bold">
                      {step.icon}
                    </span>
                  </div>
                </div>
                <div className="flex-1 bg-white p-10 rounded-[2.5rem] border-4 border-slate-50 hover:border-primary/5 transition-all shadow-sm text-left group">
                  <span className="text-primary font-black text-sm uppercase tracking-widest mb-2 block opacity-50">Step 0{i + 1}</span>
                  <h3 className="text-2xl font-extrabold text-dark-grey group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Capabilities Section (Reusing from HowItWorks) */}
      <section className="py-24 lg:py-40 bg-dark-grey text-white rounded-[4rem] lg:rounded-[6rem] mx-4 lg:mx-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 -skew-x-12 translate-x-1/2" />
        <div className="container max-w-7xl px-6 lg:px-12 relative z-10">
          <div className="max-w-3xl mb-16 lg:mb-24 text-left">
            <h2 className="text-4xl lg:text-6xl font-extrabold mb-8">
              {h.aiDoesTitle[lang]}
            </h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-24">
            <div className="bg-white/5 backdrop-blur-sm p-12 rounded-[3rem] border border-white/10">
              <h4 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary font-bold">check_circle</span>
                {h.aiHelps[lang]}
              </h4>
              <ul className="grid gap-6">
                {h.aiDoes[lang].map((item, i) => (
                  <li key={i} className="flex gap-4 text-slate-300 font-medium leading-relaxed">
                    <span className="material-symbols-outlined text-primary font-bold">check</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-12 rounded-[3rem] border border-white/10">
              <h4 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <span className="material-symbols-outlined text-highlight font-bold">cancel</span>
                {h.aiDoesNotLabel[lang]}
              </h4>
              <ul className="grid gap-6">
                {h.aiDoesNot[lang].map((item, i) => (
                  <li key={i} className="flex gap-4 text-slate-300 font-medium leading-relaxed">
                    <span className="material-symbols-outlined text-highlight font-bold">close</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-24 lg:py-40">
        <div className="container max-w-5xl px-6 lg:px-12">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-dark-grey mb-16 text-center">{p.requirements[lang]}</h2>
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {service.requirements[lang].map((item, i) => {
              const icons = ["description", "camera_alt", "account_balance", "home_work", "verified"];
              return (
                <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 flex items-center gap-6 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center group-hover:bg-primary transition-colors">
                    <span className="material-symbols-outlined text-primary text-2xl group-hover:text-white transition-colors">
                      {icons[i] || "check_circle"}
                    </span>
                  </div>
                  <p className="text-slate-700 font-bold text-lg">{item}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 lg:py-40 bg-slate-50 rounded-[4rem] lg:rounded-[6rem] mx-4 lg:mx-8">
        <div className="container max-w-4xl px-6 lg:px-12">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-dark-grey mb-16 text-center">{p.faq[lang]}</h2>
          <Accordion type="single" collapsible className="space-y-4">
            {service.faq.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-white px-8 py-4 rounded-3xl border-none shadow-sm">
                <AccordionTrigger className="text-left text-lg font-extrabold text-dark-grey hover:no-underline">
                  {item.q[lang]}
                </AccordionTrigger>
                <AccordionContent className="text-slate-500 font-medium text-lg leading-relaxed pt-4">
                  {item.a[lang]}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final Disclaimer */}
      <section className="py-12 px-6 lg:py-24">
        <div className="container max-w-7xl">
          <div className="bg-amber-50/60 border-2 border-amber-200 p-8 lg:p-12 rounded-[3.5rem] flex items-start gap-6">
            <span className="material-symbols-outlined text-amber-600 text-3xl">verified_user</span>
            <p className="text-sm lg:text-base text-amber-800 leading-relaxed font-medium">
              <strong className="block mb-2 uppercase tracking-widest text-xs font-black">Notice / Aviso</strong>
              {p.disclaimer[lang]}
            </p>
          </div>
        </div>
      </section>

      {/* Sticky Bottom CTA */}
      <div className="sticky bottom-6 z-50 px-4 mb-8">
        <div className="container max-w-6xl mx-auto">
          <div className="bg-dark-grey text-white p-6 lg:px-12 lg:py-8 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center hidden sm:flex">
                <span className="material-symbols-outlined text-primary text-2xl">verified</span>
              </div>
              <div className="text-center md:text-left">
                <h4 className="text-xl font-extrabold leading-tight">{service.shortTitle[lang]}</h4>
                <p className="text-primary font-black text-2xl">{service.price[lang]}</p>
              </div>
            </div>
            <Link 
              to={`/checkout/${slug}`}
              className="w-full md:w-auto px-12 py-5 bg-highlight text-white font-black text-xl rounded-full flex items-center justify-center gap-4 hover:shadow-2xl hover:shadow-highlight/40 transition-all hover:scale-105 active:scale-95"
            >
              {p.createAccount[lang]}
              <span className="material-symbols-outlined font-black">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
