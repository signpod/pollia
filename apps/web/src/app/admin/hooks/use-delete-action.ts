"use client";

import { deleteAction } from "@/actions/action/delete";
import { adminActionQueryKeys } from "@/app/admin/constants/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeleteActionInput {
  actionId: string;
  missionId: string;
}

interface UseDeleteActionOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useDeleteAction(options: UseDeleteActionOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: DeleteActionInput) => {
      return await deleteAction(input.actionId);
    },

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

export type UseDeleteActionReturn = ReturnType<typeof useDeleteAction>;
