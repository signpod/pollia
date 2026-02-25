"use client";

import { deleteAction } from "@/actions/action/delete";
import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeleteActionInput {
  actionId: string;
  missionId: string;
}

interface UseManageDeleteActionOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useManageDeleteAction(options: UseManageDeleteActionOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: DeleteActionInput) => {
      return await deleteAction(input.actionId);
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: actionQueryKeys.actions({ missionId: variables.missionId }),
      });
      options.onSuccess?.();
    },

    onError: error => {
      options.onError?.(error as Error);
    },
  });
}
