"use client";

import { createSubjectiveQuestion } from "@/actions/survey/question";
import { surveyQueryKeys } from "@/constants/queryKeys/surveyQueryKeys";
import type {
  CreateSubjectiveQuestionRequest,
  CreateSubjectiveQuestionResponse,
} from "@/types/dto/survey";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useResetSurveyQuestion } from "./useResetSurveyQuestion";

interface UseCreateSubjectiveQuestionOptions {
  onSuccess?: (data: CreateSubjectiveQuestionResponse) => void;
  onError?: (error: Error) => void;
}

export function useCreateSubjectiveQuestion(options: UseCreateSubjectiveQuestionOptions = {}) {
  const queryClient = useQueryClient();
  const { handleResetSurveyQuestion } = useResetSurveyQuestion();

  return useMutation({
    mutationFn: async (
      payload: CreateSubjectiveQuestionRequest,
    ): Promise<CreateSubjectiveQuestionResponse> => createSubjectiveQuestion(payload),
    onSuccess: (data, variables) => {
      if (variables.surveyId) {
        queryClient.invalidateQueries({
          queryKey: surveyQueryKeys.surveyQuestions({
            surveyId: variables.surveyId,
          }),
        });
        queryClient.invalidateQueries({
          queryKey: surveyQueryKeys.survey(variables.surveyId),
        });
      }
      handleResetSurveyQuestion();
      options.onSuccess?.(data);
    },
    onError: error => {
      console.error("❌ 주관식 질문 생성 실패:", error);
      options.onError?.(error as Error);
    },
  });
}

export type UseCreateSubjectiveQuestionReturn = ReturnType<typeof useCreateSubjectiveQuestion>;
