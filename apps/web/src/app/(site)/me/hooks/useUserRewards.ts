"use client";

import { getMyResponses } from "@/actions/mission-response";
import { getRewards } from "@/actions/reward/read";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { rewardQueryKeys } from "@/constants/queryKeys/rewardQueryKeys";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export const useUserRewards = () => {
  const rewardsQuery = useQuery({
    queryKey: rewardQueryKeys.all(),
    queryFn: () => getRewards(),
    select: data => data.data,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const responsesQuery = useQuery({
    queryKey: missionQueryKeys.myResponses(),
    queryFn: () => getMyResponses(),
    staleTime: 5 * 60 * 1000,
  });

  const data = useMemo(() => {
    if (!rewardsQuery.data) return undefined;
    const myMissionIds = new Set((responsesQuery.data?.data ?? []).map(r => r.missionId));
    return rewardsQuery.data.filter(r => r.missions.some(m => myMissionIds.has(m.id)));
  }, [rewardsQuery.data, responsesQuery.data]);

  return {
    ...rewardsQuery,
    data,
  };
};

export type UseUserRewardsReturn = ReturnType<typeof useUserRewards>;
