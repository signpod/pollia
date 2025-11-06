"use client";
import { ButtonV2, FixedTopLayout, Typo } from "@repo/ui/components";
import { QueryClientProvider } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/getQueryClient";
import { FixedBottomLayout } from "@repo/ui/components";
import { SurveyIntro } from "./SurveyIntro";

// interface SurveyClientWrapperProps {
//   dehydratedState: DehydratedState;
// }

export function SurveyClientWrapper() {
  return (
    <ClientWrapper>
      <SurveyIntro />

      <FixedBottomLayout.Content className="flex w-full justify-end bg-transparent p-4">
        <ButtonV2 variant="primary" size="large" className="w-full">
          <Typo.ButtonText size="large" className="flex w-full items-center justify-center">
            참여하고 리워드 받기
          </Typo.ButtonText>
        </ButtonV2>
      </FixedBottomLayout.Content>
    </ClientWrapper>
  );
}

function ClientWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {/* <HydrationBoundary state={dehydratedState}> */}
      <FixedBottomLayout className="bg-background min-h-screen">
        <FixedTopLayout className="space-y-6">{children}</FixedTopLayout>
      </FixedBottomLayout>
      {/* </HydrationBoundary> */}
    </QueryClientProvider>
  );
}
