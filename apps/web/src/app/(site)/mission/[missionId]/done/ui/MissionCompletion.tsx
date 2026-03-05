"use client";

import { MissionRewardSection } from "@/app/(site)/mission/[missionId]/components/MissionRewardSection";
import { SocialShareButtonsWithData } from "@/app/(site)/mission/[missionId]/components/SocialShareButtonsWithData";
import { MissionCompletionPage } from "@/components/common/pages/MissionCompletionPage";
import { useReadMission } from "@/hooks/mission";
import { useReadMissionCompletion, useReadMissionCompletionById } from "@/hooks/mission-completion";
import { useReadReward } from "@/hooks/reward/useReadReward";
import { MissionType } from "@prisma/client";
import { useParams } from "next/navigation";
import { useCompletionImageDownload } from "./hooks";

interface MissionCompletionProps {
  completionId?: string;
  initialImageUrl?: string | null;
}

export function MissionCompletion({ completionId, initialImageUrl }: MissionCompletionProps) {
  const { missionId } = useParams<{ missionId: string }>();
  const { data: mission } = useReadMission(missionId);
  const { data: missionCompletionByMission } = useReadMissionCompletion(missionId);
  const { data: missionCompletionById } = useReadMissionCompletionById(
    missionId,
    completionId ?? null,
  );

  const missionCompletion = completionId ? missionCompletionById : missionCompletionByMission;

  const { imageUrl, title: missionTitle, rewardId, type: missionType } = mission?.data ?? {};
  const { data: rewardQuery } = useReadReward(rewardId || "");
  const {
    title: completionTitle,
    description: completionDescription,
    imageUrl: completionImageUrl,
  } = missionCompletion?.data ?? {};

  const { handleSave, isGenerating, canSave } = useCompletionImageDownload({
    completionImageUrl: completionImageUrl ?? initialImageUrl,
    fallbackImageUrl: imageUrl,
    missionTitle,
    completionTitle,
  });

  const reward = rewardQuery?.data;

  return (
    <MissionCompletionPage
      imageUrl={completionImageUrl ?? initialImageUrl ?? imageUrl}
      missionTitle={missionTitle}
      title={completionTitle}
      description={completionDescription}
      reward={
        reward ? (
          <MissionRewardSection
            rewardImageUrl={reward.imageUrl ?? undefined}
            rewardName={reward.name ?? undefined}
            rewardScheduledDate={reward.scheduledDate ?? undefined}
          />
        ) : undefined
      }
      shareButtons={
        missionType !== MissionType.EXPERIENCE_GROUP ? (
          <SocialShareButtonsWithData
            missionId={missionId}
            title={missionTitle ?? undefined}
            imageUrl={imageUrl ?? undefined}
          />
        ) : undefined
      }
      hasReward={!!reward}
      onSave={handleSave}
      isSaving={isGenerating}
      canSave={canSave}
    />
  );
}
