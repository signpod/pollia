"use client";

import { ErrorBoundary } from "@/app/admin/components/common/ErrorBoundary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/admin/components/shadcn-ui/tabs";
import { useReadMission } from "@/app/admin/hooks/mission";
import { FileText, Gift, ListChecks } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense, use } from "react";
import { AdminMissionHeader } from "../components/AdminMissionHeader";
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

  if (!mission) return notFound();

  return (
    <div className="max-w-7xl">
      <AdminMissionHeader
        title="미션 수정"
        description="미션의 기본 정보, 액션, 리워드를 수정합니다"
        nav={<MissionNavigation missionId={missionId} />}
        missionId={missionId}
        isActive={mission?.isActive}
      />

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full max-w-[600px] grid-cols-3 gap-2 mb-6">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            기본 정보
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex items-center gap-2">
            <ListChecks className="h-4 w-4" />
            액션
          </TabsTrigger>
          <TabsTrigger value="reward" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            리워드
          </TabsTrigger>
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
