import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@shared/hooks/useAuth";
import { useT } from "@app/app/i18n";
import { useTheme } from "@shared/hooks/useTheme";
import { useDemoBooking } from "@shared/components/organisms/DemoBookingModal";
import { getDefaultRouteForRole } from "@app/app/router/authRedirect";
import { PublicButton } from "@shared/components/atoms/PublicButton";
import {
  AUTO_ICONS,
  FIRM_LOGOS,
  PAIN_ICONS,
  TESTIMONIAL_IMAGES_ROW1,
  TESTIMONIAL_IMAGES_ROW2,
} from "./homePageContent";
import "./landing.css";

type TextEntry = {
  title: string;
  desc: string;
};

type TextStep = {
  n: string | number;
  title: string;
  desc: string;
};

type TextFaq = {
  q: string;
  a: string;
};

type SolutionEntry = {
  title: string;
  badge?: string | null;
  desc: string;
};

type TestimonialEntry = {
  quote: [string, string, string];
  name: string;
  role: string;
  initials?: string;
};

type AutomationTask = {
  done: boolean;
  title: string;
  sub: string;
};

function MobilePlatformShowcase() {
  const tLanding = useT("landing");
  const ui = tLanding.mobileUI ?? {
    nav: "MY CASES", title: "F-1 VISA", subtitle: "STUDENT/ACADEMIC", office: "ALMEIDA & PARTNERS",
    step: "DS-160 FORM", cta: "START STEP 1", panel: "DASHBOARD", active: "ACTIVE",
    progress: "0%", nextStep1: "RECEIVE I-20", nextStep2: "SCHEDULE INTERVIEW",
  };

  return (
    <div className="lp-mobile-stage" aria-hidden="true">
      <div className="lp-mobile-orb" />
      <div className="lp-mobile-card lp-mobile-card-back">
        <div className="lp-mobile-topbar">
          <span className="lp-mobile-menu" />
          <strong>{ui.panel}</strong>
          <span className="lp-mobile-bell" />
        </div>
        <div className="lp-mobile-body">
          <h4>{ui.panel}</h4>
          <p>{ui.subtitle}</p>
          <div className="lp-mobile-case-card">
            <div className="lp-mobile-case-head">
              <span className="lp-mobile-globe" />
              <span className="lp-mobile-pill">{ui.active}</span>
            </div>
            <h5>Reaplicação F-1</h5>
            <span className="lp-mobile-case-state">{ui.active}</span>
            <span className="lp-mobile-office">{ui.office}</span>
            <div className="lp-mobile-progress-head">
              <span>PROGRESSO</span>
              <strong>{ui.progress}</strong>
            </div>
            <div className="lp-mobile-progress-bar"><i /></div>
          </div>
        </div>
      </div>

      <div className="lp-mobile-card lp-mobile-card-front">
        <div className="lp-mobile-topbar">
          <span className="lp-mobile-menu" />
          <strong>{ui.nav}</strong>
          <span className="lp-mobile-bell" />
        </div>
        <div className="lp-mobile-body">
          <div className="lp-mobile-breadcrumb">← {ui.nav}</div>
          <div className="lp-mobile-detail-head">
            <span className="lp-mobile-appmark">A</span>
            <div>
              <h4>{ui.title}</h4>
              <p>{ui.subtitle}</p>
              <span className="lp-mobile-office">{ui.office}</span>
            </div>
          </div>
          <div className="lp-mobile-step-card">
            <div className="lp-mobile-step-num">1</div>
            <div>
              <h5>{ui.step}</h5>
              <p>{ui.subtitle}</p>
            </div>
            <div className="lp-mobile-step-box">
              <p>{ui.subtitle}</p>
              <button type="button">{ui.cta}</button>
            </div>
          </div>
          <div className="lp-mobile-step-lite">
            <span />
            <div>
              <h6>{ui.nextStep1}</h6>
              <p>I-20</p>
            </div>
          </div>
          <div className="lp-mobile-step-lite">
            <span />
            <div>
              <h6>{ui.nextStep2}</h6>
              <p>DS-160</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SVG icons ──────────────────────────────────────────────────────
const ArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" width="13" height="13"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
);

// ── Reveal on scroll ───────────────────────────────────────────────
function useReveal(containerRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const els = Array.from(container.querySelectorAll(".lp-reveal"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        });
      },
      { threshold: 0.06, rootMargin: "0px 0px -50px 0px" },
    );
    els.forEach((el) => io.observe(el));
    setTimeout(() => {
      container.querySelectorAll(".lp-reveal:not(.in)").forEach((el) => el.classList.add("in"));
    }, 2500);
    return () => io.disconnect();
  }, [containerRef]);
}

