"use server";

import { requireActiveUser } from "@/actions/common/auth";
import { missionService } from "@/server/services/mission";
import type { GetMissionAiReportResponse } from "@/types/dto";

export async function getMissionAiReport(missionId: string): Promise<GetMissionAiReportResponse> {
  try {
    const user = await requireActiveUser();
    const mission = await missionService.getMission(missionId);

    if (mission.creatorId !== user.id) {
      return { data: { report: null } };
    }

    return { data: { report: mission.aiStatisticsReport } };
  } catch (error) {
    console.error("getMissionAiReport error:", error);
    return { data: { report: null } };
  }
}
