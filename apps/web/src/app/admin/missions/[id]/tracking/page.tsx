"use client";
import { FunnelViewTabs } from "@/app/admin/components/FunnelViewTabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/admin/components/shadcn-ui/card";
import { Skeleton } from "@/app/admin/components/shadcn-ui/skeleton";
import { useReadMission, useReadMissionFunnel } from "@/app/admin/hooks/mission";
import { useReadMissionResponses } from "@/app/admin/hooks/mission-response";
import { notFound } from "next/navigation";
import { use, useMemo } from "react";
import { AdminMissionHeader } from "../components/AdminMissionHeader";
import { MissionNavigation } from "../components/MissionNavigation";

interface AdminMissionTrackingPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminMissionTrackingPage({ params }: AdminMissionTrackingPageProps) {
  const { id: missionId } = use(params);
  const { data: missionResponse } = useReadMission(missionId);
  const { data: funnelResponse, isLoading, error } = useReadMissionFunnel(missionId);
  const { data: responsesData } = useReadMissionResponses(missionId);
  const mission = missionResponse?.data;

  const missionStats = useMemo(() => {
    const responses = responsesData?.data ?? [];
    const total = responses.length;
    const completed = responses.filter(r => r.completedAt !== null).length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      completed,
      completionRate,
    };
  }, [responsesData]);

  if (!mission) return notFound();

  return (
    <div className="max-w-7xl">
      <AdminMissionHeader
        title="통계"
        description="트래킹, 디바이스 분포, 참여 패턴 등 미션의 주요 지표를 확인할 수 있습니다"
        nav={<MissionNavigation missionId={missionId} />}
        missionId={missionId}
        isActive={mission.isActive}
      />

      <Card>
        <CardHeader>
          <CardTitle>트래킹 퍼널</CardTitle>
          <CardDescription>미션의 각 단계별 트래킹 데이터를 확인할 수 있습니다</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <Skeleton className="h-[450px] w-full" />}

          {error && (
            <div className="p-8 border border-destructive rounded-lg text-center text-destructive">
              데이터를 불러오는데 실패했습니다: {error.message}
            </div>
          )}

          {!isLoading && !error && funnelResponse?.data && (
            <FunnelViewTabs data={funnelResponse.data} missionStats={missionStats} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
