import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";

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

export const ServicesSection = () => {
  return (
    <section className="py-40 px-8 lg:px-16 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-32">
          <h2 className="text-4xl lg:text-5xl font-extrabold mb-8 text-primary">
            Nossos serviços
          </h2>
          <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Escolha o guia ideal para o seu processo imigratório.
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div key={index} className="group p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center lg:items-start lg:text-left overflow-hidden">
              <div className="w-full h-40 rounded-2xl overflow-hidden mb-8 border border-slate-50 relative">
                <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-primary">{service.title}</h3>
              <p className="text-slate-600 mb-10 leading-relaxed min-h-[80px]">{service.subtitle}</p>
              <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between pt-8 border-t border-slate-100 w-full gap-4 lg:gap-0">
                <div>
                  <p className="text-sm font-bold text-slate-400 line-through mb-1">{service.originalPrice}</p>
                  <p className="text-2xl font-black text-primary">{service.price}</p>
                </div>
                <Link
                  to={`/servicos/${service.slug}`}
                  className="w-14 h-14 rounded-full border-2 border-primary/20 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm"
                >
                  <FiChevronRight size={22} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
