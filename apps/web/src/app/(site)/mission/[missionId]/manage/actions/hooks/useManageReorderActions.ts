"use client";

import { type ReorderActionsRequest, reorderActions } from "@/actions/action/reorder";
import { toMutationFn } from "@/actions/common/error";
import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UseManageReorderActionsOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useManageReorderActions(options: UseManageReorderActionsOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation<Awaited<ReturnType<typeof reorderActions>>, Error, ReorderActionsRequest>({
    mutationFn: toMutationFn(reorderActions),

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
