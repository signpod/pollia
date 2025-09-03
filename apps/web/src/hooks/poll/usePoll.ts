import { useSuspenseQuery } from "@tanstack/react-query";
import { fetchPoll, fetchPollResults } from "@/lib/poll-api";

export const usePoll = (pollId: string) => {
  return useSuspenseQuery({
    queryKey: ["poll", pollId],
    queryFn: () => fetchPoll(pollId),
    refetchInterval: 30 * 60 * 1000, // 30분
    staleTime: 30 * 60 * 1000, // 30분
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export type UsePollReturn = ReturnType<typeof usePoll>;

export const usePollResults = (pollId: string) => {
  return useSuspenseQuery({
    queryKey: ["pollResults", pollId],
    queryFn: () => fetchPollResults(pollId),
    refetchInterval: 3000,
    staleTime: 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export type UsePollResultsReturn = ReturnType<typeof usePollResults>;
