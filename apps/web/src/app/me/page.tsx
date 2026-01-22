import { getMissionActionIds } from "@/actions/action";
import { getMyResponses } from "@/actions/mission-response";
import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { getQueryClient } from "@/lib/getQueryClient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { MePageContent } from "./MePageContent";

export default async function MePage() {
  const queryClient = getQueryClient();

  const myResponsesData = await queryClient.fetchQuery({
    queryKey: missionQueryKeys.myResponses(),
    queryFn: () => getMyResponses(),
  });

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
        <MePageContent />
      </Suspense>
    </HydrationBoundary>
  );
}
