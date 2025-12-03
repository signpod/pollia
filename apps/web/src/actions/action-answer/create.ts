"use server";

import { requireAuth } from "@/actions/common/auth";
import { actionAnswerService } from "@/server/services/action-answer";
import type { CreateAnswerInput, SubmitAnswersInput } from "@/server/services/action-answer/types";
import type {
  CreateQuestionAnswerRequest,
  CreateQuestionAnswerResponse,
  SubmitQuestionAnswersRequest,
  SubmitQuestionAnswersResponse,
} from "@/types/dto";

function toCreateAnswerInput(dto: CreateQuestionAnswerRequest): CreateAnswerInput {
  return {
    questionId: dto.questionId,
    responseId: dto.responseId,
    optionId: dto.optionId,
    textAnswer: dto.textAnswer,
    scaleAnswer: dto.scaleAnswer,
  };
}

function toSubmitAnswersInput(dto: SubmitQuestionAnswersRequest): SubmitAnswersInput {
  return {
    responseId: dto.responseId,
    answers: dto.answers.map(a => ({
      questionId: a.questionId,
      type: a.type,
      selectedOptionIds: a.selectedOptionIds,
      scaleValue: a.scaleValue,
      textResponse: a.textResponse,
    })),
  };
}

export async function createAnswer(
  request: CreateQuestionAnswerRequest,
): Promise<CreateQuestionAnswerResponse> {
  try {
    const user = await requireAuth();
    const input = toCreateAnswerInput(request);
    const answer = await actionAnswerService.createAnswer(input, user.id);

    const data = { ...answer, questionId: answer.action.id };
    return { data };
  } catch (error) {
    console.error("createAnswer error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("답변 생성 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function submitAnswers(
  request: SubmitQuestionAnswersRequest,
): Promise<SubmitQuestionAnswersResponse> {
  try {
    const user = await requireAuth();
    const input = toSubmitAnswersInput(request);
    const result = await actionAnswerService.submitAnswers(input, user.id);
    return { data: result };
  } catch (error) {
    console.error("submitAnswers error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("답변 제출 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
