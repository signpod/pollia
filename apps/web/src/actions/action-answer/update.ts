"use server";

import { requireActiveUser } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
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
    const user = await requireActiveUser();
    const input = toUpdateAnswerInput(request);
    const answer = await actionAnswerService.updateAnswer(answerId, input, user.id);
    const data = { ...answer, actionId: answer.action.id };
    return { data };
  } catch (error) {
    return handleActionError(error, "답변 수정 중 오류가 발생했습니다.");
  }
}

export async function updateAnswerWithPruning(
  answerId: string,
  request: UpdateActionAnswerRequest,
): Promise<GetQuestionAnswerResponse> {
  try {
    const user = await requireActiveUser();
    const input = toUpdateAnswerInput(request);
    const answer = await actionAnswerService.updateAnswerWithPruning(answerId, input, user.id);
    const data = { ...answer, actionId: answer.action.id };
    return { data };
  } catch (error) {
    return handleActionError(error, "답변 수정 중 오류가 발생했습니다.");
  }
}
