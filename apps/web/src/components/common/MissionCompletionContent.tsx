"use client";

import { getAllMissions } from "@/actions/mission/read";
import { MissionRewardSection } from "@/app/(site)/mission/[missionId]/components/MissionRewardSection";
import { SocialShareButtonsWithData } from "@/app/(site)/mission/[missionId]/components/SocialShareButtonsWithData";
import { PurchaseLinkCarousel } from "@/app/(site)/mission/[missionId]/done/ui/PurchaseLinkCarousel";
import { useCompletionImageDownload } from "@/app/(site)/mission/[missionId]/done/ui/hooks";
import { MissionCarousel } from "@/components/common/MissionCarousel";
import { MissionCompletionPage } from "@/components/common/pages/MissionCompletionPage";
import { QuizScoreSummary } from "@/components/common/quiz/QuizScoreSummary";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { useReadMission } from "@/hooks/mission";
import { useReadMissionCompletion, useReadMissionCompletionById } from "@/hooks/mission-completion";
import { useReadReward } from "@/hooks/reward/useReadReward";
import { useShareTracking } from "@/hooks/share/useShareTracking";
import { quizConfigSchema } from "@/schemas/mission/quizConfigSchema";
import { MissionCategory, MissionType } from "@prisma/client";
import { Typo } from "@repo/ui/components";
import { useQuery } from "@tanstack/react-query";

interface MissionCompletionContentProps {
  missionId: string;
  completionId?: string | null;
  initialImageUrl?: string | null;
  showBottomButton?: boolean;
  showHeader?: boolean;
}

export function MissionCompletionContent({
  missionId,
  completionId,
  initialImageUrl,
  showBottomButton = true,
  showHeader = true,
}: MissionCompletionContentProps) {
  const { data: mission } = useReadMission(missionId);
  const { data: missionCompletionByMission } = useReadMissionCompletion(missionId);
  const { data: missionCompletionById } = useReadMissionCompletionById(
    missionId,
    completionId ?? null,
  );

  const missionCompletion = completionId ? missionCompletionById : missionCompletionByMission;

  const {
    imageUrl,
    title: missionTitle,
    rewardId,
    type: missionType,
    category,
  } = mission?.data ?? {};
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
    queryFn: () => getAllMissions({ limit: 6, type: MissionType.GENERAL, isActive: true }),
    select: data => data.data.filter(m => m.id !== missionId),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <MissionCompletionPage
      imageUrl={completionImageUrl ?? initialImageUrl}
      missionTitle={missionTitle}
      title={completionTitle}
      description={completionDescription}
      reward={
        reward ? (
          <div className="flex w-full flex-col items-start gap-4">
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
      quizResult={
        category === MissionCategory.QUIZ ? (
          <QuizScoreSummary
            missionId={missionId}
            showCorrectOnWrong={
              quizConfigSchema.safeParse(mission?.data?.quizConfig ?? {}).data
                ?.showCorrectOnWrong ?? true
            }
            showExplanation={
              quizConfigSchema.safeParse(mission?.data?.quizConfig ?? {}).data?.showExplanation ??
              true
            }
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
      showBottomButton={showBottomButton}
      showHeader={showHeader}
    />
  );
}
