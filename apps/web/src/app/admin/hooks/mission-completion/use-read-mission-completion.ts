"use client";

import { getMissionCompletion } from "@/actions/mission-completion";
import { adminMissionCompletionQueryKeys } from "@/app/admin/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";

export function useReadMissionCompletion(missionId: string) {
  return useQuery({
    queryKey: adminMissionCompletionQueryKeys.missionCompletion(missionId),
    queryFn: () => getMissionCompletion(missionId),
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export type UseReadMissionCompletionReturn = ReturnType<typeof useReadMissionCompletion>;
