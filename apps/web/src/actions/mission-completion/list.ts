"use server";

import { requireAuth } from "@/actions/common/auth";
import { missionCompletionService } from "@/server/services/mission-completion/missionCompletionService";
import type { GetMissionCompletionsResponse } from "@/types/dto";
import { toMissionCompletionWithMission } from "./utils";

export async function getCompletionsByMissionId(
  missionId: string,
): Promise<GetMissionCompletionsResponse> {
  try {
    const user = await requireAuth();
    const completions = await missionCompletionService.getCompletionsByMissionId(
      missionId,
      user.id,
    );
    return { data: completions.map(toMissionCompletionWithMission) };
  } catch (error) {
    console.error("getCompletionsByMissionId error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("완료 화면 목록을 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
