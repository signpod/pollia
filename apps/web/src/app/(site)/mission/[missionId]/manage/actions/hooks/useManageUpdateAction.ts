"use client";

import { updateAction } from "@/actions/action/update";
import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import type { UpdateActionRequest } from "@/types/dto";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateActionInput extends UpdateActionRequest {
  actionId: string;
  missionId: string;
}

interface UseManageUpdateActionOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useManageUpdateAction(options: UseManageUpdateActionOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateActionInput) => {
      const { actionId, missionId: _, ...request } = input;
      return await updateAction(actionId, request);
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
