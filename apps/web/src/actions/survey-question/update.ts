"use server";

import { requireAuth } from "@/actions/common/auth";
import { surveyQuestionService } from "@/server/services/survey-question/surveyQuestionService";

/**
 * Question 수정 Server Action
 * @param questionId - Question ID
 * @param data - 수정할 데이터
 * @returns 수정된 Question 정보
 */
export async function updateQuestion(
  questionId: string,
  data: {
    title?: string;
    description?: string;
    imageUrl?: string;
    order?: number;
    maxSelections?: number;
  },
) {
  try {
    const user = await requireAuth();

    const updatedQuestion = await surveyQuestionService.updateQuestion(questionId, data, user.id);

    return { data: updatedQuestion };
  } catch (error) {
    console.error("❌ 질문 수정 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("질문 수정 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
