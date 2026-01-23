"use client";

import { getMissionResponses } from "@/actions/mission-response";
import { adminMissionResponseQueryKeys } from "@/app/admin/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";

export function useReadMissionResponses(missionId: string) {
  return useQuery({
    queryKey: adminMissionResponseQueryKeys.responses(missionId),
    queryFn: () => getMissionResponses(missionId),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export type UseReadMissionResponsesReturn = ReturnType<typeof useReadMissionResponses>;
