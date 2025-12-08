"use client";

import { type ReorderActionsRequest, reorderActions } from "@/actions/action/reorder";
import { adminActionQueryKeys } from "@/app/admin/constants/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UseReorderActionsOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useReorderActions(options: UseReorderActionsOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: ReorderActionsRequest) => {
      return await reorderActions(request);
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: adminActionQueryKeys.actions(variables.missionId),
      });
      options.onSuccess?.();
    },

    onError: (error, variables) => {
      queryClient.invalidateQueries({
        queryKey: adminActionQueryKeys.actions(variables.missionId),
      });
      options.onError?.(error as Error);
    },
  });
}

export type UseReorderActionsReturn = ReturnType<typeof useReorderActions>;
