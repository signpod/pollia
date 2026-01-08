"use server";

import { requireAuth } from "@/actions/common/auth";
import { actionAnswerService } from "@/server/services/action-answer";
import type { UpdateAnswerInput } from "@/server/services/action-answer/types";
import type { GetQuestionAnswerResponse, UpdateActionAnswerRequest } from "@/types/dto";

function toUpdateAnswerInput(dto: UpdateActionAnswerRequest): UpdateAnswerInput {
  return {
    selectedOptionIds: dto.selectedOptionIds,
    textAnswer: dto.textAnswer,
    scaleAnswer: dto.scaleAnswer,
  };
}

export async function updateAnswer(
  answerId: string,
  request: UpdateActionAnswerRequest,
): Promise<GetQuestionAnswerResponse> {
  try {
    const user = await requireAuth();
    const input = toUpdateAnswerInput(request);
    const answer = await actionAnswerService.updateAnswer(answerId, input, user.id);
    const data = { ...answer, actionId: answer.action.id };
    return { data };
  } catch (error) {
    console.error("updateAnswer error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("답변 수정 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
