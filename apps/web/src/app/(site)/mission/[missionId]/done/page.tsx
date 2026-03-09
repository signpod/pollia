import { getMissionActionsDetail } from "@/actions/action";
import { getCompletionsByMissionId, getMissionCompletion } from "@/actions/mission-completion";
import { getMyResponseForMission } from "@/actions/mission-response";
import { claimGuestResponses } from "@/actions/mission-response/claimGuestResponses";
import { getAllMissions } from "@/actions/mission/read";
import { GUEST_ID_COOKIE_NAME } from "@/constants/cookie";
import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import { missionCompletionQueryKeys } from "@/constants/queryKeys/missionCompletionQueryKeys";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { ROUTES } from "@/constants/routes";
import { checkAuthStatus } from "@/lib/auth";
import { getQueryClient } from "@/lib/getQueryClient";
import type { GetMissionCompletionResponse } from "@/types/dto";
import { MissionType } from "@prisma/client";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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

  const { isAuthenticated } = await checkAuthStatus().catch(() => ({ isAuthenticated: false }));
  if (isAuthenticated) {
    const cookieStore = await cookies();
    if (cookieStore.get(GUEST_ID_COOKIE_NAME)?.value) {
      await claimGuestResponses().catch(() => {});
    }
  }

  const missionResponse = await getMyResponseForMission(missionId).catch(() => ({ data: null }));
  if (!missionResponse.data?.completedAt) {
    redirect(ROUTES.MISSION(missionId));
  }

  if (!completionId) {
    if (missionResponse.data.selectedCompletionId) {
      redirect(ROUTES.MISSION_DONE(missionId, missionResponse.data.selectedCompletionId));
    }

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
        redirect(ROUTES.MISSION_DONE(missionId, userCompletionId));
      }
    }
  }

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

  prefetchPromises.push(
    queryClient.prefetchQuery({
      queryKey: [...missionQueryKeys.allMissions(), "recommended"],
      queryFn: () => getAllMissions({ limit: 6, type: MissionType.GENERAL }),
    }),
  );

  await Promise.all(prefetchPromises);

  const completionData = completionId
    ? queryClient.getQueryData<GetMissionCompletionResponse>(
        missionCompletionQueryKeys.missionCompletionById(missionId, completionId),
      )
    : queryClient.getQueryData<GetMissionCompletionResponse>(
        missionCompletionQueryKeys.missionCompletion(missionId),
      );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RouteWrapper>
        <MissionCompletion
          completionId={completionId}
          initialImageUrl={completionData?.data?.imageUrl}
        />
      </RouteWrapper>
    </HydrationBoundary>
  );
}
