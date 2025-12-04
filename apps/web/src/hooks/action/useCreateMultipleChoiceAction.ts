"use client";

import { createMultipleChoiceAction } from "@/actions/action";
import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import type {
  CreateMultipleChoiceActionRequest,
  CreateMultipleChoiceActionResponse,
} from "@/types/dto";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useResetAction } from "./useResetAction";

interface UseCreateMultipleChoiceActionOptions {
  onSuccess?: (data: CreateMultipleChoiceActionResponse) => void;
  onError?: (error: Error) => void;
}

export function useCreateMultipleChoiceAction(options: UseCreateMultipleChoiceActionOptions = {}) {
  const queryClient = useQueryClient();
  const { handleResetAction } = useResetAction();

  return useMutation({
    mutationFn: async (
      payload: CreateMultipleChoiceActionRequest,
    ): Promise<CreateMultipleChoiceActionResponse> => createMultipleChoiceAction(payload),
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
      console.error("❌ 객관식 질문 생성 실패:", error);
      options.onError?.(error as Error);
    },
  });
}

export type UseCreateMultipleChoiceActionReturn = ReturnType<typeof useCreateMultipleChoiceAction>;
