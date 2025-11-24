"use server";

import { requireAuth } from "@/actions/common/auth";
import { surveyAnswerService } from "@/server/services/survey-answer/surveyAnswerService";

export async function getAnswerById(answerId: string) {
  try {
    const answer = await surveyAnswerService.getAnswerById(answerId);
    return { data: answer };
  } catch (error) {
    console.error("❌ 답변 조회 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("답변을 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function getAnswersByQuestion(questionId: string) {
  try {
    const user = await requireAuth();

    const answers = await surveyAnswerService.getAnswersByQuestionAndUser(questionId, user.id);
    return { data: answers };
  } catch (error) {
    console.error("❌ 질문 답변 목록 조회 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("답변 목록을 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function getAnswersBySurvey(surveyId: string) {
  try {
    const user = await requireAuth();

    const answers = await surveyAnswerService.getAnswersBySurveyAndUser(surveyId, user.id);
    return { data: answers };
  } catch (error) {
    console.error("❌ 설문 답변 목록 조회 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("답변 목록을 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function getUserAnswers() {
  try {
    const user = await requireAuth();

    const answers = await surveyAnswerService.getUserAnswers(user.id);
    return { data: answers };
  } catch (error) {
    console.error("❌ 사용자 답변 목록 조회 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("답변 목록을 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
