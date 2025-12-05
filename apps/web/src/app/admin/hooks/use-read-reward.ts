"use client";

import { getReward } from "@/actions/reward";
import { adminRewardQueryKeys } from "@/app/admin/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";

export function useReadReward(rewardId: string | null) {
  const enabled = rewardId !== null;

  return useQuery({
    queryKey: adminRewardQueryKeys.reward(rewardId ?? ""),
    queryFn: () => getReward(rewardId as string),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
