"use server";

import { requireActiveUser } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import { missionAiReportService } from "@/server/services/mission-ai-report";
import type { GenerateMissionAiReportResponse } from "@/types/dto";

export async function generateMissionAiReport(
  missionId: string,
): Promise<GenerateMissionAiReportResponse> {
  try {
    const user = await requireActiveUser();
    const data = await missionAiReportService.generate(missionId, user.id);
    return { data };
  } catch (error) {
    return handleActionError(error, "AI 리포트 생성 중 오류가 발생했습니다.");
  }
}
