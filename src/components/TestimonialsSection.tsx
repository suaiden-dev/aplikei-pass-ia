import { motion } from "framer-motion";
import { FaStar, FaQuoteLeft } from "react-icons/fa";

interface TestimonialsSectionProps {
  avatars: string[];
}

const testimonials = [
  {
    quote: "O guia foi super detalhado e a IA me economizou horas organizando papelada. Finalmente, uma ferramenta que organiza tudo para você.",
    author: "Maria S.",
    role: "Estudante F-1",
  },
  {
    quote: "Eu estava tão confusa sobre os documentos do visto F-1. O checklist da Aplikei garantiu que eu não esquecesse nada. O pacote final em PDF ficou muito profissional.",
    author: "Carlos R.",
    role: "Visitante B1/B2",
  },
  {
    quote: "Ótimo custo-benefício. Não é um advogado, mas me deu a clareza que eu precisava para preparar minha própria aplicação B1/B2 com confiança.",
    author: "David K.",
    role: "Intercambista J-1",
  },
];

export const TestimonialsSection = ({ avatars }: TestimonialsSectionProps) => {
  return (
    <section className="py-40 px-8 lg:px-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl lg:text-5xl font-extrabold text-center mb-32 text-primary">
          Trusted by Applicants Like You
        </h2>
        <div className="grid md:grid-cols-3 gap-12 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-3xl -z-10" />
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between hover:-translate-y-2 transition-transform duration-300 relative z-10"
            >
              <div>
                <div className="flex items-center gap-1 mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FaStar key={i} className="text-amber-400" size={16} />
                  ))}
                </div>
                <FaQuoteLeft className="text-primary/20 mb-4" size={32} />
                <p className="text-lg text-slate-600 leading-relaxed font-medium italic">"{t.quote}"</p>
              </div>
              <div className="flex items-center gap-4 pt-8 mt-8 border-t border-slate-100">
                <img
                  alt={t.author}
                  className="w-14 h-14 rounded-full border-4 border-white shadow-md grayscale hover:grayscale-0 transition-all duration-500"
                  src={avatars[idx]}
                />
                <div>
                  <h4 className="font-bold text-primary">{t.author}</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
