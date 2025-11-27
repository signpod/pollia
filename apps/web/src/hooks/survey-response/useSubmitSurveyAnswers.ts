"use client";

import { submitQuestionAnswers } from "@/actions/survey-question-answer";
import { completeSurveyResponse } from "@/actions/survey-response";
import type { SubmitQuestionAnswersRequest, SubmitQuestionAnswersResponse } from "@/types/dto";
import { useMutation } from "@tanstack/react-query";

interface UseSubmitSurveyAnswersOptions {
  onSuccess?: (data: SubmitQuestionAnswersResponse) => void;
  onError?: (error: Error) => void;
}

export function useSubmitSurveyAnswers(options: UseSubmitSurveyAnswersOptions = {}) {
  return useMutation({
    mutationFn: async (
      payload: SubmitQuestionAnswersRequest,
    ): Promise<SubmitQuestionAnswersResponse> => {
      const submitResult = await submitQuestionAnswers(payload);

      await completeSurveyResponse({ responseId: payload.responseId });

      return submitResult;
    },
    onSuccess: data => {
      options.onSuccess?.(data);
    },
    onError: error => {
      console.error("❌ 설문 답변 제출 실패:", error);
      options.onError?.(error as Error);
    },
  });
}

export type UseSubmitSurveyAnswersReturn = ReturnType<typeof useSubmitSurveyAnswers>;
