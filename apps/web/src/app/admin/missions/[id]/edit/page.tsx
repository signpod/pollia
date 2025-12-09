"use client";

import { ErrorBoundary } from "@/app/admin/components/common/ErrorBoundary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/admin/components/shadcn-ui/tabs";
import { useReadMission } from "@/app/admin/hooks/use-read-mission";
import { Suspense, use } from "react";
import { AdminMissionHeader } from "../components/AdminMissionHeader";
import { MissionActiveToggle } from "../components/MissionActiveToggle";
import { MissionNavigation } from "../components/MissionNavigation";
import { ActionsEditTab } from "./components/ActionsEditTab";
import { BasicInfoEditTab } from "./components/BasicInfoEditTab";
import { RewardEditTab } from "./components/RewardEditTab";

interface AdminMissionEditPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminMissionEditPage({ params }: AdminMissionEditPageProps) {
  const { id: missionId } = use(params);
  const { data: missionResponse } = useReadMission(missionId);
  const mission = missionResponse?.data;

  return (
    <div className="max-w-4xl">
      <AdminMissionHeader
        title="미션 수정"
        description="미션의 기본 정보, 액션, 리워드를 수정합니다"
        nav={<MissionNavigation missionId={missionId} />}
      >
        {mission && <MissionActiveToggle missionId={missionId} isActive={mission.isActive} />}
      </AdminMissionHeader>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList>
          <TabsTrigger value="basic">기본 정보 수정</TabsTrigger>
          <TabsTrigger value="actions">액션 수정</TabsTrigger>
          <TabsTrigger value="reward">리워드 수정</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-6">
          <BasicInfoEditTab missionId={missionId} />
        </TabsContent>

        <TabsContent value="actions" className="mt-6">
          <ErrorBoundary>
            <Suspense fallback={<div className="text-muted-foreground">로딩 중...</div>}>
              <ActionsEditTab missionId={missionId} />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="reward" className="mt-6">
          <ErrorBoundary>
            <Suspense fallback={<div className="text-muted-foreground">로딩 중...</div>}>
              <RewardEditTab missionId={missionId} />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>
      </Tabs>
    </div>
  );
}
