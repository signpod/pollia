"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/admin/components/shadcn-ui/tabs";
import { use } from "react";
import { BasicInfoEditTab } from "./components/BasicInfoEditTab";

interface AdminMissionEditPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminMissionEditPage({ params }: AdminMissionEditPageProps) {
  const { id: missionId } = use(params);

  return (
    <div className="px-6 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">미션 수정</h1>
        <p className="text-muted-foreground mt-2">미션의 기본 정보, 액션, 리워드를 수정합니다</p>
      </header>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList>
          <TabsTrigger value="basic">기본 정보 수정</TabsTrigger>
          <TabsTrigger value="actions">액션 순서 수정</TabsTrigger>
          <TabsTrigger value="reward">리워드</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-6">
          <BasicInfoEditTab missionId={missionId} />
        </TabsContent>

        <TabsContent value="actions" className="mt-6">
          <div className="text-muted-foreground">
            액션 순서 수정 콘텐츠 (액션 수정/생성 버튼 포함)
          </div>
        </TabsContent>

        <TabsContent value="reward" className="mt-6">
          <div className="text-muted-foreground">리워드 콘텐츠 (리워드 수정/생성 버튼 포함)</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
