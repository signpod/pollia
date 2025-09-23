"use client";

import {
  QueryClientProvider,
  HydrationBoundary,
  DehydratedState,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getQueryClient } from "@/lib/getQueryClient";
import { PollContent } from "./PollContent";

interface PollClientWrapperProps {
  pollId: string;
  dehydratedState: DehydratedState;
}

export default function PollClientWrapper({
  pollId,
  dehydratedState,
}: PollClientWrapperProps) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <PollContent pollId={pollId} />
      </HydrationBoundary>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
