"use client";

import { getSubmissionList } from "@/actions/submission-list";
import { submissionQueryKeys } from "@/app/admin/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";

export function useReadSubmissionList(missionId: string) {
  return useQuery({
    queryKey: submissionQueryKeys.list(missionId),
    queryFn: () => getSubmissionList(missionId),
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export type UseReadSubmissionListReturn = ReturnType<typeof useReadSubmissionList>;
