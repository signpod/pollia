"use client";

import { connectBranchOption } from "@/actions/action/update";
import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ConnectBranchOptionInput {
  actionId: string;
  optionId: string;
  targetId: string;
  isCompletion: boolean;
  missionId: string;
}

interface UseManageConnectBranchOptionOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useManageConnectBranchOption(options: UseManageConnectBranchOptionOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ConnectBranchOptionInput) => {
      return await connectBranchOption(
        input.actionId,
        input.optionId,
        input.targetId,
        input.isCompletion,
        input.missionId,
      );
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
