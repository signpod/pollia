"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createScaleQuestion } from "@/actions/survey/question";
import { surveyQueryKeys } from "@/constants/queryKeys/surveyQueryKeys";
import type {
  CreateScaleQuestionRequest,
  CreateScaleQuestionResponse,
} from "@/types/dto/survey";

interface UseCreateScaleQuestionOptions {
  onSuccess?: (data: CreateScaleQuestionResponse) => void;
  onError?: (error: Error) => void;
}

export function useCreateScaleQuestion(
  options: UseCreateScaleQuestionOptions = {}
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: CreateScaleQuestionRequest
    ): Promise<CreateScaleQuestionResponse> => createScaleQuestion(payload),
    onSuccess: (data, variables) => {
      if (variables.surveyId) {
        queryClient.invalidateQueries({
          queryKey: surveyQueryKeys.surveyQuestions(variables.surveyId),
        });
        queryClient.invalidateQueries({
          queryKey: surveyQueryKeys.survey(variables.surveyId),
        });
      }
      options.onSuccess?.(data);
    },
    onError: (error) => {
      console.error("❌ 척도형 질문 생성 실패:", error);
      options.onError?.(error as Error);
    },
  });
}

export type UseCreateScaleQuestionReturn = ReturnType<
  typeof useCreateScaleQuestion
>;
