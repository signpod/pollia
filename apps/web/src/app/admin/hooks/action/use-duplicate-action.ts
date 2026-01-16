"use client";

import { duplicateAction } from "@/actions/action/create";
import { adminActionQueryKeys } from "@/app/admin/constants/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DuplicateActionInput {
  actionId: string;
  missionId: string;
}

interface UseDuplicateActionOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useDuplicateAction(options: UseDuplicateActionOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: DuplicateActionInput) => {
      return await duplicateAction(input);
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: adminActionQueryKeys.actions(variables.missionId),
      });
      options.onSuccess?.();
    },

    onError: error => {
      console.error("액션 복제 실패:", error);
      options.onError?.(error as Error);
    },
  });
}

export type UseDuplicateActionReturn = ReturnType<typeof useDuplicateAction>;
