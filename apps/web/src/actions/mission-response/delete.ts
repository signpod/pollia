"use server";

import { requireAuth } from "@/actions/common/auth";
import { missionResponseService } from "@/server/services/mission-response";
import type { DeleteMissionResponseResponse } from "@/types/dto";

export async function deleteMissionResponse(
  responseId: string,
): Promise<DeleteMissionResponseResponse> {
  try {
    const user = await requireAuth();
    await missionResponseService.deleteResponse(responseId, user.id);
    return { message: "응답이 삭제되었습니다." };
  } catch (error) {
    console.error("deleteMissionResponse error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("응답 삭제 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
