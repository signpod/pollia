import { useSuspenseQuery } from "@tanstack/react-query";
import { fetchPoll } from "@/lib/poll-api";

export const usePoll = (pollId: string) => {
  return useSuspenseQuery({
    queryKey: ["poll", pollId],
    queryFn: () => fetchPoll(pollId),
    refetchInterval: 5000,
    staleTime: 3000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export type UsePollReturn = ReturnType<typeof usePoll>;
