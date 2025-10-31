"use client";

import { createSurvey } from "@/actions/survey/create-survey";
import type { CreateSurveyRequest, CreateSurveyResponse } from "@/types/dto/survey";
import { useMutation } from "@tanstack/react-query";

interface UseCreateSurveyOptions {
  onSuccess?: (data: CreateSurveyResponse) => void;
  onError?: (error: Error) => void;
}

export function useCreateSurvey(options: UseCreateSurveyOptions = {}) {
  return useMutation({
    mutationFn: async (payload: CreateSurveyRequest): Promise<CreateSurveyResponse> =>
      createSurvey(payload),
    onSuccess: data => {
      options.onSuccess?.(data);
    },
    onError: error => {
      options.onError?.(error as Error);
    },
  });
}
