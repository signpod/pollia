"use client";

import { useReadMission } from "@/app/admin/hooks/mission";
import { use } from "react";
import { MissionDetailContent } from "./components/MissionDetailContent";

interface AdminMissionPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminMissionPage({ params }: AdminMissionPageProps) {
  const unwrappedParams = use(params);
  const { id: missionId } = unwrappedParams;

  const { data, isPending, error } = useReadMission(missionId);

  if (isPending) {
    return (
      <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground">
        로딩 중...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 border border-destructive rounded-lg text-center">
        <p className="text-destructive">미션 정보를 불러올 수 없습니다.</p>
        <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="p-8 border border-dashed rounded-lg text-center text-muted-foreground">
        미션을 찾을 수 없습니다.
      </div>
    );
  }

  return <MissionDetailContent mission={data.data} />;
}
