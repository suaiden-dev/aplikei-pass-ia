import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  RiSettings4Line, 
  RiBuilding4Line, 
  RiVipCrown2Line, 
  RiCheckDoubleLine,
  RiArrowRightLine,
  RiArrowLeftLine,
  RiGlobalLine,
  RiInformationLine
} from "react-icons/ri";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../atoms/dialog";
import { Button } from "../atoms/button";
import { cn } from "../../utils/cn";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const STEPS = [
  {
    id: "welcome",
    title: "Welcome to Aplikei!",
    description: "Let's walk you through the first steps to set up your legal office on our platform.",
    icon: <RiCheckDoubleLine className="text-primary w-12 h-12" />,
    content: (
      <div className="space-y-4">
        <p className="text-text-muted">
          Our platform was designed to simplify your workflow. To unlock the full potential, we need to set up your office's digital identity first.
        </p>
      </div>
    ),
  },
  {
    id: "company-profile",
    title: "Step 1: Company Profile",
    description: "Your office identity starts here.",
    icon: <RiBuilding4Line className="text-primary w-12 h-12" />,
    content: (
      <div className="space-y-4">
        <p className="text-text-muted">
          Navigate to the sidebar and go to <span className="font-bold text-text">Settings → Company Profile</span>.
        </p>
        <div className="bg-bg-subtle p-4 rounded-xl border border-border">
          <p className="text-sm">
            Fill in all the information. This data is essential to create your office and ensure everything works correctly.
          </p>
        </div>
        <div className="flex items-start gap-3 text-sm text-text-muted bg-blue-500/5 p-3 rounded-lg border border-blue-500/10">
          <RiInformationLine className="text-blue-500 mt-0.5 shrink-0" size={18} />
          <p>The <span className="font-semibold text-text">Office Name</span> is your public brand name seen by customers.</p>
        </div>
      </div>
    ),
  },
  {
    id: "slug-rules",
    title: "Step 2: Understanding the Slug",
    description: "Your unique address on the web.",
    icon: <RiGlobalLine className="text-primary w-12 h-12" />,
    content: (
      <div className="space-y-4">
        <p className="text-text-muted">
          The <span className="font-bold text-text">Slug</span> will be used in your office URL. It must be unique.
        </p>
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted px-1">Slug Rules:</p>
          <ul className="grid grid-cols-1 gap-2">
            {[
              "No spaces allowed",
              "No accents (é, ã, ç, etc.)",
              "No special characters (@, #, $, etc.)",
              "Preferably letters only",
            ].map((rule, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-text">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                {rule}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-text-muted italic bg-bg-subtle p-3 rounded-lg">
          The system will automatically validate if your chosen slug is available. If someone else is already using it, you'll need to pick a different one.
        </p>
      </div>
    ),
  },
  {
    id: "subscription",
    title: "Step 3: Activate Your Plan",
    description: "Unlock all powerful tools.",
    icon: <RiVipCrown2Line className="text-primary w-12 h-12" />,
    content: (
      <div className="space-y-4">
        <p className="text-text-muted">
          Once your profile is saved, go to <span className="font-bold text-text">My Subscription</span>.
        </p>
        <p className="text-text-muted">
          Click on <span className="text-primary font-bold">Get Plan</span> to choose and activate your subscription. This will release all application features for your use.
        </p>
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/20">
          <div className="p-2 bg-primary rounded-xl text-white">
            <RiVipCrown2Line size={24} />
          </div>
          <div>
            <p className="font-bold text-text">Subscription required</p>
            <p className="text-xs text-text-muted">Unlock teams, revenue tracking, and processes.</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "finish",
    title: "You're All Set!",
    description: "The first steps are complete.",
    icon: <RiCheckDoubleLine className="text-green-500 w-12 h-12" />,
    content: (
      <div className="space-y-4">
        <p className="text-text-muted">
          Excellent! You now know how to set up your office and activate your plan. 
        </p>
        <div className="p-4 rounded-2xl bg-green-500/5 border border-green-500/20 text-center">
          <p className="text-sm font-semibold text-green-600">
            Click Finish to start managing your office.
          </p>
        </div>
      </div>
    ),
  },
];

export function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const step = STEPS[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onComplete()}>
      <DialogContent className="max-w-xl border-border bg-card p-0 overflow-hidden rounded-3xl shadow-2xl">
        <div className="relative h-2 bg-bg-subtle">
          <motion.div 
            className="absolute h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-4 bg-primary/5 rounded-3xl border border-primary/10">
                  {step.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-text tracking-tight">{step.title}</h2>
                  <p className="text-text-muted font-medium">{step.description}</p>
                </div>
              </div>

              <div className="py-2">
                {step.content}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="p-6 bg-bg-subtle/50 border-t border-border flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className={cn(
              "px-6 rounded-2xl transition-all",
              currentStep === 0 ? "opacity-0 pointer-events-none" : "opacity-100"
            )}
          >
            <RiArrowLeftLine className="mr-2" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            className="px-8 rounded-2xl bg-primary hover:bg-primary-dark shadow-lg shadow-primary/20"
          >
            {currentStep === STEPS.length - 1 ? (
              "Finish"
            ) : (
              <>
                Next
                <RiArrowRightLine className="ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
