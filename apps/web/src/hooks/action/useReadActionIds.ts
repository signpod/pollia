"use client";

import { getMissionActionIds } from "@/actions/action";
import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import { useQuery } from "@tanstack/react-query";

export const useReadActionIds = (missionId: string) => {
  return useQuery({
    queryKey: actionQueryKeys.actionsIds({ missionId }),
    queryFn: () => getMissionActionIds(missionId),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export type UseReadActionIdsReturn = ReturnType<typeof useReadActionIds>;
