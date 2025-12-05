import { getReward } from "@/actions/reward/read";
import { rewardQueryKeys } from "@/constants/queryKeys/rewardQueryKeys";
import { useQuery } from "@tanstack/react-query";

export function useReadReward(rewardId: string) {
  return useQuery({
    queryKey: rewardQueryKeys.reward(rewardId),
    queryFn: () => getReward(rewardId),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
