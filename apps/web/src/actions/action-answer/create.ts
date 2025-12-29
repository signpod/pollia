"use server";

import { requireAuth } from "@/actions/common/auth";
import { actionAnswerService } from "@/server/services/action-answer";
import type { CreateAnswerInput, SubmitAnswersInput } from "@/server/services/action-answer/types";
import type {
  CreateActionAnswerRequest,
  CreateActionAnswerResponse,
  SubmitActionAnswersRequest,
  SubmitActionAnswersResponse,
} from "@/types/dto";

function toCreateAnswerInput(dto: CreateActionAnswerRequest): CreateAnswerInput {
  return {
    actionId: dto.actionId,
    responseId: dto.responseId,
    optionId: dto.optionId,
    textAnswer: dto.textAnswer,
    scaleAnswer: dto.scaleAnswer,
  };
}

function toSubmitAnswersInput(dto: SubmitActionAnswersRequest): SubmitAnswersInput {
  return {
    responseId: dto.responseId,
    answers: dto.answers.map(a => ({
      actionId: a.actionId,
      type: a.type,
      selectedOptionIds: a.selectedOptionIds,
      scaleValue: a.scaleValue,
      textResponse: a.textResponse,
      fileUploadIds: a.fileUploadIds,
    })),
  };
}

export async function createAnswer(
  request: CreateActionAnswerRequest,
): Promise<CreateActionAnswerResponse> {
  try {
    const user = await requireAuth();
    const input = toCreateAnswerInput(request);
    const answer = await actionAnswerService.createAnswer(input, user.id);

    const data = { ...answer, actionId: answer.action.id };
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
  request: SubmitActionAnswersRequest,
): Promise<SubmitActionAnswersResponse> {
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
