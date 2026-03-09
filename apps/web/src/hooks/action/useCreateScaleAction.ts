"use client";

import { createScaleAction } from "@/actions/action";
import { toMutationFn } from "@/actions/common/error";
import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import type { CreateScaleActionRequest, CreateScaleActionResponse } from "@/types/dto";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useResetAction } from "./useResetAction";

interface UseCreateScaleActionOptions {
  onSuccess?: (data: CreateScaleActionResponse) => void;
  onError?: (error: Error) => void;
}

export function useCreateScaleAction(options: UseCreateScaleActionOptions = {}) {
  const queryClient = useQueryClient();
  const { handleResetAction } = useResetAction();

  return useMutation<CreateScaleActionResponse, Error, CreateScaleActionRequest>({
    mutationFn: toMutationFn(createScaleAction),
    onSuccess: (data, variables) => {
      if (variables.missionId) {
        queryClient.invalidateQueries({
          queryKey: actionQueryKeys.actions({ missionId: variables.missionId }),
        });
        queryClient.invalidateQueries({
          queryKey: missionQueryKeys.mission(variables.missionId),
        });
      }
      handleResetAction();
      options.onSuccess?.(data);
    },
    onError: error => {
      console.error("❌ 척도형 질문 생성 실패:", error);
      options.onError?.(error as Error);
    },
  });
}

export type UseCreateScaleQuestionReturn = ReturnType<typeof useCreateScaleAction>;
