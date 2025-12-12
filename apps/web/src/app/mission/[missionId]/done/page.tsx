import { getMissionActionsDetail } from "@/actions/action";
import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import { getQueryClient } from "@/lib/getQueryClient";
import { MissionCompletion } from "./ui";
import { RouteWrapper } from "./ui/RouteWrapper";

export default async function MissionPage({ params }: { params: Promise<{ missionId: string }> }) {
  const { missionId } = await params;
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: actionQueryKeys.actions({ missionId }),
    queryFn: () => getMissionActionsDetail(missionId),
  });

  return (
    <RouteWrapper>
      <MissionCompletion />
    </RouteWrapper>
  );
}
