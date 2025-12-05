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
    mutationFn: async (request: ReorderActionsRequest) => reorderActions(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: adminActionQueryKeys.actions(variables.missionId),
      });
      options.onSuccess?.();
    },
    onError: error => {
      options.onError?.(error as Error);
    },
  });
}

