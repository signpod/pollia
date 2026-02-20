"use server";

import { requireActiveUser } from "@/actions/common/auth";
import UBQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { missionService } from "@/server/services/mission";
import type { DuplicateMissionRequest, DuplicateMissionResponse } from "@/types/dto";

export async function duplicateMission(
  request: DuplicateMissionRequest,
): Promise<DuplicateMissionResponse> {
  try {
    const user = await requireActiveUser();
    const duplicated = await missionService.duplicateMission(request.missionId, user.id);

    return {
      data: {
        id: duplicated.id,
        title: duplicated.title,
      },
    };
  } catch (error) {
    console.error("duplicateMission error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error(`${UBQUITOUS_CONSTANTS.MISSION} 복제 중 오류가 발생했습니다.`);
    serverError.cause = 500;
    throw serverError;
  }
}
