import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@shared/hooks/useAuth";
import { useLocale, useT } from "@app/app/i18n";
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

type HeroInsightCard = {
  eyebrow: string;
  title: string;
  detail: string;
  metric: string;
};

type HeroMockupCopy = {
  search: string;
  userRole: string;
  navGroups: string[];
  navItems: string[];
  period: string;
  title: string;
  stats: { label: string; value: string; trend: string }[];
  revenue: string;
  tasks: string;
  taskItems: { label: string; priority: string }[];
  statusTitle: string;
  statusLegend: string[];
  recentTitle: string;
  recentStatuses: string[];
};

type SolutionMockupCopy = {
  title: string;
  chip: string;
  browser: string;
  brandDetail?: string;
  headline?: string;
  subtitle?: string;
  services?: string[];
  button?: string;
  productLabel?: string;
  product?: string;
  paymentMethods?: string[];
  search?: string;
  filter?: string;
  team?: { client: string; owner: string; status: string }[];
  pending?: string;
  openCase?: string;
  threads?: string[];
  clientMessage?: string;
  assistantMessage?: string;
  actions?: string[];
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
const FaqChevron = () => (
  <svg viewBox="0 0 24 24" fill="none" width="15" height="15" aria-hidden="true"><path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

// ── Reveal on scroll ───────────────────────────────────────────────
function useReveal(containerRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const els = Array.from(container.querySelectorAll(".lp-reveal, .lp-notification-reveal"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        });
      },
      { threshold: 0.15, rootMargin: "0px" },
    );
    els.forEach((el) => io.observe(el));
    setTimeout(() => {
      container.querySelectorAll(".lp-reveal:not(.in):not(.lp-mock-wrap)").forEach((el) => el.classList.add("in"));
    }, 2500);
    return () => io.disconnect();
  }, [containerRef]);
}

