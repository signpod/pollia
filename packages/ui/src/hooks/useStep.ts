"use client";

import { useRouter } from "next/navigation";
import { createContext, createElement, useCallback, useContext, useState } from "react";

export interface StepConfig {
  id: string;
  title: string;
  canGoNext?: boolean;
  canGoBack?: boolean;
}

export interface StepContextValue {
  currentStep: number;
  currentStepConfig: StepConfig;
  steps: StepConfig[];

  goToStep: (stepIndex: number) => void;
  goNext: () => void;
  goBack: () => void;

  updateStepConfig: (stepIndex: number, updates: Partial<StepConfig>) => void;

  isFirstStep: boolean;
  isLastStep: boolean;
  canGoNext: boolean;
  canGoBack: boolean;
  progress: number;
}

const StepContext = createContext<StepContextValue | null>(null);

export interface StepProviderProps {
  children: React.ReactNode;
  steps: StepConfig[];
  initialStep?: number;
  onStepChange?: (currentStep: number, previousStep: number) => void;
  onComplete?: () => void;
  syncWithUrl?: boolean;
}

export function StepProvider({
  children,
  steps: initialSteps,
  initialStep = 0,
  onStepChange,
  onComplete,
  syncWithUrl = false,
}: StepProviderProps) {
  if (initialSteps.length === 0) {
    throw new Error("StepProvider: steps array cannot be empty");
  }

  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [steps, setSteps] = useState<StepConfig[]>(initialSteps);

  const currentStepConfig = steps[currentStep] ?? (steps[0] as StepConfig);
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const canGoNext = currentStepConfig?.canGoNext !== false;
  const canGoBack = currentStepConfig?.canGoBack !== false;

  const progress = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

  const goToStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex >= 0 && stepIndex < steps.length) {
        if (syncWithUrl) {
          if (typeof window === "undefined") {
            return;
          }
          const stepId = steps[stepIndex]?.id;
          if (!stepId) {
            console.error("❌ question id가 없습니다.");
            return;
          }
          const currentPath = window.location.pathname;
          const pathParts = currentPath.split("/").filter(Boolean);
          if (pathParts.length === 0) {
            router.push(`/${stepId}`);
            return;
          }
          pathParts[pathParts.length - 1] = stepId;
          const newPath = `/${pathParts.join("/")}`;
          router.push(newPath);
        } else {
          const previousStep = currentStep;
          setCurrentStep(stepIndex);
          onStepChange?.(stepIndex, previousStep);
        }

        if (stepIndex === steps.length - 1) {
          onComplete?.();
        }
      }
    },
    [currentStep, steps.length, onStepChange, onComplete, syncWithUrl, router, steps],
  );

  const goNext = useCallback(() => {
    if (canGoNext && !isLastStep) {
      goToStep(currentStep + 1);
    }
  }, [canGoNext, isLastStep, currentStep, goToStep]);

  const goBack = useCallback(() => {
    if (canGoBack && !isFirstStep) {
      goToStep(currentStep - 1);
    }
  }, [canGoBack, isFirstStep, currentStep, goToStep]);

  const updateStepConfig = useCallback((stepIndex: number, updates: Partial<StepConfig>) => {
    setSteps(prevSteps =>
      prevSteps.map((step, index) => (index === stepIndex ? { ...step, ...updates } : step)),
    );
  }, []);

  const value: StepContextValue = {
    currentStep,
    currentStepConfig,
    steps,
    goToStep,
    goNext,
    goBack,
    updateStepConfig,
    isFirstStep,
    isLastStep,
    canGoNext,
    canGoBack,
    progress,
  };

  return createElement(StepContext.Provider, { value }, children);
}

export function useStep(): StepContextValue {
  const context = useContext(StepContext);
  if (!context) {
    throw new Error("useStep must be used within a StepProvider");
  }
  return context;
}
