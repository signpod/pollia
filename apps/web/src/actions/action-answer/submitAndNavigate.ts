"use server";

import { resolveMissionActor } from "@/actions/common/auth";
import { getRequestMeta } from "@/actions/common/requestMeta";
import { isAnswerSameAsSubmitted } from "@/lib/answer/compareAnswers";
import { actionAnswerService } from "@/server/services/action-answer";
import { missionResponseService } from "@/server/services/mission-response";
import type { ActionAnswerItem } from "@/types/dto";
import { ActionType } from "@prisma/client";

interface SubmitAnswerParams {
  missionId: string;
  responseId: string;
  answer: ActionAnswerItem;
  isLastAction: boolean;
}

export type SubmitAnswerResult =
  | { success: true }
  | {
      success: false;
      error: string;
      code: "ALREADY_COMPLETED" | "VALIDATION_ERROR" | "SERVER_ERROR";
    };

export async function submitAnswerOnly(params: SubmitAnswerParams): Promise<SubmitAnswerResult> {
  const { missionId, responseId, answer, isLastAction } = params;

  if (!responseId) {
    return { success: false, error: "유효하지 않은 응답입니다.", code: "VALIDATION_ERROR" };
  }

  try {
    const actor = await resolveMissionActor();

    const response = await missionResponseService.getResponseById(responseId, actor);

    if (response.missionId !== missionId) {
      return { success: false, error: "유효하지 않은 응답입니다.", code: "VALIDATION_ERROR" };
    }

    if (response.completedAt) {
      return { success: false, error: "이미 완료된 미션입니다.", code: "ALREADY_COMPLETED" };
    }

    const submittedAnswers = response.answers ?? [];
    const isSame = isAnswerSameAsSubmitted(answer, submittedAnswers);

    if (!isSame) {
      const existingAnswer = submittedAnswers.find(a => a.actionId === answer.actionId);

      if (existingAnswer) {
        if (answer.type === ActionType.BRANCH) {
          await actionAnswerService.updateAnswerWithPruning(
            existingAnswer.id,
            { selectedOptionIds: answer.selectedOptionIds },
            actor,
          );
        } else {
          const updateData = buildUpdateData(answer);
          if (updateData) {
            await actionAnswerService.updateAnswer(existingAnswer.id, updateData, actor);
          }
        }
      } else {
        await actionAnswerService.submitAnswers(
          {
            responseId,
            answers: [buildAnswerPayload(answer)],
          },
          actor,
        );
      }
    }

    if (isLastAction || answer.nextCompletionId) {
      const requestMeta = await getRequestMeta();
      await missionResponseService.completeResponse({ responseId }, actor, requestMeta);
    }

    return { success: true };
  } catch (error) {
    console.error("submitAnswerOnly error:", error);

    const statusCode = error instanceof Error ? (error.cause as number) : undefined;
    if (statusCode && statusCode >= 400 && statusCode < 500) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "유효하지 않은 요청입니다.",
        code: "VALIDATION_ERROR",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "답변 제출 중 오류가 발생했습니다.",
      code: "SERVER_ERROR",
    };
  }
}

function buildUpdateData(answer: ActionAnswerItem) {
  switch (answer.type) {
    case ActionType.TAG:
      return {
        selectedOptionIds: answer.selectedOptionIds,
        ...(answer.textAnswer ? { textAnswer: answer.textAnswer } : {}),
      };
    case ActionType.SCALE:
    case ActionType.RATING:
      return { scaleAnswer: answer.scaleValue };
    case ActionType.SUBJECTIVE:
    case ActionType.SHORT_TEXT:
      return { textAnswer: answer.textAnswer };
    case ActionType.MULTIPLE_CHOICE:
      return {
        selectedOptionIds: answer.selectedOptionIds,
        ...(answer.textAnswer ? { textAnswer: answer.textAnswer } : {}),
      };
    default:
      return null;
  }
}

function buildAnswerPayload(answer: ActionAnswerItem) {
  const base = {
    actionId: answer.actionId,
    type: answer.type,
    isRequired: answer.isRequired,
  };

  switch (answer.type) {
    case ActionType.MULTIPLE_CHOICE:
    case ActionType.TAG:
    case ActionType.BRANCH:
      return {
        ...base,
        selectedOptionIds: answer.selectedOptionIds,
        ...("textAnswer" in answer && answer.textAnswer ? { textAnswer: answer.textAnswer } : {}),
      };
    case ActionType.SCALE:
    case ActionType.RATING:
      return { ...base, scaleValue: answer.scaleValue };
    case ActionType.SUBJECTIVE:
    case ActionType.SHORT_TEXT:
      return { ...base, textAnswer: answer.textAnswer };
    case ActionType.IMAGE:
    case ActionType.VIDEO:
    case ActionType.PDF:
      return { ...base, fileUploadIds: answer.fileUploadIds };
    case ActionType.DATE:
    case ActionType.TIME:
      return { ...base, dateAnswers: answer.dateAnswers?.map(d => new Date(d)) };
    default:
      return base;
  }
}
