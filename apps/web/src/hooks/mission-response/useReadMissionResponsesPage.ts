"use client";

import { getMissionResponsesPage } from "@/actions/mission-response";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

interface UseReadMissionResponsesPageOptions {
  page: number;
  pageSize: number;
}

export function useReadMissionResponsesPage(
  missionId: string,
  options: UseReadMissionResponsesPageOptions,
) {
  return useQuery({
    queryKey: missionQueryKeys.missionResponsesPage(missionId, options.page, options.pageSize),
    queryFn: () =>
      getMissionResponsesPage(missionId, {
        page: options.page,
        pageSize: options.pageSize,
      }),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!missionId,
  });
}

export type UseReadMissionResponsesPageReturn = ReturnType<typeof useReadMissionResponsesPage>;
