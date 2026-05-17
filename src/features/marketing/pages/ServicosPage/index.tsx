import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  RiArrowRightLine, 
  RiCheckLine, 
  RiShieldKeyholeLine, 
  RiScalesLine, 
  RiGlobalLine, 
  RiPassportLine,
  RiMagicLine,
  RiCheckDoubleLine
} from "react-icons/ri";
import { useT } from "@app/app/i18n";

export default function ServicosPage() {
  const t = useT("common");
  const p = t.servicesPage;

  return (
    <div className="bg-bg text-text">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 sm:px-8 lg:px-16 py-20 lg:py-32 bg-bg">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-0 h-72 w-72 -translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/12 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/4 translate-y-1/4 rounded-full bg-info/10 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto text-center lg:text-left">
           <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary shadow-sm mb-8">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              {p?.hero?.tag}
            </div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <h1 className="font-display text-balance text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.98] tracking-[-0.045em] text-primary">
                {p?.hero?.title}
              </h1>
              <p className="mt-8 max-w-2xl text-lg sm:text-xl text-text-muted font-medium leading-relaxed mx-auto lg:mx-0">
                {p?.hero?.subtitle}
              </p>
            </motion.div>

            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
               <Link
                to="/contato"
                className="px-8 py-4 rounded-2xl bg-primary text-white font-black shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center gap-2"
              >
                {p?.cta?.button}
                <RiArrowRightLine size={18} />
              </Link>
              <Link
                to="/quem-somos"
                className="px-8 py-4 rounded-2xl border border-border bg-card text-text font-bold hover:bg-bg-subtle transition-colors"
              >
                Sobre a Aplikei
              </Link>
            </div>
        </div>
      </section>

      {/* Main Services Grid */}
      <section className="px-6 sm:px-8 lg:px-16 py-20 lg:py-24 bg-bg-subtle border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-8 md:grid-cols-2">
            {(p?.sections || []).map((section: any, idx: number) => (
              <motion.article
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.1 }}
                className="rounded-[2.5rem] border border-border bg-card p-8 lg:p-10 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="flex flex-col gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:bg-primary transition-colors">
                    {idx === 0 && <RiPassportLine className="text-primary text-3xl group-hover:text-white transition-colors" />}
                    {idx === 1 && <RiMagicLine className="text-primary text-3xl group-hover:text-white transition-colors" />}
                    {idx === 2 && <RiCheckDoubleLine className="text-primary text-3xl group-hover:text-white transition-colors" />}
                    {idx === 3 && <RiShieldKeyholeLine className="text-primary text-3xl group-hover:text-white transition-colors" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl lg:text-3xl font-black text-primary leading-tight mb-4">{section.title}</h3>
                    <p className="text-text-muted leading-relaxed font-medium mb-8">{section.description}</p>
                    
                    <div className="grid gap-4">
                      {(section.features || []).map((feature: string, fidx: number) => (
                        <div key={fidx} className="flex items-start gap-3">
                          <RiCheckLine className="text-emerald-500 text-xl shrink-0 mt-0.5" />
                          <span className="text-sm font-bold text-text tracking-tight">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Info Blocks */}
      <section className="px-6 sm:px-8 lg:px-16 py-24 lg:py-32">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-24">
          <div className="p-10 lg:p-12 rounded-[3rem] bg-bg-subtle border border-border">
            <h3 className="text-2xl font-black text-primary mb-6 flex items-center gap-3">
              <RiCheckDoubleLine className="text-primary" />
              {p?.info?.leadership?.title}
            </h3>
            <p className="text-lg text-text-muted leading-relaxed font-medium">
              {p?.info?.leadership?.description}
            </p>
          </div>
          <div className="p-10 lg:p-12 rounded-[3rem] bg-bg-subtle border border-border">
            <h3 className="text-2xl font-black text-primary mb-6 flex items-center gap-3">
              <RiShieldKeyholeLine className="text-primary" />
              {p?.info?.rigor?.title}
            </h3>
            <p className="text-lg text-text-muted leading-relaxed font-medium">
              {p?.info?.rigor?.description}
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="bg-primary rounded-[48px] p-12 lg:p-24 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl lg:text-6xl font-black text-white mb-8 tracking-tighter">
                {p?.cta?.title}
              </h2>
              <p className="text-xl text-white/70 font-medium mb-12 italic">
                {p?.cta?.description}
              </p>
              <Link
                to="/contato"
                className="px-12 py-5 bg-white text-primary rounded-xl font-black text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all inline-flex items-center justify-center"
              >
                {p?.cta?.button}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
