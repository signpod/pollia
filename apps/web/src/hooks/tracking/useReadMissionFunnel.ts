"use client";

import { getMissionFunnel } from "@/actions/tracking";
import { trackingQueryKeys } from "@/constants/queryKeys/trackingQueryKeys";
import type { DateRangeString } from "@/types/common/dateRange";
import { useQuery } from "@tanstack/react-query";

export function useReadMissionFunnel(
  missionId: string,
  options?: { membersOnly?: boolean; dateRange?: DateRangeString },
) {
  return useQuery({
    queryKey: trackingQueryKeys.missionFunnel(missionId, options),
    queryFn: () => getMissionFunnel(missionId, options),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!missionId,
  });
}

export type UseReadMissionFunnelReturn = ReturnType<typeof useReadMissionFunnel>;
