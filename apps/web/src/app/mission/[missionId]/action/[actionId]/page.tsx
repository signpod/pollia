import { getActionById, getMissionActionsDetail } from "@/actions/action";
import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import { getQueryClient } from "@/lib/getQueryClient";
import { dehydrate } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { ActionClientTrackingWrapper } from "./ActionClientTrackingWrapper";
import { ActionClientWrapper } from "./ActionClientWrapper";

export default async function ActionPage({
  params,
}: {
  params: Promise<{ missionId: string; actionId: string }>;
}) {
  const { missionId, actionId } = await params;

  const queryClient = getQueryClient();

  const action = await getActionById(actionId).catch(error => {
    if (error instanceof Error && (error as Error & { cause?: number }).cause === 404) {
      notFound();
    }
    throw error;
  });

  await queryClient.prefetchQuery({
    queryKey: actionQueryKeys.actions({ missionId }),
    queryFn: () => getMissionActionsDetail(missionId),
  });

  queryClient.setQueryData(actionQueryKeys.action(actionId), action);

  const dehydratedState = dehydrate(queryClient);

  return (
    <ActionClientTrackingWrapper>
      <ActionClientWrapper dehydratedState={dehydratedState} />
    </ActionClientTrackingWrapper>
  );
}
