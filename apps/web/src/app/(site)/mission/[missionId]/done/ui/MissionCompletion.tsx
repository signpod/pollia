"use client";

import { getAllMissions } from "@/actions/mission/read";
import { MissionRewardSection } from "@/app/(site)/mission/[missionId]/components/MissionRewardSection";
import { SocialShareButtonsWithData } from "@/app/(site)/mission/[missionId]/components/SocialShareButtonsWithData";
import { MissionCarousel } from "@/components/common/MissionCarousel";
import { MissionCompletionPage } from "@/components/common/pages/MissionCompletionPage";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { useReadMission } from "@/hooks/mission";
import { useReadMissionCompletion, useReadMissionCompletionById } from "@/hooks/mission-completion";
import { useReadReward } from "@/hooks/reward/useReadReward";
import { useShareTracking } from "@/hooks/share/useShareTracking";
import { MissionType } from "@prisma/client";
import { Typo } from "@repo/ui/components";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { PurchaseLinkCarousel } from "./PurchaseLinkCarousel";
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
    links: completionLinks,
  } = missionCompletion?.data ?? {};

  const { handleSave, isGenerating, canSave } = useCompletionImageDownload({
    completionImageUrl: completionImageUrl ?? initialImageUrl,
    fallbackImageUrl: imageUrl,
    missionTitle,
    completionTitle,
  });

  const reward = rewardQuery?.data;
  const { trackShare } = useShareTracking(missionId);

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
          <div className="flex flex-col gap-4 w-full items-start">
            <Typo.MainTitle size="small" className="w-full">
              완료 리워드
            </Typo.MainTitle>
            <div className="w-full">
              <MissionRewardSection
                rewardImageUrl={reward.imageUrl ?? undefined}
                rewardName={reward.name ?? undefined}
                rewardScheduledDate={reward.scheduledDate ?? undefined}
                rewardDescription={reward.description ?? undefined}
              />
            </div>
          </div>
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
      completionLinks={
        completionLinks && completionLinks.length > 0 ? (
          <PurchaseLinkCarousel links={completionLinks} />
        ) : undefined
      }
      hasReward={!!reward}
      onShare={trackShare}
      onSave={handleSave}
      isSaving={isGenerating}
      canSave={canSave}
    />
  );
}
