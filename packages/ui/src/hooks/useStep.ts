"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

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
}

export function StepProvider({
  children,
  steps: initialSteps,
  initialStep = 0,
  onStepChange,
  onComplete,
}: StepProviderProps) {
  if (initialSteps.length === 0) {
    throw new Error("StepProvider: steps array cannot be empty");
  }

  const safeInitialStep = Math.max(
    0,
    Math.min(initialStep, initialSteps.length - 1)
  );

  const [currentStep, setCurrentStep] = useState(safeInitialStep);
  const [steps, setSteps] = useState<StepConfig[]>(initialSteps);

  const currentStepConfig = steps[currentStep] ?? steps[0]!;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const canGoNext = currentStepConfig?.canGoNext !== false;
  const canGoBack = currentStepConfig?.canGoBack !== false && !isFirstStep;

  const progress =
    steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

  const goToStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex >= 0 && stepIndex < steps.length) {
        const previousStep = currentStep;
        setCurrentStep(stepIndex);
        onStepChange?.(stepIndex, previousStep);

        if (stepIndex === steps.length - 1) {
          onComplete?.();
        }
      }
    },
    [currentStep, steps.length, onStepChange, onComplete]
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

  const updateStepConfig = useCallback(
    (stepIndex: number, updates: Partial<StepConfig>) => {
      setSteps((prevSteps) =>
        prevSteps.map((step, index) =>
          index === stepIndex ? { ...step, ...updates } : step
        )
      );
    },
    []
  );

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

  return React.createElement(StepContext.Provider, { value }, children);
}

export function useStep(): StepContextValue {
  const context = useContext(StepContext);
  if (!context) {
    throw new Error("useStep must be used within a StepProvider");
  }
  return context;
}
