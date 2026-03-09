"use client";

import { createSubjectiveAction } from "@/actions/action";
import { toMutationFn } from "@/actions/common/error";
import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import type { CreateSubjectiveActionRequest, CreateSubjectiveActionResponse } from "@/types/dto";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useResetAction } from "./useResetAction";

interface UseCreateSubjectiveActionOptions {
  onSuccess?: (data: CreateSubjectiveActionResponse) => void;
  onError?: (error: Error) => void;
}

export function useCreateSubjectiveAction(options: UseCreateSubjectiveActionOptions = {}) {
  const queryClient = useQueryClient();
  const { handleResetAction } = useResetAction();

  return useMutation<CreateSubjectiveActionResponse, Error, CreateSubjectiveActionRequest>({
    mutationFn: toMutationFn(createSubjectiveAction),
    onSuccess: (data, variables) => {
      if (variables.missionId) {
        queryClient.invalidateQueries({
          queryKey: actionQueryKeys.actions({
            missionId: variables.missionId,
          }),
        });
        queryClient.invalidateQueries({
          queryKey: missionQueryKeys.mission(variables.missionId),
        });
      }
      handleResetAction();
      options.onSuccess?.(data);
    },
    onError: error => {
      console.error("❌ 주관식 질문 생성 실패:", error);
      options.onError?.(error as Error);
    },
  });
}

export type UseCreateSubjectiveActionReturn = ReturnType<typeof useCreateSubjectiveAction>;
