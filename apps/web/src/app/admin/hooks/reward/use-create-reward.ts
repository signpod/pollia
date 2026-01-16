"use client";

import { createReward } from "@/actions/reward";
import { adminMissionQueryKeys, adminRewardQueryKeys } from "@/app/admin/constants/queryKeys";
import type { CreateRewardRequest } from "@/types/dto";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UseCreateRewardOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useCreateReward(options: UseCreateRewardOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateRewardRequest) => {
      return await createReward(request);
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: adminRewardQueryKeys.all(),
      });
      queryClient.invalidateQueries({
        queryKey: adminMissionQueryKeys.mission(variables.missionId),
      });
      options.onSuccess?.();
    },

    onError: error => {
      console.error("리워드 생성 실패:", error);
      options.onError?.(error as Error);
    },
  });
}

export type UseCreateRewardReturn = ReturnType<typeof useCreateReward>;
