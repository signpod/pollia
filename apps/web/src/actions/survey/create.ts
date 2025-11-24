"use server";

import { requireAuth } from "@/actions/common/auth";
import { surveyService } from "@/server/services/survey/surveyService";
import type { CreateSurveyRequest, CreateSurveyResponse } from "@/types/dto";

/**
 * Survey 생성 Server Action
 * @param request - Survey 생성 요청 데이터
 * @returns 생성된 Survey 정보
 */
export async function createSurvey(request: CreateSurveyRequest): Promise<CreateSurveyResponse> {
  try {
    const user = await requireAuth();

    const survey = await surveyService.createSurvey(request, user.id);

    return { data: survey };
  } catch (error) {
    console.error("❌ 설문지 생성 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("설문지 생성 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
