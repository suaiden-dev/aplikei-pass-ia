import { motion } from "framer-motion";
import { ContactSection } from "../../components/organisms/ContactSection";

export default function ContactPage() {
  return (
    <div className="bg-bg min-h-[calc(100vh-80px)] flex flex-col justify-center">
      <section className="pt-20 pb-12 px-8 lg:px-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-display text-5xl lg:text-7xl font-black text-primary tracking-tighter mb-6">
            Vamos conversar?
          </h1>
          <p className="text-lg lg:text-2xl text-text-muted max-w-2xl mx-auto">
            Estamos prontos para tirar suas dúvidas e ajudar você no seu processo imigratório.
          </p>
        </motion.div>
      </section>

      <ContactSection />
    </div>
  );
}
