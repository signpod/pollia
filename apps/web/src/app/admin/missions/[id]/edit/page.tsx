"use client";

import { Label } from "@/app/admin/components/shadcn-ui/label";
import { Switch } from "@/app/admin/components/shadcn-ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/admin/components/shadcn-ui/tabs";
import { useReadMission } from "@/app/admin/hooks/use-read-mission";
import { useUpdateMission } from "@/app/admin/hooks/use-update-mission";
import { use } from "react";
import { toast } from "sonner";
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

  const updateMission = useUpdateMission({
    onSuccess: () => {
      toast.success("활성화 상태가 변경되었습니다.");
    },
    onError: error => {
      toast.error(error.message || "활성화 상태 변경 중 오류가 발생했습니다.");
    },
  });

  const handleActiveChange = (checked: boolean) => {
    updateMission.mutate({
      missionId,
      data: { isActive: checked },
    });
  };

  return (
    <div className="px-6 py-8 max-w-4xl">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">미션 수정</h1>
            <p className="text-muted-foreground mt-2">
              미션의 기본 정보, 액션, 리워드를 수정합니다
            </p>
          </div>
          {mission && (
            <div className="flex items-center gap-3">
              <Label htmlFor="isActive" className="text-sm text-muted-foreground">
                {mission.isActive ? "활성화됨" : "비활성화됨"}
              </Label>
              <Switch
                id="isActive"
                checked={mission.isActive}
                onCheckedChange={handleActiveChange}
                disabled={updateMission.isPending}
              />
            </div>
          )}
        </div>
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
          <ActionsEditTab missionId={missionId} />
        </TabsContent>

        <TabsContent value="reward" className="mt-6">
          <RewardEditTab missionId={missionId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
