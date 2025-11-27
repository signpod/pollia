"use client";

import { FixedBottomLayout, FixedTopLayout } from "@repo/ui/components";

import { LoginModalProvider } from "@/components/providers/LoginModalProvider";
import { AuthError } from "@/hooks/login/useKakaoLogin";
import { SurveyIntro } from "./SurveyIntro";

interface SurveyClientWrapperProps {
  initialError: AuthError | null;
}

export function SurveyClientWrapper({ initialError }: SurveyClientWrapperProps) {
  return (
    <LoginModalProvider>
      <FixedBottomLayout className="bg-background min-h-screen">
        <FixedTopLayout>
          <SurveyIntro initialError={initialError} />
        </FixedTopLayout>
      </FixedBottomLayout>
    </LoginModalProvider>
  );
}
