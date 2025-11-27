"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { createContext, createElement, useCallback, useContext, useEffect, useState } from "react";

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

const URL_STEP_PARAM_NAME = "step";

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
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [steps, setSteps] = useState<StepConfig[]>(initialSteps);

  const currentStepConfig = steps[currentStep] ?? steps[0]!;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const canGoNext = currentStepConfig?.canGoNext !== false;
  const canGoBack = currentStepConfig?.canGoBack !== false;

  const progress = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

  const goToStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex >= 0 && stepIndex < steps.length) {
        if (syncWithUrl) {
          const params = new URLSearchParams(searchParams?.toString());
          params.set(URL_STEP_PARAM_NAME, String(stepIndex + 1));
          router.push(`${pathname}?${params.toString()}`);
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
    [
      currentStep,
      steps.length,
      onStepChange,
      onComplete,
      syncWithUrl,
      router,
      pathname,
      searchParams,
    ],
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

  useEffect(() => {
    if (!syncWithUrl) return;

    const urlStep = searchParams?.get(URL_STEP_PARAM_NAME);

    if (!urlStep) {
      const params = new URLSearchParams(searchParams?.toString());
      params.set(URL_STEP_PARAM_NAME, String(currentStep + 1));
      router.replace(`${pathname}?${params.toString()}`);
      return;
    }

    const urlStepNumber = Number.parseInt(urlStep, 10) - 1;

    if (
      !Number.isNaN(urlStepNumber) &&
      urlStepNumber >= 0 &&
      urlStepNumber < steps.length &&
      urlStepNumber !== currentStep
    ) {
      const previousStep = currentStep;
      setCurrentStep(urlStepNumber);
      onStepChange?.(urlStepNumber, previousStep);
    }
  }, [syncWithUrl, searchParams, currentStep, steps.length, router, pathname, onStepChange]);

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
