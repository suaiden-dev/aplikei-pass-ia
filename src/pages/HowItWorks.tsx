import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

export default function HowItWorks() {
  const { lang, t } = useLanguage();
  const p = t.howItWorksPage;

  const steps = [
    { icon: "search", ...p.steps[0] },
    { icon: "person_add", ...p.steps[1] },
    { icon: "account_balance_wallet", ...p.steps[2] },
    { icon: "smart_toy", ...p.steps[3] },
    { icon: "verified", ...p.steps[4] },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-24 lg:py-32 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 rounded-l-[10rem] -mr-20 hidden lg:block" />
        <div className="container max-w-7xl px-6 lg:px-12 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto lg:mx-0 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-bold mb-8">
              <span className="material-symbols-outlined text-lg">info</span>
              {t.nav.howItWorks[lang]}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-dark-grey tracking-tight mb-8 leading-[1.1]">
              {p.title[lang]}
            </h1>
            <p className="text-lg sm:text-xl text-slate-500 leading-relaxed font-medium max-w-2xl mx-auto lg:mx-0">
              {p.subtitle[lang]}
            </p>
          </motion.div>
        </div>
      </section>

      {/* 5-Step Journey Timeline */}
      <section className="py-24 lg:py-40 relative">
        <div className="container max-w-7xl px-6 lg:px-12">
          <div className="grid gap-24 relative">
            <div className="absolute left-8 top-12 bottom-12 w-1 bg-slate-100 hidden lg:block" />
            
            {steps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative flex flex-col lg:flex-row gap-10 lg:gap-12 items-center lg:items-start text-center lg:text-left"
              >
                {/* Number/Icon indicator */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-16 h-16 bg-white border-[6px] border-slate-50 rounded-2xl flex items-center justify-center shadow-xl">
                    <span className="material-symbols-outlined text-primary text-3xl font-bold">
                      {step.icon}
                    </span>
                  </div>
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-highlight text-white rounded-full flex items-center justify-center text-xs font-black shadow-lg">
                    0{i + 1}
                  </div>
                </div>

                {/* Content */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="flex-1 bg-white p-10 lg:p-12 rounded-[2.5rem] border-4 border-slate-50 hover:border-primary/10 transition-all hover:shadow-xl hover:-translate-y-2 duration-300 shadow-sm"
                >
                  <span className="text-primary font-black text-sm uppercase tracking-[0.2em] mb-4 block">
                    {p.step[lang]} 0{i+1}
                  </span>
                  <h3 className="text-3xl font-extrabold text-dark-grey mb-6">
                    {step.title[lang]}
                  </h3>
                  <p className="text-lg text-slate-500 leading-relaxed font-medium max-w-2xl">
                    {step.desc[lang]}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Capabilities Section */}
      <section className="py-24 lg:py-40 bg-dark-grey text-white rounded-[4rem] lg:rounded-[6rem] mx-4 lg:mx-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 -skew-x-12 translate-x-1/2" />
        <div className="container max-w-7xl px-6 lg:px-12 relative z-10">
          <div className="max-w-3xl mb-16 lg:mb-24 text-center lg:text-left mx-auto lg:mx-0">
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold mb-8">
              {p.aiDoesTitle[lang]}
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-24">
            {/* Capabilities */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-sm p-8 lg:p-12 rounded-[2.5rem] lg:rounded-[3rem] border border-white/10 hover:bg-white/10 transition-colors duration-300"
            >
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-8 mx-auto lg:mx-0">
                <span className="material-symbols-outlined text-white">check_circle</span>
              </div>
              <h4 className="text-xl sm:text-2xl font-bold mb-8 flex items-center justify-center lg:justify-start gap-3">
                {p.aiHelps[lang]}
              </h4>
              <ul className="grid gap-6 text-left">
                {p.aiDoes[lang].map((item, i) => (
                  <li key={i} className="flex gap-4 text-slate-300 font-medium leading-relaxed">
                    <span className="material-symbols-outlined text-primary font-bold">check</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Limitations */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-sm p-8 lg:p-12 rounded-[2.5rem] lg:rounded-[3rem] border border-white/10 hover:bg-white/10 transition-colors duration-300"
            >
              <div className="w-12 h-12 bg-highlight rounded-xl flex items-center justify-center mb-8 mx-auto lg:mx-0">
                <span className="material-symbols-outlined text-white">cancel</span>
              </div>
              <h4 className="text-xl sm:text-2xl font-bold mb-8 flex items-center justify-center lg:justify-start gap-3">
                {p.aiDoesNotLabel[lang]}
              </h4>
              <ul className="grid gap-6 text-left">
                {p.aiDoesNot[lang].map((item, i) => (
                  <li key={i} className="flex gap-4 text-slate-300 font-medium leading-relaxed">
                    <span className="material-symbols-outlined text-highlight font-bold">close</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What You Receive Section */}
      <section className="py-24 lg:py-40">
        <div className="container max-w-7xl px-6 lg:px-12 text-center">
          <h2 className="text-4xl lg:text-6xl font-extrabold text-dark-grey mb-16 lg:mb-24">
            {t.whatYouGet.title[lang]}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: p.youBuy[lang], desc: p.youBuyDesc[lang], icon: "verified" },
              { title: p.bonusAI[lang], desc: p.bonusAIDesc[lang], icon: "psychology" },
              { title: p.bonusN1[lang], desc: p.bonusN1Desc[lang], icon: "support_agent" }
            ].map((card, i) => (
              <div key={i} className="bg-slate-50 p-12 rounded-[3rem] flex flex-col items-center text-center group hover:bg-white hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg mb-8 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-4xl">
                    {card.icon}
                  </span>
                </div>
                <h3 className="text-2xl font-extrabold text-dark-grey mb-6">{card.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-24 lg:mt-32">
            <Link 
              to="/servicos" 
              className="inline-flex items-center gap-4 px-12 py-6 bg-highlight text-white font-black text-xl rounded-xl hover:shadow-2xl hover:shadow-highlight/40 transition-all hover:-translate-y-1"
            >
              {p.viewServices[lang]}
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
