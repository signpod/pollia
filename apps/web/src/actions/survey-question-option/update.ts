"use server";

import { requireAuth } from "@/actions/common/auth";
import { surveyQuestionOptionService } from "@/server/services/survey-question-option/surveyQuestionOptionService";
import type { SurveyQuestionOption } from "@prisma/client";

/**
 * Option 수정 Server Action
 * @param optionId - Option ID
 * @param data - 수정할 데이터
 * @returns 수정된 Option 정보
 */
export async function updateOption(
  optionId: string,
  data: {
    title?: string;
    description?: string;
    imageUrl?: string;
    order?: number;
  },
): Promise<{ data: SurveyQuestionOption }> {
  try {
    const user = await requireAuth();

    const updatedOption = await surveyQuestionOptionService.updateOption(optionId, data, user.id);

    return { data: updatedOption };
  } catch (error) {
    console.error("❌ 옵션 수정 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("옵션 수정 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

