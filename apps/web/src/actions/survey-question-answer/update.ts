"use server";

import { requireAuth } from "@/actions/common/auth";
import { surveyQuestionAnswerService } from "@/server/services/action-answer";
import type { UpdateAnswerInput } from "@/server/services/action-answer/types";
import type { GetQuestionAnswerResponse, UpdateQuestionAnswerRequest } from "@/types/dto";

function toUpdateAnswerInput(dto: UpdateQuestionAnswerRequest): UpdateAnswerInput {
  return {
    optionId: dto.optionId,
    textAnswer: dto.textAnswer,
    scaleAnswer: dto.scaleAnswer,
  };
}

export async function updateQuestionAnswer(
  answerId: string,
  request: UpdateQuestionAnswerRequest,
): Promise<GetQuestionAnswerResponse> {
  try {
    const user = await requireAuth();
    const input = toUpdateAnswerInput(request);
    const answer = await surveyQuestionAnswerService.updateAnswer(answerId, input, user.id);
    return { data: answer };
  } catch (error) {
    console.error("updateQuestionAnswer error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("답변 수정 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
