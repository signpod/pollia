"use server";

import { requireActiveUser } from "@/actions/common/auth";
import UBQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { missionCompletionService } from "@/server/services/mission-completion/missionCompletionService";
import type { DeleteMissionCompletionResponse } from "@/types/dto";

export async function deleteMissionCompletion(
  id: string,
): Promise<DeleteMissionCompletionResponse> {
  try {
    const user = await requireActiveUser();
    await missionCompletionService.deleteMissionCompletion(id, user.id);
    return { message: `${UBQUITOUS_CONSTANTS.MISSION} 완료 데이터가 삭제되었습니다.` };
  } catch (error) {
    console.error("deleteMissionCompletion error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error(
      `${UBQUITOUS_CONSTANTS.MISSION} 완료 데이터 삭제 중 오류가 발생했습니다.`,
    );
    serverError.cause = 500;
    throw serverError;
  }
}
