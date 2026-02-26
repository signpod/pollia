"use client";

import { Separator } from "@/components/ui/separator";
import type { GetMissionResponse } from "@/types/dto";
import type { PaymentType } from "@prisma/client";
import { Typo } from "@repo/ui/components";
import type { EditorTabValue } from "./EditorMissionTabContext";
import { useEditorMissionTab } from "./EditorMissionTabContext";
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
  mission: GetMissionResponse["data"];
  reward: RewardSnapshot | null;
}

function renderPlaceholder(tab: Extract<EditorTabValue, "stats" | "preview">) {
  if (tab === "stats") {
    return (
      <div className="border border-zinc-200 bg-white px-5 py-6">
        <Typo.SubTitle>통계</Typo.SubTitle>
        <Typo.Body size="medium" className="mt-2 text-zinc-500">
          통계 탭은 다음 단계에서 연결합니다.
        </Typo.Body>
      </div>
    );
  }

  return (
    <div className="border border-zinc-200 bg-white px-5 py-6">
      <Typo.SubTitle>미리보기</Typo.SubTitle>
      <Typo.Body size="medium" className="mt-2 text-zinc-500">
        미리보기 탭은 다음 단계에서 연결합니다.
      </Typo.Body>
    </div>
  );
}

export function EditorMissionTabContent({ mission, reward }: EditorMissionTabContentProps) {
  const { currentTab } = useEditorMissionTab();

  if (currentTab !== "editor") {
    return renderPlaceholder(currentTab);
  }

  return (
    <>
      <ProjectBasicInfoCard mission={mission} />
      <Separator className="h-2" />
      <RewardSettingsCard mission={mission} initialReward={reward} />
    </>
  );
}
