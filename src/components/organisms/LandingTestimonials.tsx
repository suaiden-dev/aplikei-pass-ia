import { motion } from "framer-motion";
import { FaStar, FaQuoteLeft } from "react-icons/fa";
import { useT } from "../../i18n";

interface TestimonialsSectionProps {
  avatars: string[];
}


export const TestimonialsSection = ({ avatars }: TestimonialsSectionProps) => {
  const t = useT("landing");
  const testimonials = t.testimonials.items;

  return (
    <section className="relative overflow-hidden bg-[#090e1d] px-8 py-40 lg:px-16">
      <div className="absolute inset-0 opacity-90">
        <div className="absolute left-0 top-0 h-80 w-80 -translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] translate-x-1/3 translate-y-1/3 rounded-full bg-info/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">{t.testimonials.title}</p>
          <h2 className="font-display text-3xl font-bold tracking-[-0.03em] text-white lg:text-5xl">
            Prova social com peso visual
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 lg:text-base">
            Uma seção em contraste para separar autoridade, prova e confiança do restante da página.
          </p>
        </div>

        <div className="grid gap-12 md:grid-cols-3 relative">
          {testimonials.map((item: { quote: string, author: string, role?: string }, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative z-10 flex flex-col justify-between rounded-[2.5rem] border border-white/10 bg-white/5 p-10 text-center shadow-xl shadow-black/25 transition-transform duration-300 hover:-translate-y-2 items-center lg:text-left lg:items-stretch backdrop-blur-sm"
            >
              <div className="flex flex-col items-center lg:items-start">
                <div className="flex items-center justify-center lg:justify-start gap-1 mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FaStar key={i} className="text-amber-400" size={16} />
                  ))}
                </div>
                <FaQuoteLeft className="mb-4 text-primary/30" size={32} />
                <p className="text-lg font-medium leading-relaxed text-slate-200 italic">"{item.quote}"</p>
              </div>
              <div className="mt-8 flex w-full flex-col items-center gap-4 border-t border-white/10 pt-8 text-center lg:flex-row lg:text-left">
                <img
                  alt={item.author}
                  className="h-14 w-14 rounded-full border-4 border-[#090e1d] shadow-md grayscale transition-all duration-500 hover:grayscale-0"
                  src={avatars[idx]}
                />
                <div>
                  <h4 className="font-bold text-primary">{item.author}</h4>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{item.role || (idx === 0 ? "F-1 Student" : idx === 1 ? "B1/B2 Visitor" : "J-1 Exchange")}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
