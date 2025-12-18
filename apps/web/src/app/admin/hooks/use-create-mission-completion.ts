"use client";

import { createMissionCompletion } from "@/actions/mission-completion";
import type { CreateMissionCompletionRequest, CreateMissionCompletionResponse } from "@/types/dto";
import { useMutation } from "@tanstack/react-query";

interface UseCreateMissionCompletionOptions {
  onSuccess?: (data: CreateMissionCompletionResponse) => void;
  onError?: (error: Error) => void;
}

export function useCreateMissionCompletion(options: UseCreateMissionCompletionOptions = {}) {
  return useMutation({
    mutationFn: async (
      payload: CreateMissionCompletionRequest,
    ): Promise<CreateMissionCompletionResponse> => {
      return createMissionCompletion(payload);
    },
    onSuccess: data => {
      options.onSuccess?.(data);
    },
    onError: error => {
      options.onError?.(error as Error);
    },
  });
}
