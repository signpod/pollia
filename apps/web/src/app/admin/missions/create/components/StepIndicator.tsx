"use client";

import { cn } from "@/app/admin/lib/utils";
import { Check } from "lucide-react";
import type { STEP_LABELS, Step } from "../types";

interface StepIndicatorProps {
  currentStep: Step;
  steps: Step[];
  stepLabels: typeof STEP_LABELS;
}

export function StepIndicator({ currentStep, steps, stepLabels }: StepIndicatorProps) {
  const currentIndex = steps.indexOf(currentStep);

  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const stepNumber = index + 1;

        return (
          <div
            key={step}
            className={cn("flex items-center", index === steps.length - 1 || "flex-1")}
          >
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex items-center justify-center size-10 rounded-full border-2 transition-colors",
                  isCompleted && "bg-primary border-primary text-primary-foreground",
                  isCurrent && "border-primary text-primary",
                  !isCompleted && !isCurrent && "border-muted text-muted-foreground",
                )}
              >
                {isCompleted ? (
                  <Check className="size-5" />
                ) : (
                  <span className="font-semibold">{stepNumber}</span>
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-sm font-medium",
                  isCurrent && "text-primary",
                  !isCurrent && "text-muted-foreground",
                )}
              >
                {stepLabels[step]}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-4 transition-colors",
                  isCompleted ? "bg-primary" : "bg-muted",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
