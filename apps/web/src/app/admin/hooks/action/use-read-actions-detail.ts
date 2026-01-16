"use client";

import { getMissionActionsDetail } from "@/actions/action";
import { adminActionQueryKeys } from "@/app/admin/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";

export function useReadActionsDetail(missionId: string) {
  return useQuery({
    queryKey: adminActionQueryKeys.actions(missionId),
    queryFn: () => getMissionActionsDetail(missionId),
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export type UseReadActionsDetailReturn = ReturnType<typeof useReadActionsDetail>;
