import { getMissionActionsDetail } from "@/actions/action";
import { getCompletionsByMissionId, getMissionCompletion } from "@/actions/mission-completion";
import { getMyResponseForMission } from "@/actions/mission-response";
import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import { missionCompletionQueryKeys } from "@/constants/queryKeys/missionCompletionQueryKeys";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { ROUTES } from "@/constants/routes";
import { checkAuthStatus } from "@/lib/auth";
import { getQueryClient } from "@/lib/getQueryClient";
import type { GetMissionCompletionResponse } from "@/types/dto";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { MeResultContent } from "./MeResultContent";

export default async function MeResultPage({
  params,
}: {
  params: Promise<{ missionId: string }>;
}) {
  const { missionId } = await params;
  const queryClient = getQueryClient();

  const { user } = await checkAuthStatus().catch(() => ({ user: null }));
  const actorKey = user?.id ?? "guest";

  const missionResponse = await getMyResponseForMission(missionId).catch(() => ({ data: null }));
  if (!missionResponse.data?.completedAt) {
    redirect(ROUTES.MISSION(missionId));
  }

  let completionId: string | undefined;

  const { data: actions } = await getMissionActionsDetail(missionId);
  const isBranched = actions.some(
    action => action.nextCompletionId || action.options?.some(opt => opt.nextCompletionId),
  );

  if (isBranched) {
    const answers = missionResponse.data.answers;
    let userCompletionId: string | null = null;

    for (const answer of answers) {
      const optionCompletionId = answer.options?.find(
        opt => opt.nextCompletionId,
      )?.nextCompletionId;
      if (optionCompletionId) {
        userCompletionId = optionCompletionId;
      }
      if (answer.action?.nextCompletionId) {
        userCompletionId = answer.action.nextCompletionId;
      }
    }

    if (userCompletionId) {
      completionId = userCompletionId;
    }
  }

  const prefetchPromises = [
    queryClient.prefetchQuery({
      queryKey: actionQueryKeys.actions({ missionId }),
      queryFn: () => getMissionActionsDetail(missionId),
    }),
    queryClient.prefetchQuery({
      queryKey: [...missionQueryKeys.missionResponseForMission(missionId), actorKey],
      queryFn: () => getMyResponseForMission(missionId),
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
      <MeResultContent missionId={missionId} completionId={completionId ?? null} />
    </HydrationBoundary>
  );
}
