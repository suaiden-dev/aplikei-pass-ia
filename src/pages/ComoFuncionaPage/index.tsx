import { motion } from "framer-motion";
import { HowItWorksSection } from "../../components/HowItWorksSection";
import { RiInformationLine, RiCheckDoubleLine } from "react-icons/ri";
import { useT } from "../../i18n/LanguageContext";

export default function ComoFuncionaPage() {
  const t = useT("common");
  const p = t.howItWorksPage;

  return (
    <div className="bg-white">
      {/* Page Hero */}
      <section className="pt-20 lg:pt-32 pb-16 lg:pb-24 px-8 lg:px-16 bg-white overflow-hidden">
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
                <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">{p.hero.tag}</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-black text-primary leading-[1.05] mb-10 tracking-tighter">
                {p.hero.title} <span className="text-slate-300">{p.hero.titleHighlight}</span>
              </h1>
              
              <p className="text-lg lg:text-2xl text-slate-500 font-medium leading-relaxed mb-12 italic">
                {p.hero.description}
              </p>
              
              <div className="flex flex-col gap-6 items-center lg:items-start text-left">
                {p.hero.features.map((item: string, i: number) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <RiCheckDoubleLine className="text-emerald-500 text-sm" />
                    </div>
                    <span className="text-slate-600 font-bold text-sm tracking-tight">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square bg-slate-50 rounded-[40px] overflow-hidden border border-slate-100 relative group">
                <img 
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop" 
                  alt="Team collaboration" 
                  className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
              </div>
              
              {/* Floating Stat Card */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-10 -right-6 lg:-right-12 bg-white p-8 rounded-[32px] shadow-2xl border border-slate-50 max-w-xs"
              >
                <p className="text-primary font-black text-4xl mb-2 tracking-tighter">98%</p>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                  {p.hero.stats}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Steps Section */}
      <HowItWorksSection />

      {/* Extra Info / CTA Section */}
      <section className="py-24 px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="bg-primary rounded-[48px] p-12 lg:p-24 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl lg:text-6xl font-black text-white mb-8 tracking-tighter">
                {p.cta.title}
              </h2>
              <p className="text-xl text-white/70 font-medium mb-12 italic">
                {p.cta.subtitle}
              </p>
              <button 
                onClick={() => window.location.href = '/servicos'}
                className="px-12 py-5 bg-white text-primary rounded-xl font-black text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
              >
                {p.cta.button}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
