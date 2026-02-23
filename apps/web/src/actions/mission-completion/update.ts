"use server";

import { requireActiveUser } from "@/actions/common/auth";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { missionCompletionService } from "@/server/services/mission-completion/missionCompletionService";
import type { UpdateMissionCompletionInput } from "@/server/services/mission-completion/types";
import type { UpdateMissionCompletionRequest, UpdateMissionCompletionResponse } from "@/types/dto";
import { toMissionCompletionData } from "./utils";

function toUpdateMissionCompletionInput(
  dto: UpdateMissionCompletionRequest,
): UpdateMissionCompletionInput {
  const input: UpdateMissionCompletionInput = {};

  if (dto.title !== undefined) {
    input.title = dto.title;
  }
  if (dto.description !== undefined) {
    input.description = dto.description;
  }
  if (dto.imageUrl !== undefined) {
    input.imageUrl = dto.imageUrl;
  }
  if (dto.imageFileUploadId !== undefined) {
    input.imageFileUploadId = dto.imageFileUploadId;
  }
  if (dto.links !== undefined) {
    input.links = dto.links;
  }

  return input;
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
    console.error("updateMissionCompletion error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error(
      `${UBIQUITOUS_CONSTANTS.MISSION} 완료 데이터 수정 중 오류가 발생했습니다.`,
    );
    serverError.cause = 500;
    throw serverError;
  }
}
