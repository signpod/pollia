"use client";

import { getMissionStats } from "@/actions/mission-response";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { useQuery } from "@tanstack/react-query";

export function useReadMissionStats(missionId: string) {
  return useQuery({
    queryKey: missionQueryKeys.missionStats(missionId),
    queryFn: () => getMissionStats(missionId),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!missionId,
  });
}

export type UseReadMissionStatsReturn = ReturnType<typeof useReadMissionStats>;
