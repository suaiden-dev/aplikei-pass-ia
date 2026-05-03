import { HeroSection } from "../../components/HeroSection";
import { ProblemSection } from "../../components/ProblemSection";
import { SolutionSection } from "../../components/SolutionSection";
import { HowItWorksSection } from "../../components/HowItWorksSection";
import { BenefitsSection } from "../../components/BenefitsSection";
import { TestimonialsSection } from "../../components/TestimonialsSection";
import { FinalCtaSection } from "../../components/FinalCtaSection";

const heroImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuCqxSP3HYuhLlu5a-RpsmtKx6LVC60KQKfOCKjSjJmDIixkkXFZs8Gq4kqYA3q_JVwN4iu2QTSpxno6g22j007RDu_dNzm6ZKIiZCk0pMnUuClKJKygEJEQtqjUdinzTeGdRkeljrg8WvsyskLRVpEst8FTAhVUleIiED-k-1QN9qzmwyjiYovZiAtYNhMx8W6qlpnzeKK2s0xglgbmYKlk4aL1ydjOR8VKoqYqYviGLHwT5gOyQakLC5u8VjTWI6LCI1XW2KN_vqs";

export default function HomePage() {
  return (
    <>
      <HeroSection heroImage={heroImage} />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <BenefitsSection />
      <TestimonialsSection />
      <FinalCtaSection />
    </>
  );
}
