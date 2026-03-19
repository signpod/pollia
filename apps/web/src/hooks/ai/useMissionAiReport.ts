"use client";

import { getMissionAiReport } from "@/actions/ai";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { useQuery } from "@tanstack/react-query";

export function useMissionAiReport(missionId: string) {
  return useQuery({
    queryKey: missionQueryKeys.aiReport(missionId),
    queryFn: () => getMissionAiReport(missionId),
  });
}

export type UseMissionAiReportReturn = ReturnType<typeof useMissionAiReport>;
