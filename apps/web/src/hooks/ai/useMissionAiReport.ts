"use client";

import { getMissionAiReport } from "@/actions/ai";
import { useQuery } from "@tanstack/react-query";

const aiReportQueryKeys = {
  report: (missionId: string) => ["mission-ai-report", missionId] as const,
};

export function useMissionAiReport(missionId: string) {
  return useQuery({
    queryKey: aiReportQueryKeys.report(missionId),
    queryFn: () => getMissionAiReport(missionId),
  });
}

export type UseMissionAiReportReturn = ReturnType<typeof useMissionAiReport>;
