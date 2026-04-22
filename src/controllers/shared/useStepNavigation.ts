import { useCallback, useMemo } from 'react';

export interface StepNavigationOptions {
  totalSteps: number;
  initialStep?: number;
}

export interface StepNavigationResult {
  currentStep: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  progress: number;
  goToStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

export function useStepNavigation(
  options: StepNavigationOptions
): StepNavigationResult {
  const { totalSteps, initialStep = 0 } = options;

  const currentStep = initialStep;

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep >= totalSteps - 1;
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;
  const canGoNext = !isLastStep;
  const canGoPrevious = !isFirstStep;

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < totalSteps) {
      // In a real implementation, this would update state
      console.log('Navigate to step:', step);
    }
  }, [totalSteps]);

  const nextStep = useCallback(() => {
    if (canGoNext) {
      goToStep(currentStep + 1);
    }
  }, [currentStep, canGoNext, goToStep]);

  const previousStep = useCallback(() => {
    if (canGoPrevious) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, canGoPrevious, goToStep]);

  return useMemo(() => ({
    currentStep,
    isFirstStep,
    isLastStep,
    progress,
    goToStep,
    nextStep,
    previousStep,
    canGoNext,
    canGoPrevious,
  }), [currentStep, isFirstStep, isLastStep, progress, goToStep, nextStep, previousStep, canGoNext, canGoPrevious]);
}
