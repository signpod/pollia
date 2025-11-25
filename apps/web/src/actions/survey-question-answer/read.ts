"use server";

import { requireAuth } from "@/actions/common/auth";
import { surveyQuestionAnswerService } from "@/server/services/survey-question-answer/surveyQuestionAnswerService";
import type {
  GetAnswersByResponseResponse,
  GetAnswersByUserResponse,
  GetQuestionAnswerResponse,
} from "@/types/dto";

export async function getQuestionAnswer(answerId: string): Promise<GetQuestionAnswerResponse> {
  try {
    const user = await requireAuth();
    const answer = await surveyQuestionAnswerService.getAnswerById(answerId, user.id);
    return { data: answer };
  } catch (error) {
    console.error("getQuestionAnswer error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("답변 조회 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function getMyAnswers(): Promise<GetAnswersByUserResponse> {
  try {
    const user = await requireAuth();
    const answers = await surveyQuestionAnswerService.getAnswersByUserId(user.id);
    return { data: answers };
  } catch (error) {
    console.error("getMyAnswers error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("내 답변 목록 조회 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function getAnswersByResponse(
  responseId: string,
): Promise<GetAnswersByResponseResponse> {
  try {
    const user = await requireAuth();
    const answers = await surveyQuestionAnswerService.getAnswersByResponseId(responseId, user.id);
    return { data: answers };
  } catch (error) {
    console.error("getAnswersByResponse error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("답변 목록 조회 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
