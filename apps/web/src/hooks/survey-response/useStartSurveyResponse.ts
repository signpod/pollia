"use client";

import { startSurveyResponse } from "@/actions/survey-response";
import type { StartSurveyResponseRequest, StartSurveyResponseResponse } from "@/types/dto";
import { useMutation } from "@tanstack/react-query";

interface UseStartSurveyResponseOptions {
  onSuccess?: (data: StartSurveyResponseResponse) => void;
  onError?: (error: Error) => void;
}

export function useStartSurveyResponse(options: UseStartSurveyResponseOptions = {}) {
  return useMutation({
    mutationFn: async (payload: StartSurveyResponseRequest): Promise<StartSurveyResponseResponse> =>
      startSurveyResponse(payload),
    onSuccess: data => {
      options.onSuccess?.(data);
    },
    onError: error => {
      console.error("❌ 설문 응답 시작 실패:", error);
      options.onError?.(error as Error);
    },
  });
}

export type UseStartSurveyResponseReturn = ReturnType<typeof useStartSurveyResponse>;
