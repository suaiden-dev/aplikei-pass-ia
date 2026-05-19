import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { RiInformationLine, RiCheckDoubleLine, RiTeamLine, RiHistoryLine, RiAwardLine, RiGlobeLine } from "react-icons/ri";
import { useT } from "@app/app/i18n";

export default function QuemSomosPage() {
  const t = useT("common");
  const p = t.whoWeArePage;

  return (
    <div className="bg-card">
      {/* Page Hero */}
      <section className="pt-20 lg:pt-32 pb-16 lg:pb-24 px-8 lg:px-16 bg-card overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center"
          >
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-8">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <RiInformationLine className="text-primary text-xl" />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">{p?.hero?.tag}</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-primary leading-[1.05] mb-10 tracking-tighter">
                {p?.hero?.title}{" "}
                <span className="text-text-muted">{p?.hero?.titleHighlight}</span>
              </h1>
              <p className="text-lg lg:text-2xl text-text-muted font-medium leading-relaxed mb-12 italic">
                {p?.hero?.description}
              </p>
            </div>
            <div className="relative">
              <div className="aspect-square bg-bg-subtle rounded-[40px] overflow-hidden border border-border relative group">
                <img
                  src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=2070&auto=format&fit=crop"
                  alt="Aplikei team"
                  className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
              </div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-10 -right-6 lg:-right-12 bg-card p-8 rounded-[32px] shadow-2xl border border-border max-w-xs"
              >
                <p className="text-primary font-black text-4xl mb-2 tracking-tighter">{p?.stats?.approval}</p>
                <p className="text-xs font-black text-text-muted uppercase tracking-widest leading-relaxed">
                  {p?.hero?.stats}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-bg-subtle border-y border-border">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <p className="text-4xl font-black text-primary mb-2">{p?.stats?.success}</p>
              <p className="text-xs font-bold text-text-muted uppercase tracking-widest">{p?.stats?.successLabel}</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <p className="text-4xl font-black text-primary mb-2">{p?.stats?.approval}</p>
              <p className="text-xs font-bold text-text-muted uppercase tracking-widest">{p?.stats?.approvalLabel}</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <p className="text-4xl font-black text-primary mb-2">{p?.stats?.countries}</p>
              <p className="text-xs font-bold text-text-muted uppercase tracking-widest">{p?.stats?.countriesLabel}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our History */}
      <section className="py-24 lg:py-32 px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
               <div className="aspect-[4/3] bg-bg-subtle rounded-[40px] overflow-hidden border border-border">
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"
                  alt="Office history"
                  className="w-full h-full object-cover grayscale opacity-60"
                />
              </div>
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-8">
                <RiHistoryLine className="text-primary text-2xl" />
                <h2 className="text-2xl font-black uppercase tracking-widest text-primary">{p?.history?.title}</h2>
              </div>
              <p className="text-xl text-text-muted leading-relaxed font-medium whitespace-pre-line">
                {p?.history?.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="py-24 lg:py-32 px-8 lg:px-16 bg-bg-subtle">
        <div className="max-w-7xl mx-auto text-center mb-16 lg:mb-24">
          <div className="flex items-center justify-center gap-3 mb-6">
            <RiAwardLine className="text-primary text-2xl" />
            <h2 className="text-2xl font-black uppercase tracking-widest text-primary">{p?.pillars?.title}</h2>
          </div>
        </div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {(p?.pillars?.items || []).map((item: any, i: number) => (
            <div key={i} className="bg-card p-10 rounded-[32px] border border-border hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary transition-colors">
                <RiCheckDoubleLine className="text-primary text-2xl group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-black text-primary mb-4">{item.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed font-medium">{item.description}</p>
            </div>
          ))}
        </div>
      </section>


      {/* CTA */}
      <section className="py-24 px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="bg-primary rounded-[48px] p-12 lg:p-24 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl lg:text-6xl font-black text-white mb-8 tracking-tighter">
                {p?.cta?.title}
              </h2>
              <p className="text-xl text-white/70 font-medium mb-12 italic">{p?.cta?.subtitle}</p>
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
