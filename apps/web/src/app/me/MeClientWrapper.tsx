"use client";

import { getQueryClient } from "@/lib/getQueryClient";
import { FixedBottomLayout, FixedTopLayout } from "@repo/ui/components";
import { DehydratedState, HydrationBoundary, QueryClientProvider } from "@tanstack/react-query";
import { ProfileContainer } from "./ProfileContainer";

interface MeClientWrapperProps {
  dehydratedState: DehydratedState;
}

export function MeClientWrapper({ dehydratedState }: MeClientWrapperProps) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <FixedBottomLayout className="bg-background min-h-screen">
          <FixedTopLayout className="space-y-6 pt-12">
            <ProfileContainer />
          </FixedTopLayout>
        </FixedBottomLayout>
      </HydrationBoundary>
    </QueryClientProvider>
  );
}
