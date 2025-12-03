"use client";

import { createScaleQuestion } from "@/actions/action";
import { surveyQueryKeys } from "@/constants/queryKeys/surveyQueryKeys";
import type { CreateScaleQuestionRequest, CreateScaleQuestionResponse } from "@/types/dto";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useResetSurveyQuestion } from "./useResetSurveyQuestion";

interface UseCreateScaleQuestionOptions {
  onSuccess?: (data: CreateScaleQuestionResponse) => void;
  onError?: (error: Error) => void;
}

export function useCreateScaleQuestion(options: UseCreateScaleQuestionOptions = {}) {
  const queryClient = useQueryClient();
  const { handleResetSurveyQuestion } = useResetSurveyQuestion();

  return useMutation({
    mutationFn: async (payload: CreateScaleQuestionRequest): Promise<CreateScaleQuestionResponse> =>
      createScaleQuestion(payload),
    onSuccess: (data, variables) => {
      if (variables.surveyId) {
        queryClient.invalidateQueries({
          queryKey: surveyQueryKeys.surveyQuestions({ surveyId: variables.surveyId }),
        });
        queryClient.invalidateQueries({
          queryKey: surveyQueryKeys.survey(variables.surveyId),
        });
      }
      handleResetSurveyQuestion();
      options.onSuccess?.(data);
    },
    onError: error => {
      console.error("❌ 척도형 질문 생성 실패:", error);
      options.onError?.(error as Error);
    },
  });
}

export type UseCreateScaleQuestionReturn = ReturnType<typeof useCreateScaleQuestion>;
