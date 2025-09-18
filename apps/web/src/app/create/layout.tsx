"use client";

import { StepProvider } from "@repo/ui/components";
import { CREATE_POLL_STEPS } from "@/constants/createPoll";

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StepProvider
      steps={CREATE_POLL_STEPS}
      initialStep={0}
      onStepChange={(currentStep: number, previousStep: number) => {
        console.log(`Step 변경: ${previousStep} → ${currentStep}`);
      }}
      onComplete={() => {
        console.log("모든 Step 완료");
      }}
    >
      {children}
    </StepProvider>
  );
}
