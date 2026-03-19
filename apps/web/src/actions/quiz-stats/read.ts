"use server";

import { requireContentManager } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import { getQuizStats as getQuizStatsService } from "@/server/services/quiz-stats";
import type { GetQuizStatsResponse } from "@/types/dto";

export async function getQuizStats(missionId: string): Promise<GetQuizStatsResponse> {
  try {
    await requireContentManager();
    const data = await getQuizStatsService(missionId);
    return { data };
  } catch (error) {
    return handleActionError(error, "퀴즈 통계 조회 중 오류가 발생했습니다.");
  }
}
