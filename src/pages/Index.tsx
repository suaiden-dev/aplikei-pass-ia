import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/presentation/components/atoms/accordion";

const heroImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuCnB1Ui5KR81_ZMuo2jsx-CE2-eEAymcigniK9dSdehjIJcJMpbaGUQSx37FIqHuJxB-b-g-8I9MgmdvUyc5lm6CWEgB6x25jP6fuBOdopIb7Pmy17WSCnKle7MuRB92hOoZ9wctpAcGeEplfRK4A9WS0yh_6LOr2j3QTXUFSjuMlQEXtUPT9ETTQv-iX0O1s8QEcg4w6GdquEsnSh8yPmGnzn7xQoB8c4AAY4IOhpFPwS94-7-0wEpwMiqDBmlCjbpqGG7nurSHVGT";
const avatar1 = "https://lh3.googleusercontent.com/aida-public/AB6AXuDlnEc1G-SbZB8Y7xp2Hzl3zzkKk70AbFiq_x9irj4jgOeOKkBHNQXydZlfRc05pzsT-xeVCYT2pe53RxnPsRyhFPOlCp4fUsezeATzXX5QZgEhsfTV1Jk8pzGcDXz9IHtMbzyXSRcbNy7evt1Bj5YiMeUOnV0ptnrQxDxIYvM5e3obyR-aOzPywunfU12b9FrIAlq4S6SQ8vQe11gsFbJAJ8j1vciDRzMZG1BCboKCPcx6jkNj_LjNu_hy_CeY90Nrj8yKq2TDhTXO";
const avatar2 = "https://lh3.googleusercontent.com/aida-public/AB6AXuCWNWOLfmN2ydf_8zptu7AJWO0gYi70DXdQl7aOOxNSmaaaRAZouDTOQu0K91w4hFGBHMrncmyl6-cMIbnJEHCgXMs9TV1qVGzwTswsl7aM7nxdGN0VlNH94dUuQlpfoXup7cUqzZM1Df6Jv-9Gw4wZTr1pjMMsJ5WXj8Dwz59jan0gQK6fhkqIrUy2qZKRjagl2NUkSVrZv6qZPnjrsp9YYa7r1OJ5noAmQ2qEX_xI2Mfja669a0zrNOUqNvgJHa2ZcgkoR_NzVNZD";
const avatar3 = "https://lh3.googleusercontent.com/aida-public/AB6AXuAD2kCXX_3Jos98rp_p5mVfMiJlGb_AeWmzAbthzXtHXVRVKJSCWxjlybp_t95BLR5od3RVenblwNhGqBKBmJBDh6ZTKpoSXrskVYR1zn9qL5UYfo0NM-C__MBBIT8bpJsQ_2VLSjlKfSIcrYp4Az5pn0FyCXkPfS6JfzTq9o5EQM1Rv9OzARaaDivOYXtw29DlwOQo56dG0S6z1yY9_88xvNuQaO8d9bzCAfOZrWfUKlBItccvvt0mCLg2tpB6nxbbd9gOOin6vEwb";

