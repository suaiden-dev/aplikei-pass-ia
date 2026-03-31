import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { HeroSection } from "@/presentation/components/organisms/landing/HeroSection";
import { ServicesSection } from "@/presentation/components/organisms/landing/ServicesSection";
import { HowItWorksSection } from "@/presentation/components/organisms/landing/HowItWorksSection";
import { TestimonialsSection } from "@/presentation/components/organisms/landing/TestimonialsSection";
import { FAQSection } from "@/presentation/components/organisms/landing/FAQSection";
import { avatars, heroImage } from "@/presentation/components/organisms/landing/LandingAssets";

export default function Index() {
  const { session } = useAuth();
  const user = session?.user;

  return (
    <div className="bg-background-light font-body text-dark-grey antialiased">
      <HeroSection user={user} heroImage={heroImage} avatars={avatars} />
      <ServicesSection />
      <HowItWorksSection />
      <TestimonialsSection avatars={avatars} />
      <FAQSection />
    </div>
  );
}
