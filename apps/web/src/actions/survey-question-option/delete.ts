"use server";

import { requireAuth } from "@/actions/common/auth";
import { surveyQuestionOptionService } from "@/server/services/survey-question-option/surveyQuestionOptionService";

/**
 * Option 삭제 Server Action
 * @param optionId - Option ID
 * @returns 삭제 성공 메시지
 */
export async function deleteOption(optionId: string): Promise<{ message: string }> {
  try {
    const user = await requireAuth();

    await surveyQuestionOptionService.deleteOption(optionId, user.id);

    return { message: "옵션이 삭제되었습니다." };
  } catch (error) {
    console.error("❌ 옵션 삭제 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("옵션 삭제 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

/**
 * Question의 모든 Option 삭제 Server Action
 * @param questionId - Question ID
 * @returns 삭제 성공 메시지
 */
export async function deleteOptionsByQuestionId(questionId: string): Promise<{ message: string }> {
  try {
    const user = await requireAuth();

    await surveyQuestionOptionService.deleteOptionsByQuestionId(questionId, user.id);

    return { message: "모든 옵션이 삭제되었습니다." };
  } catch (error) {
    console.error("❌ 옵션 목록 삭제 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("옵션 목록 삭제 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

