"use server";

import { requireAuth } from "@/actions/common/auth";
import { missionResponseService } from "@/server/services/mission-response";
import type { StartResponseInput } from "@/server/services/mission-response/types";
import type {
  CompleteMissionResponseRequest,
  CompleteMissionResponseResponse,
  StartMissionResponseRequest,
  StartMissionResponseResponse,
} from "@/types/dto";

function toStartResponseInput(dto: StartMissionResponseRequest): StartResponseInput {
  return {
    missionId: dto.surveyId,
  };
}

export async function startMissionResponse(
  request: StartMissionResponseRequest,
): Promise<StartMissionResponseResponse> {
  try {
    const user = await requireAuth();
    const input = toStartResponseInput(request);
    const response = await missionResponseService.startResponse(input, user.id);
    const data = { ...response, surveyId: response.missionId };
    return { data };
  } catch (error) {
    console.error("startMissionResponse error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("응답 시작 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function completeMissionResponse(
  request: CompleteMissionResponseRequest,
): Promise<CompleteMissionResponseResponse> {
  try {
    const user = await requireAuth();
    const response = await missionResponseService.completeResponse(
      { responseId: request.responseId },
      user.id,
    );
    const data = { ...response, surveyId: response.missionId };
    return { data };
  } catch (error) {
    console.error("completeMissionResponse error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("응답 완료 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
