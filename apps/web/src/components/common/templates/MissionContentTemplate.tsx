"use client";

import { MissionDescription } from "@/app/(site)/mission/[missionId]/components/MissionDescription";
import { MissionRewardSection } from "@/app/(site)/mission/[missionId]/components/MissionRewardSection";
import { MissionShareSection } from "@/app/(site)/mission/[missionId]/components/MissionShareSection";
import { SECTION_IDS } from "@/app/(site)/mission/[missionId]/constants/sectionIds";
import { ROUTES, WHITE_LABEL_PREFIX } from "@/constants/routes";
import { useCanGoBack } from "@/hooks/common/useCanGoBack";
import { cleanTiptapHTML, cn } from "@/lib/utils";
import { MissionType } from "@prisma/client";
import HomeIcon from "@public/svgs/home-icon.svg";
import { Typo } from "@repo/ui/components";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { RefObject } from "react";
import type { ReactNode } from "react";

export interface MissionContentTemplateReward {
  imageUrl?: string | null;
  name?: string | null;
  description?: string | null;
  scheduledDate?: Date | null;
}

export interface MissionContentTemplateProps {
  title?: string | null;
  isSticky?: boolean;
  sentinelRef?: RefObject<HTMLDivElement | null>;
  description: string | null;
  reward: MissionContentTemplateReward | null;
  missionType: MissionType | null;
  shareButtons?: ReactNode;
}

export function MissionContentTemplate({
  title,
  isSticky = false,
  sentinelRef,
  description,
  reward,
  missionType,
  shareButtons,
}: MissionContentTemplateProps) {
  const hasDescription = !!description && !!cleanTiptapHTML(description);
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const pathname = usePathname();
  const isWhiteLabel = pathname.startsWith(`${WHITE_LABEL_PREFIX}/`);

  return (
    <div className="bg-white relative">
      <div ref={sentinelRef} className="h-0" />
      <header className="sticky top-0 z-50 bg-white">
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 flex items-center gap-2 h-12",
            isSticky ? "max-h-12 opacity-100" : "max-h-0 opacity-0",
          )}
        >
          {canGoBack ? (
            <button
              type="button"
              onClick={() => router.back()}
              className="shrink-0 size-12 flex items-center justify-center"
            >
              <ChevronLeft className="size-6" />
            </button>
          ) : (
            <Link href={ROUTES.HOME} className="shrink-0 size-12 flex items-center justify-center">
              <HomeIcon className="size-6" />
            </Link>
          )}
          <Typo.SubTitle size="large" className="truncate">
            {title}
          </Typo.SubTitle>
        </div>
      </header>
      <div className="flex w-full flex-col px-5 pt-5 pb-10 gap-10">
        <div id={SECTION_IDS.MISSION_GUIDE}>
          {hasDescription && <MissionDescription content={cleanTiptapHTML(description)} />}
        </div>

        {reward && (
          <div id={SECTION_IDS.REWARD}>
            <MissionRewardSection
              rewardImageUrl={reward.imageUrl ?? undefined}
              rewardName={reward.name ?? undefined}
              rewardDescription={reward.description ?? undefined}
              rewardScheduledDate={reward.scheduledDate ?? undefined}
            />
          </div>
        )}

        {!isWhiteLabel && missionType !== MissionType.EXPERIENCE_GROUP && shareButtons && (
          <MissionShareSection shareButtons={shareButtons} />
        )}
      </div>
    </div>
  );
}
