import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@shared/hooks/useAuth";
import { useLocale } from "@app/app/i18n";
import { HeroSection } from "@shared/components/organisms/LandingHero";
import { FAQSection } from "@shared/components/organisms/LandingFAQ";
import { TestimonialsSection } from "@shared/components/organisms/LandingTestimonials";
import { HowItWorksSection } from "@shared/components/organisms/LandingHowItWorks";
import { BenefitsSection } from "@shared/components/organisms/LandingBenefits";
import { ProblemSection } from "@shared/components/organisms/LandingProblem";
import { SolutionSection } from "@shared/components/organisms/LandingSolution";
import { FinalCtaSection } from "@shared/components/organisms/LandingFinalCTA";
import { LandingProductShowcase } from "@shared/components/organisms/LandingProductShowcase";
import { getDefaultRouteForRole } from "@app/app/router/authRedirect";
import { RouteGuardLoader } from "@app/app/router/RouteGuardLoader";
import dashboardPreview from "@app/assets/images/dashboard-preview.png";

const avatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=100&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop",
];

const heroImage = dashboardPreview;

export default function HomePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { isLanguageLoading } = useLocale();

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated && user) {
      navigate(getDefaultRouteForRole(user.role), { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, user, navigate]);

  if (isAuthLoading || isLanguageLoading) {
    return <RouteGuardLoader />;
  }

  return (
    <div className="flex flex-col">
      <HeroSection heroImage={heroImage} avatars={avatars} />
      <ProblemSection />
      <SolutionSection />
      <LandingProductShowcase />
      <HowItWorksSection />
      <BenefitsSection />
      <TestimonialsSection avatars={avatars} />
      <FAQSection />
      <FinalCtaSection />
    </div>
  );
}
