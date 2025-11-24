"use server";

import { requireAuth } from "@/actions/common/auth";
import { surveyAnswerService } from "@/server/services/survey-answer/surveyAnswerService";

export async function deleteAnswer(answerId: string) {
  try {
    const user = await requireAuth();

    await surveyAnswerService.deleteAnswer(answerId, user.id);

    return { message: "답변이 삭제되었습니다." };
  } catch (error) {
    console.error("❌ 답변 삭제 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("답변 삭제 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function deleteAnswersBySurvey(surveyId: string) {
  try {
    const user = await requireAuth();

    await surveyAnswerService.deleteAnswersBySurvey(surveyId, user.id);

    return { message: "설문 답변이 모두 삭제되었습니다." };
  } catch (error) {
    console.error("❌ 설문 답변 삭제 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("답변 삭제 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
