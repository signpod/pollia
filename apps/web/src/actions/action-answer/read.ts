"use server";

import { requireAuth } from "@/actions/common/auth";
import { actionAnswerService } from "@/server/services/action-answer";
import type {
  GetAnswersByResponseResponse,
  GetAnswersByUserResponse,
  GetQuestionAnswerResponse,
} from "@/types/dto";

export async function getAnswer(answerId: string): Promise<GetQuestionAnswerResponse> {
  try {
    const user = await requireAuth();
    const answer = await actionAnswerService.getAnswerById(answerId, user.id);
    const data = { ...answer, actionId: answer.action.id };
    return { data };
  } catch (error) {
    console.error("getAnswer error:", error);
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
    const answers = await actionAnswerService.getAnswersByUserId(user.id);
    const data = answers.map(answer => ({ ...answer, actionId: answer.action.id }));
    return { data };
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
    const answers = await actionAnswerService.getAnswersByResponseId(responseId, user.id);
    const data = answers.map(answer => ({ ...answer, actionId: answer.action.id }));
    return { data };
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
