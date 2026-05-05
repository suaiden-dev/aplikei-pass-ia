import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Button } from "../atoms/button";
import { useT } from "../../i18n";

export function LexCTA() {
  const landing = useT("landing");
  const t = landing?.lex?.cta || {};

  return (
    <section className="bg-primary px-8 py-20 lg:px-16 lg:py-28">
      <div className="mx-auto max-w-[800px] text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-4xl font-bold tracking-[-0.03em] text-white lg:text-5xl">
            {t.title}
          </h2>
          <p className="mt-6 text-lg text-white/80 lg:text-xl">
            {t.description}
          </p>
          <div className="mt-10 flex justify-center">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
              <Link to="/contato">
                {t.button}
                <FiArrowRight />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
