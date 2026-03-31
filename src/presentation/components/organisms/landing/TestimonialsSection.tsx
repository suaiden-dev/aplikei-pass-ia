import { motion } from "framer-motion";
import { useT } from "@/i18n/LanguageContext";

interface TestimonialsSectionProps {
  avatars: string[];
}

export const TestimonialsSection = ({ avatars }: TestimonialsSectionProps) => {
  const t = useT("landing");

  return (
    <section className="py-40 px-8 lg:px-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-extrabold mb-32 text-center text-primary">
          {t.testimonials.title}
        </h2>
        <div className="grid md:grid-cols-3 gap-16">
          {t.testimonials.items.map((item: any, idx: number) => {
            const Container = idx === 2 ? motion.div : "div";
            const animationProps = idx === 2 ? {
              initial: { opacity: 0, scale: 0.95 },
              whileInView: { opacity: 1, scale: 1 },
              viewport: { once: true }
            } : {};

            return (
              <Container 
                key={idx} 
                {...animationProps}
                className="p-12 bg-white border border-slate-100 rounded-[3rem] relative hover:shadow-xl transition-shadow group text-dark-grey"
              >
                <span className="material-symbols-outlined text-primary text-6xl opacity-10 absolute top-8 right-10">format_quote</span>
                <div className="flex text-primary mb-6">
                  {[...Array(5)].map((_, i) => <span key={i} className="material-symbols-outlined">star</span>)}
                </div>
                <p className="text-slate-700 mb-12 italic leading-relaxed text-lg font-medium">"{item.quote}"</p>
                <div className="flex items-center gap-5">
                  <img alt={item.author} className="w-14 h-14 rounded-full object-cover ring-4 ring-slate-50" src={avatars[idx]} />
                  <div>
                    <p className="font-extrabold text-primary text-lg">{item.author}</p>
                    <p className="text-sm text-slate-500 font-bold">{item.role}</p>
                  </div>
                </div>
              </Container>
            );
          })}
        </div>
      </div>
    </section>
  );
};
