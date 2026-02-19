import { getMissionActionIds } from "@/actions/action";
import { getMyResponses } from "@/actions/mission-response";
import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { getQueryClient } from "@/lib/getQueryClient";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Suspense } from "react";
import { InProgressContent } from "./InProgressContent";

export default async function InProgressPage() {
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

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <InProgressContent />
      </Suspense>
    </HydrationBoundary>
  );
}
