import { getPoll, getPollResults, getUserPolls, getUserVoteStatus } from "@/actions/poll";
import { getBookmarkedPolls, getLikedPolls } from "@/actions/poll/read";
import { pollQueryKeys } from "@/constants/queryKeys/pollQueryKeys";
import { useQuery } from "@tanstack/react-query";

export const useGetPoll = (pollId: string) => {
  return useQuery({
    queryKey: pollQueryKeys.poll(pollId),
    queryFn: () => {
      return getPoll(pollId);
    },
    refetchInterval: 30 * 60 * 1000,
    staleTime: 30 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export type UsePollReturn = ReturnType<typeof useGetPoll>;

export const usePollResults = (pollId: string) => {
  return useQuery({
    queryKey: pollQueryKeys.pollResults(pollId),
    queryFn: () => getPollResults(pollId),
    refetchInterval: 10 * 1000,
    staleTime: 10 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
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

export const useUserPolls = ({
  userId,
  searchQuery,
}: {
  userId?: string;
  searchQuery?: string;
} = {}) => {
  const queryKey = searchQuery
    ? [...pollQueryKeys.userPolls(userId), searchQuery]
    : pollQueryKeys.userPolls(userId);

  return useQuery({
    queryKey,
    queryFn: () =>
      getUserPolls({
        userId,
        options: searchQuery ? { searchQuery } : undefined,
      }),
    select: data => data?.data ?? [],
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnMount: true,
  });
};

export type UseUserPollsReturn = ReturnType<typeof useUserPolls>;

export const useBookmarkedPolls = (userId?: string) => {
  return useQuery({
    queryKey: pollQueryKeys.bookmarkedPolls(userId),
    queryFn: () => getBookmarkedPolls(userId),
    select: data => data?.data ?? [],
    initialData: { data: [] },
    refetchInterval: 30 * 60 * 1000,
    staleTime: 30 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export type UseBookmarkedPollsReturn = ReturnType<typeof useBookmarkedPolls>;

export const useLikedPolls = (userId?: string) => {
  return useQuery({
    queryKey: pollQueryKeys.likedPolls(userId),
    queryFn: () => getLikedPolls(userId),
    select: data => data?.data ?? [],
    initialData: { data: [] },
    refetchInterval: 30 * 60 * 1000,
    staleTime: 30 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export type UseLikedPollsReturn = ReturnType<typeof useLikedPolls>;
