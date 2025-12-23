"use client";

import { createMissionCompletion } from "@/actions/mission-completion";
import { adminMissionCompletionQueryKeys } from "@/app/admin/constants/queryKeys";
import type { CreateMissionCompletionRequest, CreateMissionCompletionResponse } from "@/types/dto";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UseCreateMissionCompletionOptions {
  onSuccess?: (data: CreateMissionCompletionResponse) => void;
  onError?: (error: Error) => void;
}

export function useCreateMissionCompletion(options: UseCreateMissionCompletionOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: CreateMissionCompletionRequest,
    ): Promise<CreateMissionCompletionResponse> => {
      return createMissionCompletion(payload);
    },
    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: adminMissionCompletionQueryKeys.all(),
      });
      options.onSuccess?.(data);
    },
    onError: error => {
      options.onError?.(error as Error);
    },
  });
}
