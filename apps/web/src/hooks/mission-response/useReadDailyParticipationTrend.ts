"use client";

import { getDailyParticipationTrend } from "@/actions/mission-response";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import type { DateRangeString } from "@/types/common/dateRange";
import { useQuery } from "@tanstack/react-query";

export function useReadDailyParticipationTrend(missionId: string, dateRange?: DateRangeString) {
  return useQuery({
    queryKey: missionQueryKeys.dailyParticipationTrend(missionId, dateRange),
    queryFn: () => getDailyParticipationTrend(missionId, dateRange),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!missionId,
  });
}

export type UseReadDailyParticipationTrendReturn = ReturnType<
  typeof useReadDailyParticipationTrend
>;
