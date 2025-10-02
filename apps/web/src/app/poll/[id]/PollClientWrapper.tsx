"use client";

import {
  QueryClientProvider,
  HydrationBoundary,
  DehydratedState,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getQueryClient } from "@/lib/getQueryClient";
import { PollContent } from "./PollContent";
import { FixedTopLayout } from "@repo/ui/components";
import { FixedBottomLayout } from "@repo/ui/components";
import { LoginModalProvider } from "@/components/providers/LoginModalProvider";
import { PollHeader } from "./PollHeader";

interface PollClientWrapperProps {
  pollId: string;
  dehydratedState: DehydratedState;
}

export function PollClientWrapper({
  pollId,
  dehydratedState,
}: PollClientWrapperProps) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <LoginModalProvider>
          <FixedBottomLayout
            hasBottomGap={true}
            className="min-h-screen bg-zinc-50"
          >
            <FixedTopLayout className="flex flex-col gap-2">
              <PollHeader />
              <PollContent pollId={pollId} />
            </FixedTopLayout>
          </FixedBottomLayout>
        </LoginModalProvider>
      </HydrationBoundary>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
