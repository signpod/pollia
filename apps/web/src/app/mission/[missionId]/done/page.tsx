import { getMissionActionsDetail } from "@/actions/action";
import { getMissionCompletion } from "@/actions/mission-completion";
import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import { missionCompletionQueryKeys } from "@/constants/queryKeys/missionCompletionQueryKeys";
import { getQueryClient } from "@/lib/getQueryClient";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { MissionCompletion } from "./ui";
import { RouteWrapper } from "./ui/RouteWrapper";

export default async function MissionPage({ params }: { params: Promise<{ missionId: string }> }) {
  const { missionId } = await params;
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: actionQueryKeys.actions({ missionId }),
      queryFn: () => getMissionActionsDetail(missionId),
    }),
    queryClient.prefetchQuery({
      queryKey: missionCompletionQueryKeys.missionCompletion(missionId),
      queryFn: () => getMissionCompletion(missionId),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RouteWrapper>
        <MissionCompletion />
      </RouteWrapper>
    </HydrationBoundary>
  );
}
