"use server";

import { requireActiveUser } from "@/actions/common/auth";
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
    console.error("updateMissionCompletion error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("미션 완료 데이터 수정 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
