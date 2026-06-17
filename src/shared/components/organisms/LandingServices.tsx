import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { Card } from "../atoms/card";
import { SectionHeader } from "../molecules/SectionHeader";
import { PublicButton } from "../atoms/PublicButton";

interface Service {
  slug: string;
  title: string;
  subtitle: string;
  price: string;
  originalPrice: string;
  image: string;
}

const services: Service[] = [
  {
    slug: "visto-b1-b2",
    title: "Turismo e Negócios (B1/B2)",
    subtitle: "Guia completo passo a passo e checklist para o visto de turista americano.",
    price: "US$ 200,00",
    originalPrice: "US$ 400,00",
    image: "https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?auto=format&fit=crop&q=80&w=800",
  },
  {
    slug: "visto-f1",
    title: "Estudante (F-1)",
    subtitle: "Instruções detalhadas para obtenção do I-20 e entrevista consular.",
    price: "US$ 350,00",
    originalPrice: "US$ 700,00",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800",
  },
  {
    slug: "extensao-status",
    title: "Extensão de Status (EOS)",
    subtitle: "Deseja ficar mais tempo nos EUA? Saiba como estender seu prazo legal.",
    price: "US$ 200,00",
    originalPrice: "US$ 400,00",
    image: "https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?auto=format&fit=crop&q=80&w=800",
  },
  {
    slug: "troca-status",
    title: "Troca de Status (COS)",
    subtitle: "Mude sua categoria de visto (ex: B2 para F1) sem sair dos Estados Unidos.",
    price: "US$ 350,00",
    originalPrice: "US$ 700,00",
    image: "https://images.unsplash.com/photo-1569098644584-210bcd375b59?auto=format&fit=crop&q=80&w=800",
  },
];

export function LandingServices() {
  return (
    <section className="public-section bg-bg">
      <div className="public-container-wide">
        <SectionHeader
          eyebrow="Servicos"
          title="Nossos serviços"
          description="Escolha o guia ideal para o seu processo de visto."
          className="mb-16"
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service) => (
            <Card key={service.slug} className="group flex h-full flex-col overflow-hidden p-0 transition-transform duration-200 hover:-translate-y-1 hover:border-primary/25">
              <div className="relative h-44 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
              </div>

              <div className="flex flex-1 flex-col p-6">
                <div className="space-y-2">
                  <h3 className="font-display text-2xl font-bold tracking-[-0.03em] text-text">{service.title}</h3>
                  <p className="text-sm leading-relaxed text-text-muted">{service.subtitle}</p>
                </div>

                <div className="mt-8 flex items-end justify-between gap-4 border-t border-border pt-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-text-muted line-through">{service.originalPrice}</p>
                    <p className="mt-1 text-2xl font-black tracking-[-0.03em] text-primary">{service.price}</p>
                  </div>
                  <PublicButton asChild tone="outline" size="icon">
                    <Link to={`/servicos/${service.slug}`} aria-label={service.title}>
                      <FiChevronRight />
                    </Link>
                  </PublicButton>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
