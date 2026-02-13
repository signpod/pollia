"use client";

import { getCompletionsByMissionId } from "@/actions/mission-completion";
import { adminMissionCompletionQueryKeys } from "@/app/admin/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";

export function useReadCompletions(missionId: string) {
  return useQuery({
    queryKey: adminMissionCompletionQueryKeys.completionList(missionId),
    queryFn: () => getCompletionsByMissionId(missionId),
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export type UseReadCompletionsReturn = ReturnType<typeof useReadCompletions>;
