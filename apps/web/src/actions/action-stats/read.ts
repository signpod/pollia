"use server";

import { requireContentManager } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import { getActionStats as getActionStatsService } from "@/server/services/action-stats";
import type { GetActionStatsResponse } from "@/types/dto";

export async function getActionStats(missionId: string): Promise<GetActionStatsResponse> {
  try {
    await requireContentManager();
    const data = await getActionStatsService(missionId);
    return { data };
  } catch (error) {
    return handleActionError(error, "액션별 통계 조회 중 오류가 발생했습니다.");
  }
}
