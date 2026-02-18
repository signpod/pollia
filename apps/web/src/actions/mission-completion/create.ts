"use server";

import { requireActiveUser } from "@/actions/common/auth";
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
  };
}

export async function createMissionCompletion(
  request: CreateMissionCompletionRequest,
): Promise<CreateMissionCompletionResponse> {
  try {
    const user = await requireActiveUser();
    const input = toCreateMissionCompletionInput(request);
    const missionCompletion = await missionCompletionService.createMissionCompletion(
      input,
      user.id,
    );

    return { data: toMissionCompletionData(missionCompletion) };
  } catch (error) {
    console.error("createMissionCompletion error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("미션 완료 데이터 생성 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
