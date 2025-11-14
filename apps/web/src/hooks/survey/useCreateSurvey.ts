"use client";

import { createSurvey } from "@/actions/survey/create-survey";
import { surveyQueryKeys } from "@/constants/queryKeys/surveyQueryKeys";
import type { CreateSurveyRequest, CreateSurveyResponse } from "@/types/dto";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UseCreateSurveyOptions {
  onSuccess?: (data: CreateSurveyResponse) => void;
  onError?: (error: Error) => void;
}

export function useCreateSurvey(options: UseCreateSurveyOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateSurveyRequest): Promise<CreateSurveyResponse> =>
      createSurvey(payload),
    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: surveyQueryKeys.surveyQuestions(),
      });
      options.onSuccess?.(data);
    },
    onError: error => {
      options.onError?.(error as Error);
    },
  });
}
