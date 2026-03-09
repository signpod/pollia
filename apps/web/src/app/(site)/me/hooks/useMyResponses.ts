"use client";

import { getMyResponses } from "@/actions/mission-response";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { useQuery } from "@tanstack/react-query";

export function useMyResponses() {
  return useQuery({
    queryKey: missionQueryKeys.myResponses(),
    queryFn: () => getMyResponses(),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export type UseMyResponsesReturn = ReturnType<typeof useMyResponses>;
