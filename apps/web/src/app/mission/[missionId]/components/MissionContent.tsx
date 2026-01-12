import { cleanTiptapHTML } from "@/lib/utils";
import { Typo } from "@repo/ui/components";
import { MissionType } from "@prisma/client";
import { MissionDescription } from "./MissionDescription";
import { MissionFooter } from "./MissionFooter";
import { MissionRewardSection } from "./MissionRewardSection";
import { SectionHeader } from "./SectionHeader";
import { SocialShareButtonsWithData } from "./SocialShareButtonsWithData";

export interface MissionContentProps {
  missionId: string;
  missionType: MissionType | null;
  missionTitle: string | null;
  missionImageUrl: string | null;
  description: string | null;
  target: string | null;
  estimatedMinutes: number | null;
  deadlineText: string;
  reward: {
    imageUrl: string | null;
    name: string | null;
    scheduledDate: Date | null;
  } | null;
}

const SECTION_IDS = {
  MISSION_GUIDE: "mission-guide",
  REWARD: "reward",
} as const;

export function MissionContent({
  missionId,
  missionType,
  missionTitle,
  missionImageUrl,
  description,
  target,
  estimatedMinutes,
  deadlineText,
  reward,
}: MissionContentProps) {
  const showDetailInfo = !!target || !!estimatedMinutes || !!deadlineText;

  const detailInfoConfig = [
    { key: "참여 조건", value: target },
    { key: "예상 소요 시간", value: estimatedMinutes ? `${estimatedMinutes}분` : null },
    { key: "참여 기간", value: deadlineText },
  ] as const;

  return (
    <div className="bg-white">
      <div id={SECTION_IDS.MISSION_GUIDE} className="flex w-full flex-col gap-0 px-5 items-center">
        {showDetailInfo && (
          <div className="flex flex-col gap-6 w-full p-5">
            <div className="flex flex-col gap-4 w-full bg-zinc-50 rounded-md p-6">
              {detailInfoConfig.map(
                ({ key, value }) =>
                  !!key &&
                  !!value && (
                    <div className="flex gap-2" key={key}>
                      <Typo.Body
                        size="medium"
                        className="text-info whitespace-nowrap min-w-[100px]"
                      >
                        {key}
                      </Typo.Body>
                      <Typo.Body size="medium" className="flex-1 break-keep text-right">
                        {value}
                      </Typo.Body>
                    </div>
                  ),
              )}
            </div>
          </div>
        )}

        {!!description && !!cleanTiptapHTML(description) && (
          <div className="flex flex-col gap-6 px-5 py-8 items-center w-full">
            <SectionHeader badgeText="상세 안내" title={""} />
            <MissionDescription content={cleanTiptapHTML(description)} className="text-center" />
          </div>
        )}
      </div>

      {reward && (
        <div id={SECTION_IDS.REWARD} className="px-5 py-8 w-full">
          <MissionRewardSection
            rewardImageUrl={reward.imageUrl ?? undefined}
            rewardName={reward.name ?? undefined}
            rewardScheduledDate={reward.scheduledDate ?? undefined}
          />
        </div>
      )}

      {missionType !== MissionType.EXPERIENCE_GROUP && (
        <div className="flex flex-col gap-4 items-center px-5 py-8">
          <Typo.MainTitle size="small" className="text-center">
            가족, 친구에게
            <br />
            공유해주세요 👀
          </Typo.MainTitle>
          <SocialShareButtonsWithData
            missionId={missionId}
            title={missionTitle ?? undefined}
            imageUrl={missionImageUrl ?? undefined}
          />
        </div>
      )}

      <MissionFooter />
    </div>
  );
}
