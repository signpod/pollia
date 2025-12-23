"use client";

import { useReadMission } from "@/app/admin/hooks/use-read-mission";
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

      <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground">
        TODO: 4차 스프린트에서 구현 예정
      </div>
    </div>
  );
}
