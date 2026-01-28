import { getMissionActionsDetail } from "@/actions/action";
import { getCompletionsByMissionId, getMissionCompletion } from "@/actions/mission-completion";
import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import { missionCompletionQueryKeys } from "@/constants/queryKeys/missionCompletionQueryKeys";
import { getQueryClient } from "@/lib/getQueryClient";
import type { GetMissionCompletionResponse } from "@/types/dto";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { MissionCompletion } from "./ui";
import { RouteWrapper } from "./ui/RouteWrapper";

export default async function MissionPage({
  params,
  searchParams,
}: {
  params: Promise<{ missionId: string }>;
  searchParams: Promise<{ id?: string }>;
}) {
  const { missionId } = await params;
  const { id: completionId } = await searchParams;
  const queryClient = getQueryClient();

  const prefetchPromises = [
    queryClient.prefetchQuery({
      queryKey: actionQueryKeys.actions({ missionId }),
      queryFn: () => getMissionActionsDetail(missionId),
    }),
  ];

  if (completionId) {
    prefetchPromises.push(
      queryClient.prefetchQuery({
        queryKey: missionCompletionQueryKeys.missionCompletionById(missionId, completionId),
        queryFn: async (): Promise<GetMissionCompletionResponse> => {
          const response = await getCompletionsByMissionId(missionId);
          const completion = response.data.find(c => c.id === completionId);
          if (!completion) {
            throw new Error("완료 화면을 찾을 수 없습니다.");
          }
          return { data: completion };
        },
      }),
    );
  } else {
    prefetchPromises.push(
      queryClient.prefetchQuery({
        queryKey: missionCompletionQueryKeys.missionCompletion(missionId),
        queryFn: () => getMissionCompletion(missionId),
      }),
    );
  }

  await Promise.all(prefetchPromises);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RouteWrapper>
        <MissionCompletion completionId={completionId} />
      </RouteWrapper>
    </HydrationBoundary>
  );
}
