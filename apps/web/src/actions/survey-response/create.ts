"use server";

import { requireAuth } from "@/actions/common/auth";
import { surveyResponseService } from "@/server/services/mission-response";
import type { StartResponseInput } from "@/server/services/mission-response/types";
import type {
  CompleteSurveyResponseRequest,
  CompleteSurveyResponseResponse,
  StartSurveyResponseRequest,
  StartSurveyResponseResponse,
} from "@/types/dto";

function toStartResponseInput(dto: StartSurveyResponseRequest): StartResponseInput {
  return {
    surveyId: dto.surveyId,
  };
}

export async function startSurveyResponse(
  request: StartSurveyResponseRequest,
): Promise<StartSurveyResponseResponse> {
  try {
    const user = await requireAuth();
    const input = toStartResponseInput(request);
    const response = await surveyResponseService.startResponse(input, user.id);
    return { data: response };
  } catch (error) {
    console.error("startSurveyResponse error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("응답 시작 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function completeSurveyResponse(
  request: CompleteSurveyResponseRequest,
): Promise<CompleteSurveyResponseResponse> {
  try {
    const user = await requireAuth();
    const response = await surveyResponseService.completeResponse(
      { responseId: request.responseId },
      user.id,
    );
    return { data: response };
  } catch (error) {
    console.error("completeSurveyResponse error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("응답 완료 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
