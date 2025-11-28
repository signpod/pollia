"use client";

import { createMultipleChoiceQuestion } from "@/actions/survey-question/create";
import { surveyQueryKeys } from "@/constants/queryKeys/surveyQueryKeys";
import type {
  CreateMultipleChoiceQuestionRequest,
  CreateMultipleChoiceQuestionResponse,
} from "@/types/dto";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useResetSurveyQuestion } from "./useResetSurveyQuestion";

interface UseCreateMultipleChoiceQuestionOptions {
  onSuccess?: (data: CreateMultipleChoiceQuestionResponse) => void;
  onError?: (error: Error) => void;
}

export function useCreateMultipleChoiceQuestion(
  options: UseCreateMultipleChoiceQuestionOptions = {},
) {
  const queryClient = useQueryClient();
  const { handleResetSurveyQuestion } = useResetSurveyQuestion();

  return useMutation({
    mutationFn: async (
      payload: CreateMultipleChoiceQuestionRequest,
    ): Promise<CreateMultipleChoiceQuestionResponse> => createMultipleChoiceQuestion(payload),
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
      console.error("❌ 객관식 질문 생성 실패:", error);
      options.onError?.(error as Error);
    },
  });
}

export type UseCreateMultipleChoiceQuestionReturn = ReturnType<
  typeof useCreateMultipleChoiceQuestion
>;
