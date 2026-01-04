"use client";

import { submitAnswers } from "@/actions/action-answer";
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
  missionId: string;
}

export function useSubmitActionAnswer(options: UseSubmitActionAnswerOptions) {
  const queryClient = useQueryClient();
  const { missionId } = options;

  return useMutation({
    mutationFn: async ({ responseId, answer }: SubmitActionAnswerPayload) => {
      return await submitAnswers({
        responseId,
        answers: [
          {
            actionId: answer.actionId,
            type: answer.type,
            isRequired: answer.isRequired,
            ...(answer.type === "MULTIPLE_CHOICE" || answer.type === "TAG"
              ? { selectedOptionIds: answer.selectedOptionIds }
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
      console.error("❌ 답변 제출 실패:", error);
      options.onError?.(error as Error);
    },
  });
}

export type UseSubmitActionAnswerReturn = ReturnType<typeof useSubmitActionAnswer>;
