"use client";

import { updateReward } from "@/actions/reward";
import { adminRewardQueryKeys } from "@/app/admin/constants/queryKeys";
import type { UpdateRewardRequest } from "@/types/dto";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateRewardInput {
  rewardId: string;
  data: UpdateRewardRequest;
}

interface UseUpdateRewardOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useUpdateReward(options: UseUpdateRewardOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ rewardId, data }: UpdateRewardInput) => {
      return await updateReward(rewardId, data);
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: adminRewardQueryKeys.reward(variables.rewardId),
      });
      queryClient.invalidateQueries({
        queryKey: adminRewardQueryKeys.all(),
      });
      options.onSuccess?.();
    },

    onError: error => {
      options.onError?.(error as Error);
    },
  });
}

export type UseUpdateRewardReturn = ReturnType<typeof useUpdateReward>;
