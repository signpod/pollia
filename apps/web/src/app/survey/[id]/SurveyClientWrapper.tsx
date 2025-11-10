"use client";
import { FixedTopLayout } from "@repo/ui/components";
import { QueryClientProvider } from "@tanstack/react-query";

import { getQueryClient } from "@/lib/getQueryClient";
import { FixedBottomLayout } from "@repo/ui/components";
// import { SurveyIntro } from "./SurveyIntro";
import { SurveyScale } from "./SurveyScale";

// interface SurveyClientWrapperProps {
//   dehydratedState: DehydratedState;
// }

export function SurveyClientWrapper() {
  return (
    <ClientWrapper>
      {/* <SurveyIntro /> */}
      <SurveyScale />
    </ClientWrapper>
  );
}

function ClientWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {/* <HydrationBoundary state={dehydratedState}> */}
      <FixedBottomLayout className="bg-background min-h-screen">
        <FixedTopLayout>{children}</FixedTopLayout>
      </FixedBottomLayout>
      {/* </HydrationBoundary> */}
    </QueryClientProvider>
  );
}
