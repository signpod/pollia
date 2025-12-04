"use client";

import { submitQuestionAnswers } from "@/actions/action-answer";
import type { ActionAnswerItem } from "@/types/dto";
import { useMutation } from "@tanstack/react-query";

interface SubmitActionAnswerPayload {
  responseId: string;
  answer: ActionAnswerItem;
}

interface UseSubmitActionAnswerOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useSubmitActionAnswer(options: UseSubmitActionAnswerOptions = {}) {
  return useMutation({
    mutationFn: async ({ responseId, answer }: SubmitActionAnswerPayload) => {
      return await submitQuestionAnswers({
        responseId,
        answers: [answer],
      });
    },
    onSuccess: () => {
      options.onSuccess?.();
    },
    onError: error => {
      console.error("❌ 답변 제출 실패:", error);
      options.onError?.(error as Error);
    },
  });
}

export type UseSubmitActionAnswerReturn = ReturnType<typeof useSubmitActionAnswer>;
