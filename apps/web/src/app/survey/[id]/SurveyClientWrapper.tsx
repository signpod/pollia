"use client";

import { FixedBottomLayout, FixedTopLayout } from "@repo/ui/components";
import { DehydratedState, HydrationBoundary } from "@tanstack/react-query";

import { LoginModalProvider } from "@/components/providers/LoginModalProvider";
import { AuthError } from "@/hooks/login/useKakaoLogin";
import { PropsWithChildren } from "react";
import { SurveyIntro } from "./SurveyIntro";

interface SurveyClientWrapperProps {
  dehydratedState: DehydratedState;
  initialError: AuthError | null;
}

export function SurveyClientWrapper({ dehydratedState, initialError }: SurveyClientWrapperProps) {
  return (
    <ClientWrapper dehydratedState={dehydratedState}>
      <SurveyIntro initialError={initialError} />
    </ClientWrapper>
  );
}

function ClientWrapper({
  dehydratedState,
  children,
}: PropsWithChildren<{ dehydratedState: DehydratedState }>) {
  return (
    <LoginModalProvider>
      <HydrationBoundary state={dehydratedState}>
        <FixedBottomLayout className="bg-background min-h-screen">
          <FixedTopLayout>{children}</FixedTopLayout>
        </FixedBottomLayout>
      </HydrationBoundary>
    </LoginModalProvider>
  );
}
