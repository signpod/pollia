"use server";

import { requireAuth } from "@/actions/common/auth";
import { surveyResponseService } from "@/server/services/survey-response/surveyResponseService";
import type { DeleteSurveyResponseResponse } from "@/types/dto";

export async function deleteSurveyResponse(
  responseId: string,
): Promise<DeleteSurveyResponseResponse> {
  try {
    const user = await requireAuth();
    await surveyResponseService.deleteResponse(responseId, user.id);
    return { message: "응답이 삭제되었습니다." };
  } catch (error) {
    console.error("deleteSurveyResponse error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("응답 삭제 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
