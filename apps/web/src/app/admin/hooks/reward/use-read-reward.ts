"use client";

import { getReward } from "@/actions/reward";
import { adminRewardQueryKeys } from "@/app/admin/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";

export function useReadReward(rewardId: string) {
  return useQuery({
    queryKey: adminRewardQueryKeys.reward(rewardId),
    queryFn: () => getReward(rewardId),
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export type UseReadRewardReturn = ReturnType<typeof useReadReward>;
