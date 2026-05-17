import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@shared/hooks/useAuth";
import { useLocale } from "@app/app/i18n";
import { getDefaultRouteForRole } from "@app/app/router/authRedirect";
import { RouteGuardLoader } from "@app/app/router/RouteGuardLoader";

import { LexHero } from "@shared/components/organisms/LexHero";
import { LexMethodology } from "@shared/components/organisms/LexMethodology";
import { LexServices } from "@shared/components/organisms/LexServices";
import { LexTestimonials } from "@shared/components/organisms/LexTestimonials";
import { FAQSection } from "@shared/components/organisms/LandingFAQ";
import { ContactSection } from "@shared/components/organisms/ContactSection";

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
      <LexHero />
      <LexMethodology />
      <LexServices />
      <LexTestimonials />
      <FAQSection />
      <ContactSection />
    </div>
  );
}
