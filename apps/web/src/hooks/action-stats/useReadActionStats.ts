"use client";

import { getActionStats } from "@/actions/action-stats/read";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { useQuery } from "@tanstack/react-query";

export function useReadActionStats(missionId: string) {
  return useQuery({
    queryKey: missionQueryKeys.actionStats(missionId),
    queryFn: () => getActionStats(missionId),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!missionId,
  });
}

export type UseReadActionStatsReturn = ReturnType<typeof useReadActionStats>;
