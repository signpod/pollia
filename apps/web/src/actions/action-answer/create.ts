"use server";

import { resolveMissionActor } from "@/actions/common/auth";
import { actionAnswerService } from "@/server/services/action-answer";
import type { SubmitAnswersInput } from "@/server/services/action-answer/types";
import type { SubmitActionAnswersRequest, SubmitActionAnswersResponse } from "@/types/dto";

function toSubmitAnswersInput(dto: SubmitActionAnswersRequest): SubmitAnswersInput {
  return {
    responseId: dto.responseId,
    answers: dto.answers.map(a => ({
      actionId: a.actionId,
      type: a.type,
      isRequired: a.isRequired,
      selectedOptionIds: a.selectedOptionIds,
      scaleValue: a.scaleValue,
      textAnswer: a.textAnswer,
      fileUploadIds: a.fileUploadIds,
      dateAnswers: a.dateAnswers?.map(dateStr => new Date(dateStr)),
    })),
  };
}

export async function submitAnswers(
  request: SubmitActionAnswersRequest,
): Promise<SubmitActionAnswersResponse> {
  try {
    const actor = await resolveMissionActor();
    const input = toSubmitAnswersInput(request);
    const result = await actionAnswerService.submitAnswers(input, actor);
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
