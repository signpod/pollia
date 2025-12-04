import { getMissionActionIds } from "@/actions/action";
import { getMission } from "@/actions/mission";
import { getMyResponseForMission } from "@/actions/mission-response";
import { getCurrentUser } from "@/actions/user";
import Providers from "@/components/providers/QueryProvider";
import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { userQueryKeys } from "@/constants/queryKeys/userQueryKeys";
import { getQueryClient } from "@/lib/getQueryClient";
import { ModalProvider } from "@repo/ui/components";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import type { PropsWithChildren } from "react";

export default async function MissionLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const queryClient = getQueryClient();

  // Mission 데이터와 User 데이터를 prefetch
  const [missionResult] = await Promise.all([
    getMission(id).catch(error => {
      if (error instanceof Error && (error as Error & { cause?: number }).cause === 404) {
        notFound();
      }
      throw error;
    }),
    queryClient.prefetchQuery({
      queryKey: userQueryKeys.currentUser(),
      queryFn: () => getCurrentUser(),
    }),
    queryClient.prefetchQuery({
      queryKey: actionQueryKeys.actionsIds({ missionId: id }),
      queryFn: () => getMissionActionIds(id),
    }),
    queryClient.prefetchQuery({
      queryKey: missionQueryKeys.missionResponseForMission(id),
      queryFn: () => getMyResponseForMission(id),
    }),
  ]);

  queryClient.setQueryData(missionQueryKeys.mission(id), missionResult);

  const dehydratedState = dehydrate(queryClient);

  return (
    <ModalProvider>
      <Providers>
        <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
      </Providers>
    </ModalProvider>
  );
}
