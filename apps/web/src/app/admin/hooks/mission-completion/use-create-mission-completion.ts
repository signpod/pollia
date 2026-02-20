"use client";

import { createMissionCompletion } from "@/actions/mission-completion";
import { adminMissionCompletionQueryKeys } from "@/app/admin/constants/queryKeys";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
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
        queryKey: adminMissionCompletionQueryKeys.all,
      });
      options.onSuccess?.(data);
    },
    onError: error => {
      console.error(`${UBIQUITOUS_CONSTANTS.MISSION} 완료 화면 생성 실패:`, error);
      options.onError?.(error as Error);
    },
  });
}

export type UseCreateMissionCompletionReturn = ReturnType<typeof useCreateMissionCompletion>;
