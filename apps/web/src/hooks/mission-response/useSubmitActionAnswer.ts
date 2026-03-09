"use client";

import { submitAnswers, updateAnswer, updateAnswerWithPruning } from "@/actions/action-answer";
import { assertActionSuccess, toMutationFn } from "@/actions/common/error";
import { getMyResponseForMission } from "@/actions/mission-response";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { isAnswerSameAsSubmitted } from "@/lib/answer/compareAnswers";
import type { ActionAnswerItem } from "@/types/dto";
import { ActionType } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface SubmitActionAnswerPayload {
  responseId: string;
  answer: ActionAnswerItem;
}

export interface SubmitActionAnswerResult {
  skipped: boolean;
  data?: unknown;
}

interface UseSubmitActionAnswerOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onAlreadyCompleted?: () => void;
  missionId: string;
}

export function useSubmitActionAnswer(options: UseSubmitActionAnswerOptions) {
  const queryClient = useQueryClient();
  const { missionId } = options;

  return useMutation<SubmitActionAnswerResult, Error, SubmitActionAnswerPayload>({
    mutationFn: toMutationFn(
      async ({
        responseId,
        answer,
      }: SubmitActionAnswerPayload): Promise<SubmitActionAnswerResult> => {
        const freshResponse = await getMyResponseForMission(missionId);
        assertActionSuccess(freshResponse);
        if (freshResponse.data?.completedAt) {
          throw new Error("이미 완료된 미션입니다.");
        }

        const submittedAnswers = freshResponse.data?.answers ?? [];
        const isSame = isAnswerSameAsSubmitted(answer, submittedAnswers);

        if (isSame) {
          return { skipped: true };
        }

        const existingAnswer = submittedAnswers.find(a => a.actionId === answer.actionId);

        if (existingAnswer) {
          if (answer.type === ActionType.BRANCH) {
            const pruneResult = await updateAnswerWithPruning(existingAnswer.id, {
              selectedOptionIds: answer.selectedOptionIds,
            });
            assertActionSuccess(pruneResult);
            return { skipped: false, data: pruneResult };
          }

          const updateData = (() => {
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
              default:
                return null;
            }
          })();

          if (updateData) {
            const updateResult = await updateAnswer(existingAnswer.id, updateData);
            assertActionSuccess(updateResult);
            return { skipped: false, data: updateResult };
          }
        }

        const submitResult = await submitAnswers({
          responseId,
          answers: [
            {
              actionId: answer.actionId,
              type: answer.type,
              isRequired: answer.isRequired,
              ...(answer.type === ActionType.MULTIPLE_CHOICE ||
              answer.type === ActionType.TAG ||
              answer.type === ActionType.BRANCH
                ? {
                    selectedOptionIds: answer.selectedOptionIds,
                    ...("textAnswer" in answer && answer.textAnswer
                      ? { textAnswer: answer.textAnswer }
                      : {}),
                  }
                : {}),
              ...(answer.type === ActionType.SCALE || answer.type === ActionType.RATING
                ? { scaleValue: answer.scaleValue }
                : {}),
              ...(answer.type === ActionType.SUBJECTIVE || answer.type === ActionType.SHORT_TEXT
                ? { textAnswer: answer.textAnswer }
                : {}),
              ...(answer.type === ActionType.IMAGE ||
              answer.type === ActionType.VIDEO ||
              answer.type === ActionType.PDF
                ? { fileUploadIds: answer.fileUploadIds }
                : {}),
              ...(answer.type === ActionType.DATE || answer.type === ActionType.TIME
                ? { dateAnswers: answer.dateAnswers }
                : {}),
            },
          ],
        });
        assertActionSuccess(submitResult);

        return { skipped: false, data: submitResult };
      },
    ),
    onSuccess: result => {
      if (result.skipped) {
        return;
      }
      options.onSuccess?.();
      queryClient.invalidateQueries({
        queryKey: missionQueryKeys.missionResponseForMission(missionId),
      });
    },
    onError: error => {
      if (error instanceof Error && error.message === "ALREADY_COMPLETED") {
        options.onAlreadyCompleted?.();
        return;
      }
      console.error("❌ 답변 제출 실패:", error);
      options.onError?.(error as Error);
    },
  });
}

export type UseSubmitActionAnswerReturn = ReturnType<typeof useSubmitActionAnswer>;
