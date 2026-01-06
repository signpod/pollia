"use client";

import { getMissionNotionPage } from "@/actions/mission";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { useQuery } from "@tanstack/react-query";

export function useReadMissionNotionPage(missionId: string) {
  return useQuery({
    queryKey: missionQueryKeys.missionNotionPage(missionId),
    queryFn: () => getMissionNotionPage(missionId),
    staleTime: 30 * 1000,
  });
}

export type UseReadMissionNotionPageReturn = ReturnType<typeof useReadMissionNotionPage>;
