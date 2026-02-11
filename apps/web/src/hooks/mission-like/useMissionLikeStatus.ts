import { getMissionLikeStatus } from "@/actions/mission-like/read";
import { missionLikeQueryKeys } from "@/constants/queryKeys/missionLikeQueryKeys";
import { useQuery } from "@tanstack/react-query";

export const useMissionLikeStatus = (missionId: string) => {
  return useQuery({
    queryKey: missionLikeQueryKeys.likeStatus(missionId),
    queryFn: () => getMissionLikeStatus(missionId),
    select: data => data.data,
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export type UseMissionLikeStatusReturn = ReturnType<typeof useMissionLikeStatus>;
