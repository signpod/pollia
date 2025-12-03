"use client";

import { submitQuestionAnswers } from "@/actions/action-answer";
import type { SurveyAnswerItem } from "@/types/dto";
import { useMutation } from "@tanstack/react-query";

interface SubmitQuestionAnswerPayload {
  responseId: string;
  answer: SurveyAnswerItem;
}

interface UseSubmitQuestionAnswerOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useSubmitQuestionAnswer(options: UseSubmitQuestionAnswerOptions = {}) {
  return useMutation({
    mutationFn: async ({ responseId, answer }: SubmitQuestionAnswerPayload) => {
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

export type UseSubmitQuestionAnswerReturn = ReturnType<typeof useSubmitQuestionAnswer>;
