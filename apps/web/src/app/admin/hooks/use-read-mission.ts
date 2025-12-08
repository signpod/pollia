"use client";

import { getMission } from "@/actions/mission";
import { adminMissionQueryKeys } from "@/app/admin/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";

export function useReadMission(missionId: string) {
  return useQuery({
    queryKey: adminMissionQueryKeys.mission(missionId),
    queryFn: () => getMission(missionId),
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export type UseReadMissionReturn = ReturnType<typeof useReadMission>;
