import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  RiArrowRightUpLine, 
  RiEyeOffLine,
  RiVerifiedBadgeFill
} from "react-icons/ri";
import { servicesData } from "../../data/services";
import { supabase } from "../../lib/supabase";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/Accordion";
import { useT } from "../../i18n/LanguageContext";



export default function ServicosPage() {
  const t = useT("services");
  const p = t.servicesPage;
  const [activeMap, setActiveMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    supabase
      .from("services_prices")
      .select("service_id, is_active")
      .then(({ data }) => {
        if (!data) return;
        const map: Record<string, boolean> = {};
        for (const row of data) {
          if (row.is_active === false) {
            map[row.service_id] = false;
          } else if (!(row.service_id in map)) {
            map[row.service_id] = true;
          }
        }
        setActiveMap(map);
      });
  }, []);

  const isServiceActive = (slug: string) => activeMap[slug] !== false;

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-highlight pt-32 pb-24 px-8 lg:px-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-white/90 font-bold text-xs uppercase tracking-[0.2em] mb-8"
          >
            <RiVerifiedBadgeFill className="text-primary text-sm" />
            {p.hero.tag}
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl lg:text-7xl font-black text-white mb-8 tracking-tighter"
          >
            {p.hero.title} <br />
            <span className="text-primary">{p.hero.titleHighlight}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 max-w-2xl font-medium mb-12 italic"
          >
            {p.hero.description}
          </motion.p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 px-8 lg:px-16 -mt-16 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {servicesData
              .filter(s => ['visto-b1-b2', 'visto-f1', 'extensao-status', 'troca-status'].includes(s.slug))
              .map((service, index) => {
                const active = isServiceActive(service.slug);
                
                return (
                  <motion.div
                    key={service.slug}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="h-full"
                  >
                    <Link
                      to={active ? `/checkout/${service.slug}` : "#"}
                      className={`group relative bg-white rounded-[40px] p-8 border transition-all duration-500 flex flex-col h-full overflow-hidden ${
                        active
                          ? "border-slate-100 shadow-xl shadow-slate-200/50 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2"
                          : "border-slate-200 opacity-70 grayscale cursor-not-allowed"
                      }`}
                    >
                      {!active && (
                        <div className="absolute top-6 right-6 flex items-center gap-1.5 bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full z-10 shadow-lg">
                          <RiEyeOffLine className="text-xs" />
                          {p.status.paused}
                        </div>
                      )}

                      <div className="w-full h-40 rounded-2xl overflow-hidden mb-8 border border-slate-50 relative">
                        <img 
                          src={service.heroImage} 
                          alt={service.title} 
                          className={`w-full h-full object-cover transition-transform duration-500 ${active ? "group-hover:scale-105" : ""}`} 
                        />
                        {active && (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        )}
                      </div>

                      <h3 className={`text-2xl font-black mb-4 tracking-tight leading-[1.1] ${active ? "text-slate-800" : "text-slate-500"}`}>
                        {service.title}
                      </h3>
                      
                      <p className="text-slate-500 mb-8 leading-relaxed text-sm font-medium flex-1 italic line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                        {service.subtitle}
                      </p>

                      <div className="pt-8 border-t border-slate-50 flex items-center justify-between mt-auto">
                        <div>
                          <p className="text-xs font-bold text-slate-400 line-through mb-1 uppercase tracking-widest">{service.originalPrice}</p>
                          <p className={`text-2xl font-black ${active ? "text-primary" : "text-slate-400"}`}>
                            {service.price}
                          </p>
                        </div>

                        <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 ${active ? "bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white" : "bg-slate-50 text-slate-300 border border-slate-100"}`}>
                          <RiArrowRightUpLine size={24} />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 px-8 lg:px-16 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-black text-primary mb-6 tracking-tighter">
              {p.faq.title}
            </h2>
            <p className="text-slate-500 font-medium italic">
              {p.faq.subtitle}
            </p>
          </div>
          
          <Accordion type="single" collapsible className="space-y-6">
            {p.faq.items.map((item: any, idx: number) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="bg-white px-8 py-4 rounded-3xl border border-slate-100 shadow-sm">
                <AccordionTrigger className="text-left font-black text-xl text-slate-800 hover:text-primary transition-colors hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-lg text-slate-500 font-medium leading-relaxed pt-4 italic">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
}
