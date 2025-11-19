"use client";

import { FixedBottomLayout, FixedTopLayout } from "@repo/ui/components";
import { DehydratedState, HydrationBoundary, QueryClientProvider } from "@tanstack/react-query";

import { LoginModalProvider } from "@/components/providers/LoginModalProvider";
import { AuthError } from "@/hooks/login/useKakaoLogin";
import { getQueryClient } from "@/lib/getQueryClient";
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
  const queryClient = getQueryClient();

  return (
    <LoginModalProvider>
      <QueryClientProvider client={queryClient}>
        <HydrationBoundary state={dehydratedState}>
          <FixedBottomLayout className="bg-background min-h-screen">
            <FixedTopLayout>{children}</FixedTopLayout>
          </FixedBottomLayout>
        </HydrationBoundary>
      </QueryClientProvider>
    </LoginModalProvider>
  );
}
