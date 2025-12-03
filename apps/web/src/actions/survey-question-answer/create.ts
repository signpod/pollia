"use server";

import { requireAuth } from "@/actions/common/auth";
import { surveyQuestionAnswerService } from "@/server/services/action-answer";
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

export async function createQuestionAnswer(
  request: CreateQuestionAnswerRequest,
): Promise<CreateQuestionAnswerResponse> {
  try {
    const user = await requireAuth();
    const input = toCreateAnswerInput(request);
    const answer = await surveyQuestionAnswerService.createAnswer(input, user.id);
    return { data: answer };
  } catch (error) {
    console.error("createQuestionAnswer error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("답변 생성 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function submitQuestionAnswers(
  request: SubmitQuestionAnswersRequest,
): Promise<SubmitQuestionAnswersResponse> {
  try {
    const user = await requireAuth();
    const input = toSubmitAnswersInput(request);
    const result = await surveyQuestionAnswerService.submitAnswers(input, user.id);
    return { data: result };
  } catch (error) {
    console.error("submitQuestionAnswers error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("답변 제출 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
