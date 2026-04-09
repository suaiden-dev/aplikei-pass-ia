import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { HeroSection } from "../../components/HeroSection";
import { FAQSection } from "../../components/FAQSection";
import { TestimonialsSection } from "../../components/TestimonialsSection";
import { HowItWorksSection } from "../../components/HowItWorksSection";
// Remove ServicesSection import

const avatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=100&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop",
];

const heroImage =
  "https://images.unsplash.com/photo-1526253038957-bce54e05968e?q=80&w=2070&auto=format&fit=crop";

export default function HomePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      navigate(user.role === "admin" ? "/admin" : "/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, user, navigate]);

  return (
    <>
      <HeroSection heroImage={heroImage} avatars={avatars} />
      <HowItWorksSection />
      <TestimonialsSection avatars={avatars} />
      <FAQSection />
    </>
  );
}
