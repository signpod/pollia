import { getMission } from "@/actions/mission";
import { adminMissionQueryKeys } from "@/app/admin/constants/queryKeys";
import { getAdminQueryClient } from "@/app/admin/lib/get-admin-query-client";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { AdminMissionHeader } from "../components/AdminMissionHeader";
import { MissionNavigation } from "../components/MissionNavigation";
import { FlowEditor } from "./components/FlowEditor";

interface FlowPageProps {
  params: Promise<{ id: string }>;
}

export default async function MissionFlowPage({ params }: FlowPageProps) {
  const { id: missionId } = await params;
  const queryClient = getAdminQueryClient();

  const { data: mission } = await queryClient.fetchQuery({
    queryKey: adminMissionQueryKeys.detail(missionId),
    queryFn: () => getMission(missionId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="max-w-7xl">
        <AdminMissionHeader
          title="플로우 편집"
          description={mission.title}
          nav={<MissionNavigation missionId={missionId} />}
          missionId={missionId}
          isActive={mission.isActive}
        />

        <FlowEditor missionId={missionId} />
      </div>
    </HydrationBoundary>
  );
}
