"use server";

import { requireContentManager } from "@/actions/common/auth";
import { missionService } from "@/server/services/mission";
import type { AiReportData, GetMissionAiReportResponse } from "@/types/dto";

export async function getMissionAiReport(missionId: string): Promise<GetMissionAiReportResponse> {
  try {
    await requireContentManager();
    const mission = await missionService.getMission(missionId);

    if (!mission.aiStatisticsReport) {
      return { data: { reportData: null } };
    }

    try {
      const parsed = JSON.parse(mission.aiStatisticsReport) as AiReportData;
      if (parsed.version !== 2) {
        return { data: { reportData: null } };
      }
      return { data: { reportData: parsed } };
    } catch {
      return { data: { reportData: null } };
    }
  } catch (error) {
    console.error("getMissionAiReport error:", error);
    return { data: { reportData: null } };
  }
}
