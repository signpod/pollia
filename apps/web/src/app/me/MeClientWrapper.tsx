"use client";

import {
  QueryClientProvider,
  HydrationBoundary,
  DehydratedState,
} from "@tanstack/react-query";
import { FixedBottomLayout, FixedTopLayout } from "@repo/ui/components";
import { FloatingButton } from "./FloatingButton";
import { UserInfo } from "./UserInfo";
import { getQueryClient } from "@/lib/getQueryClient";
import { PollList } from "./ui";
import { useMe } from "./hook";

interface MeClientWrapperProps {
  dehydratedState: DehydratedState;
}

export function MeClientWrapper({ dehydratedState }: MeClientWrapperProps) {
  const queryClient = getQueryClient();
  const { me, polls } = useMe();

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <FixedBottomLayout className="bg-zinc-50 min-h-screen">
          <FixedTopLayout className="space-y-6">
            <FixedTopLayout.Content className="bg-transparent">
              <div className="h-12" />
            </FixedTopLayout.Content>
            <UserInfo user={me!} />
            <div className="space-y-6">
              {polls.map((poll) => (
                <PollList
                  key={poll.title}
                  title={poll.title}
                  polls={poll.polls}
                  useActiveIcon={poll.useActiveIcon}
                />
              ))}
            </div>
          </FixedTopLayout>
          <FixedBottomLayout.Content className="flex justify-end p-4 bg-transparent">
            {/* TODO: 투표 생성 FloatingButton 수정 */}
            <FloatingButton />
          </FixedBottomLayout.Content>
        </FixedBottomLayout>
      </HydrationBoundary>
    </QueryClientProvider>
  );
}
