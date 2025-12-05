import { getReward } from "@/actions/reward/read";
import { rewardQueryKeys } from "@/constants/queryKeys/rewardQueryKeys";
import { useQuery } from "@tanstack/react-query";

export function useReadReward(rewardId: string) {
  return useQuery({
    queryKey: rewardQueryKeys.reward(rewardId),
    queryFn: () => getReward(rewardId),
    staleTime: 30 * 60 * 1000,
    refetchInterval: false,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!rewardId,
  });
}

export type UseReadRewardReturn = ReturnType<typeof useReadReward>;
