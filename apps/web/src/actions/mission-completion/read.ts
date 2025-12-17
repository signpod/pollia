"use server";

import { missionCompletionService } from "@/server/services/mission-completion/missionCompletionService";
import type { GetMissionCompletionResponse } from "@/types/dto";

export async function getMissionCompletion(
  missionId: string,
): Promise<GetMissionCompletionResponse> {
  try {
    const missionCompletion = await missionCompletionService.getMissionCompletion(missionId);
    return { data: missionCompletion };
  } catch (error) {
    console.error("getMissionCompletion error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("미션 완료 데이터를 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
