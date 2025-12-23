"use client";
import { MissionSankeyChart } from "@/app/admin/components/MissionSankeyChart";
import { Skeleton } from "@/app/admin/components/shadcn-ui/skeleton";
import { useReadMission } from "@/app/admin/hooks/use-read-mission";
import { useReadMissionFunnel } from "@/app/admin/hooks/use-read-mission-funnel";
import { notFound } from "next/navigation";
import { use } from "react";
import { AdminMissionHeader } from "../components/AdminMissionHeader";
import { MissionNavigation } from "../components/MissionNavigation";

interface AdminMissionTrackingPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminMissionTrackingPage({ params }: AdminMissionTrackingPageProps) {
  const { id: missionId } = use(params);
  const { data: missionResponse } = useReadMission(missionId);
  const { data: funnelResponse, isLoading, error } = useReadMissionFunnel(missionId);
  const mission = missionResponse?.data;

  if (!mission) return notFound();

  return (
    <div className="max-w-7xl">
      <AdminMissionHeader
        title="통계"
        description="완주율, 디바이스 분포, 참여 패턴 등 미션의 주요 지표를 확인할 수 있습니다"
        nav={<MissionNavigation missionId={missionId} />}
        missionId={missionId}
        isActive={mission.isActive}
      />

      <div className="space-y-8">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">완주율 퍼널</h2>
            <p className="text-sm text-muted-foreground">
              미션의 각 단계별 진행률과 이탈 지점을 확인할 수 있습니다
            </p>
          </div>

          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-[600px] w-full" />
            </div>
          )}

          {error && (
            <div className="p-8 border border-destructive rounded-lg text-center text-destructive">
              데이터를 불러오는데 실패했습니다: {error.message}
            </div>
          )}

          {!isLoading && !error && funnelResponse?.data && (
            <MissionSankeyChart data={funnelResponse.data} />
          )}
        </div>
      </div>
    </div>
  );
}
