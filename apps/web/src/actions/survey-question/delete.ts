"use server";

import { requireAuth } from "@/actions/common/auth";
import { surveyQuestionService } from "@/server/services/survey-question/surveyQuestionService";

/**
 * Question 삭제 Server Action
 * @param questionId - Question ID
 * @returns 삭제 성공 메시지
 */
export async function deleteQuestion(questionId: string) {
  try {
    const user = await requireAuth();

    await surveyQuestionService.deleteQuestion(questionId, user.id);

    return { message: "질문이 삭제되었습니다." };
  } catch (error) {
    console.error("❌ 질문 삭제 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("질문 삭제 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