function HeroArtwork({ cards, copy }: { cards: HeroInsightCard[]; copy: HeroMockupCopy }) {
  const getIcon = (index: number) => {
    if (index === 0) {
      return (
        <span className="lp-notification-icon lp-icon-pay">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <line x1="12" y1="10" x2="12" y2="10" />
            <line x1="12" y1="14" x2="12" y2="14" />
          </svg>
        </span>
      );
    }
    if (index === 1) {
      return (
        <span className="lp-notification-icon lp-icon-ai">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        </span>
      );
    }
    return (
      <span className="lp-notification-icon lp-icon-success">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      </span>
    );
  };

  return (
    <div className="lp-hero-device-shell" aria-hidden="true">
      <div className="lp-hero-sidecards lp-hero-sidecards-left">
        <article className="lp-hero-insight-card lp-hero-insight-card-payment lp-notification-reveal">
          <div className="lp-notification-header">
            <div className="lp-notification-header-left">
              {getIcon(0)}
              <span className="lp-notification-appname">{cards[0]?.eyebrow}</span>
            </div>
            <span className="lp-notification-time">{cards[0]?.metric}</span>
          </div>
          <strong className="lp-notification-title">{cards[0]?.title}</strong>
          <p className="lp-notification-detail">{cards[0]?.detail}</p>
        </article>
        <article className="lp-hero-insight-card lp-hero-insight-card-ai lp-notification-reveal">
          <div className="lp-notification-header">
            <div className="lp-notification-header-left">
              {getIcon(1)}
              <span className="lp-notification-appname">{cards[1]?.eyebrow}</span>
            </div>
            <span className="lp-notification-time">{cards[1]?.metric}</span>
          </div>
          <strong className="lp-notification-title">{cards[1]?.title}</strong>
          <p className="lp-notification-detail">{cards[1]?.detail}</p>
        </article>
      </div>

      <div className="lp-cta-mock lp-hero-device">
        <div className="lp-cta-monitor">
          <DashboardMockup copy={copy} />
        </div>
        <div className="lp-cta-monitor-stand" />
      </div>

      <div className="lp-hero-sidecards lp-hero-sidecards-right">
        <article className="lp-hero-insight-card lp-hero-insight-card-revenue lp-notification-reveal">
          <div className="lp-notification-header">
            <div className="lp-notification-header-left">
              {getIcon(2)}
              <span className="lp-notification-appname">{cards[2]?.eyebrow}</span>
            </div>
            <span className="lp-notification-time">{cards[2]?.metric}</span>
          </div>
          <strong className="lp-notification-title">{cards[2]?.title}</strong>
          <p className="lp-notification-detail">{cards[2]?.detail}</p>
        </article>
      </div>

      <div className="lp-hero-mobile-notifications">
        {cards.map((card, index) => (
          <article key={`${card.eyebrow}-${card.title}`} className="lp-hero-mobile-notification lp-notification-reveal">
            <div className="lp-notification-header">
              <div className="lp-notification-header-left">
                {getIcon(index)}
                <span className="lp-notification-appname">{card.eyebrow}</span>
              </div>
              <span className="lp-notification-time">{card.metric}</span>
            </div>
            <div className="lp-hero-mobile-notification-copy">
              <strong className="lp-notification-title">{card.title}</strong>
              <p className="lp-notification-detail">{card.detail}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function DashboardMockup({ copy }: { copy: HeroMockupCopy }) {
  return (
    <div className="lp-dash-mock" aria-hidden="true">
      <div className="lp-dash-topbar">
        <img src="/logo.png" alt="" className="lp-dash-logo" />
        <div className="lp-dash-search">
          <span>{copy.search}</span>
          <span className="lp-dash-kbd">⌘K</span>
        </div>
        <div className="lp-dash-user">
          <span className="lp-dash-bell" />
          <span className="lp-dash-avatar" />
          <span className="lp-dash-user-info">
            <strong>Silva Immigration</strong>
            <small>{copy.userRole}</small>
          </span>
        </div>
      </div>
      <div className="lp-dash-body">
        <nav className="lp-dash-sidebar">
          <span className="lp-dash-nav-group">{copy.navGroups[0]}</span>
          <span className="lp-dash-nav-item active">{copy.navItems[0]}</span>
          <span className="lp-dash-nav-item">{copy.navItems[1]}</span>
          <span className="lp-dash-nav-item">{copy.navItems[2]}</span>
          <span className="lp-dash-nav-item">{copy.navItems[3]}</span>
          <span className="lp-dash-nav-group">{copy.navGroups[1]}</span>
          <span className="lp-dash-nav-item">{copy.navItems[4]}</span>
          <span className="lp-dash-nav-item">{copy.navItems[5]}</span>
          <span className="lp-dash-nav-item">{copy.navItems[6]}</span>
          <span className="lp-dash-nav-item">{copy.navItems[7]}</span>
          <span className="lp-dash-nav-group">{copy.navGroups[2]}</span>
          <span className="lp-dash-nav-item">{copy.navItems[8]}</span>
          <span className="lp-dash-nav-item">{copy.navItems[8]}</span>
        </nav>
        <div className="lp-dash-main">
          <div className="lp-dash-head">
            <h3>{copy.title}</h3>
            <span className="lp-dash-period">{copy.period}</span>
          </div>
          <div className="lp-dash-stats">
            <div className="lp-dash-stat">
              <span>{copy.stats[0].label}</span>
              <strong>{copy.stats[0].value} <small className="up">{copy.stats[0].trend}</small></strong>
            </div>
            <div className="lp-dash-stat">
              <span>{copy.stats[1].label}</span>
              <strong>{copy.stats[1].value} <small className="up">{copy.stats[1].trend}</small></strong>
            </div>
            <div className="lp-dash-stat">
              <span>{copy.stats[2].label}</span>
              <strong>{copy.stats[2].value} <small className="up">{copy.stats[2].trend}</small></strong>
            </div>
            <div className="lp-dash-stat">
              <span>{copy.stats[3].label}</span>
              <strong>{copy.stats[3].value} <small className="up">{copy.stats[3].trend}</small></strong>
            </div>
          </div>
          <div className="lp-dash-grid">
            <div className="lp-dash-card lp-dash-chart-card">
              <h4>{copy.revenue}</h4>
              <svg className="lp-dash-line" viewBox="0 0 240 80" preserveAspectRatio="none">
                <polyline points="0,60 30,55 60,58 90,40 120,46 150,28 180,32 210,16 240,20" fill="none" stroke="#2d63ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="lp-dash-card lp-dash-tasks-card">
              <h4>{copy.tasks}</h4>
              <ul className="lp-dash-tasks">
                {copy.taskItems.map((task, index) => <li key={task.label}><span className="dot" /> {task.label} <em className={index === 1 ? "md" : "hi"}>{task.priority}</em></li>)}
              </ul>
            </div>
          </div>
          <div className="lp-dash-grid">
            <div className="lp-dash-card lp-dash-donut-card">
              <h4>{copy.statusTitle}</h4>
              <div className="lp-dash-donut" />
              <ul className="lp-dash-legend">
                <li><span className="sw blue" /> {copy.statusLegend[0]}</li>
                <li><span className="sw cyan" /> {copy.statusLegend[1]}</li>
                <li><span className="sw violet" /> {copy.statusLegend[2]}</li>
              </ul>
            </div>
            <div className="lp-dash-card lp-dash-recent-card">
              <h4>{copy.recentTitle}</h4>
              <ul className="lp-dash-recent">
                <li><strong>Visto F-1</strong><span>Roberto Ferreira</span><em className="badge-blue">{copy.recentStatuses[0]}</em></li>
                <li><strong>Visto B-1/B-2</strong><span>Mariana Souza</span><em className="badge-amber">{copy.recentStatuses[1]}</em></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────
function SolutionModuleMockup({ index, copy }: { index: number; copy: SolutionMockupCopy }) {
  if (index === 0) {
    return (
      <div className="lp-solution-ui lp-solution-ui-site" aria-hidden="true">
        <div className="lp-solution-ui-top">
          <span className="lp-solution-ui-title">{copy.title}</span>
          <span className="lp-solution-ui-chip">{copy.chip}</span>
        </div>
        <div className="lp-mini-browser">
          <span />
          <span />
          <span />
          <b>{copy.browser}</b>
        </div>
        <div className="lp-site-preview">
          <div className="lp-site-hero">
            <div className="lp-logo-mark">SI</div>
            <div>
              <strong>Silva Immigration</strong>
            <span>{copy.subtitle}</span>
            </div>
          </div>
          <div className="lp-site-headline">
            <strong>{copy.headline}</strong>
            <span>{copy.brandDetail}</span>
          </div>
          <div className="lp-site-sections">
            {copy.services?.map((service) => <span key={service}>{service}</span>)}
          </div>
          <button type="button" className="lp-solution-ui-button">{copy.button}</button>
        </div>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="lp-solution-ui lp-solution-ui-checkout" aria-hidden="true">
        <div className="lp-solution-ui-top">
          <span className="lp-solution-ui-title">{copy.title}</span>
          <span className="lp-solution-ui-chip">{copy.chip}</span>
        </div>
        <div className="lp-mini-browser">
          <span />
          <span />
          <span />
          <b>{copy.browser}</b>
        </div>
        <div className="lp-checkout-preview">
          <div className="lp-checkout-brand">
            <div className="lp-logo-mark">SI</div>
            <div>
              <strong>Silva Immigration</strong>
              <span>{copy.brandDetail}</span>
            </div>
          </div>
          <div className="lp-checkout-product">
            <span>{copy.productLabel}</span>
            <strong>{copy.product}</strong>
            <em>US$ 1,250.00</em>
          </div>
          <div className="lp-payment-pills">
            {copy.paymentMethods?.map((method) => <span key={method}>{method}</span>)}
          </div>
          <button type="button" className="lp-solution-ui-button">{copy.button}</button>
        </div>
      </div>
    );
  }

  if (index === 2) {
    return (
      <div className="lp-solution-ui lp-solution-ui-process-team" aria-hidden="true">
        <div className="lp-solution-ui-top">
          <span className="lp-solution-ui-title">{copy.title}</span>
          <span className="lp-solution-ui-chip">{copy.chip}</span>
        </div>
        <div className="lp-process-toolbar">
          <span>{copy.search}</span>
          <b>{copy.filter}</b>
        </div>
        <div className="lp-team-board">
          {copy.team?.map((member) => <div key={member.client}>
            <span>{member.client}</span>
            <strong>{member.owner}</strong>
            <em>{member.status}</em>
          </div>)}
        </div>
        <div className="lp-team-pending">
          <span>{copy.pending}</span>
          <b>{copy.openCase}</b>
        </div>
      </div>
    );
  }

  return (
    <div className="lp-solution-ui lp-solution-ui-ai" aria-hidden="true">
      <div className="lp-solution-ui-top">
        <span className="lp-solution-ui-title">{copy.title}</span>
        <span className="lp-solution-ui-chip">{copy.chip}</span>
      </div>
      <div className="lp-ai-shell">
        <div className="lp-ai-thread-list">
          {copy.threads?.map((thread, index) => <span key={thread} className={index === 0 ? "active" : undefined}>{thread}</span>)}
        </div>
        <div className="lp-ai-chat">
          <p className="client">{copy.clientMessage}</p>
          <p className="assistant">{copy.assistantMessage}</p>
          <div className="lp-ai-actions">
            {copy.actions?.map((action) => <span key={action}>{action}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { lang } = useLocale();
  const { theme } = useTheme();
  const { openDemoBooking } = useDemoBooking();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
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
  const heroInsightCards = ((t.hero.insightCards as HeroInsightCard[] | undefined) ?? (
    lang === "en"
      ? [
          {
            eyebrow: "APLIKEI PAY",
            title: "Payment approved: $1,250",
            detail: "Lucas Silva started the F-1 Visa process.",
            metric: "now",
          },
          {
            eyebrow: "APLIKEI AI",
            title: "DS-160 pre-filled",
            detail: "AI scanned the passport and filled the form.",
            metric: "3m ago",
          },
          {
            eyebrow: "APLIKEI FINANCE",
            title: "Revenue grew +26%",
            detail: "Your firm surpassed last month's sales volume.",
            metric: "10m ago",
          },
        ]
      : lang === "es"
        ? [
            {
              eyebrow: "APLIKEI PAY",
              title: "Pago aprobado: US$ 1.250",
              detail: "Lucas Silva inició el proceso de Visa F-1.",
              metric: "ahora",
            },
            {
              eyebrow: "APLIKEI IA",
              title: "DS-160 precompletado",
              detail: "La IA analizó el pasaporte y completó el borrador.",
              metric: "hace 3m",
            },
            {
              eyebrow: "APLIKEI FINANZAS",
              title: "Facturación creció +26%",
              detail: "Su oficina superó las ventas del mes anterior.",
              metric: "hace 10m",
            },
          ]
        : [
            {
              eyebrow: "APLIKEI PAY",
              title: "Pagamento aprovado: R$ 1.250",
              detail: "Lucas Silva iniciou o processo do Visto F-1.",
              metric: "agora",
            },
            {
              eyebrow: "APLIKEI IA",
              title: "DS-160 pré-preenchido",
              detail: "IA analisou o passaporte e preencheu o formulário.",
              metric: "3m atrás",
            },
            {
              eyebrow: "APLIKEI FINANÇAS",
              title: "Faturamento cresceu +26%",
              detail: "Seu escritório superou as vendas do mês anterior.",
              metric: "10m atrás",
            },
          ]
  )) as HeroInsightCard[];
  const heroMockupCopy = t.hero.mockup as HeroMockupCopy;
  const solutionMockups = (t.solutions.mockups ?? []) as SolutionMockupCopy[];

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
              <HeroArtwork cards={heroInsightCards} copy={heroMockupCopy} />
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
                    <SolutionModuleMockup index={index} copy={solutionMockups[index]} />
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
                  <span className="lp-faq-pm"><FaqChevron /></span>
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
                    <DashboardMockup copy={heroMockupCopy} />
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
