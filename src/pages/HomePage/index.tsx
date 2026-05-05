import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useLocale } from "../../i18n";
import { getDefaultRouteForRole } from "../../routes/authRedirect";
import { RouteGuardLoader } from "../../routes/RouteGuardLoader";

import { LexHero } from "../../components/organisms/LexHero";
import { LexMethodology } from "../../components/organisms/LexMethodology";
import { LexServices } from "../../components/organisms/LexServices";
import { LexTestimonials } from "../../components/organisms/LexTestimonials";
import { FAQSection } from "../../components/organisms/LandingFAQ";
import { ContactSection } from "../../components/organisms/ContactSection";

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
