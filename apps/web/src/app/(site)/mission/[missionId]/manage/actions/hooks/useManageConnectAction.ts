"use client";

import { connectAction } from "@/actions/action/update";
import { toMutationFn } from "@/actions/common/error";
import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ConnectActionInput {
  sourceActionId: string;
  targetId: string;
  isCompletion: boolean;
  missionId: string;
}

interface UseManageConnectActionOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useManageConnectAction(options: UseManageConnectActionOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation<Awaited<ReturnType<typeof connectAction>>, Error, ConnectActionInput>({
    mutationFn: toMutationFn(async (input: ConnectActionInput) =>
      connectAction(input.sourceActionId, input.targetId, input.isCompletion, input.missionId),
    ),

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
