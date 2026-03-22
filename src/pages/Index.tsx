import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/presentation/components/atoms/accordion";
import { useAuth } from "@/contexts/AuthContext";

const heroImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuCnB1Ui5KR81_ZMuo2jsx-CE2-eEAymcigniK9dSdehjIJcJMpbaGUQSx37FIqHuJxB-b-g-8I9MgmdvUyc5lm6CWEgB6x25jP6fuBOdopIb7Pmy17WSCnKle7MuRB92hOoZ9wctpAcGeEplfRK4A9WS0yh_6LOr2j3QTXUFSjuMlQEXtUPT9ETTQv-iX0O1s8QEcg4w6GdquEsnSh8yPmGnzn7xQoB8c4AAY4IOhpFPwS94-7-0wEpwMiqDBmlCjbpqGG7nurSHVGT";
const avatar1 = "https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c3R1ZGVudHxlbnwwfHwwfHx8MA%3D%3D";
const avatar2 = "https://images.unsplash.com/photo-1571940875913-3a31f59ba28b?q=80&w=1475&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
const avatar3 = "https://images.unsplash.com/photo-1743572823584-8e165c52f650?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fHN0dWRlbnQlMjBjcm9wZWR8ZW58MHx8MHx8fDA%3D";

export default function Index() {
  const { lang, t } = useLanguage();
  const { session } = useAuth();
  const user = session?.user;
  
  const b1b2 = t.servicesData.find(s => s.slug === "visto-b1-b2") || t.servicesData[0];
  const f1 = t.servicesData.find(s => s.slug === "visto-f1") || t.servicesData[2];
  const renewal = t.servicesData.find(s => s.slug === "extensao-status") || 
                  t.servicesData.find(s => s.slug.includes("status")) || 
                  t.servicesData[3];

  return (
    <div className="bg-background-light font-body text-dark-grey antialiased">
      {/* Hero Header Section */}
      <header className="relative bg-highlight overflow-hidden py-32 lg:py-40 px-8 lg:px-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <div className="z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/20 rounded-full text-white font-bold text-sm mb-8">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              {t.hero.badge[lang]}
            </div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.1] mb-8 text-white">
                {t.hero.title[lang]} <span className="text-primary">{t.hero.titleHighlight[lang]}</span>
              </h1>
              <p className="text-xl text-slate-300 font-medium max-w-xl mb-12 leading-relaxed">
                {t.hero.subtitle[lang]}
              </p>
              <div className="flex flex-col sm:flex-row gap-5">
                {user ? (
                  <Link to="/dashboard" className="px-10 py-5 bg-primary text-white font-bold text-lg rounded-xl shadow-2xl shadow-primary/30 hover:scale-105 transition-transform flex items-center justify-center gap-2">
                    {t.nav.goToDashboard[lang]}
                  </Link>
                ) : (
                  <Link to="/servicos" className="px-10 py-5 bg-primary text-white font-bold text-lg rounded-xl shadow-2xl shadow-primary/30 hover:scale-105 transition-transform flex items-center justify-center gap-2">
                    {t.hero.getStarted[lang]} <span className="material-symbols-outlined">arrow_forward</span>
                  </Link>
                )}
                <Link to="/como-funciona" className="px-10 py-5 bg-white/10 border border-white/20 text-white font-bold text-lg rounded-xl hover:bg-white/20 transition-colors flex items-center justify-center">
                  {t.hero.viewPlans[lang]}
                </Link>
              </div>
            </motion.div>
            <div className="mt-16 flex items-center gap-4">
              <div className="flex -space-x-3">
                <img alt="User" className="w-12 h-12 rounded-full bg-contain border-4 border-highlight" src={avatar1} />
                <img alt="User" className="w-12 h-12 rounded-full bg-cover border-4 border-highlight" src={avatar2} />
                <img alt="User" className="w-12 h-12 rounded-full bg-cover border-4 border-highlight" src={avatar3} />
              </div>
              <p className="text-sm font-bold text-slate-400 tracking-wide">{t.hero.approvedCount[lang]}</p>
            </div>
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-primary/10 rounded-[3.5rem] rotate-2"></div>
            <img alt={t.hero.imageAlt[lang]} className="relative z-10 w-full aspect-[4/5] object-cover rounded-[3rem] shadow-3xl" src={heroImage} />
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute bottom-12 -left-8 z-20 bg-white p-6 rounded-2xl shadow-2xl flex items-center gap-5 border border-slate-50"
            >
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 text-3xl font-bold">verified</span>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">{t.serviceDetail.successRate[lang]}</p>
                <p className="text-2xl font-black text-primary">98.2%</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </header>

      {/* Services Section */}
      <section className="py-40 px-8 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-32">
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-8 text-primary">{t.servicesSection.title[lang]}</h2>
            <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">{t.servicesSection.subtitle[lang]}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-16">
            <div className="group p-12 rounded-[2.5rem] bg-white border border-slate-100 hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-primary group-hover:text-white transition-all">
                <span className="material-symbols-outlined text-primary text-4xl group-hover:text-white transition-colors">flight_takeoff</span>
              </div>
              <h3 className="text-2xl font-bold mb-6 text-primary">{b1b2.title[lang]}</h3>
              <p className="text-slate-600 mb-10 leading-relaxed min-h-[80px]">{b1b2.subtitle[lang]}</p>
              <div className="flex items-end justify-between pt-8 border-t border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-400 line-through mb-1">{b1b2.originalPrice[lang]}</p>
                  <p className="text-3xl font-black text-primary">{b1b2.price[lang]}</p>
                </div>
                <Link to={`/servicos/${b1b2.slug}`} className="w-14 h-14 rounded-full border-2 border-primary/20 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                  <span className="material-symbols-outlined">chevron_right</span>
                </Link>
              </div>
            </div>
            
            <div className="group p-12 rounded-[2.5rem] bg-white border border-slate-100 hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-primary group-hover:text-white transition-all">
                <span className="material-symbols-outlined text-primary text-4xl group-hover:text-white transition-colors">school</span>
              </div>
              <h3 className="text-2xl font-bold mb-6 text-primary">{f1.title[lang]}</h3>
              <p className="text-slate-600 mb-10 leading-relaxed min-h-[80px]">{f1.subtitle[lang]}</p>
              <div className="flex items-end justify-between pt-8 border-t border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-400 line-through mb-1">{f1.originalPrice[lang]}</p>
                  <p className="text-3xl font-black text-primary">{f1.price[lang]}</p>
                </div>
                <Link to={`/servicos/${f1.slug}`} className="w-14 h-14 rounded-full border-2 border-primary/20 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                  <span className="material-symbols-outlined">chevron_right</span>
                </Link>
              </div>
            </div>

            <div className="group p-12 rounded-[2.5rem] bg-white border border-slate-100 hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-primary group-hover:text-white transition-all">
                <span className="material-symbols-outlined text-primary text-4xl group-hover:text-white transition-colors">history</span>
              </div>
              <h3 className="text-2xl font-bold mb-6 text-primary">{renewal.title[lang]}</h3>
              <p className="text-slate-600 mb-10 leading-relaxed min-h-[80px]">{renewal.subtitle[lang]}</p>
              <div className="flex items-end justify-between pt-8 border-t border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-400 line-through mb-1">{renewal.originalPrice[lang]}</p>
                  <p className="text-3xl font-black text-primary">{renewal.price[lang]}</p>
                </div>
                <Link to={`/servicos/${renewal.slug}`} className="w-14 h-14 rounded-full border-2 border-primary/20 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                  <span className="material-symbols-outlined">chevron_right</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Step by Step Section */}
      <section className="py-40 px-8 lg:px-16 bg-white border-y border-slate-100 text-dark-grey">
        <div className="max-w-7xl mx-auto">
          <div className="mb-32">
            <span className="text-primary font-bold uppercase tracking-[0.2em] text-sm">{t.howItWorksSection.tagline[lang]}</span>
            <h2 className="text-4xl lg:text-5xl font-extrabold mt-6 text-primary">{t.howItWorksSection.title[lang]}</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-20 relative">
            <div className="hidden md:block absolute top-10 left-0 w-full h-px bg-slate-200 -z-10"></div>
            <div className="relative bg-white pr-6">
              <div className="w-20 h-20 bg-primary text-white rounded-2xl flex items-center justify-center font-bold text-3xl mb-10 shadow-xl shadow-primary/20">01</div>
              <h4 className="text-2xl font-bold mb-5 text-primary">{t.howItWorksSection.step1Title[lang]}</h4>
              <p className="text-slate-600 leading-relaxed text-lg font-medium">{t.howItWorksSection.step1Desc[lang]}</p>
            </div>
            <div className="relative bg-white pr-6">
              <div className="w-20 h-20 bg-white text-primary border-4 border-primary rounded-2xl flex items-center justify-center font-bold text-3xl mb-10">02</div>
              <h4 className="text-2xl font-bold mb-5 text-primary">{t.howItWorksSection.step2Title[lang]}</h4>
              <p className="text-slate-600 leading-relaxed text-lg font-medium">{t.howItWorksSection.step2Desc[lang]}</p>
            </div>
            <div className="relative bg-white pr-6">
              <div className="w-20 h-20 bg-white text-primary border-4 border-primary rounded-2xl flex items-center justify-center font-bold text-3xl mb-10">03</div>
              <h4 className="text-2xl font-bold mb-5 text-primary">{t.howItWorksSection.step3Title[lang]}</h4>
              <p className="text-slate-600 leading-relaxed text-lg font-medium">{t.howItWorksSection.step3Desc[lang]}</p>
            </div>
            <div className="relative bg-white">
              <div className="w-20 h-20 bg-white text-primary border-4 border-primary rounded-2xl flex items-center justify-center font-bold text-3xl mb-10">04</div>
              <h4 className="text-2xl font-bold mb-5 text-primary">{t.howItWorksSection.step4Title[lang]}</h4>
              <p className="text-slate-600 leading-relaxed text-lg font-medium">{t.howItWorksSection.step4Desc[lang]}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-40 px-8 lg:px-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-extrabold mb-32 text-center text-primary">{t.testimonials.title[lang]}</h2>
          <div className="grid md:grid-cols-3 gap-16">
            <div className="p-12 bg-white border border-slate-100 rounded-[3rem] relative hover:shadow-xl transition-shadow group text-dark-grey">
              <span className="material-symbols-outlined text-primary text-6xl opacity-10 absolute top-8 right-10">format_quote</span>
              <div className="flex text-primary mb-6">
                {[...Array(5)].map((_, i) => <span key={i} className="material-symbols-outlined">star</span>)}
              </div>
              <p className="text-slate-700 mb-12 italic leading-relaxed text-lg font-medium">"{t.testimonials.items[0].quote[lang]}"</p>
              <div className="flex items-center gap-5">
                <img alt={t.testimonials.items[0].author} className="w-14 h-14 rounded-full object-cover ring-4 ring-slate-50" src={avatar1} />
                <div>
                  <p className="font-extrabold text-primary text-lg">{t.testimonials.items[0].author}</p>
                  <p className="text-sm text-slate-500 font-bold">{t.testimonials.items[0].role[lang]}</p>
                </div>
              </div>
            </div>

            <div className="p-12 bg-white border border-slate-100 rounded-[3rem] relative hover:shadow-xl transition-shadow group text-dark-grey">
              <span className="material-symbols-outlined text-primary text-6xl opacity-10 absolute top-8 right-10">format_quote</span>
              <div className="flex text-primary mb-6">
                {[...Array(5)].map((_, i) => <span key={i} className="material-symbols-outlined">star</span>)}
              </div>
              <p className="text-slate-700 mb-12 italic leading-relaxed text-lg font-medium">"{t.testimonials.items[1].quote[lang]}"</p>
              <div className="flex items-center gap-5">
                <img alt={t.testimonials.items[1].author} className="w-14 h-14 rounded-full object-cover ring-4 ring-slate-50" src={avatar2} />
                <div>
                  <p className="font-extrabold text-primary text-lg">{t.testimonials.items[1].author}</p>
                  <p className="text-sm text-slate-500 font-bold">{t.testimonials.items[1].role[lang]}</p>
                </div>
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="p-12 bg-white border border-slate-100 rounded-[3rem] relative hover:shadow-xl transition-shadow group text-dark-grey"
            >
              <span className="material-symbols-outlined text-primary text-6xl opacity-10 absolute top-8 right-10">format_quote</span>
              <div className="flex text-primary mb-6">
                {[...Array(5)].map((_, i) => <span key={i} className="material-symbols-outlined">star</span>)}
              </div>
              <p className="text-slate-700 mb-12 italic leading-relaxed text-lg font-medium">"{t.testimonials.items[2].quote[lang]}"</p>
              <div className="flex items-center gap-5">
                <img alt={t.testimonials.items[2].author} className="w-14 h-14 rounded-full object-cover ring-4 ring-slate-50" src={avatar3} />
                <div>
                  <p className="font-extrabold text-primary text-lg">{t.testimonials.items[2].author}</p>
                  <p className="text-sm text-slate-500 font-bold">{t.testimonials.items[2].role[lang]}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-40 px-8 lg:px-16 bg-cloud-grey">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-extrabold text-center mb-32 text-primary">{t.homeFaq.title[lang]}</h2>
          <Accordion type="single" collapsible className="space-y-8">
            <AccordionItem value="faq-1" className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <AccordionTrigger className="w-full flex items-center justify-between p-10 text-left hover:bg-slate-50 transition-colors font-bold text-xl text-primary hover:no-underline group">
                <span>{t.homeFaq.q1[lang]}</span>
              </AccordionTrigger>
              <AccordionContent className="px-10 pb-10 text-slate-600 leading-relaxed text-lg font-medium">
                {t.homeFaq.a1[lang]}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-2" className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <AccordionTrigger className="w-full flex items-center justify-between p-10 text-left hover:bg-slate-50 transition-colors font-bold text-xl text-primary hover:no-underline group">
                <span>{t.homeFaq.q2[lang]}</span>
              </AccordionTrigger>
              <AccordionContent className="px-10 pb-10 text-slate-600 leading-relaxed text-lg font-medium">
                {t.homeFaq.a2[lang]}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-3" className="bg-white rounded-2xl border-2 border-primary/20 overflow-hidden shadow-md">
              <AccordionTrigger className="w-full flex items-center justify-between p-10 text-left bg-slate-50 hover:bg-slate-100 transition-colors font-bold text-xl text-primary hover:no-underline group">
                <span>{t.homeFaq.q3[lang]}</span>
              </AccordionTrigger>
              <AccordionContent className="px-10 pb-10 text-slate-600 leading-relaxed text-lg font-medium bg-slate-50">
                {t.homeFaq.a3[lang]}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </div>
  );
}
