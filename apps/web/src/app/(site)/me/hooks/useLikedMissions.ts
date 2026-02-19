"use client";

import { getLikedMissions } from "@/actions/mission-like/read";
import { missionLikeQueryKeys } from "@/constants/queryKeys/missionLikeQueryKeys";
import { useQuery } from "@tanstack/react-query";

export const useLikedMissions = () => {
  return useQuery({
    queryKey: missionLikeQueryKeys.likedMissions(),
    queryFn: () => getLikedMissions(),
    select: data => data.data,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export type UseLikedMissionsReturn = ReturnType<typeof useLikedMissions>;