export default function Index() {
  const { lang, t } = useLanguage();

  return (
    <div className="bg-background-light font-body text-dark-grey antialiased">
      {/* Hero Header Section */}
      <header className="relative bg-highlight overflow-hidden py-32 lg:py-40 px-8 lg:px-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <div className="z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/20 rounded-full text-white font-bold text-sm mb-8">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              TECNOLOGIA + SUPORTE HUMANO
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.1] mb-8 text-white">
              {t.hero.title[lang]} <span className="text-primary">{t.hero.titleHighlight[lang]}</span>
            </h1>
            <p className="text-xl text-slate-300 font-medium max-w-xl mb-12 leading-relaxed">
              {t.hero.subtitle[lang]}
            </p>
            <div className="flex flex-col sm:flex-row gap-5">
              <Link to="/servicos" className="px-10 py-5 bg-primary text-white font-bold text-lg rounded-full shadow-2xl shadow-primary/30 hover:scale-105 transition-transform flex items-center justify-center gap-2">
                Começar Agora <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <Link to="/como-funciona" className="px-10 py-5 bg-white/10 border border-white/20 text-white font-bold text-lg rounded-full hover:bg-white/20 transition-colors flex items-center justify-center">
                Ver planos
              </Link>
            </div>
            <div className="mt-16 flex items-center gap-4">
              <div className="flex -space-x-3">
                <img alt="User" className="w-12 h-12 rounded-full border-4 border-highlight" src={avatar1} />
                <img alt="User" className="w-12 h-12 rounded-full border-4 border-highlight" src={avatar2} />
                <img alt="User" className="w-12 h-12 rounded-full border-4 border-highlight" src={avatar3} />
              </div>
              <p className="text-sm font-bold text-slate-400 tracking-wide">+1.500 brasileiros já aprovados este ano</p>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-primary/10 rounded-[3.5rem] rotate-2"></div>
            <img alt="Estudante focada" className="relative z-10 w-full aspect-[4/5] object-cover rounded-[3rem] shadow-3xl" src={heroImage} />
            <div className="absolute bottom-12 -left-8 z-20 bg-white p-6 rounded-2xl shadow-2xl flex items-center gap-5 border border-slate-50">
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 text-3xl font-bold">verified</span>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Taxa de Sucesso</p>
                <p className="text-2xl font-black text-primary">98.2%</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Services Section */}
      <section className="py-40 px-8 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-32">
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-8 text-primary">Escolha o visto ideal para sua jornada</h2>
            <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">Oferecemos guias passo a passo e suporte de IA para as categorias mais procuradas por brasileiros.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-16">
            <div className="group p-12 rounded-[2.5rem] bg-white border border-slate-100 hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/5">
              <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-primary group-hover:text-white transition-all">
                <span className="material-symbols-outlined text-primary text-4xl group-hover:text-white transition-colors">flight_takeoff</span>
              </div>
              <h3 className="text-2xl font-bold mb-6 text-primary">Visto de Turismo (B1/B2)</h3>
              <p className="text-slate-600 mb-10 leading-relaxed min-h-[80px]">{t.servicesData[0].subtitle[lang]}</p>
              <div className="flex items-end justify-between pt-8 border-t border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-400 line-through mb-1">{t.servicesData[0].originalPrice[lang]}</p>
                  <p className="text-3xl font-black text-primary">{t.servicesData[0].price[lang]}</p>
                </div>
                <Link to={`/servicos/${t.servicesData[0].slug}`} className="w-14 h-14 rounded-full border-2 border-primary/20 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                  <span className="material-symbols-outlined">chevron_right</span>
                </Link>
              </div>
            </div>
            
            <div className="group p-12 rounded-[2.5rem] bg-white border border-slate-100 hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/5">
              <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-primary group-hover:text-white transition-all">
                <span className="material-symbols-outlined text-primary text-4xl group-hover:text-white transition-colors">school</span>
              </div>
              <h3 className="text-2xl font-bold mb-6 text-primary">Visto de Estudante (F-1)</h3>
              <p className="text-slate-600 mb-10 leading-relaxed min-h-[80px]">{t.servicesData[1].subtitle[lang]}</p>
              <div className="flex items-end justify-between pt-8 border-t border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-400 line-through mb-1">{t.servicesData[1].originalPrice[lang]}</p>
                  <p className="text-3xl font-black text-primary">{t.servicesData[1].price[lang]}</p>
                </div>
                <Link to={`/servicos/${t.servicesData[1].slug}`} className="w-14 h-14 rounded-full border-2 border-primary/20 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                  <span className="material-symbols-outlined">chevron_right</span>
                </Link>
              </div>
            </div>

            <div className="group p-12 rounded-[2.5rem] bg-white border border-slate-100 hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/5">
              <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-primary group-hover:text-white transition-all">
                <span className="material-symbols-outlined text-primary text-4xl group-hover:text-white transition-colors">history</span>
              </div>
              <h3 className="text-2xl font-bold mb-6 text-primary">Renovação de Visto</h3>
              <p className="text-slate-600 mb-10 leading-relaxed min-h-[80px]">{t.servicesData[2].subtitle[lang]}</p>
              <div className="flex items-end justify-between pt-8 border-t border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-400 line-through mb-1">{t.servicesData[2].originalPrice[lang]}</p>
                  <p className="text-3xl font-black text-primary">{t.servicesData[2].price[lang]}</p>
                </div>
                <Link to={`/servicos/${t.servicesData[2].slug}`} className="w-14 h-14 rounded-full border-2 border-primary/20 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                  <span className="material-symbols-outlined">chevron_right</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Step by Step Section */}
      <section className="py-40 px-8 lg:px-16 bg-white border-y border-slate-100 text-dark-grey">
        <div className="max-w-7xl mx-auto">
          <div className="mb-32">
            <span className="text-primary font-bold uppercase tracking-[0.2em] text-sm">Passo a Passo</span>
            <h2 className="text-4xl lg:text-5xl font-extrabold mt-6 text-primary">Como funciona a Aplikei</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-20 relative">
            <div className="hidden md:block absolute top-10 left-0 w-full h-px bg-slate-200 -z-10"></div>
            <div className="relative bg-white pr-6">
              <div className="w-20 h-20 bg-primary text-white rounded-2xl flex items-center justify-center font-bold text-3xl mb-10 shadow-xl shadow-primary/20">01</div>
              <h4 className="text-2xl font-bold mb-5 text-primary">Escolha o Visto</h4>
              <p className="text-slate-600 leading-relaxed text-lg font-medium">Selecione a categoria que melhor se adapta aos seus planos de viagem ou estudo.</p>
            </div>
            <div className="relative bg-white pr-6">
              <div className="w-20 h-20 bg-white text-primary border-4 border-primary rounded-2xl flex items-center justify-center font-bold text-3xl mb-10">02</div>
              <h4 className="text-2xl font-bold mb-5 text-primary">Análise de IA</h4>
              <p className="text-slate-600 leading-relaxed text-lg font-medium">Nossa inteligência artificial analisa seus dados para garantir conformidade total.</p>
            </div>
            <div className="relative bg-white pr-6">
              <div className="w-20 h-20 bg-white text-primary border-4 border-primary rounded-2xl flex items-center justify-center font-bold text-3xl mb-10">03</div>
              <h4 className="text-2xl font-bold mb-5 text-primary">Organização</h4>
              <p className="text-slate-600 leading-relaxed text-lg font-medium">Organizamos toda a documentação necessária em um kit pronto para impressão.</p>
            </div>
            <div className="relative bg-white">
              <div className="w-20 h-20 bg-white text-primary border-4 border-primary rounded-2xl flex items-center justify-center font-bold text-3xl mb-10">04</div>
              <h4 className="text-2xl font-bold mb-5 text-primary">Protocolo</h4>
              <p className="text-slate-600 leading-relaxed text-lg font-medium">Com o pacote completo em mãos, você está pronto para o consulado com confiança.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-40 px-8 lg:px-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-extrabold mb-32 text-center text-primary">Quem já aprovou o visto com a gente</h2>
          <div className="grid md:grid-cols-3 gap-16">
            <div className="p-12 bg-white border border-slate-100 rounded-[3rem] relative hover:shadow-xl transition-shadow group text-dark-grey">
              <span className="material-symbols-outlined text-primary text-6xl opacity-10 absolute top-8 right-10">format_quote</span>
              <div className="flex text-primary mb-6">
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
              </div>
              <p className="text-slate-700 mb-12 italic leading-relaxed text-lg font-medium">"O guia foi super detalhado e a IA me economizou horas de papelada. Finalmente, uma ferramenta que organiza tudo pra você!"</p>
              <div className="flex items-center gap-5">
                <img alt="Maria Silva" className="w-14 h-14 rounded-full object-cover ring-4 ring-slate-50" src={avatar1} />
                <div>
                  <p className="font-extrabold text-primary text-lg">Maria Silva</p>
                  <p className="text-sm text-slate-500 font-bold">Visto B1/B2 Aprovado</p>
                </div>
              </div>
            </div>

            <div className="p-12 bg-white border border-slate-100 rounded-[3rem] relative hover:shadow-xl transition-shadow group text-dark-grey">
              <span className="material-symbols-outlined text-primary text-6xl opacity-10 absolute top-8 right-10">format_quote</span>
              <div className="flex text-primary mb-6">
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
              </div>
              <p className="text-slate-700 mb-12 italic leading-relaxed text-lg font-medium">"Eu estava confuso com o processo do F-1, mas o checklist da Aplikei me deu segurança. Não esqueci nada e o PDF gerado ficou impecável."</p>
              <div className="flex items-center gap-5">
                <img alt="Carlos Ramos" className="w-14 h-14 rounded-full object-cover ring-4 ring-slate-50" src={avatar2} />
                <div>
                  <p className="font-extrabold text-primary text-lg">Carlos Ramos</p>
                  <p className="text-sm text-slate-500 font-bold">Visto F-1 Aprovado</p>
                </div>
              </div>
            </div>

            <div className="p-12 bg-white border border-slate-100 rounded-[3rem] relative hover:shadow-xl transition-shadow group text-dark-grey">
              <span className="material-symbols-outlined text-primary text-6xl opacity-10 absolute top-8 right-10">format_quote</span>
              <div className="flex text-primary mb-6">
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
              </div>
              <p className="text-slate-700 mb-12 italic leading-relaxed text-lg font-medium">"Atendimento rápido e suporte nota 10. Ter todos os documentos organizados me deu muita clareza na entrevista consular."</p>
              <div className="flex items-center gap-5">
                <img alt="Daniela Klein" className="w-14 h-14 rounded-full object-cover ring-4 ring-slate-50" src={avatar3} />
                <div>
                  <p className="font-extrabold text-primary text-lg">Daniela Klein</p>
                  <p className="text-sm text-slate-500 font-bold">Visto B1/B2 Renovado</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-40 px-8 lg:px-16 bg-cloud-grey">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-extrabold text-center mb-32 text-primary">Dúvidas Frequentes</h2>
          <Accordion type="single" collapsible className="space-y-8">
            <AccordionItem value="faq-1" className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <AccordionTrigger className="w-full flex items-center justify-between p-10 text-left hover:bg-slate-50 transition-colors font-bold text-xl text-primary hover:no-underline group">
                <span>Quanto tempo tenho acesso à ferramenta de IA?</span>
                <span className="material-symbols-outlined text-primary transition-transform group-data-[state=open]:rotate-45">add</span>
              </AccordionTrigger>
              <AccordionContent className="px-10 pb-10 text-slate-600 leading-relaxed text-lg font-medium">
                Você mantém acesso à nossa plataforma durante todo o seu processo, até a conclusão da sua aplicação para o visto.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-2" className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <AccordionTrigger className="w-full flex items-center justify-between p-10 text-left hover:bg-slate-50 transition-colors font-bold text-xl text-primary hover:no-underline group">
                <span>Quais tipos de visto vocês cobrem hoje?</span>
                <span className="material-symbols-outlined text-primary transition-transform group-data-[state=open]:rotate-45">add</span>
              </AccordionTrigger>
              <AccordionContent className="px-10 pb-10 text-slate-600 leading-relaxed text-lg font-medium">
                Atualmente focamos em Vistos de Turismo (B1/B2), Vistos de Estudante (F-1) e Renovação de Vistos.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-3" className="bg-white rounded-2xl border-2 border-primary/20 overflow-hidden shadow-md">
              <AccordionTrigger className="w-full flex items-center justify-between p-10 text-left bg-slate-50 hover:bg-slate-100 transition-colors font-bold text-xl text-primary hover:no-underline group">
                <span>A Aplikei é um escritório de advocacia?</span>
                <span className="material-symbols-outlined text-primary transition-transform group-data-[state=open]:rotate-45">add</span>
              </AccordionTrigger>
              <AccordionContent className="px-10 pb-10 text-slate-600 leading-relaxed text-lg font-medium bg-slate-50">
                Não, a Aplikei é uma plataforma tecnológica que facilita o preenchimento e organização de documentos. Não prestamos consultoria jurídica.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </div>
  );
}
