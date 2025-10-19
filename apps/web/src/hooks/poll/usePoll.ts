import { useQuery } from "@tanstack/react-query";
import {
  getPoll,
  getPollResults,
  getUserPolls,
  getUserVoteStatus,
} from "@/actions/poll";
import { pollQueryKeys } from "@/constants/queryKeys/pollQueryKeys";
import { getBookmarkedPolls, getLikedPolls } from "@/actions/poll/read";

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
    queryFn: () => getPollResults(pollId),
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

export const useUserPolls = (userId?: string) => {
  return useQuery({
    queryKey: pollQueryKeys.userPolls(userId),
    queryFn: () => getUserPolls(userId),
    select: (data) => data?.data ?? [],
    initialData: { data: [] },
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export type UseUserPollsReturn = ReturnType<typeof useUserPolls>;

export const useBookmarkedPolls = (userId?: string) => {
  return useQuery({
    queryKey: pollQueryKeys.bookmarkedPolls(userId),
    queryFn: () => getBookmarkedPolls(userId),
    select: (data) => data?.data ?? [],
    initialData: { data: [] },
    refetchInterval: 30 * 60 * 1000,
    staleTime: 30 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export type UseBookmarkedPollsReturn = ReturnType<typeof useBookmarkedPolls>;

export const useLikedPolls = (userId?: string) => {
  return useQuery({
    queryKey: pollQueryKeys.likedPolls(userId),
    queryFn: () => getLikedPolls(userId),
    select: (data) => data?.data ?? [],
    initialData: { data: [] },
    refetchInterval: 30 * 60 * 1000,
    staleTime: 30 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export type UseLikedPollsReturn = ReturnType<typeof useLikedPolls>;
