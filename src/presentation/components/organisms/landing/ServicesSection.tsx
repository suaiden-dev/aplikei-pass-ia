import { Link } from "react-router-dom";
import { useT } from "@/i18n/LanguageContext";

interface ServicesSectionProps {
  // We can still pass services if we want to override, but we'll default to useT
  services?: any[];
}

export const ServicesSection = ({ services: propServices }: ServicesSectionProps) => {
  const t = useT("services");
  
  // Use prop services if provided, else use the first 3 from the modular catalog
  const displayedServices = propServices || t.data.slice(0, 3);

  return (
    <section className="py-40 px-8 lg:px-16 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-32">
          <h2 className="text-4xl lg:text-5xl font-extrabold mb-8 text-primary">
            {t.sectionTitle}
          </h2>
          <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
            {t.sectionSubtitle}
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-16">
          {displayedServices.map((service, index) => (
            <div key={index} className="group p-12 rounded-[2.5rem] bg-white border border-slate-100 hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-primary group-hover:text-white transition-all">
                <span className="material-symbols-outlined text-primary text-4xl group-hover:text-white transition-colors">
                  {service.slug.includes("b1") ? "flight_takeoff" : service.slug.includes("estudante") ? "school" : "history"}
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-6 text-primary">{service.title}</h3>
              <p className="text-slate-600 mb-10 leading-relaxed min-h-[80px]">{service.subtitle}</p>
              <div className="flex items-end justify-between pt-8 border-t border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-400 line-through mb-1">{service.originalPrice}</p>
                  <p className="text-3xl font-black text-primary">{service.price}</p>
                </div>
                <Link to={`/servicos/${service.slug}`} className="w-14 h-14 rounded-full border-2 border-primary/20 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                  <span className="material-symbols-outlined">chevron_right</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
