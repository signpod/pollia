"use client";

import { getRewards } from "@/actions/reward/read";
import { rewardQueryKeys } from "@/constants/queryKeys/rewardQueryKeys";
import { useQuery } from "@tanstack/react-query";

export const useRewards = () => {
  return useQuery({
    queryKey: rewardQueryKeys.all(),
    queryFn: () => getRewards(),
    select: data => data.data,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export type UseRewardsReturn = ReturnType<typeof useRewards>;
