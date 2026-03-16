"use server";

import { requireContentManager } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import { missionResponseService } from "@/server/services/mission-response";
import type { DeleteMissionResponseResponse } from "@/types/dto";

export async function deleteMissionResponse(
  responseId: string,
): Promise<DeleteMissionResponseResponse> {
  try {
    const { user, isAdmin } = await requireContentManager();
    await missionResponseService.deleteResponse(responseId, user.id, isAdmin);
    return { message: "응답이 삭제되었습니다." };
  } catch (error) {
    return handleActionError(error, "응답 삭제 중 오류가 발생했습니다.");
  }
}
