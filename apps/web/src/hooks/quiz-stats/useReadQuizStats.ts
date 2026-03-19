"use client";

import { getQuizStats } from "@/actions/quiz-stats/read";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { useQuery } from "@tanstack/react-query";

export function useReadQuizStats(missionId: string) {
  return useQuery({
    queryKey: missionQueryKeys.quizStats(missionId),
    queryFn: () => getQuizStats(missionId),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!missionId,
  });
}

export type UseReadQuizStatsReturn = ReturnType<typeof useReadQuizStats>;
