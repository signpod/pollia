import { getMission } from "@/actions/mission";
import { adminMissionQueryKeys } from "@/app/admin/constants/queryKeys";
import { getAdminQueryClient } from "@/app/admin/lib/get-admin-query-client";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { AdminMissionHeader } from "../components/AdminMissionHeader";
import { MissionNavigation } from "../components/MissionNavigation";
import { NotionReportCard } from "./components/NotionReportCard";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MissionReportPage({ params }: PageProps) {
  const { id: missionId } = await params;
  const queryClient = getAdminQueryClient();

  const { data: mission } = await queryClient.fetchQuery({
    queryKey: adminMissionQueryKeys.detail(missionId),
    queryFn: () => getMission(missionId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <>
        <AdminMissionHeader
          title="노션 리포트"
          description={mission.title}
          nav={<MissionNavigation missionId={missionId} />}
          missionId={missionId}
        />

        <div className="max-w-3xl">
          <NotionReportCard missionId={missionId} />
        </div>
      </>
    </HydrationBoundary>
  );
}
