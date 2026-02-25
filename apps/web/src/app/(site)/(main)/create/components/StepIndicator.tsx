"use client";

import { Typo } from "@repo/ui/components";
import { cn } from "@repo/ui/lib";
import { Check } from "lucide-react";
import type { Step } from "../types";

interface StepIndicatorProps {
  currentStep: Step;
  steps: Step[];
  stepLabels: Record<Step, string>;
}

export function StepIndicator({ currentStep, steps, stepLabels }: StepIndicatorProps) {
  const currentIndex = steps.indexOf(currentStep);

  return (
    <div className="mb-8 flex items-center justify-between">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const stepNumber = index + 1;

        return (
          <div key={step} className={cn("flex items-center", index < steps.length - 1 && "flex-1")}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex size-10 items-center justify-center rounded-full border-2 transition-colors",
                  isCompleted && "border-zinc-800 bg-zinc-800 text-white",
                  isCurrent && "border-zinc-800 text-zinc-800",
                  !isCompleted && !isCurrent && "border-zinc-200 text-zinc-400",
                )}
              >
                {isCompleted ? (
                  <Check className="size-5" />
                ) : (
                  <Typo.Body size="medium" className="font-semibold">
                    {stepNumber}
                  </Typo.Body>
                )}
              </div>
              <Typo.Body
                size="small"
                className={cn("mt-2 font-medium", isCurrent ? "text-zinc-900" : "text-zinc-500")}
              >
                {stepLabels[step]}
              </Typo.Body>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "mx-4 h-0.5 flex-1 transition-colors",
                  isCompleted ? "bg-zinc-800" : "bg-zinc-200",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
