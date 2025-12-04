"use server";

import { requireAuth } from "@/actions/common/auth";
import { missionResponseService } from "@/server/services/mission-response";
import type { StartResponseInput } from "@/server/services/mission-response/types";
import type {
  CompleteSurveyResponseRequest,
  CompleteSurveyResponseResponse,
  StartSurveyResponseRequest,
  StartSurveyResponseResponse,
} from "@/types/dto";

function toStartResponseInput(dto: StartSurveyResponseRequest): StartResponseInput {
  return {
    missionId: dto.surveyId,
  };
}

export async function startMissionResponse(
  request: StartSurveyResponseRequest,
): Promise<StartSurveyResponseResponse> {
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
  request: CompleteSurveyResponseRequest,
): Promise<CompleteSurveyResponseResponse> {
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
