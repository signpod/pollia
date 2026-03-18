"use server";

import { requireContentManager } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { missionCompletionService } from "@/server/services/mission-completion/missionCompletionService";
import type { CreateMissionCompletionInput } from "@/server/services/mission-completion/types";
import type { CreateMissionCompletionRequest, CreateMissionCompletionResponse } from "@/types/dto";
import { toMissionCompletionData } from "./utils";

function toCreateMissionCompletionInput(
  dto: CreateMissionCompletionRequest,
): CreateMissionCompletionInput {
  return {
    title: dto.title,
    description: dto.description,
    imageUrl: dto.imageUrl,
    imageFileUploadId: dto.imageFileUploadId,
    links: dto.links,
    missionId: dto.missionId,
    minScoreRatio: dto.minScoreRatio,
    maxScoreRatio: dto.maxScoreRatio,
  };
}

export async function createMissionCompletion(
  request: CreateMissionCompletionRequest,
): Promise<CreateMissionCompletionResponse> {
  try {
    const { user, isAdmin } = await requireContentManager();
    const input = toCreateMissionCompletionInput(request);
    const missionCompletion = await missionCompletionService.createMissionCompletion(
      input,
      user.id,
      isAdmin,
    );

    return { data: toMissionCompletionData(missionCompletion) };
  } catch (error) {
    return handleActionError(
      error,
      `${UBIQUITOUS_CONSTANTS.MISSION} 완료 데이터 생성 중 오류가 발생했습니다.`,
    );
  }
}
