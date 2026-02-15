import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plane, GraduationCap, Clock, Repeat, CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import { services } from "@/data/services";

const iconMap: Record<string, React.ReactNode> = {
  plane: <Plane className="h-7 w-7" />,
  "graduation-cap": <GraduationCap className="h-7 w-7" />,
  clock: <Clock className="h-7 w-7" />,
  repeat: <Repeat className="h-7 w-7" />,
};

export default function Services() {
  return (
    <div className="py-16">
      <div className="container">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center font-display text-4xl font-bold text-foreground"
        >
          Nossos Serviços
        </motion.h1>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          Escolha o guia passo a passo ideal para o seu processo imigratório. Leia tudo antes de comprar.
        </p>

        <div className="mt-12 space-y-8">
          {services.map((s, i) => (
            <motion.div
              key={s.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="overflow-hidden rounded-xl border border-border bg-card shadow-card"
            >
              <div className="flex flex-col md:flex-row">
                {/* Left column */}
                <div className="border-b border-border p-6 md:w-1/3 md:border-b-0 md:border-r">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    {iconMap[s.icon]}
                  </div>
                  <h2 className="font-display text-xl font-bold text-foreground">{s.shortTitle}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{s.subtitle}</p>
                  <p className="mt-4 font-display text-2xl font-bold text-accent">{s.price}</p>
                  <div className="mt-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Para quem é</h4>
                    <ul className="mt-2 space-y-1">
                      {s.forWhom.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-foreground">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right column */}
                <div className="flex-1 p-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent">
                        ✅ Inclui
                      </h4>
                      <ul className="space-y-1.5">
                        {s.included.slice(0, 5).map((item, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-destructive">
                        ❌ Não inclui
                      </h4>
                      <ul className="space-y-1.5">
                        {s.notIncluded.slice(0, 4).map((item, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive/60" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button className="bg-accent text-accent-foreground shadow-button hover:bg-green-dark" asChild>
                      <Link to={`/servicos/${s.slug}`}>
                        Ver detalhes completos <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
