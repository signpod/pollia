"use client";

import { deleteAction } from "@/actions/action/delete";
import { toMutationFn } from "@/actions/common/error";
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

  return useMutation<Awaited<ReturnType<typeof deleteAction>>, Error, DeleteActionInput>({
    mutationFn: toMutationFn(async (input: DeleteActionInput) => deleteAction(input.actionId)),

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
