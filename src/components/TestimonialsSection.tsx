import { motion } from "framer-motion";
import { useT } from "../i18n";

export const TestimonialsSection = () => {
  const t = useT("landing");

  if (!t.testimonials) return null;

  return (
    <section className="py-12 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-h2 text-h2 text-on-surface"
          >
            {t.testimonials.title}
          </motion.h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {t.testimonials.items.map((item: any, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="bg-white p-12 rounded-2xl shadow-sm border border-outline-variant relative"
            >
              <span className="material-symbols-outlined text-surface-container-highest text-6xl absolute top-6 right-6 opacity-50">
                format_quote
              </span>
              <p 
                className="font-body-lg text-on-surface italic mb-8 relative z-10"
                dangerouslySetInnerHTML={{ __html: item.quote }}
              />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-container-highest overflow-hidden">
                  <img
                    alt={item.author}
                    className="w-full h-full object-cover"
                    src={item.image}
                  />
                </div>
                <div>
                  <h5 className="font-label-md text-on-surface">{item.author}</h5>
                  <p className="text-label-sm text-secondary">{item.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
