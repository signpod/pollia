import { getActionById, getMissionActionsDetail } from "@/actions/action";
import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import { getQueryClient } from "@/lib/getQueryClient";
import { dehydrate } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { ActionClientWrapper } from "./ActionClientWrapper";

export default async function ActionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const queryClient = getQueryClient();

  const action = await getActionById(id).catch(error => {
    if (error instanceof Error && (error as Error & { cause?: number }).cause === 404) {
      notFound();
    }
    throw error;
  });

  const missionId = action.data.missionId;

  if (missionId) {
    await queryClient.prefetchQuery({
      queryKey: actionQueryKeys.actions({ missionId: missionId }),
      queryFn: () => getMissionActionsDetail(missionId),
    });
  }

  queryClient.setQueryData(actionQueryKeys.action(id), action);

  const dehydratedState = dehydrate(queryClient);

  return (
    <ActionClientWrapper
      missionId={missionId ?? ""}
      dehydratedState={dehydratedState}
      currentActionId={id}
    />
  );
}
