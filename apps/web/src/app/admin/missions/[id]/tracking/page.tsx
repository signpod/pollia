"use client";

import { use } from "react";
import { AdminMissionHeader } from "../components/AdminMissionHeader";
import { MissionNavigation } from "../components/MissionNavigation";

interface AdminMissionTrackingPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminMissionTrackingPage({ params }: AdminMissionTrackingPageProps) {
  const { id: missionId } = use(params);

  return (
    <div className="max-w-7xl">
      <AdminMissionHeader
        title="사용자 추적"
        description="미션에 참여한 사용자들의 활동 내역을 확인할 수 있습니다"
        nav={<MissionNavigation missionId={missionId} />}
      />

      <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground">
        TODO: 4차 스프린트에서 구현 예정
      </div>
    </div>
  );
}
