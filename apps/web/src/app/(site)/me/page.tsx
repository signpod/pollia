import { getMissionActionIds } from "@/actions/action";
import { getLikedMissions } from "@/actions/mission-like/read";
import { getMyResponses } from "@/actions/mission-response";
import { getAllMissions } from "@/actions/mission/read";
import { getRewards } from "@/actions/reward/read";
import { getCurrentUser } from "@/actions/user";
import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import { missionLikeQueryKeys } from "@/constants/queryKeys/missionLikeQueryKeys";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { rewardQueryKeys } from "@/constants/queryKeys/rewardQueryKeys";
import { userQueryKeys } from "@/constants/queryKeys/userQueryKeys";
import { getQueryClient } from "@/lib/getQueryClient";
import { MissionType } from "@prisma/client";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Suspense } from "react";
import { MePageContent } from "./MePageContent";

export default async function MePage() {
  const queryClient = getQueryClient();

  const [myResponsesData, userData] = await Promise.all([
    queryClient.fetchQuery({
      queryKey: missionQueryKeys.myResponses(),
      queryFn: () => getMyResponses(),
    }),
    queryClient.fetchQuery({
      queryKey: userQueryKeys.currentUser(),
      queryFn: () => getCurrentUser(),
    }),
    queryClient.prefetchQuery({
      queryKey: rewardQueryKeys.all(),
      queryFn: () => getRewards(),
    }),
    queryClient.prefetchQuery({
      queryKey: missionLikeQueryKeys.likedMissions(),
      queryFn: () => getLikedMissions(),
    }),
    queryClient.prefetchQuery({
      queryKey: [...missionQueryKeys.allMissions(), "recommended"],
      queryFn: () => getAllMissions({ limit: 6, type: MissionType.GENERAL }),
    }),
  ]);

  const inProgressMissionIds =
    myResponsesData?.data
      ?.filter(response => response.completedAt === null)
      .map(response => response.mission.id) ?? [];

  await Promise.all(
    inProgressMissionIds.map(missionId =>
      queryClient.prefetchQuery({
        queryKey: actionQueryKeys.actionsIds({ missionId }),
        queryFn: () => getMissionActionIds(missionId),
      }),
    ),
  );

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <Suspense>
        <MePageContent user={{ name: userData.data.name, email: userData.data.email }} />
      </Suspense>
    </HydrationBoundary>
  );
}
