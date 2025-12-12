import { getMissionActionIds } from "@/actions/action";
import { getMission } from "@/actions/mission";
import { getMyResponseForMission } from "@/actions/mission-response";
import { getReward } from "@/actions/reward/read";
import { getCurrentUser } from "@/actions/user";
import Providers from "@/components/providers/QueryProvider";
import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { rewardQueryKeys } from "@/constants/queryKeys/rewardQueryKeys";
import { userQueryKeys } from "@/constants/queryKeys/userQueryKeys";
import { checkAuthStatus } from "@/lib/auth";
import { getQueryClient } from "@/lib/getQueryClient";
import { ModalProvider } from "@repo/ui/components";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import type { PropsWithChildren } from "react";

export default async function MissionLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ missionId: string }> }>) {
  const { missionId } = await params;
  const queryClient = getQueryClient();

  const { isAuthenticated } = await checkAuthStatus();

  const missionResult = await getMission(missionId).catch(error => {
    if (error instanceof Error && (error as Error & { cause?: number }).cause === 404) {
      notFound();
    }
    throw error;
  });

  const prefetchPromises = [
    queryClient.prefetchQuery({
      queryKey: actionQueryKeys.actionsIds({ missionId }),
      queryFn: () => getMissionActionIds(missionId),
    }),
  ];

  if (isAuthenticated) {
    prefetchPromises.push(
      queryClient
        .prefetchQuery({
          queryKey: userQueryKeys.currentUser(),
          queryFn: () => getCurrentUser(),
        })
        .catch(() => {
          // 로그인하지 않은 경우 에러 무시
        }),
      queryClient
        .prefetchQuery({
          queryKey: missionQueryKeys.missionResponseForMission(missionId),
          queryFn: () => getMyResponseForMission(missionId),
        })
        .catch(() => {
          // 로그인하지 않은 경우 에러 무시
        }),
    );
  }

  await Promise.all(prefetchPromises);

  const rewardId = missionResult.data.rewardId;
  const rewardPrefetchPromises = [];
  if (rewardId) {
    rewardPrefetchPromises.push(
      queryClient.prefetchQuery({
        queryKey: rewardQueryKeys.reward(rewardId),
        queryFn: () => getReward(rewardId),
      }),
    );
  }
  if (rewardPrefetchPromises.length > 0) {
    await Promise.all(rewardPrefetchPromises);
  }

  queryClient.setQueryData(missionQueryKeys.mission(missionId), missionResult);

  const dehydratedState = dehydrate(queryClient);

  return (
    <ModalProvider>
      <Providers>
        <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
      </Providers>
    </ModalProvider>
  );
}
