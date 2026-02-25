"use client";

import { type ReorderActionsRequest, reorderActions } from "@/actions/action/reorder";
import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UseManageReorderActionsOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useManageReorderActions(options: UseManageReorderActionsOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: ReorderActionsRequest) => {
      return await reorderActions(request);
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: actionQueryKeys.actions({ missionId: variables.missionId }),
      });
      options.onSuccess?.();
    },

    onError: (error, variables) => {
      queryClient.invalidateQueries({
        queryKey: actionQueryKeys.actions({ missionId: variables.missionId }),
      });
      options.onError?.(error as Error);
    },
  });
}
