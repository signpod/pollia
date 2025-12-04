"use client";

import { submitQuestionAnswers } from "@/actions/action-answer";
import { completeSurveyResponse } from "@/actions/mission-response";
import type { SubmitActionAnswersRequest, SubmitActionAnswersResponse } from "@/types/dto";
import { useMutation } from "@tanstack/react-query";

interface UseSubmitMissionAnswersOptions {
  onSuccess?: (data: SubmitActionAnswersResponse) => void;
  onError?: (error: Error) => void;
}

export function useSubmitMissionAnswers(options: UseSubmitMissionAnswersOptions = {}) {
  return useMutation({
    mutationFn: async (
      payload: SubmitActionAnswersRequest,
    ): Promise<SubmitActionAnswersResponse> => {
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

export type UseSubmitSurveyAnswersReturn = ReturnType<typeof useSubmitMissionAnswers>;
