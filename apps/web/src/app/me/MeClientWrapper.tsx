"use client";

import Link from "next/link";
import { DehydratedState, HydrationBoundary, QueryClientProvider } from "@tanstack/react-query";
import { FixedBottomLayout, FixedTopLayout } from "@repo/ui/components";
import PollCreateFloatingButton from "@/components/poll/PollCreateFloatingButton";
import SurveyCreateFloatingButton from "@/components/survey/SurveyCreateFloatingButton";
import { getQueryClient } from "@/lib/getQueryClient";
import { ProfileContainer } from "./ProfileContainer";

interface MeClientWrapperProps {
  dehydratedState: DehydratedState;
}

export function MeClientWrapper({ dehydratedState }: MeClientWrapperProps) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <FixedBottomLayout className="min-h-screen bg-zinc-50">
          <FixedTopLayout className="space-y-6">
            <FixedTopLayout.Content className="bg-transparent">
              <div className="h-12" />
            </FixedTopLayout.Content>
            <ProfileContainer />
          </FixedTopLayout>
          <FixedBottomLayout.Content className="flex w-full justify-end bg-transparent p-4">
            <div className="fixed right-5 bottom-5 flex flex-col gap-4">
              <Link href="/poll/create">
                <PollCreateFloatingButton variant="with-text" />
              </Link>
              <Link href="/survey/create">
                <SurveyCreateFloatingButton variant="with-text" />
              </Link>
            </div>
          </FixedBottomLayout.Content>
        </FixedBottomLayout>
      </HydrationBoundary>
    </QueryClientProvider>
  );
}
