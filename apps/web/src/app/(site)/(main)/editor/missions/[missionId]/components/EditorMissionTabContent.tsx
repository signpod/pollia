"use client";

import { Separator } from "@/components/ui/separator";
import type { GetMissionResponse } from "@/types/dto";
import type { PaymentType } from "@prisma/client";
import { Typo } from "@repo/ui/components";
import { ActionSettingsCard } from "./ActionSettingsCard";
import { useEditorMissionTab } from "./EditorMissionTabContext";
import { MissionStatsDashboard } from "./MissionStatsDashboard";
import { ProjectBasicInfoCard } from "./ProjectBasicInfoCard";
import { RewardSettingsCard } from "./RewardSettingsCard";

interface RewardSnapshot {
  id: string;
  name: string;
  description: string | null;
  paymentType: PaymentType;
  scheduledDate: Date | null;
}

interface EditorMissionTabContentProps {
  missionId: string;
  mission: GetMissionResponse["data"];
  reward: RewardSnapshot | null;
}

function renderPreviewPlaceholder() {
  return (
    <div className="border border-zinc-200 bg-white px-5 py-6">
      <Typo.SubTitle>미리보기</Typo.SubTitle>
      <Typo.Body size="medium" className="mt-2 text-zinc-500">
        미리보기 탭은 다음 단계에서 연결합니다.
      </Typo.Body>
    </div>
  );
}

export function EditorMissionTabContent({
  missionId,
  mission,
  reward,
}: EditorMissionTabContentProps) {
  const { currentTab } = useEditorMissionTab();

  if (currentTab === "stats") {
    return <MissionStatsDashboard missionId={missionId} />;
  }

  if (currentTab === "preview") {
    return renderPreviewPlaceholder();
  }

  return (
    <>
      <ProjectBasicInfoCard mission={mission} />
      <Separator className="h-2" />
      <RewardSettingsCard mission={mission} initialReward={reward} />
      <Separator className="h-2" />
      <ActionSettingsCard missionId={mission.id} />
    </>
  );
}
