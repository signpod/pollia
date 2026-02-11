import { getRewards } from "@/actions/reward/read";
import { rewardQueryKeys } from "@/constants/queryKeys/rewardQueryKeys";
import { getQueryClient } from "@/lib/getQueryClient";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Suspense } from "react";
import { RewardListContent } from "../RewardListContent";

export default async function PendingRewardsPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: rewardQueryKeys.all(),
    queryFn: () => getRewards(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <RewardListContent type="pending" />
      </Suspense>
    </HydrationBoundary>
  );
}
