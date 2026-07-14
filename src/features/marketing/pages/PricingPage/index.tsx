import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
} from "lucide-react";
import { useLocale, useT } from "@app/app/i18n";
import { PublicButton } from "@shared/components/atoms/PublicButton";
import {
  fetchActiveSubscriptionPlans,
  normalizePlanDescription,
  normalizePlanName,
  type DBPlan,
} from "@features/admin/services/subscriptionPageService";
import { cn } from "@shared/utils/cn";
import "./pricing.css";

function formatCurrencyBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPricingValue(plan: DBPlan) {
  if (plan.type === "PERCENTAGE") return `${plan.percentage_fee}%`;
  if (plan.type === "HYBRID") return `${formatCurrencyBRL(plan.fixed_fee)} + ${plan.percentage_fee}%`;
  return formatCurrencyBRL(plan.fixed_fee);
}

function getBillingLabel(plan: DBPlan, lang: string) {
  if (plan.type === "PERCENTAGE") {
    return lang === "en"
      ? "of billed revenue"
      : lang === "es"
        ? "de la facturación"
        : "da receita faturada";
  }

  return lang === "en"
    ? "per user/month"
    : lang === "es"
      ? "por usuario/mes"
      : "por usuário/mês";
}

function buildFeatureList(plan: DBPlan, lang: string) {
  const baseFeatures = plan.features?.length ? plan.features.slice(0, 6) : [];
  const billingFeature =
    plan.type === "PERCENTAGE"
      ? lang === "en"
        ? "Variable pricing tied to billed revenue"
        : lang === "es"
          ? "Precio variable basado en la facturación"
          : "Preço variável com base na receita"
      : plan.type === "HYBRID"
        ? lang === "en"
          ? "Fixed fee plus percentage component"
          : lang === "es"
            ? "Cuota fija más porcentaje"
            : "Taxa fixa mais percentual"
        : lang === "en"
          ? "Fixed monthly fee"
          : lang === "es"
            ? "Cuota mensual fija"
            : "Mensalidade fixa";

  const activationFeature =
    lang === "en"
      ? "Ready for commercial activation"
      : lang === "es"
        ? "Listo para activación comercial"
        : "Pronto para ativação comercial";

  const controlFeature =
    lang === "en"
      ? "Flexible rules for your subscription"
      : lang === "es"
        ? "Reglas flexibles para su suscripción"
        : "Regras flexíveis para sua assinatura";

  const feeBoundsFeature =
    plan.type === "PERCENTAGE"
      ? lang === "en"
        ? "Minimum charge applies"
        : lang === "es"
          ? "Se aplica un cobro mínimo"
          : "Aplica-se cobrança mínima"
      : null;

  return [...baseFeatures, billingFeature, activationFeature, controlFeature, feeBoundsFeature]
    .filter((feature): feature is string => Boolean(feature))
    .slice(0, 6);
}

function buildCards(plans: DBPlan[], lang: string) {
  const activePlans = plans.filter((plan) => plan.is_active && !plan.is_exclusive);
  return activePlans.slice(0, 4).map((plan, index) => {
    const isBlueHighlight = index === 0;

    return {
      planId: plan.id,
      label: normalizePlanName(plan.name, lang),
      price: formatPricingValue(plan),
      period: getBillingLabel(plan, lang),
      description: [
        normalizePlanDescription(plan.description ?? "", plan.type, lang),
        getPlanNote(plan, lang),
      ]
        .filter(Boolean)
        .join(" "),
      features: buildFeatureList(plan, lang),
      cta:
        lang === "en"
          ? "Start now"
          : lang === "es"
            ? "Comenzar ahora"
            : "Começar agora",
      highlighted: isBlueHighlight,
      badge:
        lang === "en"
          ? isBlueHighlight
            ? "Popular"
            : "Commercial"
          : lang === "es"
            ? isBlueHighlight
              ? "Popular"
              : "Comercial"
            : isBlueHighlight
              ? "Popular"
              : "Comercial",
      tone: isBlueHighlight ? "blue" : "default",
    };
  });
}

