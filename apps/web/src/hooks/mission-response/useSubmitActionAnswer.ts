"use client";

import { submitAnswers, updateAnswerWithPruning } from "@/actions/action-answer";
import { getMyResponseForMission } from "@/actions/mission-response";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import type { ActionAnswerItem } from "@/types/dto";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface SubmitActionAnswerPayload {
  responseId: string;
  answer: ActionAnswerItem;
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

  return useMutation({
    mutationFn: async ({ responseId, answer }: SubmitActionAnswerPayload) => {
      // Fetch fresh mission response to check completion status
      const freshResponse = await getMyResponseForMission(missionId);
      if (freshResponse?.data?.completedAt) {
        throw new Error("ALREADY_COMPLETED");
      }

      // 분기 처리되는 multiple choice (nextActionId가 있는 경우)에서 기존 답변이 있으면 updateAnswerWithPruning 사용
      if (answer.type === "MULTIPLE_CHOICE" && answer.nextActionId) {
        const existingAnswer = freshResponse?.data?.answers.find(
          a => a.actionId === answer.actionId,
        );

        if (existingAnswer) {
          return await updateAnswerWithPruning(existingAnswer.id, {
            selectedOptionIds: answer.selectedOptionIds,
            ...(answer.textAnswer ? { textAnswer: answer.textAnswer } : {}),
          });
        }
      }

      return await submitAnswers({
        responseId,
        answers: [
          {
            actionId: answer.actionId,
            type: answer.type,
            isRequired: answer.isRequired,
            ...(answer.type === "MULTIPLE_CHOICE" || answer.type === "TAG"
              ? {
                  selectedOptionIds: answer.selectedOptionIds,
                  ...(answer.textAnswer ? { textAnswer: answer.textAnswer } : {}),
                }
              : {}),
            ...(answer.type === "SCALE" || answer.type === "RATING"
              ? { scaleValue: answer.scaleValue }
              : {}),
            ...(answer.type === "SUBJECTIVE" || answer.type === "SHORT_TEXT"
              ? { textAnswer: answer.textAnswer }
              : {}),
            ...(answer.type === "IMAGE" || answer.type === "VIDEO" || answer.type === "PDF"
              ? { fileUploadIds: answer.fileUploadIds }
              : {}),
            ...(answer.type === "DATE" || answer.type === "TIME"
              ? { dateAnswers: answer.dateAnswers }
              : {}),
          },
        ],
      });
    },
    onSuccess: () => {
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
