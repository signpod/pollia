"use client";

import { ActionCreateFloatingButton } from "@/components/mission/ActionCreateFloatingButton";
import { MissionCreateFloatingButton } from "@/components/mission/MissionCreateFloatingButton";
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
          <FixedBottomLayout.Content className="flex w-full justify-end bg-transparent p-4">
            <div className="fixed right-5 bottom-5 flex flex-col gap-4">
              <ActionCreateFloatingButton variant="with-text" />
              <MissionCreateFloatingButton variant="with-text" />
            </div>
          </FixedBottomLayout.Content>
        </FixedBottomLayout>
      </HydrationBoundary>
    </QueryClientProvider>
  );
}
