import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@shared/hooks/useAuth";
import { authService } from "@features/auth/lib/auth";
import { StepIndicator } from "./StepIndicator";
import { CompanyStep } from "./steps/CompanyStep";
import { SubscriptionStep } from "./steps/SubscriptionStep";
import { ProductsStep } from "./steps/ProductsStep";
import { DoneStep } from "./steps/DoneStep";

const STEPS = ["company", "subscription", "products", "done"] as const;
type Step = (typeof STEPS)[number];

const STORAGE_KEY = "admin_lawyer_onboarding_step_v1";

export default function AdminOnboardingPage() {
  const navigate = useNavigate();
  const { user: currentUser, refreshAccount } = useAuth();

  const [currentStep, setCurrentStep] = useState<Step>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && STEPS.includes(saved as Step)) return saved as Step;
    return "company";
  });
  const [productsSkipped, setProductsSkipped] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, currentStep);
  }, [currentStep]);

  const handleComplete = async () => {
    if (!currentUser) return;
    try {
      await authService.updateAccount(currentUser.id, { has_completed_onboarding: true });
      localStorage.removeItem(STORAGE_KEY);
      await refreshAccount();
    } catch {
      // continue regardless
    }
    navigate("/admin", { replace: true });
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <header className="shrink-0 border-b border-border bg-card px-6 h-12 flex items-center justify-center">
        <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
          Account Setup
        </span>
      </header>

      {/* Step Indicator */}
      <div className="shrink-0 px-4 pt-5 pb-3">
        <StepIndicator steps={[...STEPS]} currentStep={currentStep} />
      </div>

      {/* Content — scrollable */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        <div className="w-full max-w-xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              {currentStep === "company" && (
                <CompanyStep onSuccess={() => setCurrentStep("subscription")} />
              )}
              {currentStep === "subscription" && (
                <SubscriptionStep onSuccess={() => setCurrentStep("products")} />
              )}
              {currentStep === "products" && (
                <ProductsStep
                  onSuccess={() => setCurrentStep("done")}
                  onBack={() => setCurrentStep("subscription")}
                  onSkip={() => {
                    setProductsSkipped(true);
                    setCurrentStep("done");
                  }}
                />
              )}
              {currentStep === "done" && (
                <DoneStep
                  onComplete={handleComplete}
                  productsSkipped={productsSkipped}
                  onConfigureProducts={() => {
                    setProductsSkipped(false);
                    setCurrentStep("products");
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
