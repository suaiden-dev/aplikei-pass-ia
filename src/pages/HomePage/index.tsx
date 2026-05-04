import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { HeroSection } from "../../components/organisms/LandingHero";
import { FAQSection } from "../../components/organisms/LandingFAQ";
import { TestimonialsSection } from "../../components/organisms/LandingTestimonials";
import { HowItWorksSection } from "../../components/organisms/LandingHowItWorks";
import { ProblemSection } from "../../components/ProblemSection";
import { SolutionSection } from "../../components/SolutionSection";
import { BenefitsSection } from "../../components/BenefitsSection";
import { FinalCtaSection } from "../../components/FinalCtaSection";
import { getDefaultRouteForRole } from "../../routes/authRedirect";
import { RouteGuardLoader } from "../../routes/RouteGuardLoader";

const avatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=100&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop",
];

const heroImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuCqxSP3HYuhLlu5a-RpsmtKx6LVC60KQKfOCKjSjJmDIixkkXFZs8Gq4kqYA3q_JVwN4iu2QTSpxno6g22j007RDu_dNzm6ZKIiZCk0pMnUuClKJKygEJEQtqjUdinzTeGdRkeljrg8WvsyskLRVpEst8FTAhVUleIiED-k-1QN9qzmwyjiYovZiAtYNhMx8W6qlpnzeKK2s0xglgbmYKlk4aL1ydjOR8VKoqYqYviGLHwT5gOyQakLC5u8VjTWI6LCI1XW2KN_vqs";

export default function HomePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      navigate(getDefaultRouteForRole(user.role), { replace: true });
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  if (isLoading) {
    return <RouteGuardLoader />;
  }

  return (
    <>
      <HeroSection heroImage={heroImage} avatars={avatars} />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <BenefitsSection />
      <TestimonialsSection avatars={avatars} />
      <FAQSection />
      <FinalCtaSection />
    </>
  );
}
