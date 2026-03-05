import { getLikedMissions } from "@/actions/mission-like/read";
import { missionLikeQueryKeys } from "@/constants/queryKeys/missionLikeQueryKeys";
import { getQueryClient } from "@/lib/getQueryClient";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Suspense } from "react";
import { LikedContent } from "./LikedContent";

export default async function LikedPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: missionLikeQueryKeys.likedMissions(),
    queryFn: () => getLikedMissions(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <LikedContent />
      </Suspense>
    </HydrationBoundary>
  );
}
