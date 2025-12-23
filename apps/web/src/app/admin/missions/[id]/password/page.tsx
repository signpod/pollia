import { getMission } from "@/actions/mission";
import { adminMissionQueryKeys } from "@/app/admin/constants/queryKeys";
import { getAdminQueryClient } from "@/app/admin/lib/get-admin-query-client";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { AdminMissionHeader } from "../components/AdminMissionHeader";
import { MissionNavigation } from "../components/MissionNavigation";
import { PasswordManagement } from "./components/PasswordManagement";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MissionPasswordPage({ params }: PageProps) {
  const { id: missionId } = await params;
  const queryClient = getAdminQueryClient();

  const { data: mission } = await queryClient.fetchQuery({
    queryKey: adminMissionQueryKeys.mission(missionId),
    queryFn: () => getMission(missionId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="max-w-7xl">
        <AdminMissionHeader
          title="비밀번호 관리"
          description={mission.title}
          nav={<MissionNavigation missionId={missionId} />}
          missionId={missionId}
          isActive={mission.isActive}
        />

        <PasswordManagement missionId={missionId} />
      </div>
    </HydrationBoundary>
  );
}