function getPlanNote(plan: DBPlan, lang: string) {
  if (plan.type !== "PERCENTAGE") return null;
  return lang === "en"
    ? "If the percentage fee does not reach the minimum, the fixed fee applies."
    : lang === "es"
      ? "Si la tarifa variable no alcanza el mínimo, se aplica la cuota fija."
      : "Se a cobrança variável não atingir o mínimo, a taxa fixa é aplicada.";
}

export default function PricingPage() {
  const { lang } = useLocale();
  const t = useT("landing");
  const { data: livePlans = [] } = useQuery({
    queryKey: ["pricing-page-plans"],
    queryFn: fetchActiveSubscriptionPlans,
    staleTime: 5 * 60 * 1000,
  });

  const cards = buildCards(livePlans, lang);
  const hasActivePlans = cards.length > 0;

  return (
    <div className="pricing-page">
      <section className="pricing-hero">
        <div className="pricing-orb pricing-orb-left" />
        <div className="pricing-orb pricing-orb-right" />

        <div className="pricing-shell">
          <div className="pricing-head">
            <div className="pricing-head-copy">
              <h1>{t.pricing.title}</h1>
              <p className="pricing-lead">{t.pricing.lead}</p>

            </div>
          </div>


        </div>
      </section>

      <section className="pricing-grid-section" id="pricing-plans">
        <div className="pricing-shell">
          {!hasActivePlans ? (
            <div className="pricing-empty">
              <div className="pricing-empty-icon">
                <CircleDollarSign className="h-5 w-5" />
              </div>
              <div>
                <h2>{lang === "en" ? "No active plans right now" : lang === "es" ? "No hay planes activos" : "Nenhum plano ativo no momento"}</h2>
                <p>
                  {lang === "en"
                    ? "The page only shows plans that already exist and are active in the database."
                    : lang === "es"
                      ? "La página solo muestra planes que ya existen y están activos en la base de datos."
                      : "A página só mostra planos que já existem e estão ativos no banco."}
                </p>
              </div>
            </div>
          ) : (
          <div className="pricing-grid">
            {cards.map((card) => (
              <article
                key={card.planId ?? card.label}
                className={cn(
                  "pricing-card",
                  card.tone === "blue" && "pricing-card-blue",
                  card.tone === "muted" && "pricing-card-muted",
                  card.highlighted && "highlighted",
                )}
              >
                <div className="pricing-card-top">
                  <div className="pricing-card-heading">
                    <h2>{card.label}</h2>
                    {card.badge ? <span className="pricing-card-badge-pill">{card.badge}</span> : null}
                  </div>
                  <div className="pricing-card-price-block">
                    <div className="pricing-card-price">{card.price}</div>
                    <div className="pricing-card-period">{card.period}</div>
                  </div>
                </div>

                <div className="pricing-card-body">
                  {card.description ? <p className="pricing-card-description">{card.description}</p> : null}
                </div>

                <div className="pricing-card-features-head">
                  <span>
                    {lang === "en"
                      ? "Key features"
                      : lang === "es"
                        ? "Características clave"
                        : "Principais recursos"}
                  </span>
                </div>

                <ul className="pricing-card-features">
                  {card.features.map((feature) => (
                    <li key={feature}>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="pricing-card-actions">
                  <PublicButton
                    asChild
                    tone={card.tone === "blue" ? "soft" : card.tone === "muted" ? "outline" : "solid"}
                    size="lg"
                    className="pricing-card-cta"
                  >
                    <Link to={card.planId ? `/sign-up?planId=${encodeURIComponent(card.planId)}` : "/contato"}>
                      {card.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </PublicButton>
                </div>
              </article>
            ))}
          </div>
          )}

        </div>
      </section>
    </div>
  );
}
