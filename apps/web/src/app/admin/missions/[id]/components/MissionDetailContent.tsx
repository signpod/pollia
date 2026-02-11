"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/admin/components/shadcn-ui/tabs";
import UBQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import type { GetMissionResponse } from "@/types/dto";
import { Award, FileText, Gift, ListChecks } from "lucide-react";
import { AdminMissionHeader } from "./AdminMissionHeader";
import { MissionNavigation } from "./MissionNavigation";
import { MissionTabActionListContent } from "./mission-tab-action-list-content";
import { MissionTabBasicInfoContent } from "./mission-tab-basic-info-content";
import { MissionTabCompletionContent } from "./mission-tab-completion-content";
import { MissionTabRewardContent } from "./mission-tab-reward-content";

interface MissionDetailContentProps {
  mission: GetMissionResponse["data"];
  defaultTab?: "basic" | "actions" | "completion" | "reward";
}

const TAB_LABELS = {
  basic: {
    label: "인트로",
    icon: FileText,
  },
  actions: {
    label: "액션 목록",
    icon: ListChecks,
  },
  completion: {
    label: "완료화면",
    icon: Award,
  },
  reward: {
    label: "리워드",
    icon: Gift,
  },
} as const;

export function MissionDetailContent({ mission, defaultTab = "basic" }: MissionDetailContentProps) {
  return (
    <>
      <AdminMissionHeader
        title={`${UBQUITOUS_CONSTANTS.MISSION} 상세`}
        description={mission.title}
        nav={<MissionNavigation missionId={mission.id} />}
        missionId={mission.id}
      />

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full max-w-[800px] grid-cols-4 mb-6">
          {Object.values(TAB_LABELS).map(tab => (
            <TabsTrigger key={tab.label} value={tab.label} className="flex items-center gap-2">
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="basic">
          <MissionTabBasicInfoContent mission={mission} />
        </TabsContent>

        <TabsContent value="actions">
          <MissionTabActionListContent missionId={mission.id} />
        </TabsContent>

        <TabsContent value="completion">
          <MissionTabCompletionContent missionId={mission.id} />
        </TabsContent>

        <TabsContent value="reward">
          <MissionTabRewardContent missionId={mission.id} />
        </TabsContent>
      </Tabs>
    </>
  );
}
