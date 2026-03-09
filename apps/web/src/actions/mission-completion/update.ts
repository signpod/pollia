"use server";

import { requireActiveUser } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { missionCompletionService } from "@/server/services/mission-completion/missionCompletionService";
import type { UpdateMissionCompletionInput } from "@/server/services/mission-completion/types";
import type { UpdateMissionCompletionRequest, UpdateMissionCompletionResponse } from "@/types/dto";
import { toMissionCompletionData } from "./utils";

function toUpdateMissionCompletionInput(
  dto: UpdateMissionCompletionRequest,
): UpdateMissionCompletionInput {
  return {
    title: dto.title,
    description: dto.description,
    imageUrl: dto.imageUrl,
    imageFileUploadId: dto.imageFileUploadId,
    links: dto.links,
  };
}

export async function updateMissionCompletion(
  id: string,
  request: UpdateMissionCompletionRequest,
): Promise<UpdateMissionCompletionResponse> {
  try {
    const user = await requireActiveUser();
    const input = toUpdateMissionCompletionInput(request);
    const missionCompletion = await missionCompletionService.updateMissionCompletion(
      id,
      input,
      user.id,
    );
    return { data: toMissionCompletionData(missionCompletion) };
  } catch (error) {
    return handleActionError(
      error,
      `${UBIQUITOUS_CONSTANTS.MISSION} 완료 데이터 수정 중 오류가 발생했습니다.`,
    );
  }
}
