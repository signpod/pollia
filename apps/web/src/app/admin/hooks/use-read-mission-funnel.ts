"use client";

import { getMissionFunnel } from "@/actions/tracking";
import { trackingQueryKeys } from "@/app/admin/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";

export const useReadMissionFunnel = (missionId: string) => {
  return useQuery({
    queryKey: trackingQueryKeys.missionFunnel(missionId),
    queryFn: () => getMissionFunnel(missionId),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export type UseReadMissionFunnelReturn = ReturnType<typeof useReadMissionFunnel>;
