import { motion } from "framer-motion";
import { useT } from "@app/app/i18n";

export function LandingProblem() {
  const t = useT("landing");

  if (!t.problem || !Array.isArray(t.problem.items) || t.problem.items.length === 0) return null;

  const items = t.problem.items.slice(0, 4);

  return (
    <section className="relative overflow-hidden py-20 bg-[#0b1220]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-7 md:p-8"
          >
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-cyan-300 mb-3">
              Diagnóstico
            </p>
            <h2 className="font-h2 text-h2 text-white mb-3">
              {t.problem.title}
            </h2>
            <p className="font-body-md text-body-md text-slate-300">
              {t.problem.subtitle}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-7 rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-transparent p-7 md:p-8"
          >
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-cyan-200 mb-2">
              O custo da desorganização
            </p>
            <p className="text-base md:text-lg text-slate-100 leading-relaxed">
              Falta de direção, retrabalho documental e comunicação fragmentada atrasam decisões críticas.  
              Nós centralizamos a estratégia e transformamos cada etapa em execução previsível.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
          {items.map((item: { icon: string; title: string; description: string }, index: number) => (
            <motion.article
              key={`${item.title}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 + index * 0.08 }}
              className="group rounded-2xl border border-white/10 bg-white/[0.045] p-5 md:p-6 backdrop-blur-sm hover:bg-white/[0.08] transition-all"
            >
              <span className="material-symbols-outlined text-cyan-200 p-3 bg-cyan-400/10 rounded-xl mb-4 inline-flex border border-cyan-200/20">
                {item.icon}
              </span>
              <h3 className="font-h3 text-h3 text-white mb-2">{item.title}</h3>
              <p className="font-body-md text-slate-300">{item.description}</p>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4"
        >
          <div className="flex-1">
            <p className="text-label-md text-cyan-100 uppercase tracking-widest mb-1">
              {t.problem.simulationLabel}
            </p>
            <p className="font-body-md text-slate-100">
              Transformamos incerteza em plano de ação com previsibilidade de etapas, responsáveis e prazos.
            </p>
          </div>
          <div className="w-full md:w-auto rounded-xl border border-cyan-100/25 bg-[#0f1a2f] px-5 py-3.5">
            <p className="text-sm font-semibold text-cyan-50 text-center md:text-left">Menos retrabalho. Mais clareza. Melhor decisão.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export const ProblemSection = LandingProblem;
