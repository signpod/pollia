import { useSuspenseQuery } from "@tanstack/react-query";

export const usePoll = (pollId: string) => {
  return useSuspenseQuery({
    queryKey: ["poll", pollId],
    queryFn: () => {
      //TODO: 폴 조회 API 구현
    },
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
    queryFn: () => {
      //TODO: 폴 결과 조회 API 구현
    },
    refetchInterval: 3000,
    staleTime: 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export type UsePollResultsReturn = ReturnType<typeof usePollResults>;
