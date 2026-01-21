"use client";

import { deleteReward } from "@/actions/reward";
import { adminMissionQueryKeys, adminRewardQueryKeys } from "@/app/admin/constants/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DeleteRewardInput {
  rewardId: string;
  missionId?: string;
}

interface UseDeleteRewardOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

type MissionQueryData = { data: { rewardId: string | null } } | undefined;

export function useDeleteReward(options: UseDeleteRewardOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ rewardId, missionId }: DeleteRewardInput) => {
      return await deleteReward(rewardId, missionId);
    },

    onSuccess: (_, variables) => {
      if (variables.missionId) {
        queryClient.setQueryData<MissionQueryData>(
          adminMissionQueryKeys.detail(variables.missionId),
          oldData => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              data: { ...oldData.data, rewardId: null },
            };
          },
        );
      }

      queryClient.removeQueries({
        queryKey: adminRewardQueryKeys.reward(variables.rewardId),
      });
      queryClient.invalidateQueries({
        queryKey: adminRewardQueryKeys.all(),
      });

      if (variables.missionId) {
        queryClient.invalidateQueries({
          queryKey: adminMissionQueryKeys.detail(variables.missionId),
        });
      }

      options.onSuccess?.();
    },

    onError: error => {
      console.error("리워드 삭제 실패:", error);
      options.onError?.(error as Error);
    },
  });
}

export type UseDeleteRewardReturn = ReturnType<typeof useDeleteReward>;
