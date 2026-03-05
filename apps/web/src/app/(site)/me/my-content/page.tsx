import { getUserMissions } from "@/actions/mission/read";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { getQueryClient } from "@/lib/getQueryClient";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Suspense } from "react";
import { MyContentFullList } from "./MyContentFullList";

export default async function MyContentPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: missionQueryKeys.userMissions(),
    queryFn: () => getUserMissions({ limit: 10 }),
    initialPageParam: undefined,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <MyContentFullList />
      </Suspense>
    </HydrationBoundary>
  );
}
