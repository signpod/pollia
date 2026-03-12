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
import { PurchaseLinkCard, Typo } from "@repo/ui/components";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
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
    links: completionLinks,
  } = missionCompletion?.data ?? {};

  const { handleSave, isGenerating, canSave } = useCompletionImageDownload({
    completionImageUrl: completionImageUrl ?? initialImageUrl,
    fallbackImageUrl: imageUrl,
    missionTitle,
    completionTitle,
  });

  const reward = rewardQuery?.data;
  const purchaseLinks = usePurchaseLinks();

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
          <div className="flex flex-col gap-3 w-full">
            {completionLinks.map(link => (
              <a
                key={`${link.name}-${link.url}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 transition-colors hover:bg-zinc-50"
              >
                {link.imageUrl && (
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={link.imageUrl}
                      alt={link.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                )}
                <span className="flex-1 min-w-0 text-sm font-medium text-zinc-800 truncate">
                  {link.name}
                </span>
                <ExternalLink className="size-4 shrink-0 text-zinc-400" />
              </a>
            ))}
          </div>
        ) : undefined
      }
      purchaseLinks={
        purchaseLinks ? (
          <div className="flex flex-col gap-4 w-full items-start">
            <Typo.MainTitle size="small" className="w-full">
              이런 상품은 어때요?
            </Typo.MainTitle>
            <div className="w-full">
              <PurchaseLinkCard items={purchaseLinks} />
            </div>
          </div>
        ) : undefined
      }
      hasReward={!!reward}
      onSave={handleSave}
      isSaving={isGenerating}
      canSave={canSave}
    />
  );
}
