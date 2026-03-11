"use client";

import { getAllMissions } from "@/actions/mission/read";
import { MissionRewardSection } from "@/app/(site)/mission/[missionId]/components/MissionRewardSection";
import { SocialShareButtonsWithData } from "@/app/(site)/mission/[missionId]/components/SocialShareButtonsWithData";
import { MissionCarousel } from "@/components/common/MissionCarousel";
import { MissionCompletionPage } from "@/components/common/pages/MissionCompletionPage";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { useReadMission } from "@/hooks/mission";
import { useReadMissionCompletion, useReadMissionCompletionById } from "@/hooks/mission-completion";
import { usePurchaseLinks } from "@/hooks/purchase-link";
import { useReadReward } from "@/hooks/reward/useReadReward";
import { MissionType } from "@prisma/client";
import { PurchaseLinkCard } from "@repo/ui/components";
import { useQuery } from "@tanstack/react-query";
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
  const purchaseLinks = usePurchaseLinks(missionId);

  const { data: recommendedMissions } = useQuery({
    queryKey: [...missionQueryKeys.allMissions(), "recommended"],
    queryFn: () => getAllMissions({ limit: 6, type: MissionType.GENERAL }),
    select: data => data.data.filter(m => m.id !== missionId && m.isActive),
    staleTime: 5 * 60 * 1000,
  });

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
      recommendation={
        recommendedMissions && recommendedMissions.length > 0 ? (
          <MissionCarousel
            title="재밌게 즐기셨다면 이 콘텐츠는 어때요?"
            missions={recommendedMissions}
            cardClassName="w-[159.5px] sm:w-[200px]"
          />
        ) : undefined
      }
      purchaseLinks={purchaseLinks ? <PurchaseLinkCard items={purchaseLinks} /> : undefined}
      hasReward={!!reward}
      onSave={handleSave}
      isSaving={isGenerating}
      canSave={canSave}
    />
  );
}
