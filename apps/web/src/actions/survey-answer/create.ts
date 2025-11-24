"use server";

import { requireAuth } from "@/actions/common/auth";
import { surveyAnswerService } from "@/server/services/survey-answer/surveyAnswerService";
import type {
  CreateAnswerRequest,
  SubmitAnswersRequest,
} from "@/server/services/survey-answer/types";

export async function createAnswer(request: CreateAnswerRequest) {
  try {
    const user = await requireAuth();

    const answer = await surveyAnswerService.createAnswer(request, user.id);

    return { data: answer };
  } catch (error) {
    console.error("❌ 답변 생성 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("답변 생성 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function submitAnswers(request: SubmitAnswersRequest) {
  try {
    const user = await requireAuth();

    const result = await surveyAnswerService.submitAnswers(request, user.id);

    return { data: result };
  } catch (error) {
    console.error("❌ 답변 제출 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("답변 제출 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
