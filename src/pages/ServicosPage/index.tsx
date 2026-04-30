import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { MdCheckCircle, MdVerified, MdLanguage, MdSchool, MdHistory, MdSyncAlt } from "react-icons/md";
import type { IconType } from "react-icons";
import { useT } from "../../i18n";
import { getCustomerProcessStartPath } from "../../utils/customer-process-start";
import { getServiceBySlug, type ServiceMeta } from "../../data/services";

const heroIconMap: Record<string, IconType> = {
  MdVerified,
  MdLanguage,
  MdSchool,
  MdHistory,
  MdSyncAlt,
};

const featuredServiceSlugs = [
  "visto-b1-b2",
  "visto-f1",
  "extensao-status",
  "troca-status",
] as const;

const featuredServices = featuredServiceSlugs
  .map((slug) => getServiceBySlug(slug))
  .filter((service): service is ServiceMeta => Boolean(service));

export default function ServicosPage() {
  const t = useT("common");
  const p = t.servicesPage as {
    hero?: { tag?: string; title?: string; subtitle?: string };
    sectionTitle?: string;
    sectionSubtitle?: string;
    cardCta?: string;
    startNow?: string;
    features?: string[];
  };

  return (
    <div className="bg-bg text-text">
      <section className="relative overflow-hidden px-6 sm:px-8 lg:px-16 py-20 lg:py-28 bg-bg">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-0 h-72 w-72 -translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/12 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/4 translate-y-1/4 rounded-full bg-info/10 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-14 lg:gap-20 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary shadow-sm mb-8">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              {p.hero?.tag ?? "Serviços"}
            </div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <h1 className="font-display text-balance text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.98] tracking-[-0.045em] text-text">
                {p.hero?.title ?? "Escolha o visto certo para o seu momento"}
              </h1>
              <p className="mt-8 max-w-2xl text-lg sm:text-xl text-text-muted font-medium leading-relaxed mx-auto lg:mx-0">
                {p.hero?.subtitle ?? "Compare os guias principais e siga o caminho ideal com clareza."}
              </p>
            </motion.div>

            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/como-funciona"
                className="px-8 py-4 rounded-2xl border border-border bg-card text-text font-bold hover:bg-bg-subtle transition-colors"
              >
                Como funciona
              </Link>
              <Link
                to="/cadastro"
                className="px-8 py-4 rounded-2xl bg-primary text-white font-black shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center gap-2"
              >
                {p.startNow ?? "Começar agora"}
                <FiArrowRight size={18} />
              </Link>
            </div>

            <div className="mt-10 grid sm:grid-cols-3 gap-4">
              {(p.features ?? []).map((feature) => (
                <div key={feature} className="rounded-2xl border border-border bg-card px-4 py-5 shadow-sm">
                  <MdCheckCircle className="text-emerald-500 text-xl mb-3" />
                  <p className="text-sm font-bold text-text">{feature}</p>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="relative"
          >
            <div className="rounded-[2.5rem] border border-border bg-card p-6 sm:p-8 shadow-2xl">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[2rem] bg-primary text-white p-6 sm:p-7">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Guia principal</p>
                  <p className="mt-3 text-3xl font-black leading-tight">4 serviços selecionados</p>
                  <p className="mt-3 text-sm text-white/80">Foco nos vistos mais procurados para simplificar sua escolha.</p>
                </div>
                {featuredServices.slice(0, 3).map((service, index) => {
                  const Icon = heroIconMap[service.heroIconName] ?? MdVerified;
                  return (
                    <div key={service.slug} className="rounded-[2rem] border border-border bg-bg-subtle p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center shrink-0">
                          <Icon className="text-primary text-2xl" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                          {service.processType}
                        </span>
                      </div>
                      <p className="mt-4 text-lg font-black text-text leading-tight">{service.title}</p>
                      <p className="mt-2 text-sm text-text-muted">{service.price}</p>
                      <div className="mt-4 h-1.5 w-full rounded-full bg-border overflow-hidden">
                        <div className="h-full w-3/4 rounded-full bg-primary" />
                      </div>
                      <p className="mt-3 text-xs font-medium text-text-muted">
                        {index === 0 ? "Comece pelo guia mais buscado." : "Disponível para contratação imediata."}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-6 sm:px-8 lg:px-16 py-20 lg:py-24 bg-bg-subtle border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-primary font-bold tracking-widest uppercase text-xs mb-4">
              {p.sectionTitle ?? "Vistos principais"}
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-primary">
              {p.sectionSubtitle ?? "Selecionamos os serviços mais procurados para facilitar sua escolha."}
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {featuredServices.map((service) => {
              const Icon = heroIconMap[service.heroIconName] ?? MdVerified;
              const startPath = getCustomerProcessStartPath(service.slug);

              return (
                <motion.article
                  key={service.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45 }}
                  className="rounded-[2rem] border border-border bg-card p-7 sm:p-8 shadow-sm hover:shadow-xl transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row gap-5 sm:gap-6">
                    <div className="w-16 h-16 rounded-2xl border border-border bg-bg-subtle flex items-center justify-center shrink-0">
                      <Icon className="text-primary text-3xl" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-primary/10 text-primary">
                          {service.processType}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-bg-subtle text-text-muted border border-border">
                          {service.price}
                        </span>
                      </div>
                      <h3 className="mt-4 text-2xl font-black text-text leading-tight">{service.title}</h3>
                      <p className="mt-3 text-text-muted leading-relaxed">{service.subtitle}</p>
                    </div>
                  </div>

                  <div className="mt-7 grid gap-3 sm:grid-cols-3">
                    {service.included.slice(0, 3).map((item) => (
                      <div key={item} className="rounded-2xl border border-border bg-bg-subtle px-4 py-4">
                        <p className="text-sm font-bold text-text">{item}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    <Link
                      to={`/servicos/${service.slug}`}
                      className="flex-1 rounded-2xl border border-border bg-card px-5 py-4 text-center font-black text-text hover:bg-bg-subtle transition-colors"
                    >
                      {p.cardCta ?? "Ver detalhes"}
                    </Link>
                    <Link
                      to={startPath}
                      className="flex-1 rounded-2xl bg-primary px-5 py-4 text-center font-black text-white shadow-lg shadow-primary/20 hover:bg-primary-hover transition-colors"
                    >
                      {p.startNow ?? "Começar agora"}
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