function HeroArtwork() {
  return (
    <div className="lp-cta-mock lp-hero-device" aria-hidden="true">
      <div className="lp-cta-monitor">
        <DashboardMockup />
      </div>
      <div className="lp-cta-monitor-stand" />
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="lp-dash-mock" aria-hidden="true">
      <div className="lp-dash-topbar">
        <img src="/logo.png" alt="" className="lp-dash-logo" />
        <div className="lp-dash-search">
          <span>Buscar…</span>
          <span className="lp-dash-kbd">⌘K</span>
        </div>
        <div className="lp-dash-user">
          <span className="lp-dash-bell" />
          <span className="lp-dash-avatar" />
          <span className="lp-dash-user-info">
            <strong>Maria Oliveira</strong>
            <small>Administradora</small>
          </span>
        </div>
      </div>
      <div className="lp-dash-body">
        <nav className="lp-dash-sidebar">
          <span className="lp-dash-nav-group">Principal</span>
          <span className="lp-dash-nav-item active">Dashboard</span>
          <span className="lp-dash-nav-item">Produtos</span>
          <span className="lp-dash-nav-item">Processos</span>
          <span className="lp-dash-nav-item">Tarefas</span>
          <span className="lp-dash-nav-group">Gestão</span>
          <span className="lp-dash-nav-item">Equipe</span>
          <span className="lp-dash-nav-item">Documentos</span>
          <span className="lp-dash-nav-item">Clientes</span>
          <span className="lp-dash-nav-item">Relatórios</span>
          <span className="lp-dash-nav-group">Financeiro</span>
          <span className="lp-dash-nav-item">Financeiro</span>
          <span className="lp-dash-nav-item">Configurações</span>
        </nav>
        <div className="lp-dash-main">
          <div className="lp-dash-head">
            <h3>Dashboard</h3>
            <span className="lp-dash-period">Este mês ⌄</span>
          </div>
          <div className="lp-dash-stats">
            <div className="lp-dash-stat">
              <span>Clientes ativos</span>
              <strong>142 <small className="up">+15%</small></strong>
            </div>
            <div className="lp-dash-stat">
              <span>Taxa de aprovação</span>
              <strong>98.7% <small className="up">+0.5%</small></strong>
            </div>
            <div className="lp-dash-stat">
              <span>Tempo economizado</span>
              <strong>352h <small className="up">+28%</small></strong>
            </div>
            <div className="lp-dash-stat">
              <span>Processos no prazo</span>
              <strong>99.3% <small className="up">+1.2%</small></strong>
            </div>
          </div>
          <div className="lp-dash-grid">
            <div className="lp-dash-card lp-dash-chart-card">
              <h4>Receita</h4>
              <svg className="lp-dash-line" viewBox="0 0 240 80" preserveAspectRatio="none">
                <polyline points="0,60 30,55 60,58 90,40 120,46 150,28 180,32 210,16 240,20" fill="none" stroke="#2d63ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="lp-dash-card lp-dash-tasks-card">
              <h4>Tarefas</h4>
              <ul className="lp-dash-tasks">
                <li><span className="dot" /> Revisar documentos <em className="hi">Alta</em></li>
                <li><span className="dot" /> Enviar proposta <em className="md">Média</em></li>
                <li><span className="dot" /> Acompanhar biometria <em className="hi">Alta</em></li>
              </ul>
            </div>
          </div>
          <div className="lp-dash-grid">
            <div className="lp-dash-card lp-dash-donut-card">
              <h4>Processos por status</h4>
              <div className="lp-dash-donut" />
              <ul className="lp-dash-legend">
                <li><span className="sw blue" /> Em andamento</li>
                <li><span className="sw cyan" /> Documentos</li>
                <li><span className="sw violet" /> Em análise</li>
              </ul>
            </div>
            <div className="lp-dash-card lp-dash-recent-card">
              <h4>Processos recentes</h4>
              <ul className="lp-dash-recent">
                <li><strong>Visto F-1</strong><span>Roberto Ferreira</span><em className="badge-blue">Em andamento</em></li>
                <li><strong>Visto B-1/B-2</strong><span>Mariana Souza</span><em className="badge-amber">Em análise</em></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────
function SolutionModuleMockup({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="lp-solution-ui lp-solution-ui-site" aria-hidden="true">
        <div className="lp-solution-ui-top">
          <span className="lp-solution-ui-title">Site publico</span>
          <span className="lp-solution-ui-chip">No ar</span>
        </div>
        <div className="lp-mini-browser">
          <span />
          <span />
          <span />
          <b>silvaimmigration.com</b>
        </div>
        <div className="lp-site-preview">
          <div className="lp-site-hero">
            <div className="lp-logo-mark">SI</div>
            <div>
              <strong>Silva Immigration</strong>
              <span>Vistos, consultorias e processos nos EUA</span>
            </div>
          </div>
          <div className="lp-site-headline">
            <strong>Imigre com um plano claro</strong>
            <span>Atendimento em portugues para familias e profissionais.</span>
          </div>
          <div className="lp-site-sections">
            <span>Consultoria</span>
            <span>Visto F-1</span>
            <span>Visto B-1/B-2</span>
          </div>
          <button type="button" className="lp-solution-ui-button">Agendar avaliacao</button>
        </div>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="lp-solution-ui lp-solution-ui-checkout" aria-hidden="true">
        <div className="lp-solution-ui-top">
          <span className="lp-solution-ui-title">/checkout/f1-visa</span>
          <span className="lp-solution-ui-chip">Pagamento</span>
        </div>
        <div className="lp-mini-browser">
          <span />
          <span />
          <span />
          <b>aplikei.com/l/silva-f1</b>
        </div>
        <div className="lp-checkout-preview">
          <div className="lp-checkout-brand">
            <div className="lp-logo-mark">SI</div>
            <div>
              <strong>Silva Immigration</strong>
              <span>Checkout com a marca do escritorio</span>
            </div>
          </div>
          <div className="lp-checkout-product">
            <span>Servico selecionado</span>
            <strong>Visto F-1 + dependente</strong>
            <em>US$ 1,250.00</em>
          </div>
          <div className="lp-payment-pills">
            <span>Cartao</span>
            <span>Pix</span>
            <span>Zelle</span>
          </div>
          <button type="button" className="lp-solution-ui-button">Pagar e iniciar processo</button>
        </div>
      </div>
    );
  }

  if (index === 2) {
    return (
      <div className="lp-solution-ui lp-solution-ui-process-team" aria-hidden="true">
        <div className="lp-solution-ui-top">
          <span className="lp-solution-ui-title">Equipe / Processos</span>
          <span className="lp-solution-ui-chip">12 ativos</span>
        </div>
        <div className="lp-process-toolbar">
          <span>Buscar cliente, visto ou responsavel</span>
          <b>Pendentes</b>
        </div>
        <div className="lp-team-board">
          <div>
            <span>Maria Souza</span>
            <strong>Camila</strong>
            <em>Revisao juridica</em>
          </div>
          <div>
            <span>Rafael Lima</span>
            <strong>Bruno</strong>
            <em>Docs enviados</em>
          </div>
          <div>
            <span>Ana Costa</span>
            <strong>Dra. Helena</strong>
            <em>Entrevista</em>
          </div>
        </div>
        <div className="lp-team-pending">
          <span>Cada processo mostra etapa, dono e pendencia</span>
          <b>Abrir caso</b>
        </div>
      </div>
    );
  }

  return (
    <div className="lp-solution-ui lp-solution-ui-ai" aria-hidden="true">
      <div className="lp-solution-ui-top">
        <span className="lp-solution-ui-title">AI Chat / Caso F-1</span>
        <span className="lp-solution-ui-chip">Ativo</span>
      </div>
      <div className="lp-ai-shell">
        <div className="lp-ai-thread-list">
          <span className="active">F-1 Visa</span>
          <span>B1/B2</span>
          <span>RFE</span>
        </div>
        <div className="lp-ai-chat">
          <p className="client">Cliente enviou I-20 e extratos. O que falta?</p>
          <p className="assistant">Faltam comprovante de vinculo, carta de suporte e roteiro de entrevista.</p>
          <div className="lp-ai-actions">
            <span>Gerar checklist</span>
            <span>Preparar perguntas</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { theme } = useTheme();
  const { openDemoBooking } = useDemoBooking();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const t = useT("landing");
  const isDark = theme === "dark";
  const painItems = (t.pain.items ?? []) as TextEntry[];
  const solutionItems = (t.solutions?.items ?? []) as SolutionEntry[];
  const automationFeatures = (t.automation.features ?? []) as TextEntry[];
  const automationTasks = (t.automation.aiPanel.tasks ?? []) as AutomationTask[];
  const howItWorksSteps = (t.howItWorks.steps ?? []) as TextStep[];
  const testimonials = (t.testimonials?.items ?? []) as TestimonialEntry[];
  const faqItems = (t.faq.items ?? []) as TextFaq[];
  const heroBullets = (t.hero.bullets ?? []) as string[];

  // Redirect authenticated users once auth resolves — don't block rendering
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated && user)
      navigate(getDefaultRouteForRole(user.role), { replace: true });
  }, [isAuthenticated, isAuthLoading, user, navigate]);

  useReveal(containerRef);

  return (
    <div ref={containerRef} className={`landing-page${isDark ? " lp-dark" : ""}`}>
      {/* HERO */}
      <section className="lp-section lp-dark-zone lp-hero">
        <div className="lp-glow" />
        <div className="lp-wrap lp-hero-grid">
          <div className="lp-hero-copy">
            <h1 className="lp-h1">{t.hero.title} <span className="lp-accent-text">{t.hero.titleAccent}</span></h1>
            <p className="lp-lead">{t.hero.lead}</p>
            {heroBullets.length > 0 ? (
              <ul className="lp-hero-bullets lp-reveal">
                {heroBullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
            <div className="lp-hero-cta">
              <PublicButton asChild tone="solid" size="lg">
                <Link to="/sign-up">{t.hero.ctaPrimary}</Link>
              </PublicButton>
            </div>
            <div className="lp-mock-wrap lp-reveal">
              <HeroArtwork />
            </div>
          </div>
        </div>
      </section>

      <section className="lp-logo-strip" aria-label={t.logos.label}>
        <div className="lp-wrap">
          <div className="lp-logo-strip-head">
            <span>{t.logos.label}</span>
          </div>
          <div className="lp-logo-marquee lp-reveal">
            <div className="lp-logo-band">
              {[...FIRM_LOGOS, ...FIRM_LOGOS].map((firm, index) => (
                <div
                  key={`${firm.name}-${index}`}
                  className="lp-logo-cell"
                  aria-hidden={index >= FIRM_LOGOS.length}
                >
                  <img
                     src={firm.src}
                     alt={index < FIRM_LOGOS.length ? firm.name : ""}
                     className={`lp-logo-img ${firm.logoClassName ?? ""}`.trim()}
                     loading="lazy"
                   />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {solutionItems.length > 0 ? (
        <section className="lp-section" id="lp-solutions">
          <div className="lp-wrap">
            <div className="lp-sec-head lp-reveal">
              <h2 className="lp-h2">{t.solutions.title}</h2>
              <p className="lp-lead">{t.solutions.lead}</p>
            </div>
            <div className="lp-solutions-grid lp-reveal">
              {solutionItems.map((item, index) => (
                <article key={item.title} className="lp-card lp-solution-card">
                  <div className="lp-solution-visual">
                    <SolutionModuleMockup index={index} />
                  </div>
                  <div className="lp-solution-copy">
                    {item.badge ? <span className="lp-solution-badge">{item.badge}</span> : null}
                    <h3 className="lp-h3">{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* PAIN */}
      <section className="lp-section lp-dark-zone" id="lp-pain">
        <div className="lp-wrap">
          <div className="lp-pain-showcase">
            <div className="lp-pain-copy lp-reveal">
              <h2 className="lp-h2">{t.pain.title}</h2>
              <p className="lp-lead">{t.pain.lead}</p>
              <div className="lp-pain-points">
                {painItems.slice(0, 3).map((item, i) => (
                  <div key={i} className="lp-pain-point">
                    <div className="lp-icon-box">{PAIN_ICONS[i]}</div>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="lp-pain-note">
                <strong>{t.pain.barText}</strong>
                <span>{t.pain.barSub}</span>
              </div>
            </div>

            <div className="lp-pain-device lp-reveal">
              <MobilePlatformShowcase />
            </div>

          </div>
        </div>
      </section>

      {/* SHOWCASE hidden to simplify the home flow after the product and pain sections. */}
      {false ? (
        <section className="lp-section lp-tint-zone">
          <div className="lp-wrap" />
        </section>
      ) : null}

      {/* AUTOMATION */}
      <section className="lp-section lp-dark-zone" id="lp-automation">
        <div className="lp-glow" style={{ background: "radial-gradient(50% 60% at 90% 30%,rgba(45,99,255,.22),transparent 60%)" }} />
        <div className="lp-wrap" style={{ position: "relative", zIndex: 1 }}>
          <div className="lp-sec-head lp-reveal" style={{ marginBottom: 42 }}>
            <h2 className="lp-h2">{t.automation.title}</h2>
          </div>
          <div className="lp-ai-grid">
            <div className="lp-ai-feats lp-reveal">
              {automationFeatures.map((f, i) => (
                <div key={i} className={`lp-ai-feat${i === 0 ? " hot" : ""}`}>
                  <div className={`lp-icon-box${i === 0 ? " solid" : ""}`}>{AUTO_ICONS[i]}</div>
                  <div>
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="lp-engine lp-reveal">
              <div className="lp-engine-grad-bar" />
              <div className="lp-engine-inner">
                <div className="lp-ai-panel-client">
                  <div className="lp-ai-panel-avatar">CS</div>
                  <div className="lp-ai-panel-client-info">
                    <strong>{t.automation.aiPanel.clientName}</strong>
                    <span>{t.automation.aiPanel.clientVisa} · {t.automation.aiPanel.clientStatus}</span>
                  </div>
                </div>
                <div className="lp-ai-tasks">
                  {automationTasks.map((task, i) => (
                    <div key={i} className={`lp-ai-task ${task.done ? "done" : "pending"}`}>
                      <div className="lp-ai-task-icon">{task.done ? "✓" : "→"}</div>
                      <div>
                        <strong>{task.title}</strong>
                        <small>{task.sub}</small>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="lp-ai-panel-saved">{t.automation.aiPanel.saved}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="lp-section" id="lp-how">
        <div className="lp-wrap">
          <div className="lp-sec-head lp-reveal">
            <h2 className="lp-h2">{t.howItWorks.title}</h2>
            <p className="lp-lead">{t.howItWorks.lead}</p>
          </div>
          <div className="lp-steps lp-reveal">
            {howItWorksSteps.map((s) => (
              <div key={s.n} className="lp-step">
                <div className="n">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXCELLENCE hidden to reduce repeated visibility/control messaging. */}
      {false ? (
        <section className="lp-section lp-tint-zone" id="lp-who-we-are">
          <div className="lp-wrap" />
        </section>
      ) : null}

      {/* TESTIMONIALS */}
      <section className="lp-section lp-dark-zone lp-testimonials-section">
        <div className="lp-wrap">
          <div className="lp-sec-head lp-reveal">
            <h2 className="lp-h2">{t.testimonials.title}</h2>
          </div>
        </div>

        {/* Marquee Row 1 (Da esquerda para a direita - Left to Right) */}
        {testimonials.length > 0 && (
          <div className="lp-marquee-container lp-marquee-ltr lp-reveal">
            <div className="lp-marquee-track">
              {(() => {
                const half = Math.ceil(testimonials.length / 2);
                const firstRow = testimonials.slice(0, half);
                return firstRow.concat(firstRow).map((item, i) => (
                  <div key={`row1-${i}`} className="lp-tst lp-marquee-item">
                    <div className="lp-stars">★★★★★</div>
                    <blockquote>"{item.quote[0]}<span className="hl">{item.quote[1]}</span>{item.quote[2]}"</blockquote>
                    <div className="lp-tst-foot">
                      <span className="av">
                        <img
                          src={TESTIMONIAL_IMAGES_ROW1[i % TESTIMONIAL_IMAGES_ROW1.length]}
                          alt={item.name}
                          className="lp-tst-avatar"
                          loading="lazy"
                        />
                      </span>
                      <div><b>{item.name}</b><span>{item.role}</span></div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}

        {/* Marquee Row 2 (Da direita para a esquerda - Right to Left) */}
        {testimonials.length > 1 && (
          <div className="lp-marquee-container lp-marquee-rtl lp-reveal">
            <div className="lp-marquee-track">
              {(() => {
                const half = Math.ceil(testimonials.length / 2);
                const secondRow = testimonials.slice(half);
                return secondRow.concat(secondRow).map((item, i) => (
                  <div key={`row2-${i}`} className="lp-tst lp-marquee-item">
                    <div className="lp-stars">★★★★★</div>
                    <blockquote>"{item.quote[0]}<span className="hl">{item.quote[1]}</span>{item.quote[2]}"</blockquote>
                    <div className="lp-tst-foot">
                      <span className="av">
                        <img
                          src={TESTIMONIAL_IMAGES_ROW2[i % TESTIMONIAL_IMAGES_ROW2.length]}
                          alt={item.name}
                          className="lp-tst-avatar"
                          loading="lazy"
                        />
                      </span>
                      <div><b>{item.name}</b><span>{item.role}</span></div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}
      </section>

      {/* FAQ */}
      <section className="lp-section lp-tint-zone">
        <div className="lp-wrap">
          <div className="lp-sec-head lp-reveal">
            <h2 className="lp-h2">{t.faq.title}</h2>
            <p className="lp-lead">{t.faq.lead}</p>
          </div>
          <div className="lp-faq lp-reveal">
            {faqItems.map((item, i) => (
              <div key={i} className={`lp-faq-item${openFaq === i ? " open" : ""}`}>
                <div className="lp-faq-q" role="button" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{item.q}</span>
                  <span className="lp-faq-pm"><PlusIcon /></span>
                </div>
                {openFaq === i && <div className="lp-faq-a">{item.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA hidden for now. Possible future removal if this section stays unused. */}
      {false ? (
        <section className="lp-section" id="lp-cta">
          <div className="lp-wrap">
            <div className="lp-cta-block lp-reveal">
              <div className="lp-cta-grid">
                <div className="lp-cta-copy">
                  <img src="/logo-dark.png" alt="Aplikei" className="lp-cta-logo" />
                  <h2 className="lp-h2">{t.cta.title}</h2>
                  <p className="lp-lead">{t.cta.desc}</p>
                  <div className="flex flex-wrap gap-3">
                    <PublicButton tone="solid" size="lg" onClick={openDemoBooking}>
                      {t.nav.bookDemo}
                    </PublicButton>
                    <PublicButton asChild tone="inverse" size="lg">
                      <Link to="/sign-up">
                        {t.cta.btn}
                        <ArrowRight />
                      </Link>
                    </PublicButton>
                  </div>
                </div>
                <div className="lp-cta-mock">
                  <div className="lp-cta-monitor">
                    <DashboardMockup />
                  </div>
                  <div className="lp-cta-monitor-stand" />
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

    </div>
  );
}
