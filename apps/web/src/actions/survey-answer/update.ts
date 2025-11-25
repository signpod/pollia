"use server";

import { requireAuth } from "@/actions/common/auth";
import { surveyAnswerService } from "@/server/services/survey-answer/surveyAnswerService";

export async function updateAnswer(
  answerId: string,
  data: {
    optionId?: string;
    textAnswer?: string;
    scaleAnswer?: number;
  },
) {
  try {
    const user = await requireAuth();

    const updatedAnswer = await surveyAnswerService.updateAnswer(answerId, data, user.id);

    return { data: updatedAnswer };
  } catch (error) {
    console.error("❌ 답변 수정 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("답변 수정 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
