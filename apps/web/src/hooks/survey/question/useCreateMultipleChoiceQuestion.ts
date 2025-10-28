"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMultipleChoiceQuestion } from "@/actions/survey/question";
import { surveyQueryKeys } from "@/constants/queryKeys/surveyQueryKeys";
import type {
  CreateMultipleChoiceQuestionRequest,
  CreateMultipleChoiceQuestionResponse,
} from "@/types/dto/survey";

interface UseCreateMultipleChoiceQuestionOptions {
  onSuccess?: (data: CreateMultipleChoiceQuestionResponse) => void;
  onError?: (error: Error) => void;
}

export function useCreateMultipleChoiceQuestion(
  options: UseCreateMultipleChoiceQuestionOptions = {}
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: CreateMultipleChoiceQuestionRequest
    ): Promise<CreateMultipleChoiceQuestionResponse> =>
      createMultipleChoiceQuestion(payload),
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
      console.error("❌ 객관식 질문 생성 실패:", error);
      options.onError?.(error as Error);
    },
  });
}

export type UseCreateMultipleChoiceQuestionReturn = ReturnType<
  typeof useCreateMultipleChoiceQuestion
>;
