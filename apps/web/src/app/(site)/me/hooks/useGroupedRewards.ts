"use client";

import { useMemo } from "react";
import { type UseUserRewardsReturn, useUserRewards } from "./useUserRewards";

type RewardItem = NonNullable<UseUserRewardsReturn["data"]>[number];

export function useGroupedRewards() {
  const { data: rewards } = useUserRewards();

  const grouped = useMemo(() => {
    const result: Record<string, RewardItem[]> = { pending: [], paid: [] };
    if (!rewards) return result;
    for (const r of rewards) {
      if (r.paidAt === null) result.pending?.push(r);
      else result.paid?.push(r);
    }
    return result;
  }, [rewards]);

  return { rewards, grouped };
}

export type UseGroupedRewardsReturn = ReturnType<typeof useGroupedRewards>;
