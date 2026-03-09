"use server";

import { handleActionError } from "@/actions/common/error";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { missionCompletionService } from "@/server/services/mission-completion/missionCompletionService";
import type { GetMissionCompletionResponse } from "@/types/dto";
import { toMissionCompletionData } from "./utils";

export async function getMissionCompletion(
  missionId: string,
): Promise<GetMissionCompletionResponse> {
  try {
    const missionCompletion = await missionCompletionService.getMissionCompletion(missionId);
    return { data: toMissionCompletionData(missionCompletion) };
  } catch (error) {
    return handleActionError(
      error,
      `${UBIQUITOUS_CONSTANTS.MISSION} 완료 데이터를 불러올 수 없습니다.`,
    );
  }
}
