"use client";
import { FixedBottomLayout, FixedTopLayout } from "@repo/ui/components";
import { DehydratedState, HydrationBoundary } from "@tanstack/react-query";

import { PropsWithChildren } from "react";
import { SurveyIntro } from "./SurveyIntro";

interface SurveyClientWrapperProps {
  dehydratedState: DehydratedState;
}

export function SurveyClientWrapper({ dehydratedState }: SurveyClientWrapperProps) {
  return (
    <ClientWrapper dehydratedState={dehydratedState}>
      <SurveyIntro />
    </ClientWrapper>
  );
}

function ClientWrapper({
  dehydratedState,
  children,
}: PropsWithChildren<{ dehydratedState: DehydratedState }>) {
  return (
    <HydrationBoundary state={dehydratedState}>
      <FixedBottomLayout className="bg-background min-h-screen">
        <FixedTopLayout>{children}</FixedTopLayout>
      </FixedBottomLayout>
    </HydrationBoundary>
  );
}
