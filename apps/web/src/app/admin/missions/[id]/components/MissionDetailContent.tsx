"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/admin/components/shadcn-ui/tabs";
import type { GetMissionResponse } from "@/types/dto";
import { FileText, ListChecks } from "lucide-react";
import { AdminMissionHeader } from "./AdminMissionHeader";
import { MissionNavigation } from "./MissionNavigation";
import { MissionTabActionListContent } from "./mission-tab-action-list-content";
import { MissionTabBasicInfoContent } from "./mission-tab-basic-info-content";

interface MissionDetailContentProps {
  mission: GetMissionResponse["data"];
  defaultTab?: "basic" | "actions";
}

export function MissionDetailContent({ mission, defaultTab = "basic" }: MissionDetailContentProps) {
  return (
    <div className="max-w-7xl">
      <AdminMissionHeader
        title="미션 상세"
        description={mission.title}
        nav={<MissionNavigation missionId={mission.id} />}
        missionId={mission.id}
        isActive={mission.isActive}
      />

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-6">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            기본 정보
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex items-center gap-2">
            <ListChecks className="h-4 w-4" />
            액션 목록
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <MissionTabBasicInfoContent mission={mission} />
        </TabsContent>

        <TabsContent value="actions">
          <MissionTabActionListContent missionId={mission.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
