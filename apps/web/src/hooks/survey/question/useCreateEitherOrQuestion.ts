"use client";

import { createEitherOrQuestion } from "@/actions/survey/question";
import { surveyQueryKeys } from "@/constants/queryKeys/surveyQueryKeys";
import type {
  CreateEitherOrQuestionRequest,
  CreateEitherOrQuestionResponse,
} from "@/types/dto/survey";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UseCreateEitherOrQuestionOptions {
  onSuccess?: (data: CreateEitherOrQuestionResponse) => void;
  onError?: (error: Error) => void;
}

export function useCreateEitherOrQuestion(options: UseCreateEitherOrQuestionOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: CreateEitherOrQuestionRequest,
    ): Promise<CreateEitherOrQuestionResponse> => createEitherOrQuestion(payload),
    onSuccess: (data, variables) => {
      if (variables.surveyId) {
        queryClient.invalidateQueries({
          queryKey: surveyQueryKeys.surveyQuestions({ surveyId: variables.surveyId }),
        });
        queryClient.invalidateQueries({
          queryKey: surveyQueryKeys.survey(variables.surveyId),
        });
      }
      options.onSuccess?.(data);
    },
    onError: error => {
      console.error("❌ 양자택일 질문 생성 실패:", error);
      options.onError?.(error as Error);
    },
  });
}

export type UseCreateEitherOrQuestionReturn = ReturnType<typeof useCreateEitherOrQuestion>;
