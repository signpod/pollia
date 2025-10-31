"use client";

import PollCreateFloatingButton from "@/components/poll/PollCreateFloatingButton";
import SurveyCreateFloatingButton from "@/components/survey/SurveyCreateFloatingButton";
import { getQueryClient } from "@/lib/getQueryClient";
import { FixedBottomLayout, FixedTopLayout } from "@repo/ui/components";
import { DehydratedState, HydrationBoundary, QueryClientProvider } from "@tanstack/react-query";
import Link from "next/link";
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
          <FixedBottomLayout.Content className="w-full flex justify-end p-4 bg-transparent">
            <div className="flex flex-col gap-4 fixed bottom-5 right-5">
              <Link href="/survey/question/create">
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
