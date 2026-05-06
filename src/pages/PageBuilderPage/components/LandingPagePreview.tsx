import { Button } from "../../../components/atoms/button";
import type { LandingPageConfig } from "../types";

interface LandingPagePreviewProps {
  config: LandingPageConfig;
}

export function LandingPagePreview({ config }: LandingPagePreviewProps) {
  return (
    <div className="min-h-full overflow-x-hidden bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:h-20 md:px-6">
          <img
            src={config.logoUrl}
            alt="Logo"
            className="h-8 w-auto object-contain md:h-10"
          />
          <div className="flex items-center gap-2">
            <a href={config.loginUrl}>
              <Button
                variant="outline"
                className="h-10 rounded-full border-slate-700 px-4 text-xs text-slate-100 hover:bg-slate-900 md:h-11 md:px-6 md:text-sm"
              >
                {config.loginButtonLabel}
              </Button>
            </a>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.28),_rgba(2,6,23,1)_42%)] px-4 py-14 md:px-6 md:py-24">
        <div className="absolute -right-32 top-12 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 md:gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
              Advocacia imigratória estratégica
            </p>
            <h1 className="mt-5 text-3xl font-black leading-tight text-white sm:text-4xl md:text-6xl">
              {config.heroTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base md:mt-6 md:text-lg">
              {config.heroSubtitle}
            </p>
            <div className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:items-center">
              <a href={config.primaryCtaUrl}>
                <Button className="h-12 w-full rounded-full bg-white px-8 text-sm font-bold text-slate-900 hover:bg-slate-200 sm:w-auto">
                  {config.primaryCtaLabel}
                </Button>
              </a>
              <a href={config.secondaryCtaUrl}>
                <Button
                  variant="outline"
                  className="h-12 w-full rounded-full border-slate-500 px-8 text-sm font-bold text-slate-100 hover:bg-slate-900 sm:w-auto"
                >
                  {config.secondaryCtaLabel}
                </Button>
              </a>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-700/60 bg-slate-900/70 p-5 shadow-[0_20px_70px_rgba(8,145,178,0.25)] sm:p-6">
            <p className="text-sm font-semibold text-cyan-300">
              Atendimento com advogado responsável
            </p>
            <p className="mt-2 text-2xl font-black text-white">
              {config.lawyerName}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              {config.lawyerCtaText}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-center text-xs text-slate-300">
              <div className="rounded-xl bg-slate-800/70 p-3">
                <p className="text-xl font-black text-white">+2.000</p>
                <p>Clientes atendidos</p>
              </div>
              <div className="rounded-xl bg-slate-800/70 p-3">
                <p className="text-xl font-black text-white">4.9/5</p>
                <p>Satisfação média</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-14 text-slate-900 md:px-6 md:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-black md:text-4xl">
            Serviços de vistos com foco em resultado
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-center text-slate-600">
            Soluções jurídicas para cada etapa da sua jornada imigratória, com
            organização documental e estratégia personalizada.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              {
                enabledKey: "serviceB1B2Enabled" as const,
                serviceSlug: "visa-b1b2",
                title: "Visto de Turismo",
                badge: "B1/B2",
                text: "Turismo e negócios com preparação de perfil, DS-160 e orientação de entrevista.",
              },
              {
                enabledKey: "serviceF1Enabled" as const,
                serviceSlug: "visa-f1",
                title: "Visto de Estudante",
                badge: "F1",
                text: "Plano completo para estudantes, alinhando documentação acadêmica e narrativa migratória.",
              },
              {
                enabledKey: "serviceEOSEnabled" as const,
                serviceSlug: "visa-eos",
                title: "Extensão de Status",
                badge: "EOS",
                text: "Solicitação técnica para ampliar permanência regular sem improviso.",
              },
              {
                enabledKey: "serviceCOSEnabled" as const,
                serviceSlug: "visa-cos",
                title: "Troca de Status",
                badge: "COS",
                text: "Mudança de categoria com estratégia jurídica e mitigação de riscos de negação.",
              },
            ]
              .filter((s) => config[s.enabledKey])
              .map((service) => (
                <article
                  key={service.title}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50 p-6"
                >
                  <span className="inline-block self-start rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {service.badge}
                  </span>
                  <h3 className="mt-2 text-xl font-black">{service.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-slate-600">{service.text}</p>
                  <a
                    href={`/checkout?office=${config.officeSlug}&product=${service.serviceSlug}`}
                    className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-slate-900 px-6 text-sm font-bold text-white hover:bg-slate-700"
                  >
                    Contratar serviço
                  </a>
                </article>
              ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-100 px-4 py-14 text-slate-900 md:px-6 md:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-black md:text-4xl">
            Como funciona
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Diagnóstico",
                text: "Análise do seu histórico e do objetivo migratório.",
              },
              {
                step: "02",
                title: "Plano Jurídico",
                text: "Definição de estratégia e checklist documental.",
              },
              {
                step: "03",
                title: "Execução",
                text: "Preenchimento, revisão e acompanhamento até o protocolo.",
              },
            ].map((item) => (
              <article
                key={item.step}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <p className="text-sm font-black text-cyan-700">{item.step}</p>
                <h3 className="mt-2 text-xl font-black">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-black text-white md:text-4xl">
            Quem contrata recomenda
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              "“Fui orientado em cada etapa e consegui organizar tudo sem insegurança.”",
              "“Atendimento técnico e humano. Entendi exatamente o que precisava fazer.”",
              "“O plano para troca de status foi claro e me deu previsibilidade.”",
            ].map((quote) => (
              <blockquote
                key={quote}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-300"
              >
                {quote}
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-14 text-slate-900 md:px-6 md:py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-black md:text-4xl">
            Dúvidas frequentes
          </h2>
          <div className="mt-8 space-y-3">
            {[
              {
                q: "Qual visto é ideal para o meu perfil?",
                a: "Depende do objetivo, histórico e tempo planejado. A análise inicial define a melhor rota.",
              },
              {
                q: "Vocês ajudam com documentação e formulários?",
                a: "Sim. Você recebe checklist, revisão técnica e orientação para submissão correta.",
              },
              {
                q: "É possível acelerar meu processo?",
                a: "Cada caso tem limites legais e operacionais, mas trabalhamos para reduzir riscos e retrabalho.",
              },
            ].map((item) => (
              <article
                key={item.q}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <h3 className="text-sm font-black">{item.q}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.a}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-cyan-600 to-blue-700 px-4 py-14 text-white md:px-6 md:py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 text-center md:flex-row md:items-start md:text-left">
          <div>
            <h2 className="text-2xl font-black md:text-3xl">
              Pronto para estruturar seu pedido de visto com segurança?
            </h2>
            <p className="mt-2 text-cyan-100">
              Fale com nossa equipe e receba um plano inicial para o seu caso.
            </p>
          </div>
          <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:items-center">
            <a href={config.primaryCtaUrl}>
              <Button className="h-12 w-full rounded-full bg-white px-8 font-bold text-slate-900 hover:bg-slate-100 sm:w-auto">
                {config.primaryCtaLabel}
              </Button>
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800 bg-slate-950 px-6 py-8 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} {config.lawyerName}. Todos os direitos
        reservados.
      </footer>
    </div>
  );
}
