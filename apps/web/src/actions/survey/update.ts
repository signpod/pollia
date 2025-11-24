"use server";

import { requireAuth } from "@/actions/common/auth";
import { surveyService } from "@/server/services/survey/surveyService";

/**
 * Survey 수정 Server Action
 * @param surveyId - Survey ID
 * @param data - 수정할 데이터
 * @returns 수정된 Survey 정보
 */
export async function updateSurvey(
  surveyId: string,
  data: {
    title?: string;
    description?: string;
    target?: string;
    imageUrl?: string;
    deadline?: Date;
    estimatedMinutes?: number;
  },
) {
  try {
    const user = await requireAuth();

    const updatedSurvey = await surveyService.updateSurvey(surveyId, data, user.id);

    return { data: updatedSurvey };
  } catch (error) {
    console.error("❌ 설문조사 수정 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("설문조사 수정 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
