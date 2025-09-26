import { useQuery } from "@tanstack/react-query";
import { getPoll, getPollResults, getUserVoteStatus } from "@/actions/poll";
import { pollQueryKeys } from "@/constants/queryKeys/pollQueryKeys";

export const useGetPoll = (pollId: string) => {
  return useQuery({
    queryKey: pollQueryKeys.poll(pollId),
    queryFn: () => {
      return getPoll(pollId);
    },
    refetchInterval: 30 * 60 * 1000,
    staleTime: 30 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export type UsePollReturn = ReturnType<typeof useGetPoll>;

export const usePollResults = (pollId: string) => {
  return useQuery({
    queryKey: pollQueryKeys.pollResults(pollId),
    queryFn: () => {
      return getPollResults(pollId);
    },
    refetchInterval: 10 * 1000,
    staleTime: 10 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export type UsePollResultsReturn = ReturnType<typeof usePollResults>;

export const useUserVoteStatus = (pollId: string) => {
  return useQuery({
    queryKey: pollQueryKeys.userVoteStatus(pollId),
    queryFn: () => {
      return getUserVoteStatus(pollId);
    },
  });
};

export type UseUserVoteStatusReturn = ReturnType<typeof useUserVoteStatus>;
