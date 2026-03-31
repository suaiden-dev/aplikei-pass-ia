import { useT } from "@/i18n/LanguageContext";

interface HowItWorksSectionProps {}

export const HowItWorksSection = ({}: HowItWorksSectionProps) => {
  const t = useT("howItWorks");

  return (
    <section className="py-40 px-8 lg:px-16 bg-white border-y border-slate-100 text-dark-grey">
      <div className="max-w-7xl mx-auto">
        <div className="mb-32">
          <span className="text-primary font-bold uppercase tracking-[0.2em] text-sm">
            {t.subtitle}
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold mt-6 text-primary">
            {t.title}
          </h2>
        </div>
        <div className="grid md:grid-cols-4 gap-20 relative">
          <div className="hidden md:block absolute top-10 left-0 w-full h-px bg-slate-200 -z-10"></div>
          
          {t.steps.slice(0, 4).map((step, idx) => (
            <div key={idx} className="relative bg-white pr-6">
              <div className={`w-20 h-20 ${idx === 0 ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-white text-primary border-4 border-primary'} rounded-2xl flex items-center justify-center font-bold text-3xl mb-10`}>
                0{idx + 1}
              </div>
              <h4 className="text-2xl font-bold mb-5 text-primary">{step.title}</h4>
              <p className="text-slate-600 leading-relaxed text-lg font-medium">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
