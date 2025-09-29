"use client";

import {
  QueryClientProvider,
  HydrationBoundary,
  DehydratedState,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getQueryClient } from "@/lib/getQueryClient";
import { PollContent } from "./PollContent";
import { FixedTopLayout, IconButton } from "@repo/ui/components";
import { FixedBottomLayout } from "@repo/ui/components";
import { MoreVertical, X } from "lucide-react";

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
        <FixedBottomLayout
          hasBottomGap={false}
          className="min-h-screen bg-zinc-50"
        >
          <FixedTopLayout className="flex flex-col gap-2">
            <FixedTopLayout.Content className="bg-zinc-50">
              <div className="flex items-center justify-between px-1">
                <IconButton icon={X} className="size-12" />
                <IconButton icon={MoreVertical} className="size-12" />
              </div>
            </FixedTopLayout.Content>

            <PollContent pollId={pollId} />
          </FixedTopLayout>
        </FixedBottomLayout>
      </HydrationBoundary>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
