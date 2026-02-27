"use client";

import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants/routes";
import type { GetMissionResponse } from "@/types/dto";
import type { PaymentType } from "@prisma/client";
import { useEffect, useState } from "react";
import { ActionSettingsCard } from "./ActionSettingsCard";
import { CompletionSettingsCard } from "./CompletionSettingsCard";
import { EditorMissionDraftProvider } from "./EditorMissionDraftContext";
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

function MissionIntroPreview({ missionId }: { missionId: string }) {
  const previewUrl = ROUTES.MISSION(missionId);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
  }, [previewUrl]);

  return (
    <div className="relative h-[calc(100vh-120px)] min-h-[720px] w-full overflow-hidden bg-white">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90">
          <div className="size-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-500" />
        </div>
      )}
      <iframe
        title="프로젝트 인트로 미리보기"
        src={previewUrl}
        className="h-full w-full border-0"
        onLoad={() => setIsLoading(false)}
      />
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
    return <MissionIntroPreview missionId={missionId} />;
  }

  return (
    <EditorMissionDraftProvider>
      <ProjectBasicInfoCard mission={mission} />
      <Separator className="h-2" />
      <RewardSettingsCard mission={mission} initialReward={reward} />
      <Separator className="h-2" />
      <ActionSettingsCard missionId={mission.id} />
      <Separator className="h-2" />
      <CompletionSettingsCard missionId={mission.id} />
    </EditorMissionDraftProvider>
  );
}
